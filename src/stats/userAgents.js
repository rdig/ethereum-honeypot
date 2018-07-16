/* @flow */

import sanitize from 'sanitize-filename';

import { DOCUMENTS, UNDERSCORE } from './defaults';

/**
 * Track the number of times a request used an unique user agent
 *
 * @method userAgentsStats
 *
 * @param {string} method The method name to track the stats of
 */
export const userAgentsStats = (userAgent: string): Object => {
  try {
    let safeUserAgent = 'hidden';
    if (userAgent && typeof userAgent === 'string') {
      safeUserAgent = userAgent;
    }
    return {
      documentId: DOCUMENTS.USER_AGENTS,
      propName: sanitize(safeUserAgent, { replacement: UNDERSCORE }),
      additionalData: { name: safeUserAgent },
    };
  } catch (caughtError) {
    return {};
  }
};

export default userAgentsStats;
