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

jest.mock('RelayQueryTracker').mock('RelayClassicRecordState');

require('configureForRelayOSS');

const RelayClassic = require('RelayClassic');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

const diffRelayQuery = require('diffRelayQuery');

describe('diffRelayQuery', () => {
  let RelayRecordStore;
  let RelayRecordWriter;

  const {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');

    expect.extend(RelayTestUtils.matchers);
  });

  it('keeps queries if the root dataID is unknown', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();

    const query = getNode(
      RelayClassic.QL`
      query {
        username(name:"joe") {
          id
          firstName
          lastName
        }
      }
    `,
    );
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('returns original query if all fields unfetched', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();

    const query = getNode(
      RelayClassic.QL`
      query {
        node(id:"123") {
          id
          firstName
          lastName
        }
      }
    `,
    );
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('keeps unfetched scalar fields', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const writer = new RelayRecordWriter(records, {}, false);
    const tracker = new RelayQueryTracker();

    const writeQuery = getNode(
      RelayClassic.QL`
      query {
        node(id:"123") {
          firstName
        }
      }
    `,
    );
    const payload = {
      node: {
        id: '123',
        firstName: 'Joe',
        __typename: 'User',
      },
    };
    writePayload(store, writer, writeQuery, payload, tracker);

    const fetchQuery = getNode(
      RelayClassic.QL`
      query {
        node(id:"123") {
          id
          firstName
          lastName
        }
      }
    `,
    );
    const diffQueries = diffRelayQuery(fetchQuery, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toEqualQueryRoot(
      getNode(
        RelayClassic.QL`
      query {
        node(id:"123") {
          lastName
        }
      }
    `,
      ),
    );
  });
});
