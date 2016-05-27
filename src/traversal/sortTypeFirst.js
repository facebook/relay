/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule sortTypeFirst
 * @flow
 */

'use strict';

const TYPE = '__type__';

function sortTypeFirst(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (a === TYPE) {
    return -1;
  }
  if (b === TYPE) {
    return 1;
  }
  return 0;
}

module.exports = sortTypeFirst;
