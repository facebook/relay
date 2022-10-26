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

const warningsSystem = createConsoleInterceptionSystem(
  'warning',
  'expectToWarn',
  impl => {
    jest.mock('warning', () =>
      jest.fn((condition, format, ...args) => {
        if (!condition) {
          let argIndex = 0;
          const message = format.replace(/%s/g, () => String(args[argIndex++]));
          impl(message);
        }
      }),
    );
  },
);

/**
 * Mocks the `warning` module to turn warnings into errors. Any expected
 * warnings need to be explicitly expected with `expectWarningWillFire(message)`.
 *
 * NOTE: This should be called on top of a test file. The test should NOT
 *       use `jest.resetModules()` or manually mock `warning`.
 */
function disallowWarnings(): void {
  warningsSystem.disallowMessages();
}

/**
 * Expect a warning with the given message. If the message isn't fired in the
 * current test, the test will fail.
 */
function expectWarningWillFire(
  message: string,
  options?: WillFireOptions,
): void {
  warningsSystem.expectMessageWillFire(message, options);
}

/**
 * Expect the callback `fn` to trigger the warning message and otherwise fail.
 */
function expectToWarn<T>(message: string, fn: () => T): T {
  return warningsSystem.expectMessage(message, fn);
}

/**
 * Expect the callback `fn` to trigger all warning messages (in sequence)
 * or otherwise fail.
 */
function expectToWarnMany<T>(messages: Array<string>, fn: () => T): T {
  return warningsSystem.expectMessageMany(messages, fn);
}

module.exports = {
  disallowWarnings,
  expectWarningWillFire,
  expectToWarn,
  expectToWarnMany,
};
