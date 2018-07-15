/* @flow */

import { firestoreDatabase } from '../utils/firebase';

import { statsTransactionGenerator } from './helpers';
import { countriesStats } from './countries';

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
export const stats = async ({ country }: honeypotDataObjectType) => (
  firestoreDatabase.runTransaction(
    transactionObject => statsTransactionGenerator({
      transactionObject,
      transactionStatsArray: [
        countriesStats(country),
      ],
    }),
  )
);

export default stats;
