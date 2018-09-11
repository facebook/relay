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

declare function isPromise(p: mixed): boolean %checks(p instanceof Promise);

function isPromise(p) {
  return !!p && typeof p.then === 'function';
}

module.exports = isPromise;
