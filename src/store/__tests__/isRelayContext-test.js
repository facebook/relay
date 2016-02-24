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

const RelayContext = require('RelayContext');

const isRelayContext = require('isRelayContext');

describe('isRelayContext()', () => {
  it('returns true for `RelayContext` instances', () => {
    expect(isRelayContext(new RelayContext())).toBe(true);
  });

  it('returns true for objects that conform to the interface', () => {
    const context = {
      getFragmentResolver: () => null,
      getStoreData: () => null,
    };
    expect(isRelayContext(context)).toBe(true);
  });

  it('returns false for objects that do not conform to the interface', () => {
    const fakeContext = {
      getFragmentResolver: null,
      getStoreData: null,
    };
    expect(isRelayContext(fakeContext)).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isRelayContext(null)).toBe(false);
    expect(isRelayContext(false)).toBe(false);
    expect(isRelayContext('relay')).toBe(false);
    expect(isRelayContext(1)).toBe(false);
  });
});
