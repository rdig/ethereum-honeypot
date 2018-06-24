/* @flow */

import type { StatusCodesType, MimeTypesType } from './flowtypes';

export const RPC_DEFAULT_PORT: number = 8545;

export const MIME_TYPES: MimeTypesType = {
  JSON: 'application/json',
};

export const STATUS_CODES: StatusCodesType = {
  SUCCESS: 200,
};

const defaults = {
  MIME_TYPES,
  STATUS_CODES,
};

export default defaults;
