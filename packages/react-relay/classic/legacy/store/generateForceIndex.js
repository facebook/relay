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

let _index = 1;

/**
 * Generate a new force index used to write GraphQL data in the store. A new
 * force index can be used to overwrite previous ranges.
 *
 * @internal
 */
function generateForceIndex(): number {
  return _index++;
}

module.exports = generateForceIndex;
