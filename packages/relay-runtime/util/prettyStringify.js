/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule prettyStringify
 * @format
 */

'use strict';

/**
 * Simple wrapper for `JSON.stringify` that adds whitespace to aid readability:
 *
 * ```
 * const object = {a: 1, b 2};
 *
 * JSON.stringify(object);  // {"a":1,"b":2}
 *
 * prettyStringify(object); // {
 *                          //   "a": 1,
 *                          //   "b": 2
 *                          // }
 * ```
 */
function prettyStringify(stringifiable: mixed): string {
  return JSON.stringify(stringifiable, null, 2);
}

module.exports = prettyStringify;
