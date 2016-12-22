/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

jest
  .autoMockOff();

const RelayEnvironment = require('RelayEnvironment');

const isRelayEnvironment = require('isRelayEnvironment');

describe('isRelayEnvironment()', () => {
  it('returns true for `RelayEnvironment` instances', () => {
    const environment = new RelayEnvironment();
    expect(isRelayEnvironment(environment)).toBe(true);
  });

  it('returns true for objects that conform to the interface', () => {
    const environment = {
      applyMutation: jest.fn(),
      lookup: jest.fn(),
      retain: jest.fn(),
      sendMutation: jest.fn(),
      sendQuery: jest.fn(),
      sendQuerySubscription: jest.fn(),
      subscribe: jest.fn(),
    };
    expect(isRelayEnvironment(environment)).toBe(true);
  });

  it('returns false for objects that do not conform to the interface', () => {
    const fakeEnvironment = {
      lookup: null,
      sendQuery: null,
      sendQuerySubscription: null,
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
