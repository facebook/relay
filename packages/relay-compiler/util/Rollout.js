/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const {createHash} = require('crypto');

let buckets: null | $ReadOnlyArray<boolean> = null;

/**
 * This module helps gradually rolling out changes to the code generation by
 * gradually enabling more buckets representing randomly distributed artifacts.
 */
function set(newBuckets: null | $ReadOnlyArray<boolean>) {
  buckets = newBuckets == null || newBuckets.length === 0 ? null : newBuckets;
}

function check(key: string): boolean {
  if (buckets === null) {
    return true;
  }
  const hash = createHash('md5')
    .update(key)
    .digest()
    .readUInt16BE(0);
  return buckets[hash % buckets.length];
}

module.exports = {
  set,
  check,
};
