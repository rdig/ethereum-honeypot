const sqlite3 = require('sqlite3').verbose();

const honeyLogger = ({ request, payload } = {}) => {
  const ipAddressRaw = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || (request.connection.socket ? request.connection.socket.remoteAddress : null);
  const ipAddress = ipAddressRaw.substring(ipAddressRaw.lastIndexOf(':') + 1);

  const database = new sqlite3.Database('./honeypot.db');

  database
    .run(
      'CREATE TABLE IF NOT EXISTS honeypot (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, loc TEXT, ua TEXT, method TEXT, raw TEXT, date TEXT);'
    )
    .run(
      'INSERT INTO honeypot (ip, loc, ua, method, raw, date) VALUES (?, ?, ?, ?, ?, ?)',
      [ipAddress, null, request.headers['user-agent'] || false, payload.method, JSON.stringify(payload), new Date().getTime()],
    );

  database.close();

}

module.exports = honeyLogger;
