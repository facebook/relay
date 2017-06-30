/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCompilerCache
 * @flow
 * @format
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * A file backed cache. Values are JSON encoded on disk, so only JSON
 * serializable values should be used.
 */
class RelayCompilerCache<T> {
  _dir: string;

  /**
   * @param name         Human readable identifier for the cache
   * @param cacheBreaker This should be changed in order to invalidate existing
   *                     caches.
   */
  constructor(name: string, cacheBreaker: string) {
    // Include username in the cache dir to avoid issues with directories being
    // owned by a different user.
    const username = os.userInfo().username;
    const cacheID = crypto
      .createHash('md5')
      .update(cacheBreaker)
      .update(username)
      .digest('hex');
    this._dir = path.join(os.tmpdir(), `${name}-${cacheID}`);
    if (!fs.existsSync(this._dir)) {
      fs.mkdirSync(this._dir);
    }
  }

  getOrCompute(key: string, compute: () => T): T {
    const cacheFile = path.join(this._dir, key);
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }
    const value = compute();
    fs.writeFileSync(cacheFile, JSON.stringify(value), 'utf8');
    return value;
  }
}

module.exports = RelayCompilerCache;
