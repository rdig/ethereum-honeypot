/* @flow */

import { errorLogger } from '../errorLogger';

import { IPV6_LOCAL, PLACEHOLDER_IP, X_FORWARDED_HEADER } from './defaults';

/**
 * Get the request IP address from the request object
 * (It's found in various places across the request object depending on how the request
 * was made: direct, proxyies, vpns, etc...)
 *
 * @method getIpFromRequest
 *
 * @param {Object} requestObject the node `http` request object
 *
 * @return {string} the extract ip address (either ipv4 or ipv6)
 */
export const getIpFromRequest = (requestObject: Object): string => {
  if (
    !(requestObject && (requestObject.headers || requestObject.connection || requestObject.socket))
  ) {
    /*
     * @TODO Create a better error logging util
     */
    errorLogger(
      'Could not get IP address information from the Request Object',
      requestObject,
    );
  }
  const rawIpString: string = (
    requestObject.headers[X_FORWARDED_HEADER]
    || requestObject.connection.remoteAddress
    || requestObject.socket.remoteAddress
    || (requestObject.connection.socket
      ? requestObject.connection.socket.remoteAddress : PLACEHOLDER_IP)
  );
  if (rawIpString.indexOf(IPV6_LOCAL) >= 0) {
    return rawIpString.replace(IPV6_LOCAL, '');
  }
  return rawIpString;
};

export default getIpFromRequest;
