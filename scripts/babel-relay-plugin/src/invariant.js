/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

// $FlowFixMe: Resolves to third-party module instead of core Node.js module.
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
