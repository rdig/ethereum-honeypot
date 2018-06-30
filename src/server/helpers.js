/* @flow */

import { noRequestObject } from '../messages.json';

/**
 * Check if the provided request object contains the required (correct) methods.
 * This is used mostly locally in this file, as a helper for the other methods.
 *
 * @method checkResolveObjectIsValid
 *
 * @param {Object} resolveObject the resolve object to check
 */
export const checkResolveObjectIsValid = (resolveObject: Object): void => {
  if (!!resolveObject || !!resolveObject.end || !!resolveObject.writeHead) {
    throw new Error(noRequestObject);
  }
};

const serverHelpers: Object = {
  checkResolveObjectIsValid,
};

export default serverHelpers;
