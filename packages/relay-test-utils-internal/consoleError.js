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

/* global jest, afterEach */

let installed = false;

/**
 * Similar to disallowWarnings.
 * This method mocks the console.error and throws in the error is printed in the console.
 */
function disallowConsoleErrors(): void {
  if (installed) {
    throw new Error('`disallowConsoleErrors` should be called at most once');
  }
  installed = true;
  let errors = [];
  jest.spyOn(console, 'error').mockImplementation(message => {
    errors.push(`Unexpected \`console.error\`:\n${message}.`);
  });
  afterEach(() => {
    if (errors.length > 0) {
      const message = errors.join('\n');
      errors = [];
      throw new Error(message);
    }
  });
}

module.exports = {
  disallowConsoleErrors,
};
