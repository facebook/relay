/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const getOutputForFixture = require('../getOutputForFixture');

describe('getOutputForFixture', () => {
  it('should throw when there is #expected-to-throw but operation succeeded', () => {
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

  it('should throw when there is no #expected-to-throw but operation failed', () => {
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

  it('should pass when there is #expected-to-throw and operation failed', () => {
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

  it('should pass when there is no expected-to-throw and operation succeeded', () => {
    const RESULT_STRING = 'SUCCESS_STRING';
    const output = getOutputForFixture(
      'fragment tnemgarf{}',
      () => RESULT_STRING,
      'test.graphql',
    );
    expect(output).toEqual(RESULT_STRING);
  });
});
