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

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Returns two arrays of keys that contain each object's exclusive keys.
 */
function filterExclusiveKeys(
  a: ?Object,
  b: ?Object,
): [Array<string>, Array<string>] {
  const keysA = a ? Object.keys(a) : [];
  const keysB = b ? Object.keys(b) : [];

  if (keysA.length === 0 || keysB.length === 0) {
    return [keysA, keysB];
  }
  return [
    keysA.filter(key => !hasOwnProperty.call(b, key)),
    keysB.filter(key => !hasOwnProperty.call(a, key)),
  ];
}

module.exports = filterExclusiveKeys;
