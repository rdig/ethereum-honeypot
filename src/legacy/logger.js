/* eslint-disable */

/*
 * WARNING: This code is legacy.
 */

import validateIPAddress from '../validators';
import geoJsConnector from '../utils/geoIp';

const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');

const honeyLogger = async ({ request, payload, response } = {}) => {
  const ipAddressRaw = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || (request.connection.socket ? request.connection.socket.remoteAddress : null);
  const ipAddress = ipAddressRaw.substring(ipAddressRaw.lastIndexOf(':') + 1);
  if (!validateIPAddress(ipAddress)) {
    /*
     * @TODO Create a better error logging util
     */
    throw new Error(`[${new Date().toString()}] IP address ${ipAddress} is not valid`);
  }
  const locationObject = await geoJsConnector(ipAddress);
  if (locationObject && locationObject.success) {
    const database = new sqlite3.Database('./honeypot.db');
    database
      .run(
        'CREATE TABLE IF NOT EXISTS honeypot_new (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, city TEXT, country TEXT, lat INT, lon INT, network TEXT, isp TEXT, ua TEXT, method TEXT, request TEXT, response TEXT, date INT);',
      );
    database
      .run(
        'INSERT INTO honeypot_new (ip, city, country, lat, lon, network, isp, ua, method, request, response, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime(\'%s\',\'now\'))',
        [
          ipAddress,
          locationObject.city,
          locationObject.country,
          locationObject.lat,
          locationObject.lon,
          locationObject.as,
          locationObject.isp || false,
          request.headers['user-agent'] || false,
          payload.method,
          JSON.stringify(payload),
          response,
        ],
      );
    database.close();
  }
};

module.exports = honeyLogger;
