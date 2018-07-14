/* eslint-disable */

/*
 * WARNING: This code is legacy.
 */

 /*
  * Flow has problems with this import, even after I've added in a generic flow type
  */
 /* $FlowFixMe */
import { firestore } from 'firebase-admin';

import { getIpFromRequest } from '../utils/getIpFromRequest';
import { ipApiConnector } from '../utils/geoIp';
import { firebaseFirestoreAddData, firebaseFirestoreGetData } from '../utils/firebase';

const { GeoPoint } = firestore;

import type { honeypotDataObjectType } from '../flowtypes';

const honeyLogger = async ({ request, payload, response } = {}) => {
  const ipAddress: string = getIpFromRequest(request);
  let geoObject: Object = { success: false };
  /*
   * Check if we already have this IP's geolocation data in the Firestore database.
   *
   * If we do, we're using that to avoid making multiple identical requests to the geolocation API
   *
   * @TODO Order queries by `date` ascending
   *
   * Problem with this is that Firestore needs an index created for this to work, which will add
   * and extra step to the (already kind of complex) setup process
   */
  const availableIpFirebaseQuery: Object = await firebaseFirestoreGetData({
    fieldPath: 'ipAddress',
    opStr: '==',
    value: ipAddress,
    limit: 1,
  });
  /*
   * We already have the data, let's just get it.
   */
  if (availableIpFirebaseQuery.docs[0]) {
    const {
      city: existentCity,
      country: existentCountry,
      geoLocation: {
        _latitude: existentLat,
        _longitude: existentLon,
      },
      network: existentAs
    } = availableIpFirebaseQuery.docs[0].data();
    geoObject = {
      city: existentCity,
      country: existentCountry,
      lat: existentLat,
      lon: existentLon,
      as: existentAs,
      success: true,
    };
  /*
   * We don't have the geolocation data in the database, fetch it
   */
  } else {
    geoObject = await ipApiConnector(ipAddress);
  }
  /*
   * Write the new entry to the database
   */
  if (geoObject && geoObject.success) {
    const { city, country, lat, lon, as: network } = geoObject;
    let failedResponse: Array<boolean> = [];
    const responseObject: Object = JSON.parse(response);
    /*
    * Don't log the request/response if it failed (most likely some empty request that tried to
    * bypass the provider)
    *
    * @TODO Better response validation (maybe inside the server?)
    */
    if (Array.isArray(responseObject)) {
      if (!responseObject.length) {
        failedResponse.push(true);
      }
      if (responseObject[0] && responseObject[0].error) {
        failedResponse.push(true);
      }
    }
    if (responseObject instanceof Object && responseObject.error) {
      failedResponse.push(true);
    }
    if (failedResponse.some(failedResponses => failedResponses === true)) {
      throw new Error(`Request could not be handled. Not Logging it.`);
    }
    await firebaseFirestoreAddData({
      dataObject: Object.assign(
        {},
        {
          ipAddress,
          city,
          country,
          geoLocation: new GeoPoint(
            parseFloat(lat),
            parseFloat(lon)
          ),
          network,
          userAgent: request.headers['user-agent'] || false,
          /*
           * Request might be an array, so just take the first index from it
           *
           * It also might be an empty array with no method prop in the first index's object
           */
          method:
            (Array.isArray(payload) && payload.length === 1)
              ? payload[0].method
              : payload.method,
          request:
            (Array.isArray(payload) && payload.length === 1)
              ? payload[0]
              : payload,
          response:
            (Array.isArray(responseObject) && responseObject.length === 1)
              ? responseObject[0]
              : responseObject,
          date: new Date(),
        },
      ),
    }: { dataObject: honeypotDataObjectType });
  }
};

module.exports = honeyLogger;
