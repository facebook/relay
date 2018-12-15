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

/**
 * A fast test to determine if two values are equal scalars:
 * - compares scalars such as booleans, strings, numbers by value
 * - compares functions by identity
 * - returns false for complex values, since these cannot be cheaply tested for
 *   equality (use `areEquals` instead)
 */
function isScalarAndEqual(valueA: mixed, valueB: mixed): boolean {
  return valueA === valueB && (valueA === null || typeof valueA !== 'object');
}

module.exports = isScalarAndEqual;
