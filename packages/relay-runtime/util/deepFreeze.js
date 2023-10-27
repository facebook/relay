/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall relay
 */

'use strict';

/**
 * Recursively "deep" freezes the supplied object.
 *
 * For convenience, and for consistency with the behavior of `Object.freeze`,
 * returns the now-frozen original object.
 */
function deepFreeze<T: {...}>(object: T): T {
  if (!shouldBeFrozen(object)) {
    return object;
  }
  Object.freeze(object);
  Object.getOwnPropertyNames(object).forEach(name => {
    const property = object[name];
    if (
      property &&
      typeof property === 'object' &&
      !Object.isFrozen(property)
    ) {
      deepFreeze(property);
    }
  });
  return object;
}

function shouldBeFrozen(value: mixed): boolean {
  // Only freeze plain JS arrays and objects
  return (
    value != null &&
    (Array.isArray(value) ||
      (typeof value === 'object' && value.constructor === Object))
  );
}

module.exports = deepFreeze;
