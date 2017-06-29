/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

const isCompatibleRelayFragmentType = require('isCompatibleRelayFragmentType');

describe('isCompatibleRelayFragmentType', () => {
  const {getNode} = RelayTestUtils;

  it('returns false for different concrete types', () => {
    expect(
      isCompatibleRelayFragmentType(
        getNode(Relay.QL`fragment on User{id}`),
        'Page',
      ),
    ).toBe(false);
  });

  it('returns true for equal concrete types', () => {
    expect(
      isCompatibleRelayFragmentType(
        getNode(Relay.QL`fragment on User{id}`),
        'User',
      ),
    ).toBe(true);
  });

  it('returns true for abstract fragments', () => {
    expect(
      isCompatibleRelayFragmentType(
        getNode(Relay.QL`fragment on Node{id}`),
        'User',
      ),
    ).toBe(true);
  });

  it('returns true for client records', () => {
    expect(
      isCompatibleRelayFragmentType(
        getNode(Relay.QL`fragment on User{id}`),
        null,
      ),
    ).toBe(true);
  });
});
