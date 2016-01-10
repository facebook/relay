/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

const util = require('util');

function invariant(
  condition: mixed,
  format: string,
  ...args: Array<mixed>
): void {
  if (!condition) {
    throw new Error(util.format(format, ...args));
  }
}

module.exports = invariant;
