/* @flow */

import { createServer } from 'http';

import { handleBadRequest } from './helpers';
import messages from '../messages.json';
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
    let requestDataBuffer: Buffer = Buffer.alloc(0);
    /*
     * Request
     *
     * @TODO Better handle the error request type
     */
    request.connection.on(REQUEST_TYPES.ERROR, (error) => {
      throw new Error(`${messages.requestFailed}. ${error}`);
    });
    request.connection.on(REQUEST_TYPES.DATA, (bufferChunk) => {
      requestDataBuffer = Buffer.concat([requestDataBuffer, bufferChunk]);
    });
    /*
     * Response
     */
    if (method !== REQUEST_METHODS.POST) {
      handleBadRequest(response);
    }
  });
  return serverInstance.listen(port);
};

const server = {
  start,
};

export default server;
