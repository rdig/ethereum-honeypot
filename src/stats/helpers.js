/* @flow */

import { errorLogger } from '../utils/errorLogger';
import {
  firebaseFirestoreAddData,
  firebaseFirestoreGetData,
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
  /*
   * Document id does not exist, this is the first entry of it's kind, so we add it.
   */
  if (!availableStatsFireabaseQuery.exists) {
    return firebaseFirestoreAddData({
      dataObject: getInitialDataObject({ propName, additionalData }),
      collection,
      documentId,
    });
  }
  /*
   * Document id exists, let's see if the current prop name exists
   */
  const allStats = availableStatsFireabaseQuery.data();
  if (Object.prototype.hasOwnProperty.call(allStats, propName)) {
    /*
     * Document id exists, and the current prop name exists, so we increment it
     */
    let propNameData: Object | number;
    /*
     * This is to check if this was just upgraded from a simple counter to an object
     */
    const propNameCount: number = allStats[propName].count
      ? allStats[propName].count + 1
      : allStats[propName] + 1;
    /*
     * If we have additional data to add, the counter gets it's own prop name.
     */
    if (additionalData && additionalData instanceof Object) {
      propNameData = Object.assign(
        {},
        allStats[propName],
        additionalData,
        { count: propNameCount },
      );
    } else {
      /*
       * But if there's no additional data, we just increment it
       */
      propNameData = propNameCount;
    }
    return firebaseFirestoreAddData({
      dataObject: Object.assign(
        {},
        allStats,
        { [propName]: propNameData },
      ),
      collection,
      documentId,
    });
  }
  /*
   * Document id exists, but the current prop name does not exist. We add it now
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
};
