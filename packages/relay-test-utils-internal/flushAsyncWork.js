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

const flushMicrotasks = require('./flushMicrotasks');

/**
 * Drain both microtasks (Promise then-callbacks) and fake timers until stable.
 *
 * Microtasks and timers can trigger each other in chains. This helper
 * loops until both queues are empty.
 *
 * Usage:
 *
 *   // After triggering async work that mixes promises and timers:
 *   await flushAsyncWork();
 *
 *   // Inside act() for React tests:
 *   await TestRenderer.act(() => flushAsyncWork());
 */
async function flushAsyncWork(): Promise<void> {
  // Drain microtasks first — they may schedule timers
  await flushMicrotasks();
  // Loop: timers may schedule microtasks and vice versa
  while (jest.getTimerCount() > 0) {
    jest.runAllTimers();
    await flushMicrotasks();
  }
}

module.exports = flushAsyncWork;
