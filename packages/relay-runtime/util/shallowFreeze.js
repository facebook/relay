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

// Shallow freeze to prevent Relay from mutating the value in recycleNodesInto or deepFreezing the value
module.exports = function shallowFreeze(value: mixed) {
  if (
    typeof value === 'object' &&
    value != null &&
    (Array.isArray(value) || value.constructor === Object)
  ) {
    Object.freeze(value);
  }
};
