/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

function getOutputForFixture(
  input: string,
  operation: (input: string) => string,
  file: string,
): string {
  const shouldThrow =
    /^# *expected-to-throw/.test(input) || /\.error\.\w+$/.test(file);
  if (shouldThrow) {
    let result;
    try {
      result = operation(input);
    } catch (e) {
      return `THROWN EXCEPTION:\n\n${e.toString()}`;
    }
    throw new Error(
      `Expected test file '${file}' to throw, but it passed:\n${result}`,
    );
  } else {
    return operation(input);
  }
}

module.exports = getOutputForFixture;
