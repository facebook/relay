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

const createFragmentSpecResolver = require('../createFragmentSpecResolver');
const {getFragment, graphql} = require('relay-runtime');
const {matchers} = require('relay-test-utils-internal');

jest.mock('warning');

beforeEach(() => {
  expect.extend(matchers);
});

it('warns if any prop is undefined', () => {
  const TestComponent_test = getFragment(graphql`
    fragment createFragmentSpecResolverTestTestComponent_test on User {
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
      () => {},
    );
  }).toWarn([
    'createFragmentSpecResolver: Expected prop `%s` to be supplied ' +
      'to `%s`, but got `undefined`. Pass an explicit `null` if this ' +
      'is intentional.',
    'test',
    'Relay(TestComponent)',
  ]);
});
