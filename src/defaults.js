/* @flow */

export const RPC_DEFAULT_PORT: number = 8545;

export const MIME_TYPES: Object = {
  JSON: 'application/json',
  PLAIN_TEXT: 'text/plain',
};

export const STATUS_CODES: Object = {
  OK: 200,
  BAD_REQUEST: 400,
};

export const DEFAULT_HEADERS: Object = {
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Content-Type': MIME_TYPES.PLAIN_TEXT,
};

export const REQUEST_TYPES: Object = {
  ERROR: 'error',
  DATA: 'data',
  END: 'end',
};

export const REQUEST_METHODS: Object = {
  POST: 'POST',
  GET: 'GET',
  OPTIONS: 'OPTIONS',
};

export const LOCAL_IP: string = '127.0.0.1';
