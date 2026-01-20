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
      network: null as $FlowFixMe,
      store: null as $FlowFixMe,
    });
    expect(isRelayEnvironment(environment)).toBe(true);
  });

  it('returns true for objects that conform to the interface', () => {
    const environment = {
      applyMutation: jest.fn<ReadonlyArray<unknown>, unknown>(),
      check: jest.fn<ReadonlyArray<unknown>, unknown>(),
      execute: jest.fn<ReadonlyArray<unknown>, unknown>(),
      lookup: jest.fn<ReadonlyArray<unknown>, unknown>(),
      retain: jest.fn<ReadonlyArray<unknown>, unknown>(),
      sendMutation: jest.fn<ReadonlyArray<unknown>, unknown>(),
      sendQuery: jest.fn<ReadonlyArray<unknown>, unknown>(),
      subscribe: jest.fn<ReadonlyArray<unknown>, unknown>(),
    };
    expect(isRelayEnvironment(environment)).toBe(true);
  });

  it('returns false for objects that do not conform to the interface', () => {
    const fakeEnvironment = {
      check: null,
      execute: null,
      lookup: null,
      sendQuery: null,
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
