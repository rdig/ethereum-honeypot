/* eslint-disable */

const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');

const honeyLogger = ({ request, payload, response } = {}) => {
  const ipAddressRaw = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || (request.connection.socket ? request.connection.socket.remoteAddress : null);
  const ipAddress = ipAddressRaw.substring(ipAddressRaw.lastIndexOf(':') + 1);

  const database = new sqlite3.Database('./honeypot.db');

  fetch(`http://ip-api.com/json/${ipAddress}`).then(res => res.text()).then((body) => {
    const fetchResponse = JSON.parse(body);
    let locationObject = {
      as: 'Local connection',
      city: 'Local connection',
      country: 'Local connection',
      isp: null,
      lat: 0.0,
      lon: 0.0,
    };
    if (!fetchResponse.message) {
      locationObject = {
        as: fetchResponse.as,
        city: fetchResponse.city,
        country: fetchResponse.country,
        lat: fetchResponse.lat,
        lon: fetchResponse.lon,
      };
    }
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
          locationObject.isp,
          request.headers['user-agent'] || false,
          payload.method,
          JSON.stringify(payload),
          response,
        ],
      );
    database.close();
  });
};

module.exports = honeyLogger;
