/* @flow */

/*
 * Flow has problems with this import, even after I've added in a generic flow type
 */
/* $FlowFixMe */
import * as firebaseAdmin from 'firebase-admin';

/*
 * Export an (almost) empty object if we cannot establish the connection
 */
/* eslint-disable-next-line import/no-mutable-exports */
let firestoreDatabaseConnection: Object = {
  connection: false,
};

try {
  /*
   * We need to test if the `serviceAccountKey` file is present, otherwise we won't
   * be able to establish the connection to the Firebase service.
   */
  /* eslint-disable-next-line global-require */
  const serviceAccountKey = require('../../../serviceAccountKey.json');
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccountKey),
  });
  firestoreDatabaseConnection = firebaseAdmin.firestore();
} catch (caughtError) {
  /*
   * @TODO Create a better error logging util
   */
  throw new Error(`[${new Date().toString()}] Cannot find the 'serviceAccountKey' file. Make sure you've downloaded it from the Firebase Console: https://console.firebase.google.com/`);
}

export default firestoreDatabaseConnection;
