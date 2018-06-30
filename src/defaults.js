/* @flow */

export const RPC_DEFAULT_PORT: number = 8545;

export const MIME_TYPES: Object = {
  JSON: 'application/json',
  PLAIN_TEXT: 'text/plain',
};

export const STATUS_CODES: Object = {
  SUCCESS: 200,
};

export const DEFAULT_HEADERS: Object = {
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Content-Type': MIME_TYPES.PLAIN_TEXT,
};

const defaults = {
  MIME_TYPES,
  STATUS_CODES,
};

export default defaults;
