/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule relayUnstableBatchedUpdates
 * @format
 */

'use strict';

const ReactNative = require('ReactNative');
let batchedUpdates = undefined;

if (ReactNative.unstable_batchedUpdates) {
  batchedUpdates = ReactNative.unstable_batchedUpdates;
} else {
  const Renderer = require('ReactNative/Libraries/Renderer/src/renderers/native/ReactNative');
  batchedUpdates = Renderer.unstable_batchedUpdates;
}

module.exports = batchedUpdates;
