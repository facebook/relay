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
