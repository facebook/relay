/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule isScalarAndEqual
 */

'use strict';

/**
 * A fast test to determine if two values are equal scalars:
 * - compares scalars such as booleans, strings, numbers by value
 * - compares functions by identity
 * - returns false for complex values, since these cannot be cheaply tested for
 *   equality (use `areEquals` instead)
 */
function isScalarAndEqual(
  valueA: mixed,
  valueB: mixed
): boolean {
  return valueA === valueB && (valueA === null || typeof valueA !== 'object');
}

module.exports = isScalarAndEqual;
