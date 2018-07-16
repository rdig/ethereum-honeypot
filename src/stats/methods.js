/* @flow */

import { errorLogger } from '../utils/errorLogger';

import { DOCUMENTS, UNDEFINED } from './defaults';

/**
 * Track the number of times a request used an unique web3 method
 *
 * @method methodsStats
 *
 * @param {string} method The method name to track the stats of
 */
export const methodsStats = (method: string): Object => {
  try {
    if (!method || typeof method !== 'string') {
      /*
       * @TODO Move message string to `messages.json`
       */
      errorLogger(
        "Stats web3 method name not available, we're not counting it",
        method || UNDEFINED,
      );
    }
    return {
      documentId: DOCUMENTS.METHODS,
      propName: method,
    };
  } catch (caughtError) {
    return {};
  }
};

export default methodsStats;
