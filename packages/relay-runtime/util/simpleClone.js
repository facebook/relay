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

const mapObject = require('mapObject');

/**
 * A helper to create a deep clone of a value, plain Object, or array of such.
 *
 * Does not support RegExp, Date, other classes, or self-referential values.
 */
function simpleClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(simpleClone);
  } else if (value && typeof value === 'object') {
    return ((mapObject(value, simpleClone): any): T);
  } else {
    return value;
  }
}

module.exports = simpleClone;
