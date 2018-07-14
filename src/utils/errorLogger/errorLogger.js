/* @flow */

/**
 * Throw and error with a log-formatted message
 * (Which will be logged inside a file on the system)
 *
 * @method errorLogger
 *
 * @param {string} userMessage A message to inform the user about the problem
 * @param {any} errorValue Optional variable value (if it's an Object, it will be serialized)
 * @param {string} errorMessage Optional message that came from a try-catch block
 */
export const errorLogger = (
  userMessage: string | void,
  errorValue?: any,
  errorMessage?: string | void,
) => {
  let loggerMessage: string;
  if (!userMessage) {
    return false;
  }
  loggerMessage = `[${new Date().toString()}] ${userMessage}.`;
  if (errorValue) {
    if (errorValue instanceof Object) {
      loggerMessage += ` Your object: ${JSON.stringify(errorValue)}.`;
    } else {
      loggerMessage += ` Yout value: ${errorValue}.`;
    }
  }
  if (errorMessage) {
    loggerMessage += ` Error: ${errorMessage}.`;
  }
  throw new Error(loggerMessage);
};

export default errorLogger;
