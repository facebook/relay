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

// Grab the real setImmediate before jest fake timers can replace it
const {setImmediate: realSetImmediate} = require('timers');

/**
 * Drain the microtask queue (pending Promise then-callbacks).
 *
 * Schedules a macrotask via the real (unfaked) setImmediate. The event loop
 * drains all microtasks before any macrotask, so awaiting this guarantees
 * every pending then-chain has completed.
 *
 * Usage:
 *
 *   // React tests — flush microtasks inside act():
 *   await TestRenderer.act(() => flushMicrotasks());
 *
 *   // Non-React tests:
 *   await flushMicrotasks();
 */
function flushMicrotasks(): Promise<void> {
  return new Promise(resolve => realSetImmediate(resolve));
}

module.exports = flushMicrotasks;
