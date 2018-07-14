/* @flow */

import firestoreDatabase from './firebaseFirestoreConnector';

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
}: Object): Promise<*> => {
  try {
    let firestoreQuery = firestoreDatabase.collection(collection).where(fieldPath, opStr, value);
    if (limit) {
      firestoreQuery = firestoreQuery.limit(limit);
    }
    if (orderBy) {
      firestoreQuery = firestoreQuery.orderBy(orderBy, orderDirection);
    }
    return firestoreQuery.get();
  } catch (caughtError) {
    /*
     * @TODO Create a better error logging util
     */
    throw new Error(`[${new Date().toString()}] Could not get data from the Cloud Firestore Database. Check the query you were trying to use: ${fieldPath} ${opStr} ${value}. Error: ${caughtError.message}`);
  }
};

export default firebaseFirestoreGetData;
