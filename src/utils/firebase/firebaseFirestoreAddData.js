/* @flow */

import firestoreDatabase from './firebaseFirestoreConnector';

import { DEFAULT_COLLECTION } from './defaults';

/**
 * Write a new object (under a randomly generated id) into the specified collection.
 * (This is using the "still beta" Cloud Firestore Database API)
 *
 * @param {object} honeypotObject the object to write to the firestore database
 * @param {string} collection optional collection name, defaults to `rpc-requests`
 *
 * The above arguments are passed in as props of and Object
 */
export const firebaseFirestoreAddData = async ({
  honeypotObject,
  /*
   * @TODO Different collections if we're in a development environment
   */
  collection = DEFAULT_COLLECTION,
}: Object): Promise<*> => {
  try {
    return firestoreDatabase.collection(collection).doc().set(honeypotObject);
  } catch (caughtError) {
    console.log(`[${new Date().toString()}] Could not add data to the Cloud Firestore Database. Check the object you were trying to add: ${JSON.stringify(honeypotObject)}`);
    return false;
  }
};

export default firebaseFirestoreAddData;
