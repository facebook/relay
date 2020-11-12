/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @emails oncall+relay
 */

'use strict';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmptyObject(obj: {+[key: string]: mixed}): boolean {
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

module.exports = isEmptyObject;
