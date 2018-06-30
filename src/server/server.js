/* @flow */

import { createServer } from 'http';

import messages from '../messages.json';
import {
  MIME_TYPES, STATUS_CODES, REQUEST_TYPES, DEFAULT_HEADERS, RPC_DEFAULT_PORT,
} from '../defaults';

import type { ServerArgumentsType } from '../flowtypes';

export const start = async (
  { port = RPC_DEFAULT_PORT }: ServerArgumentsType = {},
): Promise<Object> => {
  const serverInstance = createServer((request, response) => {
    let requestDataBuffer: Buffer = Buffer.alloc(0);
    /*
     * Request
     *
     * @TODO Better handle the error request type
     */
    request.on(REQUEST_TYPES.ERROR, (error) => {
      throw new Error(`${messages.requestFailed}. ${error}`);
    });
    request.on(REQUEST_TYPES.DATA, (bufferChunk) => {
      requestDataBuffer = Buffer.concat([requestDataBuffer, bufferChunk]);
    });
    /*
     * Response
     */
    response.writeHead(
      STATUS_CODES.OK,
      Object.assign(
        {},
        DEFAULT_HEADERS,
        { 'Content-Type': MIME_TYPES.JSON },
      ),
    );
    response.write('Server is running!');
    response.end();
  });
  return serverInstance.listen(port);
};

const server = {
  start,
};

export default server;
