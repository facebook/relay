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

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment');

var GraphQLFragmentPointer = require('GraphQLFragmentPointer');
var GraphQLRange = require('GraphQLRange');
var GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');
var Relay = require('Relay');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayFragmentReference = require('RelayFragmentReference');
var RelayQuery = require('RelayQuery');
var RelayQueryTracker = require('RelayQueryTracker');
var RelayRecordStatusMap = require('RelayRecordStatusMap');
var RelayRecordStore = require('RelayRecordStore');
var callsToGraphQL = require('callsToGraphQL');
var readRelayQueryData = require('readRelayQueryData');

describe('readRelayQueryData() query tracking', () => {
  var {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('records query tracking for traversed nodes', () => {
    var concreteFragment = Relay.QL`
      fragment on User {
        name,
        friends(first: "1") {
          edges {
            node {
              name
            }
          }
        }
      }
    `;
    var query = getNode(Relay.QL`
      query {
        node(id: "123") {
          ${concreteFragment},
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        __typename: 'User',
        name: 'Greg',
        friends: {
          edges: [{
            node: {
              id: '456',
              name: 'Tim',
            },
          }],
        },
      },
    };
    var records = {};
    var store = new RelayRecordStore({records});
    writePayload(store, query, payload);
    var fragment = query.getChildren().find(
      child => child instanceof RelayQuery.Fragment
    );
    var {queryTracker} = readRelayQueryData(store, fragment, '123');

    var trackNodeCalls = queryTracker.trackNodeForID.mock.calls;
    expect(trackNodeCalls.length).toBe(4);
    expect(trackNodeCalls[0][0]).toEqualQueryNode(fragment);
    expect(trackNodeCalls[0][1]).toBe('123');
    expect(trackNodeCalls[1][0]).toEqualQueryNode(
      fragment.getFieldByStorageKey('friends')
    );
    expect(trackNodeCalls[1][1]).toBe('client:1');
    expect(trackNodeCalls[2][0]).toEqualQueryNode(
      fragment
        .getFieldByStorageKey('friends')
        .getFieldByStorageKey('edges')
    );
    expect(trackNodeCalls[2][1]).toBe('client:client:1:456');
    expect(trackNodeCalls[3][0]).toEqualQueryNode(
      fragment
        .getFieldByStorageKey('friends')
        .getFieldByStorageKey('edges')
        .getFieldByStorageKey('node')
    );
    expect(trackNodeCalls[3][1]).toBe('456');
  });
});