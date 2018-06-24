/* @flow */

import { createServer } from 'http';

import { MIME_TYPES, STATUS_CODES, RPC_DEFAULT_PORT } from '../defaults';

import type { ServerArgumentsType } from '../flowtypes';

export const start = async (
  { port = RPC_DEFAULT_PORT }: ServerArgumentsType = {},
): Promise<Object> => {
  const serverInstance = createServer((request, response) => {
    response.writeHead(
      STATUS_CODES.SUCCESS,
      { 'Content-Type': MIME_TYPES.JSON },
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
