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
const expectedWarnings = new Set();

/**
 * Mocks the `warning` module to turn warnings into errors. Any expected
 * warnings need to be explicitly expected with `expectWarning(message)`.
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

        if (!expectedWarnings.delete(message)) {
          // log to console in case the error gets swallowed somewhere
          console.error('Warning: ' + message);
          throw new Error('Warning: ' + message);
        }
      }
    });
  });
  afterEach(() => {
    if (expectedWarnings.size > 0) {
      const error = new Error(
        'Some expected warnings where not triggered:\n\n' +
          Array.from(expectedWarnings, message => ` * ${message}`).join('\n') +
          '\n',
      );
      expectedWarnings.clear();
      throw error;
    }
  });
}

/**
 * Expect a warning with the given message. If the message isn't fired in the
 * current test, the test will fail.
 */
function expectWarning(message: string): void {
  if (!installed) {
    throw new Error(
      '`disallowWarnings` needs to be called before `expectWarning`',
    );
  }
  expectedWarnings.add(message);
}

module.exports = {
  disallowWarnings,
  expectWarning,
};
