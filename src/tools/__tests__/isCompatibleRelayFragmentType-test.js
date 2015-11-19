/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var Relay = require('Relay');
var isCompatibleRelayFragmentType = require('isCompatibleRelayFragmentType');

describe('isCompatibleRelayFragmentType', () => {
  const {getNode} = RelayTestUtils;

  it('returns false for different concrete types', () => {
    expect(isCompatibleRelayFragmentType(
      getNode(Relay.QL`fragment on User{id}`),
      'Page'
    ));
  });

  it('returns true for equal concrete types', () => {
    expect(isCompatibleRelayFragmentType(
      getNode(Relay.QL`fragment on User{id}`),
      'User'
    ));
  });

  it('returns true for abstract fragments', () => {
    expect(isCompatibleRelayFragmentType(
      getNode(Relay.QL`fragment on Node{id}`),
      'User'
    ));
  });

  it('returns true for client records', () => {
    expect(isCompatibleRelayFragmentType(
      getNode(Relay.QL`fragment on User{id}`),
      null
    ));
  });
});
