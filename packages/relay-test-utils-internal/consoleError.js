/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

/* global jest */

import type {WillFireOptions} from './consoleErrorsAndWarnings';

const {createConsoleInterceptionSystem} = require('./consoleErrorsAndWarnings');

const consoleErrorsSystem = createConsoleInterceptionSystem(
  'error',
  'expectConsoleError',
  impl => {
    jest.spyOn(console, 'error').mockImplementation(impl);
  },
);

/**
 * Mocks console.error so that errors printed to the console are instead thrown.
 * Any expected errors need to be explicitly expected with `expectConsoleErrorWillFire(message)`.
 *
 * NOTE: This should be called on top of a test file. The test should NOT
 *       use `jest.resetModules()` or manually mock `console`.
 */
function disallowConsoleErrors(): void {
  consoleErrorsSystem.disallowMessages();
}

/**
 * Expect an error with the given message. If the message isn't fired in the
 * current test, the test will fail.
 */
function expectConsoleErrorWillFire(
  message: string,
  options?: WillFireOptions,
): void {
  consoleErrorsSystem.expectMessageWillFire(message, options);
}

/**
 * Expect the callback `fn` to print an error with the message, and otherwise fail.
 */
function expectConsoleError<T>(message: string, fn: () => T): T {
  return consoleErrorsSystem.expectMessage(message, fn);
}

/**
 * Expect the callback `fn` to trigger all console errors (in sequence),
 * and otherwise fail.
 */
function expectConsoleErrorsMany<T>(messages: Array<string>, fn: () => T): T {
  return consoleErrorsSystem.expectMessageMany(messages, fn);
}

module.exports = {
  disallowConsoleErrors,
  expectConsoleErrorWillFire,
  expectConsoleError,
  expectConsoleErrorsMany,
};
