/* @flow */

import { start } from './server';
import honeyLogger from './legacy/logger';

/*
 * These get passed directly into the `ganache-core` provider
 */
const providerOptions: Object = {
  gasLimit: 7000000,
  total_accounts: 50,
};

/*
 * Start the server
 */
start({
  providerOptions,
  logger: honeyLogger,
});
