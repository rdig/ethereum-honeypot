/* @flow */

export const errorLogger = (
  userMessage: string | void,
  errorValue: any,
  errorMessage: string | void,
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
