/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */
'use strict';

var nullthrows: <T>(x: ?T, message?: string) => T = function<T>(
  x: ?T,
  message?: string = 'Got unexpected null or undefined',
): T {
  if (x != null) {
    return x;
  }
  var error = new Error(message);
  (error: any).framesToPop = 1; // Skip nullthrows own stack frame.
  throw error;
};

module.exports = nullthrows;
