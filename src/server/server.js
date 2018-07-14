/* @flow */

import { createServer } from 'http';
import { provider } from 'ganache-core';

import { errorLogger } from '../utils/errorLogger';

import { handleRequest } from './helpers';
import { requestFailed } from './messages.json';
import {
  REQUEST_TYPES,
  RPC_DEFAULT_PORT,
  REQUEST_METHODS,
  STATUS_CODES,
  DEFAULT_HEADERS,
  MIME_TYPES,
} from '../defaults';

import type { ServerArgumentsType } from '../flowtypes';

export const start = async ({
  port = RPC_DEFAULT_PORT,
  providerOptions = {},
  logger,
}: ServerArgumentsType = {}): Promise<Object> => {
  const serverInstance = createServer((request, response) => {
    const handleMiscRequest = handleRequest.bind(response);
    /*
     * Instantiate the ganache provider
     */
    const ganacheProvider = provider(providerOptions);
    let requestDataBuffer: Buffer = Buffer.alloc(0);
    /*
     * Request
     */
    request.on(REQUEST_TYPES.ERROR, (error: string) => errorLogger(
      requestFailed,
      null,
      error,
    ));
    /*
     * Get the streamed request data and add it to the Buffer
     */
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
            const requestPayload = JSON.parse(requestDataBuffer.toString());
            /*
             * Send the request data to the provider and listen of it's response
             *
             * @TODO Handle the case in which the provider runs into and error
             */
            ganacheProvider.send(requestPayload, async (responseerrorError, providerResponse) => {
              /*
               * Get the response from the provider so we can send it back to the requester
               */
              const serverReponse = JSON.stringify(providerResponse);
              /*
               * Since the data is in a (stringified) JSON format, we ne to set the
               * headers accordingly
               */
              response.writeHead(
                STATUS_CODES.OK,
                Object.assign(
                  {},
                  DEFAULT_HEADERS,
                  { 'Content-Type': MIME_TYPES.JSON },
                ),
              );
              /*
               * Send the response data
               */
              response.end(serverReponse);
              /*
               * Log the request and response to the database.
               * We also pass in the whole request object so we can extract metadata from it
               * (ip addreses, hosts, etc...)
               *
               * @TODO Cleaner way to log requests/responses
               */
              if (logger && typeof logger === 'function') {
                await logger({
                  request,
                  payload: requestPayload,
                  response: serverReponse,
                });
              }
            });
            break;
          }
          /*
           * If it's and `OPTIONS` request, just answer with `200 OK` status
           */
          case REQUEST_METHODS.OPTIONS: {
            handleMiscRequest(REQUEST_METHODS.OPTIONS);
            break;
          }
          /*
           * If it's any other kind of request answer with status `400 Bad Request`
           */
          default: {
            handleMiscRequest();
            break;
          }
        }
      /*
       * If we run into an error, and the try-catch block is triggered, we assume that the request
       * was malformed, and aswer with status `400 Bad Request`
       */
      } catch (caughtError) {
        handleMiscRequest();
        errorLogger('Bad request', null, caughtError);
      }
    });
  });
  /*
   * Start listening to the server instance on the specified port
   */
  return serverInstance.listen(port);
};

const server = {
  start,
};

export default server;
