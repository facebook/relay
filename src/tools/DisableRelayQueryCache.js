/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule disableRelayQueryCache
 * @flow
 */
'use strict';


let queryCacheEnabled = true;

/**
 * `disableQueryCache` turns off caching of queries for `getRelayQueryies` and `buildRQL`
 */
function disableCache(): void {
  queryCacheEnabled = false;
}

/**
 * @internal
 *
 */
function getCacheEnabled(): boolean {
  return queryCacheEnabled;
}

module.exports = {
  disableCache,
  getCacheEnabled,
}
