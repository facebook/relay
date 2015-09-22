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

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment');

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var Relay = require('Relay');
var RelayQueryPath = require('RelayQueryPath');
var RelayQueryTracker = require('RelayQueryTracker');
var invariant = require('invariant');

describe('writePayload()', () => {
  var RelayRecordStore;

  var {getNode, writePayload} = RelayTestUtils;

  function getField(node, ...fieldNames) {
    for (var ii = 0; ii < fieldNames.length; ii++) {
      node = node.getFieldByStorageKey(fieldNames[ii]);
      invariant(
        node,
        'getField(): Expected node to have field named `%s`.',
        fieldNames[ii]
      );
    }
    return node;
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('paths', () => {
    it('writes path for id-less root records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id,
            },
          }
        }
      `);
      var payload = {
        viewer: {
          actor: {
            id: '123',
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'client:viewer': true,
          '123': true,
        },
        updated: {}
      });

      // viewer has a client id and must be refetched by the original root call
      var path = new RelayQueryPath(query);
      expect(store.getRecordState('client:viewer')).toBe('EXISTENT');
      expect(store.getPathToRecord('client:viewer')).toMatchPath(path);

      // actor is refetchable by ID
      expect(store.getPathToRecord('123')).toBe(undefined);
    });

    it('does not write paths to refetchable root records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id,
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {}
      });

      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getPathToRecord('123')).toBe(undefined);
    });

    it('writes paths to non-refetchable linked records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              address {
                city,
              },
            },
          }
        }
      `);
      var payload = {
        viewer: {
          'actor': {
            id: '123',
            address: {
              city: 'San Francisco',
            },
          },
        },
      };
      writePayload(store, query, payload);

      // linked nodes use a minimal path from the nearest refetchable node
      var addressID = 'client:1';
      var pathQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            address {
              city,
            },
          }
        }
      `);
      var path = new RelayQueryPath(pathQuery)
        .getPath(getField(pathQuery, 'address'), addressID);
      expect(store.getPathToRecord(addressID)).toMatchPath(path);
    });

    it('writes paths to plural linked fields', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212', // directory assistance
          countryCode: '1',
        },
      };
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified,
              phoneNumber {
                displayNumber,
                countryCode,
              },
            },
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          allPhones: [phone],
        },
      };
      writePayload(store, query, payload);

      // plural fields must be refetched through the parent
      // get linked records to verify the client id
      var allPhoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(allPhoneIDs.length).toBe(1);
      var path = new RelayQueryPath(query)
        .getPath(getField(query, 'allPhones'), allPhoneIDs[0]);
      expect(store.getPathToRecord(allPhoneIDs[0])).toMatchPath(path);

      // plural items must be refetched through the parent plural field
      // get field to verify the client id is correct
      var phoneNoID = store.getLinkedRecordID(allPhoneIDs[0], 'phoneNumber');
      path = new RelayQueryPath(query)
        .getPath(getField(query, 'allPhones'), allPhoneIDs[0])
        .getPath(getField(query, 'allPhones', 'phoneNumber'), phoneNoID);
      expect(store.getPathToRecord(phoneNoID)).toMatchPath(path);
    });

    it('writes paths to connection records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              edges {
                node {
                  id,
                  address {
                    city,
                  },
                },
              },
            },
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [
              {
                cursor: 'cursor1',
                node: {
                  id: 'node1',
                  address: {
                    city: 'San Francisco',
                  },
                },
              },
            ],
          },
        },
      };
      writePayload(store, query, payload);

      // connections and edges must be refetched through the parent
      var path = new RelayQueryPath(query)
        .getPath(getField(query, 'friends'), 'client:1');
      expect(store.getPathToRecord('client:1')).toMatchPath(path);
      path = new RelayQueryPath(query)
        .getPath(getField(query, 'friends'), 'client:1')
        .getPath(getField(query, 'friends', 'edges'), 'client:client:1:node1');
      expect(store.getPathToRecord('client:client:1:node1')).toMatchPath(path);

      // connection nodes with an ID are refetchable
      expect(store.getPathToRecord('node1')).toBe(undefined);

      // linked nodes use a minimal path from the nearest refetchable node
      var pathQuery = getNode(Relay.QL`query{node(id:"node1"){address{city}}}`);
      path = new RelayQueryPath(pathQuery)
        .getPath(getField(pathQuery, 'address'), 'client:2');
      expect(store.getField('client:2', 'city')).toBe('San Francisco');
      expect(store.getPathToRecord('client:2')).toMatchPath(path);
    });
  });

  describe('query tracking', () => {
    it('tracks new root records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var tracker = new RelayQueryTracker();
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id,
            name,
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: 'Joe',
        },
      };
      writePayload(store, query, payload, tracker);
      var trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(1);
      expect(trackedQueries[0][1]).toBe('123');
      expect(trackedQueries[0][0]).toEqualQueryRoot(query);
    });

    it('tracks new records in fragments', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var tracker = new RelayQueryTracker();

      // `address` will be encountered twice, both occurrences must be tracked
      var fragment = Relay.QL`fragment on Node{address{city}}`;
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            ${fragment},
            ${fragment},
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          address: {
            city: 'San Francisco',
          },
        },
      };
      var addressID = 'client:1';
      var addressFragment = getNode(fragment).getChildren()[0];
      writePayload(store, query, payload, tracker);
      var trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(3);
      expect(trackedQueries[1][1]).toBe(addressID);
      expect(trackedQueries[1][0]).toEqualQueryNode(addressFragment);
      expect(trackedQueries[2][1]).toBe(addressID);
      expect(trackedQueries[2][0]).toEqualQueryNode(addressFragment);
    });

    it('tracks new linked records', () => {
      var records = {
        'client:viewer': {
          __dataID__: 'client:viewer',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              name,
            },
          }
        }
      `);
      var payload = {
        viewer: {
          actor: {
            id: '123',
            name: 'Joe',
          },
        },
      };
      var tracker = new RelayQueryTracker();
      writePayload(store, query, payload, tracker);
      var trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(1);
      expect(trackedQueries[0][1]).toBe('123');
      expect(trackedQueries[0][0]).toEqualQueryNode(query.getChildren()[0]);
    });

    it('tracks new plural linked records', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified,
              phoneNumber {
                displayNumber,
                countryCode,
              },
            },
          }
        }
      `);
      var phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212', // directory assistance
          countryCode: '1',
        },
      };
      var payload = {
        node: {
          id: '123',
          allPhones: [phone],
        },
      };
      var tracker = new RelayQueryTracker();
      writePayload(store, query, payload, tracker);
      var trackedQueries = tracker.trackNodeForID.mock.calls;
      // creates `allPhones` record and linked `phoneNumber` field
      expect(trackedQueries.length).toBe(2);
      expect(trackedQueries[0][1]).toBe('client:1');
      expect(trackedQueries[0][0]).toEqualQueryNode(
        getField(query, 'allPhones')
      );
      expect(trackedQueries[1][1]).toBe('client:2');
      expect(trackedQueries[1][0]).toEqualQueryNode(
        getField(query, 'allPhones', 'phoneNumber')
      );
    });

    it('tracks new connections', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              edges {
                node {
                  name,
                },
              },
            },
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [
              {
                cursor: 'c1',
                node: {
                  id: '456',
                  name: 'Greg',
                },
              },
            ],
          },
        },
      };
      var tracker = new RelayQueryTracker();
      writePayload(store, query, payload, tracker);
      var trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(3);
      // track range node
      expect(trackedQueries[0][1]).toBe('client:1');
      expect(trackedQueries[0][0]).toEqualQueryNode(
        getField(query, 'friends')
      );
      // track first edge
      expect(trackedQueries[1][1]).toBe('client:client:1:456');
      expect(trackedQueries[1][0]).toEqualQueryNode(
        getField(query, 'friends', 'edges')
      );
      // track node
      expect(trackedQueries[2][1]).toBe('456');
      expect(trackedQueries[2][0]).toEqualQueryNode(
        getField(query, 'friends', 'edges', 'node')
      );
    });

    it('tracks edges and nodes added to an existing connection', () => {
      // write a range with first(1) edge
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              edges {
                node {
                  name,
                },
              },
            },
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [
              {
                cursor: 'c1',
                node: {
                  id: '456',
                  name: 'Greg',
                },
              },
            ],
          },
        },
      };
      var tracker = new RelayQueryTracker();
      writePayload(store, query, payload, tracker);
      expect(tracker.trackNodeForID.mock.calls.length).toBe(3);

      // write an additional node and verify only the new edge and node are
      // tracked
      query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(after:"c1",first:"1") {
              edges {
                node {
                  name,
                },
              },
            },
          }
        }
      `);
      payload = {
        node: {
          id: '123',
          friends: {
            edges: [
              {
                cursor: 'c2',
                node: {
                  id: '789',
                  name: 'Jing',
                },
              },
            ],
          },
        },
      };
      tracker = new RelayQueryTracker();
      tracker.trackNodeForID.mockClear();
      writePayload(store, query, payload, tracker);
      var trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(2);
      // track new edge
      expect(trackedQueries[0][1]).toBe('client:client:1:789');
      expect(trackedQueries[0][0]).toEqualQueryNode(
        getField(query, 'friends', 'edges')
      );
      // track node
      expect(trackedQueries[1][1]).toBe('789');
      expect(trackedQueries[1][0]).toEqualQueryNode(
        getField(query, 'friends', 'edges', 'node')
      );
    });

    it('re-tracks all nodes if `updateTrackedQueries` is enabled', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name,
            allPhones {
              phoneNumber {
                displayNumber,
              },
            },
            friends(first:"1") {
              edges {
                node {
                  name,
                },
              },
            },
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: 'Joe',
          allPhones: [
            {
              phoneNumber: {
                displayNumber: '1-800-555-1212', // directory assistance
              },
            },
          ],
          friends: {
            edges: [
              {
                cursor: 'c1',
                node: {
                  id: '456',
                  name: 'Tim',
                },
              },
            ],
          },
        },
      };
      // populate the store and record the original tracked queries
      var tracker = new RelayQueryTracker();
      writePayload(store, query, payload, tracker);
      var prevTracked = tracker.trackNodeForID.mock.calls.slice();
      expect(prevTracked.length).toBe(6);

      // rewriting the same payload by default does not track anything
      tracker = new RelayQueryTracker();
      tracker.trackNodeForID.mockClear();
      writePayload(store, query, payload, tracker);
      expect(tracker.trackNodeForID.mock.calls.length).toBe(0);

      // force-tracking should track the original nodes again
      tracker = new RelayQueryTracker();
      tracker.trackNodeForID.mockClear();
      writePayload(store, query, payload, tracker, {
        updateTrackedQueries: true,
      });
      var nextTracked = tracker.trackNodeForID.mock.calls;
      expect(nextTracked.length).toBe(prevTracked.length);
      nextTracked.forEach((tracked, ii) => {
        expect(tracked[1]).toBe(prevTracked[ii][1]); // dataID
        expect(tracked[0]).toEqualQueryNode(prevTracked[ii][0]); // dataID
      });
    });
  });
});
