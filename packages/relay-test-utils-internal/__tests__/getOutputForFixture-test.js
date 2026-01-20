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
  it('should throw when there is #expected-to-throw but operation succeeded', async () => {
    const RESULT_STRING = 'SUCCESS_STRING';
    await expect(async () => {
      await getOutputForFixture(
        '# expected-to-throw\n query{}',
        () => RESULT_STRING,
        'test.graphql',
      );
    }).rejects.toThrow(
      `Expected test file 'test.graphql' to throw, but it passed:\n${RESULT_STRING}`,
    );
  });

  it('should throw when there is no #expected-to-throw but operation failed', async () => {
    await expect(async () => {
      await getOutputForFixture(
        'fragment tnemgarf{}',
        () => {
          throw new Error('my error');
        },
        'test.graphql',
      );
    }).rejects.toThrow('my error');
  });

  it('should pass when there is #expected-to-throw and operation failed', async () => {
    const RESULT_STRING = 'ERROR_STRING';
    const output = await getOutputForFixture(
      '# expected-to-throw\n query{}',
      () => {
        throw new Error(RESULT_STRING);
      },
      'test.graphql',
    );
    expect(output).toEqual(`THROWN EXCEPTION:\n\nError: ${RESULT_STRING}`);
  });

  it('should pass when there is no expected-to-throw and operation succeeded', async () => {
    const RESULT_STRING = 'SUCCESS_STRING';
    const output = await getOutputForFixture(
      'fragment tnemgarf{}',
      () => RESULT_STRING,
      'test.graphql',
    );
    expect(output).toEqual(RESULT_STRING);
  });
});
