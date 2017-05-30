/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule simpleClone
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
    return mapObject(value, simpleClone);
  } else {
    return value;
  }
}

module.exports = simpleClone;
