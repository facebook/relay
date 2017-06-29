/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule throwFailedPromise
 * @format
 */

'use strict';

/**
 * This function is used in place of the non-standard promise.done() method.
 * However, this is an anti-pattern as any function which operates on a Promise
 * should instead consider returning that Promise for the caller to handle
 * failure itself.
 */
function throwFailedPromise(promise: Promise<mixed>): void {
  promise.then(undefined, error =>
    setTimeout(() => {
      throw error;
    }, 0),
  );
}

module.exports = throwFailedPromise;
