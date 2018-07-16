/* @flow */

import * as firebaseAdmin from 'firebase-admin';

import { errorLogger } from '../errorLogger';

import { SERVICE_ACCOUNT_KEY_PATH } from './defaults';

/*
 * Export an (almost) empty object if we cannot establish the connection
 *
 * Get a new Firestore Admin Database instance by instantiating the values found inside the service
 * account key. If it can't find it, it will throw and Error.
 *
 * You can download your key from:
 * `https://console.firebase.google.com/u/0/project/<your-projects-name>/settings/serviceaccounts/adminsdk`
 */
/* eslint-disable-next-line import/no-mutable-exports */
let firestoreDatabaseConnection: Object = {};

try {
  /*
   * We need to test if the `serviceAccountKey` file is present, otherwise we won't
   * be able to establish the connection to the Firebase service.
   */
  /* eslint-disable global-require, import/no-dynamic-require */
  /* $FlowFixMe */
  const serviceAccountKey = require(SERVICE_ACCOUNT_KEY_PATH);
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccountKey),
  });
  firestoreDatabaseConnection = firebaseAdmin.firestore();
} catch (caughtError) {
  /*
   * @TODO Move message string to `messages.json`
   */
  errorLogger(
    "Cannot find the 'serviceAccountKey' file. Make sure you've downloaded it from the Firebase Console: `https://console.firebase.google.com/u/0/project/<your-projects-name>/settings/serviceaccounts/adminsdk`",
    null,
    caughtError.message,
  );
}

export default firestoreDatabaseConnection;
