const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');

const honeyLogger = ({ request, payload, response } = {}) => {
  const ipAddressRaw = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || (request.connection.socket ? request.connection.socket.remoteAddress : null);
  const ipAddress = ipAddressRaw.substring(ipAddressRaw.lastIndexOf(':') + 1);

  const database = new sqlite3.Database('./honeypot.db');

  fetch(`http://ip-api.com/json/${ipAddress}`).then(res => res.text()).then(body => {
    const fetchResponse = JSON.parse(body);
    let locationObject = {
      as: 'Local connection',
      city: 'Local connection',
      country: 'Local connection',
      isp: 'Local connection',
    };
    if (!fetchResponse.message) {
      locationObject = {
        as: fetchResponse.as,
        city: fetchResponse.city,
        country: fetchResponse.country,
        isp: fetchResponse.country,
      };
    }
    database
      .run(
        'CREATE TABLE IF NOT EXISTS honeypot_new (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, city TEXT, country TEXT, network TEXT, isp TEXT, ua TEXT, method TEXT, request TEXT, response TEXT, date INT);'
      )
      .run(
        `INSERT INTO honeypot_new (ip, city, country, network, isp, ua, method, request, response, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s','now'))`,
        [
          ipAddress,
          locationObject.city,
          locationObject.country,
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
}

module.exports = honeyLogger;
