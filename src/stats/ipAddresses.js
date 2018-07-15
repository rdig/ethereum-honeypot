/* @flow */

import { errorLogger } from '../utils/errorLogger';

import { DOCUMENTS, UNDEFINED } from './defaults';

/**
 * Track the number of times a unique ip address has made a request to the honeypot
 *
 * @method ipAddressesStats
 *
 * @param {string} ipAddress The ip address to track the stats of
 */
export const ipAddressesStats = (ipAddress: string): Object => {
  try {
    if (!ipAddress || typeof ipAddress !== 'string') {
      /*
       * @TODO Move message string to `messages.json`
       */
      errorLogger(
        "Stats ip address not available, we're counting it",
        ipAddress || UNDEFINED,
      );
    }
    return {
      documentId: DOCUMENTS.IPS,
      propName: ipAddress,
    };
  } catch (caughtError) {
    return {};
  }
};

export default ipAddressesStats;
