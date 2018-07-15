/* @flow */

import { errorLogger } from '../utils/errorLogger';
import {
  firebaseFirestoreAddData,
  firebaseFirestoreGetData,
  getFirestoreReference,
} from '../utils/firebase';

import { STATS_COLLECTION } from '../utils/firebase/defaults';
import { UNDEFINED } from './defaults';

const propNameCountInitial: number = 1;

/**
 * Helper method to generate an stats data object for a new prop name (one that hasn't been added before)
 *
 * @method getInitialDataObject
 *
 * @param {string} propName Stat name inside the document id to search for (basically the individual value inside the stats collection)
 * @param {Object} additionalData An optional object to add to the individual stat value, besides the count
 * @param {Object} statsData An option object containing already existing stats data
 *
 * The above params are passed in as props of an Object.
 */
export const getInitialDataObject = ({
  propName,
  additionalData,
  statsData = {},
}: {
  propName: string,
  additionalData?: Object,
  statsData?: Object,
}): Object => {
  /*
   * The current prop name does not exist. We add it now
   */
  let propNameData: Object | number;
  /*
  * If we have additional data to add, then the counter gets it's own prop name.
  */
  if (additionalData && additionalData instanceof Object) {
    propNameData = Object.assign(
      {},
      additionalData,
      { count: propNameCountInitial },
    );
  } else {
    /*
     * But if there's no additional data, just set the counter directly on the prop name
     */
    propNameData = propNameCountInitial;
  }
  return Object.assign(
    {},
    statsData,
    { [propName]: propNameData },
  );
};

/**
 * Helper method to generate an stats data object for an existing prop
 * (basically incrementing it's values by one)
 *
 * @method getExistingDataObject
 *
 * @param {string} propName Stat name inside the document id to search for (basically the individual value inside the stats collection)
 * @param {Object} additionalData An optional object to add to the individual stat value, besides the count
 * @param {Object} statsData An option object containing already existing stats data
 *
 * The above params are passed in as props of an Object.
 */
export const getExistingDataObject = ({
  propName,
  additionalData,
  statsData = {},
}: {
  propName: string,
  additionalData?: Object,
  statsData?: Object,
}): Object => {
  let propNameData: Object | number;
  /*
   * This is to check if this was just upgraded from a simple counter to an object
   */
  const propNameCount: number = statsData[propName].count
    ? statsData[propName].count + 1
    : statsData[propName] + 1;
  /*
   * If we have additional data to add, the counter gets it's own prop name.
   */
  if (additionalData && additionalData instanceof Object) {
    propNameData = Object.assign(
      {},
      statsData[propName],
      additionalData,
      { count: propNameCount },
    );
  } else {
    /*
     * But if there's no additional data, we just increment it
     */
    propNameData = propNameCount;
  }
  return Object.assign(
    {},
    statsData,
    { [propName]: propNameData },
  );
};

/**
 * Helper method to reduce code repetition when counting stats.
 * This will check if the document Id exists, if it is, it increments it, otherwise it adds it in.
 *
 * @method statsGenerator
 *
 * @param {string} collection Collection name, defaults to `rpc-requests-stats`
 * @param {string} documentId Document id to search for (basically the current stats collection)
 * @param {string} propName Stat name inside the document id to search for (basically the individual value inside the stats collection)
 * @param {Objecct} additionalData An optional object to add to the individual stat value, besides the count
 *
 * The above params are passed in as props of an Object.
 */
export const statsGenerator = async ({
  collection = STATS_COLLECTION,
  documentId,
  propName,
  additionalData,
}: {
  collection?: string,
  documentId: string,
  propName: string,
  additionalData?: Object,
}) => {
  if (!documentId) {
    errorLogger('Stats `documentId` was not set', documentId || UNDEFINED);
  }
  if (!propName) {
    errorLogger('Stats prop name was not set', propName || UNDEFINED);
  }
  const availableStatsFireabaseQuery: Object = await firebaseFirestoreGetData({
    collection,
    documentId,
  });
  const allStats = availableStatsFireabaseQuery.data();
  if (!allStats || !Object.prototype.hasOwnProperty.call(allStats, propName)) {
    /*
     * Either the document id does not exist, or the prop name does not exist within the document
     *
     * In either case we, add it new (if the document id does not exist, it will be created)
     */
    return firebaseFirestoreAddData({
      dataObject: getInitialDataObject({
        propName,
        additionalData,
        statsData: allStats,
      }),
      collection,
      documentId,
    });
  }
  /*
   * Document id exists, and the current prop name exists, so we increment it
   */
  return firebaseFirestoreAddData({
    dataObject: getExistingDataObject({
      propName,
      additionalData,
      statsData: allStats,
    }),
    collection,
    documentId,
  });
};

/**
 * Helper method for reducing code repetition when counting stats. This makes use of transactions
 * so that every documnet id / prop name can be changed in one call.
 *
 * This is just like batches, just that it can also read, not just write.
 *
 * The method takes in an Array of Objects containing transaction data.
 * The object needs to have the following structure:
 * {
 *   collection -- name of the collection to select
 *   documentId -- the id of the document to select
 *   propName -- Name of the prop to check for
 *   additionalData -- Additional data object to write to the prop
 * }
 *
 * Usage example:
 *
 * await statsTransactionGenerator([
 *   {
 *     documentId: 'countries',
 *     propName: 'Netherlands',
 *   },
 *   {
 *     documentId: 'countries',
 *     propName: 'Germany',
 *     additionalData: { geoLocation: { lat: 1.2, lon: 3.4 }},
 *   },
 * ]);
 *
 * @method statsTransactionGenerator
 *
 * @param {Object} transactionObject The transaction reference object
 * @param {Array} transactionStatsArray Array composed of objects that contain the transaction data.
 */
export const statsTransactionGenerator = async ({
  transactionObject,
  transactionStatsArray,
}: {
  transactionObject: Object,
  transactionStatsArray: Array<Object>,
}) => {
  if (!transactionObject) {
    /*
     * @TODO Move message string to `messages.json`
     */
    errorLogger(
      'Transaction object was not passed in to the `statsTransactionGenerator` helper. Cannot proceed further',
      transactionObject || UNDEFINED,
    );
  }
  if (!transactionStatsArray || !Array.isArray(transactionStatsArray)) {
    /*
     * @TODO Move message string to `messages.json`
     */
    return errorLogger(
      'Transaction stats paramenter you provided is not an Array',
      transactionStatsArray || UNDEFINED,
    );
  }
  try {
    /*
     * Since this is a transaction, we first need to read the data, and only then we can write it.
     */
    const transactionAvailableStatsData: Array<Object> = await transactionStatsArray
      /*
       * If one of the array's value is an empty Object (or does not contain the `documentId`
       * and `propName` props), we filter it out.
       *
       * This way we don't track stats that we cannot (we dont't have the value), but we also don't
       * prevent other stats from being tracked.
       */
      .filter(({
        documentId,
        propName,
      }: {
        documentId: string,
        propName: string,
      }) => {
        try {
          if (!documentId) {
            /*
             * @TODO Move message string to `messages.json`
             */
            errorLogger('Stats `documentId` was not set', documentId || UNDEFINED);
          }
          if (!propName) {
            /*
             * @TODO Move message string to `messages.json`
             */
            errorLogger('Stats prop name was not set', propName || UNDEFINED);
          }
          return true;
        } catch (caughtError) {
          return false;
        }
      })
      .map(async ({
        collection = STATS_COLLECTION,
        documentId,
        propName,
        additionalData,
      }: {
        collection?: string,
        documentId: string,
        propName: string,
        additionalData?: Object,
      }) => {
        const statsDocumentReference = getFirestoreReference({ collection, documentId });
        const transactionQuery: Object = await transactionObject.get(statsDocumentReference);
        const transactionStatsData = transactionQuery.data();
        return {
          reference: statsDocumentReference,
          data: transactionStatsData,
          propName,
          additionalData,
        };
      });
    /*
     * We've got the data, now we process it and write back
     */
    return Promise.all(transactionAvailableStatsData.map(async (
      availableData: {
      reference: Object,
      data: Object,
      propName: string,
      additionalData: Object,
    }) => {
      const {
        reference,
        data,
        propName,
        additionalData,
      } = await availableData;
      if (!data || !Object.prototype.hasOwnProperty.call(data, propName)) {
        /*
         * Either the document id does not exist, or the prop name does not exist within the document
         *
         * In either case we, add it new (if the document id does not exist, it will be created)
         */
        return transactionObject.set(
          reference,
          getInitialDataObject({
            propName,
            additionalData,
            statsData: data,
          }),
        );
      }
      /*
       * Document id exists, and the current prop name exists, so we increment it
       */
      return transactionObject.set(
        reference,
        getExistingDataObject({
          propName,
          additionalData,
          statsData: data,
        }),
      );
    }));
  } catch (caughtError) {
    /*
     * @TODO Move message string to `messages.json`
     */
    return errorLogger(
      'Could not run the Firestore stats transaction',
      transactionStatsArray,
      caughtError.message,
    );
  }
};

/**
 * Pad a given date with zeros (where apropriate).
 *
 * Date values under 10 are single digits, and in certain cases we need to write them with a
 * leading zero.
 *
 * @method getPaddedDate
 *
 * @param {number | string} date The date number (or string) to pad
 *
 * @return {string} The padded string
 */
export const getPaddedDate = (date: number | string) => {
  if (!date) {
    /*
     * @TODO Move message string to `messages.json`
     */
    return errorLogger(
      'The date value is undefined or 0',
      date || UNDEFINED,
    );
  }
  if (parseInt(date, 10) <= 9) {
    return `0${date}`;
  }
  return date;
};
