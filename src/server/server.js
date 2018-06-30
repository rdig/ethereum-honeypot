/* @flow */

import { createServer } from 'http';

import { handleRequest } from './helpers';
import { requestFailed } from '../messages.json';
import {
  REQUEST_TYPES,
  RPC_DEFAULT_PORT,
  REQUEST_METHODS,
  STATUS_CODES,
  DEFAULT_HEADERS,
  MIME_TYPES,
} from '../defaults';

import type { ServerArgumentsType } from '../flowtypes';

export const start = async (
  { port = RPC_DEFAULT_PORT }: ServerArgumentsType = {},
): Promise<Object> => {
  const serverInstance = createServer((request, response) => {
    const handleMiscRequest = handleRequest.bind(response);
    let requestDataBuffer: Buffer = Buffer.alloc(0);
    /*
     * Request
     *
     * @TODO Better handle the error request type
     */
    request.on(REQUEST_TYPES.ERROR, (error) => {
      throw new Error(`${requestFailed}. ${error}`);
    });
    request.on(REQUEST_TYPES.DATA, (bufferChunk) => {
      requestDataBuffer = Buffer.concat([requestDataBuffer, bufferChunk]);
    });
    /*
     * Response
     */
    request.on(REQUEST_TYPES.END, () => {
      const { method } = request;
      try {
        switch (method) {
          case REQUEST_METHODS.POST: {
            /*
             * If the `requestDataBuffer` value is malformed, parsing it to JSON will fail and we
             * will `catch` it.
             *
             * If that's the case, then we return a `Bad Request`, `400` server response.
             */
            const payload = JSON.parse(requestDataBuffer.toString());
            response.writeHead(
              STATUS_CODES.OK,
              Object.assign(
                {},
                DEFAULT_HEADERS,
                { 'Content-Type': MIME_TYPES.JSON },
              ),
            );
            response.end(JSON.stringify(payload));
            break;
          }
          case REQUEST_METHODS.OPTIONS: {
            handleMiscRequest(REQUEST_METHODS.OPTIONS);
            break;
          }
          default: {
            handleMiscRequest();
            break;
          }
        }
      } catch (caughtError) {
        handleMiscRequest();
      }
    });
  });
  return serverInstance.listen(port);
};

const server = {
  start,
};

export default server;
