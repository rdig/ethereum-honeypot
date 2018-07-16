/* @flow */

import fetch from 'node-fetch';

import { errorLogger } from '../errorLogger';

import {
  GEOJS_ENDPOINT,
  LOCAL_GEO_OBJECT,
  ENUMERABLE_PROP,
  LOCAL_IP,
} from './defaults';

const defaultLocationObject = Object.assign(
  {},
  LOCAL_GEO_OBJECT,
  { success: true },
);

/**
 * Connect to the geolocation service endpoint and return the location data from a given IP
 *
 * @method ipApiConnector
 *
 * @param {string} ipAddress the ip address to retrive location data for
 *
 * @return {Object} the location object
 */
export const ipApiConnector = async (ipAddress: string = LOCAL_IP): Object => {
  /*
   * We're assuming the IP Address is correct (already validated)
   */
  const endpoint = `${GEOJS_ENDPOINT}${ipAddress}.json`;
  /*
   * If we're on localhost, just return the default (local) location object
   *
   * @TODO Maybe create a whitelist of allowed locahost IPs
   */
  if (ipAddress === LOCAL_IP) {
    return defaultLocationObject;
  }
  /*
   * This needs to be wrapped inside a try-catch block since the fetch request might fail
   */
  try {
    const fetchResult = await fetch(endpoint);
    /*
     * Parse the JSON response into an object
     */
    const resultsObject = Object.assign(
      defaultLocationObject,
      JSON.parse(await fetchResult.text()),
    );
    /*
     * Normalize the prop names and values
     */
    const {
      latitude,
      longitude,
      organization,
      lat,
      lon,
      as,
    } = resultsObject;
    Object.defineProperties(
      resultsObject,
      {
        lat: Object.assign({}, ENUMERABLE_PROP, { value: latitude || lat }),
        lon: Object.assign({}, ENUMERABLE_PROP, { value: longitude || lon }),
        as: Object.assign({}, ENUMERABLE_PROP, { value: organization || as }),
      },
    );
    return resultsObject;
  } catch (caughtError) {
    errorLogger(
      `Could not fetch data from the remote endpoint: '${endpoint}'`,
      null,
      caughtError.message,
    );
  } finally {
    /* eslint-disable no-unsafe-finally */
    defaultLocationObject.success = false;
    return defaultLocationObject;
  }
};

export default ipApiConnector;
