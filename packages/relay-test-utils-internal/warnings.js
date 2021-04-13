/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

/* global jest, afterEach */

let installed = false;
const expectedWarnings: Array<string> = [];
let contextualExpectedWarning: string | null = null;

/**
 * Mocks the `warning` module to turn warnings into errors. Any expected
 * warnings need to be explicitly expected with `expectWarningWillFire(message)`.
 *
 * NOTE: This should be called on top of a test file. The test should NOT
 *       use `jest.resetModules()` or manually mock `warning`.
 */
function disallowWarnings(): void {
  if (installed) {
    throw new Error('`disallowWarnings` should be called at most once');
  }
  installed = true;
  jest.mock('warning', () => {
    return jest.fn((condition, format, ...args) => {
      if (!condition) {
        let argIndex = 0;
        const message = format.replace(/%s/g, () => String(args[argIndex++]));
        const index = expectedWarnings.indexOf(message);

        if (
          contextualExpectedWarning != null &&
          contextualExpectedWarning === message
        ) {
          contextualExpectedWarning = null;
        } else if (index >= 0) {
          expectedWarnings.splice(index, 1);
        } else {
          // log to console in case the error gets swallowed somewhere
          console.error('Unexpected Warning: ' + message);
          throw new Error('Warning: ' + message);
        }
      }
    });
  });
  afterEach(() => {
    if (expectedWarnings.length > 0) {
      const error = new Error(
        'Some expected warnings where not triggered:\n\n' +
          Array.from(expectedWarnings, message => ` * ${message}`).join('\n') +
          '\n',
      );
      expectedWarnings.length = 0;
      throw error;
    }
  });
}

/**
 * Expect a warning with the given message. If the message isn't fired in the
 * current test, the test will fail.
 */
function expectWarningWillFire(message: string): void {
  if (!installed) {
    throw new Error(
      '`disallowWarnings` needs to be called before `expectWarningWillFire`',
    );
  }
  expectedWarnings.push(message);
}

/**
 * Expect the callback `fn` to trigger the warning message and otherwise fail.
 */
function expectToWarn<T>(message: string, fn: () => T): T {
  if (contextualExpectedWarning != null) {
    throw new Error('Cannot nest `expectToWarn()` calls.');
  }
  contextualExpectedWarning = message;
  const result = fn();
  if (contextualExpectedWarning != null) {
    contextualExpectedWarning = null;
    throw new Error(`Expected callback to warn: ${message}`);
  }
  return result;
}

module.exports = {
  disallowWarnings,
  expectWarningWillFire,
  expectToWarn,
};
