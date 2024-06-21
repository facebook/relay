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

declare function isPromise<T>(p: mixed): p is Promise<T>;

function isPromise(p: mixed) {
  return p != null && typeof p === 'object' && typeof p.then === 'function';
}

module.exports = isPromise;
