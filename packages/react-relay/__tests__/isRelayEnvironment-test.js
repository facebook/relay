/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const isRelayEnvironment = require('../isRelayEnvironment');
const {Environment} = require('relay-runtime');

describe('isRelayEnvironment()', () => {
  it('returns true for `RelayEnvironment` instances', () => {
    const environment = new Environment({
      network: (null: $FlowFixMe),
      store: (null: $FlowFixMe),
    });
    expect(isRelayEnvironment(environment)).toBe(true);
  });

  it('returns true for objects that conform to the interface', () => {
    const environment = {
      applyMutation: jest.fn<$ReadOnlyArray<mixed>, mixed>(),
      check: jest.fn<$ReadOnlyArray<mixed>, mixed>(),
      lookup: jest.fn<$ReadOnlyArray<mixed>, mixed>(),
      retain: jest.fn<$ReadOnlyArray<mixed>, mixed>(),
      sendMutation: jest.fn<$ReadOnlyArray<mixed>, mixed>(),
      sendQuery: jest.fn<$ReadOnlyArray<mixed>, mixed>(),
      execute: jest.fn<$ReadOnlyArray<mixed>, mixed>(),
      subscribe: jest.fn<$ReadOnlyArray<mixed>, mixed>(),
    };
    expect(isRelayEnvironment(environment)).toBe(true);
  });

  it('returns false for objects that do not conform to the interface', () => {
    const fakeEnvironment = {
      check: null,
      lookup: null,
      sendQuery: null,
      execute: null,
      subscribe: null,
    };
    expect(isRelayEnvironment(fakeEnvironment)).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isRelayEnvironment(null)).toBe(false);
    expect(isRelayEnvironment(false)).toBe(false);
    expect(isRelayEnvironment('relay')).toBe(false);
    expect(isRelayEnvironment(1)).toBe(false);
  });
});
