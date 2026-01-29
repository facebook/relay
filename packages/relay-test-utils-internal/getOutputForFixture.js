/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall relay
 */

'use strict';

async function getOutputForFixture(
  input: string,
  operation: (input: string) => Promise<string> | string,
  file: string,
): Promise<string> {
  const shouldThrow =
    /^# *expected-to-throw/.test(input) || /\.error\.\w+$/.test(file);
  if (shouldThrow) {
    let result;
    try {
      result = await operation(input);
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
