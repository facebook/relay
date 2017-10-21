/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
