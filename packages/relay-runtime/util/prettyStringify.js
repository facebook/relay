/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
