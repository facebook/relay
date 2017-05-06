/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryCaching
 * @flow
 * @format
 */

'use strict';

let queryCachingEnabled = true;

/**
 * Methods for configuring caching of Relay queries.
 */
const RelayQueryCaching = {
  /**
   * `disable` turns off caching of queries for `getRelayQueries` and
   * `buildRQL`.
   */
  disable(): void {
    queryCachingEnabled = false;
  },

  /**
   * @internal
   */
  getEnabled(): boolean {
    return queryCachingEnabled;
  },
};

module.exports = RelayQueryCaching;
