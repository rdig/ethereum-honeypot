/* @flow */

import { errorLogger } from '../utils/errorLogger';

import { getPaddedDate } from './helpers';

import { DOCUMENTS, UNDEFINED } from './defaults';

/**
 * Track the number of times a unique request was made this day, month and year
 *
 * Note:
 * As opposed to the other stats methods, this exports an array in itself, so it will need to be
 * either concatenated or spread.
 *
 * @method datesStats
 *
 * @param {Date} date The current date (as a Date object instance)
 */
export const datesStats = (date: Date): Array<Object> => {
  try {
    if (!date || !(date instanceof Date)) {
      /*
       * @TODO Move message string to `messages.json`
       */
      errorLogger(
        "Stats date not available, we're not counting it",
        date || UNDEFINED,
      );
    }
    const year: number = date.getFullYear();
    /*
     * Month value is a 0 based index, so we need to increment it by one
     */
    const month: string = getPaddedDate(date.getMonth() + 1);
    const day: string = getPaddedDate(date.getDate());
    return [
      {
        documentId: DOCUMENTS.YEARS,
        propName: `${year}`,
      },
      {
        documentId: DOCUMENTS.MONTHS,
        propName: `${year}_${month}`,
      },
      {
        documentId: DOCUMENTS.DAYS,
        propName: `${year}_${month}_${day}`,
      },
    ];
  } catch (caughtError) {
    return [{}];
  }
};

export default datesStats;
