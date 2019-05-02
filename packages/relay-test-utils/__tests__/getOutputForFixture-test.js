/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 * @emails oncall+relay
 *
 */

'use strict';

const getOutputForFixture = require('../getOutputForFixture');

describe('getOutputForFixture', () => {
  it('should throw when shouldThrow == true but operation succeeded', async () => {
    try {
      await getOutputForFixture(
        '# expected-to-throw\n query{}',
        () => '',
        'test.graphql',
      );
      throw new Error('Should fail');
    } catch (e) {
      expect(e).toEqual(
        new Error("Expect test 'test.graphql' to throw, but it passed"),
      );
    }
  });

  it('should throw when shouldThrow == false but operation failed', async () => {
    try {
      await getOutputForFixture(
        'fragment tnemgarf{}',
        () => {
          throw new Error();
        },
        'test.graphql',
      );
      throw new Error('Should fail');
    } catch (e) {
      expect(e).toEqual(
        new Error("Expect test 'test.graphql' to pass, but it threw:\nError"),
      );
    }
  });
});
