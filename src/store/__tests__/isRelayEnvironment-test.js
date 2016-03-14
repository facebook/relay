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

require('configureForRelayOSS');

const RelayEnvironment = require('RelayEnvironment');

const isRelayEnvironment = require('isRelayEnvironment');

describe('isRelayEnvironment()', () => {
  it('returns true for `RelayEnvironment` instances', () => {
    expect(isRelayEnvironment(new RelayEnvironment())).toBe(true);
  });

  it('returns true for objects that conform to the interface', () => {
    const environment = {
      forceFetch: () => null,
      getFragmentResolver: () => null,
      getStoreData: () => null,
      primeCache: () => null,
    };
    expect(isRelayEnvironment(environment)).toBe(true);
  });

  it('returns false for objects that do not conform to the interface', () => {
    const fakeEnvironment = {
      forceFetch: true,
      getFragmentResolver: true,
      getStoreData: true,
      primeCache: true,
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
