/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule nullthrowsOSS
 * @flow
 * @format
 */
'use strict';

var nullthrows = function<T>(x: ?T): T {
  if (x != null) {
    return x;
  }
  throw new Error('Got unexpected null or undefined');
};

module.exports = nullthrows;
