/* @flow */

import { errorLogger } from '../errorLogger';

import { getFirestoreReference } from './helpers';

import { RAW_COLLECTION } from './defaults';

/**
 * Get all obects from a specified firestore collection.
 * (This is useful to check for previously entered values and set the same geolocation data to the
 * new request, avoiding the need to hit the geo api again)
 *
 * @method firebaseFirestoreGetData
 *
 * @param {string} fieldPath name of the field to search for
 * @param {string} opStr comparison operator (as a string)
 * @param {any} value any value to test for
 * @param {number} limit optional limit the number of returned values
 * @param {string} orderBy optional prop name to order by
 * @param {string} orderDirection optional direction to order ('asc', 'desc')
 * @param {string} collection optional collection name, defaults to `rpc-requests`
 * @param {object} dataObject the object to write to the firestore database
 *
 * The above arguments are passed in as props of and Object
 *
 * @return {Object} the query snapshot
 * See: https://cloud.google.com/nodejs/docs/reference/firestore/0.14.x/Query
 */
export const firebaseFirestoreGetData = async ({
  fieldPath,
  opStr,
  value,
  limit,
  orderBy,
  orderDirection = 'asc',
  /*
   * @TODO Different collections if we're in a development environment
   */
  collection = RAW_COLLECTION,
  documentId,
}: Object): Promise<*> => {
  try {
    let firestoreQuery = getFirestoreReference({ collection });
    if (documentId) {
      firestoreQuery = firestoreQuery.doc(documentId);
    }
    if (fieldPath && opStr && value) {
      firestoreQuery = firestoreQuery.where(fieldPath, opStr, value);
    }
    if (limit) {
      firestoreQuery = firestoreQuery.limit(limit);
    }
    if (orderBy) {
      firestoreQuery = firestoreQuery.orderBy(orderBy, orderDirection);
    }
    return firestoreQuery.get();
  } catch (caughtError) {
    return errorLogger(
      'Could not get data from the Cloud Firestore Database',
      { fieldPath, opStr, value },
      caughtError.message,
    );
  }
};

export default firebaseFirestoreGetData;
