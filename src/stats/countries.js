/* @flow */

import { errorLogger } from '../utils/errorLogger';

import { statsGenerator } from './helpers';

import { DOCUMENTS, UNDEFINED } from './defaults';

/**
 * Track the number of times a unique contry has made a request to the honeypot
 * It makes use of the `statsGenerator()` helper method.
 *
 * @method countriesStats
 *
 * @param {string} country The country name to track the stats of
 */
export const countriesStats = async (country: string) => {
  if (!country || typeof country !== 'string') {
    return errorLogger(
      "Stats country name not available, we're counting it",
      country || UNDEFINED,
    );
  }
  return statsGenerator({
    documentId: DOCUMENTS.COUNTRIES,
    propName: country,
  });
};

export default countriesStats;
