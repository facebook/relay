/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

const Relay = require('../../RelayPublic');
const RelayTestUtils = require('RelayTestUtils');

const isCompatibleRelayFragmentType = require('../isCompatibleRelayFragmentType');

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
