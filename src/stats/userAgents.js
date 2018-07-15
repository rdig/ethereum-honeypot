/* @flow */

import sanitize from 'sanitize-filename';

import { errorLogger } from '../utils/errorLogger';

import { DOCUMENTS, UNDEFINED, UNDERSCORE } from './defaults';

/**
 * Track the number of times a request used an unique user agent
 *
 * @method userAgentsStats
 *
 * @param {string} method The method name to track the stats of
 */
export const userAgentsStats = (userAgent: string): Object => {
  try {
    if (!userAgent || typeof userAgent !== 'string') {
      /*
       * @TODO Move message string to `messages.json`
       */
      errorLogger(
        "Stats user agent name not available, we're not counting it",
        userAgent || UNDEFINED,
      );
    }
    return {
      documentId: DOCUMENTS.USER_AGENTS,
      propName: sanitize(userAgent, { replacement: UNDERSCORE }),
      additionalData: { name: userAgent },
    };
  } catch (caughtError) {
    return {};
  }
};

export default userAgentsStats;
