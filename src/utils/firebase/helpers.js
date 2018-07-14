/* @flow */

import { errorLogger } from '../errorLogger';

import firestoreDatabase from './firebaseFirestoreConnector';

import { RAW_COLLECTION, UNDEFINED } from './defaults';

/**
 * Get a reference to a firestore collection and, optionally,
 * also to an document id inside that collection.
 *
 * @method getFirestoreReference
 *
 * @param {string} collection The name of the collection, defaults to `rpc-requests-raw`
 * @param {string} documentId And optional document id name
 *
 * @return {Object} An instance reference to the collection (and optionally to the document id)
 */
export const getFirestoreReference = ({
  collection = RAW_COLLECTION,
  documentId,
}: {
  collection: string,
  documentId?: string,
}): Object => {
  try {
    if (!collection) {
      /*
       * @TODO Move message string to `messages.json`
       */
      errorLogger(
        'Could not get firestore reference using the collection name',
        collection || UNDEFINED,
      );
    }
    const firestoreReference = firestoreDatabase.collection(collection);
    if (documentId) {
      return firestoreReference.doc(documentId);
    }
    return firestoreReference;
  } catch (caughtError) {
    /*
     * @TODO Move message string to `messages.json`
     */
    /* $FlowFixMe */
    return errorLogger(
      'An error occured trying to get a firestore reference',
      { collection, documentId },
      caughtError.message,
    );
  }
};

export default getFirestoreReference;
