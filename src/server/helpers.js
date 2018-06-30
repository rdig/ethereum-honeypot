/* @flow */

import { STATUS_CODES, DEFAULT_HEADERS } from '../defaults';
import { noResponseObject, badRequest } from '../messages.json';

/**
 * Check if the provided request object contains the required (correct) methods.
 * This is used mostly locally in this file, as a helper for the other methods.
 *
 * @method checkResponseObjectIsValid
 *
 * @param {Object} responseObject the resolve object to check
 */
export const checkResponseObjectIsValid = (responseObject: Object): void => {
  if (!responseObject || !responseObject.connection.on || !responseObject.connection.writable) {
    throw new Error(noResponseObject);
  }
};

/**
 * Handle and respond to a bad server request
 *
 * @method handleBadRequest
 *
 * @param {Object} responseObject This is optional, as it can be also bound to this method
 */
export const handleBadRequest = (responseObject: Object): void => {
  /*
   * This is a little finnicky, and we need to mark this appropriatly.
   */
  /* eslint-disable-next-line no-underscore-dangle */
  const __responseObject = responseObject || this;
  checkResponseObjectIsValid(__responseObject);
  __responseObject.writeHead(
    STATUS_CODES.BAD_REQUEST,
    DEFAULT_HEADERS,
  );
  __responseObject.end(`${STATUS_CODES.BAD_REQUEST} ${badRequest}`);
};

const serverHelpers: Object = {
  checkResponseObjectIsValid,
  handleBadRequest,
};

export default serverHelpers;
