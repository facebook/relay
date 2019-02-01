/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

jest.mock('warning');

const {generateAndCompile, matchers} = require('RelayModernTestUtils');

const {createFragmentSpecResolver} = require('../RelayCore');

describe('RelayCore', () => {
  describe('createFragmentSpecResolver', () => {
    let mockCb;

    beforeEach(() => {
      expect.extend(matchers);
      jest.resetModules();
      mockCb = jest.fn();
    });

    it('warns if any prop is undefined', () => {
      const {TestComponent_test} = generateAndCompile(`
        fragment TestComponent_test on User {
          id
        }
      `);
      const fragments = {
        test: TestComponent_test,
      };

      const props = {};
      const context = {};

      expect(() => {
        createFragmentSpecResolver(
          context,
          'Relay(TestComponent)',
          fragments,
          props,
          mockCb,
        );
      }).toWarn([
        'createFragmentSpecResolver: Expected prop `%s` to be supplied ' +
          'to `%s`, but got `undefined`. Pass an explicit `null` if this ' +
          'is intentional.',
        'test',
        'Relay(TestComponent)',
      ]);
    });
  });
});
