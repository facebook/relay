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

var Relay = require('Relay');
var RelayQueryTracker = require('RelayQueryTracker');
var diffRelayQuery = require('diffRelayQuery');

describe('diffRelayQuery', () => {
  var RelayRecordStore;

  var {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('keeps queries if the root dataID is unknown', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();

    var query = getNode(Relay.QL`
      query {
        username(name:"joe") {
          id,
          firstName,
          lastName,
        }
      }
    `);
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('returns original query if all fields unfetched', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();

    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          firstName,
          lastName,
        }
      }
    `);
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('keeps unfetched scalar fields', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();

    var writeQuery = getNode(Relay.QL`
      query {
        node(id:"123") {
          firstName
        }
      }
    `);
    var payload = {
      '123': {
        id: '123',
        firstName: 'Joe'
      }
    };
    writePayload(store, writeQuery, payload, tracker);

    var fetchQuery = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          firstName,
          lastName,
        }
      }
    `);
    var diffQueries = diffRelayQuery(fetchQuery, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          lastName
        }
      }
    `));
  });
});
