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

const getOutputForFixture = require('../getOutputForFixture');

describe('getOutputForFixture', () => {
  test('should throw when there is #expected-to-throw but operation succeeded', () => {
    const RESULT_STRING = 'SUCCESS_STRING';
    expect(() => {
      getOutputForFixture(
        '# expected-to-throw\n query{}',
        () => RESULT_STRING,
        'test.graphql',
      );
    }).toThrow(
      `Expected test file 'test.graphql' to throw, but it passed:\n${RESULT_STRING}`,
    );
  });

  test('should throw when there is no #expected-to-throw but operation failed', () => {
    expect(() => {
      getOutputForFixture(
        'fragment tnemgarf{}',
        () => {
          throw new Error('my error');
        },
        'test.graphql',
      );
    }).toThrow('my error');
  });

  test('should pass when there is #expected-to-throw and operation failed', () => {
    const RESULT_STRING = 'ERROR_STRING';
    const output = getOutputForFixture(
      '# expected-to-throw\n query{}',
      () => {
        throw new Error(RESULT_STRING);
      },
      'test.graphql',
    );
    expect(output).toEqual(`THROWN EXCEPTION:\n\nError: ${RESULT_STRING}`);
  });

  test('should pass when there is no expected-to-throw and operation succeeded', () => {
    const RESULT_STRING = 'SUCCESS_STRING';
    const output = getOutputForFixture(
      'fragment tnemgarf{}',
      () => RESULT_STRING,
      'test.graphql',
    );
    expect(output).toEqual(RESULT_STRING);
  });
});
