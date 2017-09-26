/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @fullSyntaxTransform
 * @format
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
