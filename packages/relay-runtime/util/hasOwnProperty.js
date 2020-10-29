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

function hasOwnProperty(obj: {+[key: string]: mixed}, key: string) {
  return (Object.prototype.hasOwnProperty.call(obj, key): boolean);
}

module.exports = hasOwnProperty;
