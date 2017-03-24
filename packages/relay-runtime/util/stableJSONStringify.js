/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule stableJSONStringify
 */

'use strict';

/**
 * Simple recursive stringifier that produces a stable JSON string suitable for
 * use as a cache key. Does not handle corner-cases such as circular references
 * or exotic types.
 */
function stableJSONStringify(obj: mixed): string {
  if (Array.isArray(obj)) {
    const result = [];
    for (let ii = 0; ii < obj.length; ii++) {
      const value = obj[ii] !== undefined ?
        obj[ii] :
        null;
      result.push(stableJSONStringify(value));
    }
    return '[' + result.join(',') + ']';
  } else if (typeof obj === 'object' && obj) {
    const result = [];
    const keys = Object.keys(obj);
    keys.sort();
    for (let ii = 0; ii < keys.length; ii++) {
      const key = keys[ii];
      const value = stableJSONStringify(obj[key]);
      result.push(`"${key}":${value}`);
    }
    return '{' + result.join(',') + '}';
  } else {
    return JSON.stringify(obj);
  }
}

module.exports = stableJSONStringify;
