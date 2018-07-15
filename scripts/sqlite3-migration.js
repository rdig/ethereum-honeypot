/*
 * WARNING: This script requires quite a lot of memmory, as the whole sqlite3 file will be loaded
 * into your machines memmory.
 */

const sqlite3 = require('sqlite3');
const path = require('path');
const { sleep } = require('sleep');
const firestoreAdmin = require('firebase-admin');

const { errorLogger } = require('../lib/utils/errorLogger');
const { firebaseFirestoreBatch } = require('../lib/utils/firebase');

const FIREBASE_DEFAULTS = require('../lib/utils/firebase/defaults');

const { DB_PATH } = process.env;
const TABLE_NAME = process.env.TABLE_NAME || 'honeypot_new';
const COLLECTION = process.env.COLLECTION || FIREBASE_DEFAULTS.RAW_COLLECTION;
const FIRSTORE_BATCH_LIMIT = 2;
const SLEEP_SECS = 5;

if (!DB_PATH) {
  errorLogger(
    'Database path was not set, or was set to a wrong location',
    DB_PATH || 'undefined',
  );
}

console.log(`
  *****************************************************************************************
  * WARNING:                                                                              *
  * Don't run this more than one time on a single collection as your data will double and *
  * it will VERY hard to clean that up afterwards.                                        *
  *****************************************************************************************
`);

/*
 * Fetch the data from the Sqlite3 database
 */
const sqlite3DbInstance = new sqlite3.Database(path.resolve('.', DB_PATH));
const SELECT_QUERY = `SELECT * FROM ${TABLE_NAME} LIMIT 5`;

sqlite3DbInstance.serialize(() => {
  console.log('Starting import...');
  /*
   * Get the value from the database
   */
  sqlite3DbInstance.all(SELECT_QUERY, (error, allRows) => {
    console.log('Selected the queried rows from the database...');
    while (allRows.length) {
      /*
       * Create the array chunk
       *
       * In needs to be limited to under 500 since that's max we can send
       * in one batch to Firstore Service
       */
      const arrayChunk = allRows.slice(0, FIRSTORE_BATCH_LIMIT);
      allRows.splice(0, FIRSTORE_BATCH_LIMIT);
      /*
       * Log current id's
       */
      console.log(
        'Current batch of IDs that are being send to Firestore...',
        ...arrayChunk.map(({ id }) => id),
      );
      /*
       * Create the batch
       */
      firebaseFirestoreBatch(arrayChunk.map(({
        city,
        country,
        date,
        lat,
        lon,
        ip,
        method,
        network,
        request,
        response,
        ua,
      }) => ({
        collection: COLLECTION,
        batchMethod: 'set',
        dataObject: {
          city,
          country,
          date: new Date(new Date(0).setUTCSeconds(date)),
          geoLocation: new firestoreAdmin.firestore.GeoPoint(
            parseFloat(lat),
            parseFloat(lon),
          ),
          ipAddress: ip,
          method,
          network,
          request: JSON.parse(request),
          response: JSON.parse(response),
          userAgent: ua,
        },
      })));
      /*
       * Sleep, so we don't hammer the Firstore service
       */
      sleep(SLEEP_SECS);
      console.log('Finished processing current batch...');
    }
  });
});

sqlite3DbInstance.close();

console.log('Import finished successfully!');
