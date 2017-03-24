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
const RelayStaticEnvironment = require('RelayStaticEnvironment');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');

const isRelayStaticEnvironment = require('isRelayStaticEnvironment');

describe('isRelayStaticEnvironment()', () => {
  it('returns true for `RelayStaticEnvironment` instances', () => {
    const source = new RelayInMemoryRecordSource();
    const store = new RelayMarkSweepStore(source);
    const fetch = jest.fn();
    const environment = new RelayStaticEnvironment({fetch, store});
    expect(isRelayStaticEnvironment(environment)).toBe(true);
  });

  it('returns false for classic RelayEnvironment instances', () => {
    const environment = new RelayEnvironment();
    expect(isRelayStaticEnvironment(environment)).toBe(false);
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
    expect(isRelayStaticEnvironment(environment)).toBe(false);
  });

  it('returns false for objects that do not conform to the interface', () => {
    const fakeEnvironment = {
      applyUpdate: null,
      commitPayload: null,
      getStore: null,
      sendMutation: null,
      sendQuery: null,
    };
    expect(isRelayStaticEnvironment(fakeEnvironment)).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isRelayStaticEnvironment(null)).toBe(false);
    expect(isRelayStaticEnvironment(false)).toBe(false);
    expect(isRelayStaticEnvironment('relay')).toBe(false);
    expect(isRelayStaticEnvironment(1)).toBe(false);
  });
});
