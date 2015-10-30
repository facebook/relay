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

const RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

const Relay = require('Relay');
const RelayRecordStore = require('RelayRecordStore');
const dereferenceRelayQueryData = require('dereferenceRelayQueryData');
const readRelayQueryData = require('readRelayQueryData');

describe('dereferenceRelayQueryData', () => {
  var {getNode, writeVerbatimPayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();
  });

  it('dereferences scalar fields', () => {
    const fragment = Relay.QL`
      fragment on User {
        name
      }
    `;
    const payload = {
      node: {
        id: '123',
        name: 'Joe',
      },
    };
    const query = getNode(Relay.QL`
      query {
        node(id: "123") {
          ${fragment}
        }
      }
    `);
    const store = new RelayRecordStore({records: {}});
    writeVerbatimPayload(store, query, payload);

    const result = readRelayQueryData(store, getNode(fragment), '123', {
      incrementReferenceCounts: true,
    });
    expect(store.getReferenceCount('123', 'id')).toBe(0);
    expect(store.getReferenceCount('123', 'name')).toBe(1);

    dereferenceRelayQueryData(store, getNode(fragment), result.data);
    expect(store.getReferenceCount('123', 'id')).toBe(0);
    expect(store.getReferenceCount('123', 'name')).toBe(0);
  });

  it('dereferences plural fields', () => {
    const fragment = Relay.QL`
      fragment on Feedback {
        actors {
          name
        }
      }
    `;
    const payload = {
      node: {
        id: '123',
        actors: [{
          id: '456',
          __typename: 'User',
          name: 'Greg',
        }],
      },
    };
    const query = getNode(Relay.QL`
      query {
        node(id: "123") {
          ${fragment}
        }
      }
    `);
    const store = new RelayRecordStore({records: {}});
    writeVerbatimPayload(store, query, payload);

    const result = readRelayQueryData(store, getNode(fragment), '123', {
      incrementReferenceCounts: true,
    });
    expect(store.getReferenceCount('123', 'id')).toBe(0);
    expect(store.getReferenceCount('123', 'actors')).toBe(1);
    expect(store.getReferenceCount('456', 'id')).toBe(0);
    expect(store.getReferenceCount('456', '__typename')).toBe(0);
    expect(store.getReferenceCount('456', 'name')).toBe(1);

    dereferenceRelayQueryData(store, getNode(fragment), result.data);
    expect(store.getReferenceCount('123', 'id')).toBe(0);
    expect(store.getReferenceCount('123', 'actors')).toBe(0);
    expect(store.getReferenceCount('456', 'id')).toBe(0);
    expect(store.getReferenceCount('456', '__typename')).toBe(0);
    expect(store.getReferenceCount('456', 'name')).toBe(0);
  });
});
