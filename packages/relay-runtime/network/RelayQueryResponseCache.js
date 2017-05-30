/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryResponseCache
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const stableJSONStringify = require('stableJSONStringify');

import type {QueryPayload} from 'RelayNetworkTypes';
import type {Variables} from 'RelayTypes';

type Response = {
  fetchTime: number,
  payload: QueryPayload,
};

/**
 * A cache for storing query responses, featuring:
 * - `get` with TTL
 * - cache size limiting, with least-recently *updated* entries purged first
 */
class RelayQueryResponseCache {
  _responses: Map<string, Response>;
  _size: number;
  _ttl: number;

  constructor({size, ttl}: {size: number, ttl: number}) {
    invariant(
      size > 0,
      'RelayQueryResponseCache: Expected the max cache size to be > 0, got ' +
        '`%s`.',
      size,
    );
    invariant(
      ttl > 0,
      'RelayQueryResponseCache: Expected the max ttl to be > 0, got `%s`.',
      ttl,
    );
    this._responses = new Map();
    this._size = size;
    this._ttl = ttl;
  }

  clear(): void {
    this._responses.clear();
  }

  get(queryID: string, variables: Variables): ?QueryPayload {
    const cacheKey = getCacheKey(queryID, variables);
    this._responses.forEach((response, key) => {
      if (!isCurrent(response.fetchTime, this._ttl)) {
        this._responses.delete(key);
      }
    });
    const response = this._responses.get(cacheKey);
    return response != null ? response.payload : null;
  }

  set(queryID: string, variables: Variables, payload: QueryPayload): void {
    const fetchTime = Date.now();
    const cacheKey = getCacheKey(queryID, variables);
    this._responses.delete(cacheKey); // deletion resets key ordering
    this._responses.set(cacheKey, {
      fetchTime,
      payload,
    });
    // Purge least-recently updated key when max size reached
    if (this._responses.size > this._size) {
      const firstKey = this._responses.keys().next();
      if (!firstKey.done) {
        this._responses.delete(firstKey.value);
      }
    }
  }
}

function getCacheKey(queryID: string, variables: Variables): string {
  return stableJSONStringify({queryID, variables});
}

/**
 * Determine whether a response fetched at `fetchTime` is still valid given
 * some `ttl`.
 */
function isCurrent(fetchTime: number, ttl: number): boolean {
  return fetchTime + ttl >= Date.now();
}

module.exports = RelayQueryResponseCache;
