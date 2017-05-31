/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.disableAutomock();
jest.mock('warning');

const RelayTestUtils = require('RelayTestUtils');
const {generateAndCompile} = require('RelayModernTestUtils');

const {createFragmentSpecResolver} = require('RelayCore');

describe('RelayCore', () => {
  describe('createFragmentSpecResolver', () => {
    let mockCb;

    beforeEach(() => {
      jasmine.addMatchers(RelayTestUtils.matchers);
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
