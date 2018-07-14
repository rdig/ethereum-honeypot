/* @flow */

export type honeypotDataObjectType = {
  city: string,
  country: string,
  date: Date,
  geoLocation: Object,
  ipAddress: string,
  method: string,
  network: string,
  request: Object | Array<*>,
  response: Object | Array<*>,
  userAgent: string,
};
