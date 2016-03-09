/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule generateForceIndex
 * @flow
 * @typechecks
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
