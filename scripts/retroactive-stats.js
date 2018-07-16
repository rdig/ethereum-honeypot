/*
 * WARNING: This script will most likely hit the limit of your daily quota of reads
 */
const sanitize = require('sanitize-filename');

const { firebaseFirestoreGetData, firebaseFirestoreBatch } = require('../lib/utils/firebase');

const FIREBASE_DEFAULTS = require('../lib/utils/firebase/defaults');
const { DOCUMENTS, UNDERSCORE } = require('../lib/stats/defaults');
const {
  getInitialDataObject,
  getExistingDataObject,
  getPaddedDate,
} = require('../lib/stats/helpers');

const COLLECTION = process.env.COLLECTION || FIREBASE_DEFAULTS.RAW_COLLECTION;
const STATS_COLLECTION = process.env.STATS_COLLECTION || FIREBASE_DEFAULTS.STATS_COLLECTION;
const STATS_COLLECTION_REPLICA = {
  [DOCUMENTS.COUNTRIES]: {},
  [DOCUMENTS.CITIES]: {},
  [DOCUMENTS.IPS]: {},
  [DOCUMENTS.METHODS]: {},
  [DOCUMENTS.USER_AGENTS]: {},
  [DOCUMENTS.YEARS]: {},
  [DOCUMENTS.MONTHS]: {},
  [DOCUMENTS.DAYS]: {},
};

const generateReplicaData = ({
  documentId,
  propName,
  additionalData,
}) => {
  const allStats = STATS_COLLECTION_REPLICA[documentId];
  if (!allStats || !Object.prototype.hasOwnProperty.call(allStats, propName)) {
    /*
     * Either the document id does not exist, or the prop name does not exist within the document
     *
     * In either case we, add it new (if the document id does not exist, it will be created)
     */
    STATS_COLLECTION_REPLICA[documentId] = getInitialDataObject({
      propName,
      additionalData,
      statsData: allStats,
    });
    return;
  }
  /*
   * Document id exists, and the current prop name exists, so we increment it
   */
  STATS_COLLECTION_REPLICA[documentId] = getExistingDataObject({
    propName,
    additionalData,
    statsData: allStats,
  });
};

const generateBatchArray = array => array.map(documentName => ({
  collection: STATS_COLLECTION,
  documentId: documentName,
  batchMethod: 'set',
  dataObject: STATS_COLLECTION_REPLICA[documentName],
}));

const processStats = async () => {
  console.log(`
    ***********************************************************************************************
    * WARNING:                                                                                    *
    * You should only run this script if you don't already have the 'rpc-requests-stats'          *
    * collection, otherwise it will be OVERWRITTEN!!!                                             *
    ***********************************************************************************************`);
  console.log(`
    ***********************************************************************************************
    * DOUBLE WARNING:                                                                             *
    * This will most likely make your account reach it's daily reads quota.                       *
    * Free accounts only have 50000 document reads / day.                                         *
    ***********************************************************************************************
  `);

  console.log(`Getting requests data from the '${COLLECTION}' collection...`);
  console.log();

  const allRequests = await firebaseFirestoreGetData({
    collection: COLLECTION,
  });

  /* eslint-disable-next-line array-callback-return */
  allRequests.docs.map((request, index) => {
    const {
      country,
      city,
      ipAddress,
      geoLocation,
      method,
      userAgent,
      date,
    } = request.data();
    console.log(`Started processing ID ${index + 1} of ${allRequests.docs.length}... ${request.id}`);
    /*
     * Countries
     */
    generateReplicaData({
      propName: country,
      documentId: DOCUMENTS.COUNTRIES,
    });
    /*
     * Cities
     */
    generateReplicaData({
      propName: city,
      documentId: DOCUMENTS.CITIES,
      additionalData: { geoLocation },
    });
    /*
     * IP Address
     */
    generateReplicaData({
      propName: ipAddress,
      documentId: DOCUMENTS.IPS,
    });
    /*
     * RPC Methods
     */
    generateReplicaData({
      propName: method,
      documentId: DOCUMENTS.METHODS,
    });
    /*
     * User Agents
     */
    let safeUserAgent = 'hidden';
    if (userAgent && typeof userAgent === 'string') {
      safeUserAgent = userAgent;
    }
    generateReplicaData({
      propName: sanitize(safeUserAgent, { replacement: UNDERSCORE }),
      documentId: DOCUMENTS.USER_AGENTS,
      additionalData: { name: safeUserAgent },
    });
    /*
     * Years
     */
    const year = date.getFullYear();
    generateReplicaData({
      propName: `${year}`,
      documentId: DOCUMENTS.YEARS,
    });
    /*
     * Months
     */
    /*
     * Month value is a 0 based index, so we need to increment it by one
     */
    const month = getPaddedDate(date.getMonth() + 1);
    generateReplicaData({
      propName: `${year}_${month}`,
      documentId: DOCUMENTS.MONTHS,
    });
    /*
     * Days
     */
    const day = getPaddedDate(date.getDate());
    generateReplicaData({
      propName: `${year}_${month}_${day}`,
      documentId: DOCUMENTS.DAYS,
    });
  });

  console.log();
  console.log('Finished collection data for the stats collection local replica...');
  console.log();

  console.log('Generating batch write instructions...');
  console.log();
  const batchArray = generateBatchArray([
    DOCUMENTS.COUNTRIES,
    DOCUMENTS.CITIES,
    DOCUMENTS.IPS,
    DOCUMENTS.METHODS,
    DOCUMENTS.USER_AGENTS,
    DOCUMENTS.YEARS,
    DOCUMENTS.MONTHS,
    DOCUMENTS.DAYS,
  ]);

  console.log('Batch write stats values to the Firestore...');
  console.log();
  firebaseFirestoreBatch(batchArray);

  console.log('Stats processing finished successfully!');
};

processStats();
