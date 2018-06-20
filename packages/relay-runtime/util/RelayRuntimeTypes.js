/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

/**
 * Basic types used throughout Relay.
 */

/**
 * Represents any resource that must be explicitly disposed of. The most common
 * use-case is as a return value for subscriptions, where calling `dispose()`
 * would cancel the subscription.
 */
export type Disposable = {
  dispose(): void,
};

export type DataID = string;

// Variables
export type Variables = {[name: string]: $FlowFixMe};

export type RerunParam = {
  param: string,
  import?: ?string,
  target?: ?string,
  max_runs: number,
};

/**
 * Settings for how a query response may be cached.
 *
 * - `force`: causes a query to be issued unconditionally, irrespective of the
 *   state of any configured response cache.
 * - `poll`: causes a query to live update by polling at the specified interval
 *   in milliseconds. (This value will be passed to setTimeout.)
 * - `liveConfigId`: causes a query to live update by calling GraphQLLiveQuery,
 *   it represents a configuration of gateway when doing live query
 * - `rerunParamExperimental`: causes the query to be run with the experimental
 *   batch API on Network interfaces and GraphQL servers that support it.
 * - `metadata`: user-supplied metadata.
 */
export type CacheConfig = {
  force?: ?boolean,
  poll?: ?number,
  liveConfigId?: ?string,
  rerunParamExperimental?: ?RerunParam,
  metadata?: {[key: string]: mixed},
};
