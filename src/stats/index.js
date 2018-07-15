/* @flow */

import { firestoreDatabase } from '../utils/firebase';

import { statsTransactionGenerator } from './helpers';
import { countriesStats } from './countries';
import { citiesStats } from './cities';
import { ipAddressesStats } from './ipAddresses';
import { methodsStats } from './methods';
import { userAgentsStats } from './userAgents';

import type { honeypotDataObjectType } from '../flowtypes';

/**
 * Orchestrate the transaction batch read and writes
 *
 * @method stats
 *
 * @param {string} country Country name
 * @param {string} city City name
 * @param {GeoPoint} geoLocation Instance of the GeoPoint class, containing location coordinates
 * @param {string} ipAddress Ip address of the request
 * @param {string} method Ip address of the request
 * @param {string} userAgent User agent of that made the request
 *
 * The above parameters are sent in as a prop name of an {honeypotDataObjectType} Object
 */
export const stats = async ({
  country,
  city,
  geoLocation,
  ipAddress,
  method,
  userAgent,
}: honeypotDataObjectType) => (
  firestoreDatabase.runTransaction(
    transactionObject => statsTransactionGenerator({
      transactionObject,
      transactionStatsArray: [
        countriesStats(country),
        citiesStats(city, geoLocation),
        ipAddressesStats(ipAddress),
        methodsStats(method),
        userAgentsStats(userAgent),
      ],
    }),
  )
);

export default stats;
