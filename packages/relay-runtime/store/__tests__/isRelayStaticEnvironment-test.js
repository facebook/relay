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
const RelayModernEnvironment = require('RelayModernEnvironment');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');

const isRelayModernEnvironment = require('isRelayModernEnvironment');

describe('isRelayModernEnvironment()', () => {
  it('returns true for `RelayModernEnvironment` instances', () => {
    const source = new RelayInMemoryRecordSource();
    const store = new RelayMarkSweepStore(source);
    const fetch = jest.fn();
    const environment = new RelayModernEnvironment({fetch, store});
    expect(isRelayModernEnvironment(environment)).toBe(true);
  });

  it('returns false for classic RelayEnvironment instances', () => {
    const environment = new RelayEnvironment();
    expect(isRelayModernEnvironment(environment)).toBe(false);
  });

  it('returns false for plain objects that conform to the interface', () => {
    const environment = {
      applyUpdate: jest.fn(),
      commitPayload: jest.fn(),
      getStore: jest.fn(),
      lookup: jest.fn(),
      retain: jest.fn(),
      sendMutation: jest.fn(),
      sendQuery: jest.fn(),
      subscribe: jest.fn(),
    };
    expect(isRelayModernEnvironment(environment)).toBe(false);
  });

  it('returns false for objects that do not conform to the interface', () => {
    const fakeEnvironment = {
      applyUpdate: null,
      commitPayload: null,
      getStore: null,
      sendMutation: null,
      sendQuery: null,
    };
    expect(isRelayModernEnvironment(fakeEnvironment)).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isRelayModernEnvironment(null)).toBe(false);
    expect(isRelayModernEnvironment(false)).toBe(false);
    expect(isRelayModernEnvironment('relay')).toBe(false);
    expect(isRelayModernEnvironment(1)).toBe(false);
  });
});
