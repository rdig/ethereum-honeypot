/* @flow */

import { countriesStats } from './countries';

import type { honeypotDataObjectType } from '../flowtypes';

/**
 * Split the honeypot logger data object to the various stats tracking methods
 *
 * @method stats
 *
 * @param {string} country Country name
 *
 * The above parameter is sent in as a prop name of an {honeypotDataObjectType} Object
 */
export const stats = async ({ country }: honeypotDataObjectType) => {
  await countriesStats(country);
};

export default stats;
