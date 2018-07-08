/* eslint-disable */

/*
 * WARNING: This code is legacy.
 */

 /*
  * Flow has problems with this import, even after I've added in a generic flow type
  */
 /* $FlowFixMe */
import { firestore } from 'firebase-admin';

import geoJsConnector from '../utils/geoIp';
import firebaseFirestoreAddData from '../utils/firebase';

const { GeoPoint } = firestore;

const honeyLogger = async ({ request, payload, response } = {}) => {
  const ipAddressRaw = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || (request.connection.socket ? request.connection.socket.remoteAddress : null);
  const ipAddress = ipAddressRaw.substring(ipAddressRaw.lastIndexOf(':') + 1);

  const geoObject = await geoJsConnector(ipAddress);

  if (geoObject && geoObject.success) {
    const { city, country, lat, lon, as: network } = geoObject;
    await firebaseFirestoreAddData({
      honeypotObject: Object.assign(
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
          method: payload.method,
          request: payload,
          response: JSON.parse(response),
          date: new Date(),
        },
      ),
    });
  }
};

module.exports = honeyLogger;
