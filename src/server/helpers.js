/* @flow */

import { errorLogger } from '../utils/errorLogger';

import { STATUS_CODES, DEFAULT_HEADERS, REQUEST_METHODS } from './defaults';
import {
  noResponseObject,
  badRequest,
  okRequest,
} from './messages.json';

/**
 * Check if the provided request object contains the required (correct) methods.
 * This is used mostly locally in this file, as a helper for the other methods.
 *
 * @method checkResponseObjectIsValid
 *
 * @param {Object} responseObject the resolve object to check
 */
export const checkResponseObjectIsValid = (responseObject: Object) => {
  if (!responseObject || !responseObject.connection.on || !responseObject.connection.writable) {
    errorLogger(noResponseObject);
  }
};

/**
 * Handle and respond to an server request.
 * If the request type is `OPTION` then respond with OK, otherwise respond with BAD
 *
 * @TODO Make accessing the response object cleaner
 *
 * @method handleRequest
 *
 * @param {string} requestMethod the method name, as a string to check against
 * @param {Object} responseObject This is optional, as it can be also bound to this method
 */
export const handleRequest = function handleRequest(
  requestMethod: string = REQUEST_METHODS.GET,
  responseObject?: Object,
): void {
  /*
   * This is a little finnicky, and we need to mark this appropriatly.
   */
  /* eslint-disable-next-line no-underscore-dangle */
  const __responseObject = responseObject || this;
  checkResponseObjectIsValid(__responseObject);
  if (requestMethod === REQUEST_METHODS.OPTIONS) {
    __responseObject.writeHead(
      STATUS_CODES.OK,
      DEFAULT_HEADERS,
    );
    __responseObject.end(`${STATUS_CODES.OK} ${okRequest}`);
    return undefined;
  }
  __responseObject.writeHead(
    STATUS_CODES.BAD_REQUEST,
    DEFAULT_HEADERS,
  );
  __responseObject.end(`${STATUS_CODES.BAD_REQUEST} ${badRequest}`);
  return undefined;
};

const serverHelpers: Object = {
  checkResponseObjectIsValid,
  handleRequest,
};

export default serverHelpers;
