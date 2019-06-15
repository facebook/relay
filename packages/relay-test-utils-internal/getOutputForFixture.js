/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const SHOULD_THROW_FLAG = 'expected-to-throw';

async function getOutputForFixture(
  input: string,
  operation: (input: string) => string | Promise<string>,
  file: string,
): Promise<string> {
  let result;
  const firstLine = input.substring(0, input.indexOf('\n')).trim();
  const shouldThrow =
    firstLine[0] === '#' && firstLine.substring(1).trim() === SHOULD_THROW_FLAG;
  try {
    const output = operation(input);
    result = output instanceof Promise ? await output : output;
  } catch (e) {
    if (e instanceof TypeError) {
      // Fail on blatant coding bugs during development
      throw e;
    }
    if (!shouldThrow) {
      throw new Error(
        `Expect test '${file}' to pass, but it threw:\n${e.toString()}`,
      );
    }
    return `THROWN EXCEPTION:\n\n${e.toString()}`;
  }
  if (shouldThrow) {
    throw new Error(
      `Expect test '${file}' to throw, but it passed:\n${result}`,
    );
  }
  return result;
}

module.exports = getOutputForFixture;
