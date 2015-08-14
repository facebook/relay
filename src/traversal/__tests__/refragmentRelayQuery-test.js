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

describe('refragmentRelayQuery', () => {
  var Relay;
  var flattenRelayQuery;
  var refragmentRelayQuery;

  var {getVerbatimNode, matchers} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    Relay = require('Relay');
    flattenRelayQuery = require('flattenRelayQuery');
    refragmentRelayQuery = require('refragmentRelayQuery');

    jest.addMatchers({
      toRefragmentTo: function(expected) {
        /* jslint validthis:true */
        this.actual = refragmentRelayQuery(flattenRelayQuery(this.actual));
        return matchers.toEqualQueryNode.call(this, expected);
      }
    });
  });

  it('returns concrete fields unmodified', () => {
    var fragment = getVerbatimNode(Relay.QL`
      fragment on User {
        firstName,
        address {
          city,
        },
      }
    `);
    expect(refragmentRelayQuery(fragment)).toBe(fragment);
  });

  it('refragments children of dynamic fields', () => {
    // `User` is a concrete type implementing `Actor`
    var nameFragment = Relay.QL`fragment on User{name}`;
    var fragment = getVerbatimNode(Relay.QL`
      fragment on Viewer {
        actor {
          ${nameFragment},
        },
      }
    `);
    expect(fragment).toRefragmentTo(fragment);
  });

  it('refragments children of dynamic fields within connections', () => {
    // `FeedUnit` is the abstract type of `newsFeed.edges.node`
    var idFragment = Relay.QL`fragment on FeedUnit{id}`;
    // `Story` is a concrete type implementing `FeedUnit`
    var messageFragment = Relay.QL`fragment on Story{message{text}}`;
    var fragment = getVerbatimNode(Relay.QL`
      fragment on Viewer {
        newsFeed(first:"10") {
          edges {
            cursor,
            node {
              ${idFragment},
              ${messageFragment},
            },
          },
          pageInfo {
            hasNextPage,
            hasPreviousPage,
          },
        },
      }
    `);
    expect(fragment).toRefragmentTo(fragment);
  });

  it('refragments children of root nodes', () => {
    var idFragment = Relay.QL`fragment on Node{id}`;
    var friendsFragment = Relay.QL`fragment on User{friends{count}}`;
    var nameFragment = Relay.QL`fragment on Actor{name}`;
    var query = getVerbatimNode(Relay.QL`
      query {
        node(id:"123") {
          ${friendsFragment},
          ${idFragment},
          ${nameFragment},
        }
      }
    `);
    expect(query).toRefragmentTo(query);
  });
});
