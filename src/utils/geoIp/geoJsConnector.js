/* @flow */

/*
 * Flow has problems with this import, even after I've added in a generic flow type
 */
/* $FlowFixMe */
import fetch from 'node-fetch';

import { GEOJS_ENDPOINT, LOCAL_GEO_OBJECT, ENUMERABLE_PROP } from './defaults';
import { LOCAL_IP } from '../../defaults';

const geoJsConnector = async (ipAddress: string = LOCAL_IP): Object => {
  /*
   * We're assuming the IP Address is correct (already validated)
   */
  const endpoint = `${GEOJS_ENDPOINT}${ipAddress}.json`;
  /*
   * This needs to be wrapped inside a try-catch block since the fetch request might fail
   */
  try {
    const fetchResult = await fetch(endpoint);
    /*
     * Parse the JSON response into an object
     */
    const resultsObject = Object.assign(
      LOCAL_GEO_OBJECT,
      JSON.parse(await fetchResult.text()),
      { success: true },
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
    /*
     * @TODO Create a better error logging util
     */
    console.log(`[${new Date().toString()}] Could not fetch data from the remote endpoint: '${endpoint}'. ${caughtError.message}`);
    return ({
      success: false,
    });
  }
};

export default geoJsConnector;
