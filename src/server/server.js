/* @flow */

import { createServer } from 'http';

import { handleRequest } from './helpers';
import { requestFailed } from '../messages.json';
import {
  REQUEST_TYPES,
  RPC_DEFAULT_PORT,
  REQUEST_METHODS,
} from '../defaults';

import type { ServerArgumentsType } from '../flowtypes';

export const start = async (
  { port = RPC_DEFAULT_PORT }: ServerArgumentsType = {},
): Promise<Object> => {
  const serverInstance = createServer(({ method, url, ...request }, response) => {
    const handleMiscRequest = handleRequest.bind(response);
    let requestDataBuffer: Buffer = Buffer.alloc(0);
    /*
     * Request
     *
     * @TODO Better handle the error request type
     */
    request.connection.on(REQUEST_TYPES.ERROR, (error) => {
      throw new Error(`${requestFailed}. ${error}`);
    });
    request.connection.on(REQUEST_TYPES.DATA, (bufferChunk) => {
      requestDataBuffer = Buffer.concat([requestDataBuffer, bufferChunk]);
    });
    /*
     * Response
     */
    switch (method) {
      case REQUEST_METHODS.POST:
        break;
      case REQUEST_METHODS.OPTIONS:
        handleMiscRequest(REQUEST_METHODS.OPTIONS);
        break;
      default:
        handleMiscRequest();
        break;
    }
  });
  return serverInstance.listen(port);
};

const server = {
  start,
};

export default server;
