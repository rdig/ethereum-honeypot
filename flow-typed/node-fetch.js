/* @flow */

/*
 * Flow doesn't play well with `node-fetch's` module export so we need to declare
 * it explicitly.
 *
 * See: https://github.com/facebook/flow/issues/2092
 */
declare module 'node-fetch' {
  declare module.exports: any;
}
