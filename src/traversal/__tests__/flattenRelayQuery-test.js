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

describe('flattenRelayQuery', () => {
  var Relay = require('Relay');

  var flattenRelayQuery = require('flattenRelayQuery');

  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('flattens roots', () => {
    var node = getNode(Relay.QL`
      query {
        viewer {
          actor {
            firstName,
            name,
            ${Relay.QL`
      fragment on Actor {
        name,
        lastName
      }
    `}
          }
        }
      }
    `);
    var expected = getNode(Relay.QL`
      query {
        viewer {
          actor {
            firstName,
            name,
            lastName
          }
        }
      }
    `);
    expect(flattenRelayQuery(node)).toEqualQueryRoot(expected);
  });

  it('flattens fragments', () => {
    var node = getNode(Relay.QL`
      fragment on Viewer {
        actor {
          firstName,
          name,
          ${Relay.QL`
      fragment on Actor {
        name,
        lastName
      }
    `}
        }
      }
    `);
    var expected = getNode(Relay.QL`
      fragment on Viewer {
        actor {
          firstName,
          name,
          lastName
        }
      }
    `);
    expect(flattenRelayQuery(node)).toEqualQueryNode(expected);
  });

  it('flattens fields', () => {
    var node = getNode(Relay.QL`
      query {
        viewer {
          actor {
            firstName,
            name,
            ${Relay.QL`
      fragment on Actor {
        name,
        lastName
      }
    `}
          }
        }
      }
    `).getFieldByStorageKey('actor');
    var expected = getNode(Relay.QL`
      query {
        viewer {
          actor {
            firstName,
            name,
            lastName
          }
        }
      }
    `).getFieldByStorageKey('actor');
    expect(flattenRelayQuery(node)).toEqualQueryNode(expected);
  });

  it('flattens empty fragments', () => {
    var emptyFragment = Relay.QL`
      fragment on TimezoneInfo {
        ${null}
      }
    `;

    var fragmentNode = getNode(emptyFragment);
    var rootNode = getNode(Relay.QL`
      query {
        viewer {
          timezoneEstimate {
            ${emptyFragment}
          }
        }
      }
    `);
    var fieldNode = rootNode.getFieldByStorageKey('timezoneEstimate');

    expect(flattenRelayQuery(fragmentNode)).toBe(null);
    expect(flattenRelayQuery(rootNode)).toBe(null);
    expect(flattenRelayQuery(fieldNode)).toBe(null);
  });
});
