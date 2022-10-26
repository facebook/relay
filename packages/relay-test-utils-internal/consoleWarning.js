/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

/* global jest */

import type {WillFireOptions} from './consoleErrorsAndWarnings';

const {createConsoleInterceptionSystem} = require('./consoleErrorsAndWarnings');

const consoleWarningsSystem = createConsoleInterceptionSystem(
  'warning',
  'expectConsoleWarning',
  impl => {
    jest.spyOn(console, 'warn').mockImplementation(impl);
  },
);

/**
 * Mocks console.warn so that warnings printed to the console are instead thrown.
 * Any expected warnings need to be explicitly expected with `expectConsoleWarningWillFire(message)`.
 *
 * NOTE: This should be called on top of a test file. The test should NOT
 *       use `jest.resetModules()` or manually mock `console`.
 */
function disallowConsoleWarnings(): void {
  consoleWarningsSystem.disallowMessages();
}

/**
 * Expect a warning with the given message. If the message isn't fired in the
 * current test, the test will fail.
 */
function expectConsoleWarningWillFire(
  message: string,
  options?: WillFireOptions,
): void {
  consoleWarningsSystem.expectMessageWillFire(message, options);
}

/**
 * Expect the callback `fn` to print a warning with the message, and otherwise fail.
 */
function expectConsoleWarning<T>(message: string, fn: () => T): T {
  return consoleWarningsSystem.expectMessage(message, fn);
}

/**
 * Expect the callback `fn` to trigger all console warnings (in sequence),
 * and otherwise fail.
 */
function expectConsoleWarningsMany<T>(messages: Array<string>, fn: () => T): T {
  return consoleWarningsSystem.expectMessageMany(messages, fn);
}

module.exports = {
  disallowConsoleWarnings,
  expectConsoleWarningWillFire,
  expectConsoleWarning,
  expectConsoleWarningsMany,
};
