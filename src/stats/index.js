/* @flow */

import { firestoreDatabase } from '../utils/firebase';

import { statsTransactionGenerator } from './helpers';
import { countriesStats } from './countries';
import { citiesStats } from './cities';

import type { honeypotDataObjectType } from '../flowtypes';

/**
 * Orchestrate the transaction batch read and writes
 *
 * @method stats
 *
 * @param {string} country Country name
 *
 * The above parameter is sent in as a prop name of an {honeypotDataObjectType} Object
 */
export const stats = async ({ country, city, geoLocation }: honeypotDataObjectType) => (
  firestoreDatabase.runTransaction(
    transactionObject => statsTransactionGenerator({
      transactionObject,
      transactionStatsArray: [
        countriesStats(country),
        citiesStats(city, geoLocation),
      ],
    }),
  )
);

export default stats;
