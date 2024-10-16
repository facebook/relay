/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

/**
 * Provides backwards compatability for unit tests relying on promise-polyfill
 *
 * Polyfill implementations and native promises have subtle differences in scheduling
 * which can break async tests.
 *
 * This should be removed once all tests have been migrated off of ReactTestRenderer and polyfilled promises.
 */
function injectPromisePolyfill_DEPRECATED() {
  let originalPromise;
  beforeAll(() => {
    originalPromise = global.Promise;
    global.Promise = require('promise-polyfill');
  });

  afterAll(() => {
    global.Promise = originalPromise;
  });
}

module.exports = injectPromisePolyfill_DEPRECATED;
