/* @flow */

import { errorLogger } from '../utils/errorLogger';
import { firebaseFirestoreAddData, firebaseFirestoreGetData } from '../utils/firebase';

import { UNDEFINED } from './defaults';
import { STATS_COLLECTION } from '../utils/firebase/defaults';

/**
 * Helper method to reduce code repetition when counting stats.
 * This will check if the document Id exists, if it is, it increments it, otherwise it adds it in.

 * @method statsGenerator

 * @param {string} collection Collection name, defaults to `rpc-requests-stats`
 * @param {string} documentId Document id to search for (basically the current stats collection)
 * @param {string} propName Stat name inside the document id to search for (basically the individual value inside the stats collection)
 * @param {Objecct} additionalData An optional object to add to the individual stat value, besides the count
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
  const propNameCountInitial: number = 1;
  const availableStatsFireabaseQuery: Object = await firebaseFirestoreGetData({
    collection,
    documentId,
  });
  /*
   * Document id does not exist, this is the first entry of it's kind, so we add it.
   */
  if (!availableStatsFireabaseQuery.exists) {
    /*
     * If we don't have additional data, just count the entries,
     * and since this is the first one, it's 1
     */
    const dataObject: Object = {};
    dataObject[propName] = propNameCountInitial;
    /*
     * But if we have additional data to add, the counter gets it's own prop name.
     */
    if (additionalData && additionalData instanceof Object) {
      dataObject[propName] = Object.assign(
        {},
        { count: propNameCountInitial },
        additionalData,
      );
    }
    return firebaseFirestoreAddData({
      dataObject,
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

  /*
   * Document id exists, and the current prop name exists, so we increment it
   */
  let propNameData: Object | number;
  /*
  * If we have additional data to add, the counter gets it's own prop name.
  */
  if (additionalData && additionalData instanceof Object) {
    propNameData = Object.assign(
      {},
      additionalData,
      { count: propNameCountInitial },
    );
  } else {
    /*
     * But if there's no additional data, we just increment it
     */
    propNameData = propNameCountInitial;
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
};

export default statsGenerator;
