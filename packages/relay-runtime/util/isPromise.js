/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isPromise
 * @flow
 * @format
 */

'use strict';

declare function isPromise(p: mixed): boolean %checks(p instanceof Promise);

function isPromise(p) {
  return !!p && typeof p.then === 'function';
}

module.exports = isPromise;
