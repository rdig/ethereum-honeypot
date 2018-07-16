/* @flow */

import { errorLogger } from '../errorLogger';

import { getFirestoreReference } from './helpers';

import { RAW_COLLECTION } from './defaults';

/**
 * Write a new object (under a randomly generated id) into the specified collection.
 * (This is using the "still beta" Cloud Firestore Database API)
 *
 * @param {object} dataObject the object to write to the firestore database
 * @param {string} collection optional collection name
 * @param {string} document optional document name, if you want to set data directly onto an existing id
 *
 * The above arguments are passed in as props of and Object
 */
export const firebaseFirestoreAddData = async ({
  dataObject,
  /*
   * @TODO Different collections if we're in a development environment
   */
  collection = RAW_COLLECTION,
  documentId,
}: Object): Promise<*> => {
  try {
    const firestoreQuery = getFirestoreReference({ collection });
    if (documentId) {
      return firestoreQuery.doc(documentId).set(dataObject);
    }
    return firestoreQuery.add(dataObject);
  } catch (caughtError) {
    return errorLogger(
      'Could not add data to the Cloud Firestore Database',
      dataObject,
      caughtError.message,
    );
  }
};

export default firebaseFirestoreAddData;
