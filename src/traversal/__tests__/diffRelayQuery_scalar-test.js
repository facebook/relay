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

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment');

const Relay = require('Relay');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

const diffRelayQuery = require('diffRelayQuery');

describe('diffRelayQuery', () => {
  let RelayRecordStore;
  let RelayRecordWriter;

  const {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('keeps queries if the root dataID is unknown', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();

    const query = getNode(Relay.QL`
      query {
        username(name:"joe") {
          id,
          firstName,
          lastName,
        }
      }
    `);
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('returns original query if all fields unfetched', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();

    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          firstName,
          lastName,
        }
      }
    `);
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('keeps unfetched scalar fields', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const writer = new RelayRecordWriter(records, {}, false);
    const tracker = new RelayQueryTracker();

    const writeQuery = getNode(Relay.QL`
      query {
        node(id:"123") {
          firstName
        }
      }
    `);
    const payload = {
      node: {
        id: '123',
        firstName: 'Joe',
        __typename: 'User',
      },
    };
    writePayload(store, writer, writeQuery, payload, tracker);

    const fetchQuery = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          firstName,
          lastName,
        }
      }
    `);
    const diffQueries = diffRelayQuery(fetchQuery, store, tracker);
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
