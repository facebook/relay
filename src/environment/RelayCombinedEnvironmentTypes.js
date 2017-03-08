/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCombinedEnvironmentTypes
 * @flow
 */

'use strict';

/**
 * Settings for how a query response may be cached.
 *
 * - `force`: causes a query to be issued unconditionally, irrespective of the
 *   state of any configured response cache.
 */
export type CacheConfig = {
  force: boolean,
};

/**
 * Represents any resource that must be explicitly disposed of. The most common
 * use-case is as a return value for subscriptions, where calling `dispose()`
 * would cancel the subscription.
 */
export type Disposable = {
  dispose(): void,
};

/**
 * The results of reading the results of a FragmentMap given some input
 * `Props`.
 */
export type FragmentSpecResults = {[key: string]: mixed};
