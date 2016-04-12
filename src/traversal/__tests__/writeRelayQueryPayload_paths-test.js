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
const RelayQueryPath = require('RelayQueryPath');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

const invariant = require('invariant');

describe('writePayload()', () => {
  let RelayRecordStore;
  let RelayRecordWriter;

  const {
    getNode,
    getVerbatimNode,
    writeVerbatimPayload,
    writePayload,
  } = RelayTestUtils;

  function getField(node, ...fieldNames) {
    for (let ii = 0; ii < fieldNames.length; ii++) {
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
    RelayRecordWriter = require('RelayRecordWriter');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('paths', () => {
    it('writes path for id-less root records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id,
            },
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            id: '123',
            __typename: 'User',
          },
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          'client:1': true,
          '123': true,
        },
        updated: {},
      });

      // viewer has a client id and must be refetched by the original root call
      const path = RelayQueryPath.create(query);
      expect(store.getRecordState('client:1')).toBe('EXISTENT');
      expect(store.getPathToRecord('client:1')).toMatchPath(path);

      // actor is refetchable by ID
      expect(store.getPathToRecord('123')).toBe(undefined);
    });

    it('does not write paths to refetchable root records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id,
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          __typename: 'User',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });

      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getPathToRecord('123')).toBe(undefined);
    });

    it('writes paths to non-refetchable linked records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
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
      const payload = {
        viewer: {
          actor: {
            id: '123',
            address: {
              city: 'San Francisco',
            },
            __typename: 'User',
          },
        },
      };
      writePayload(store, writer, query, payload);

      // linked nodes use a minimal path from the nearest refetchable node
      const addressID = store.getLinkedRecordID('123', 'address');
      const pathQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            address {
              city,
            },
          }
        }
      `);
      const path = RelayQueryPath.getPath(
        RelayQueryPath.create(pathQuery),
        getField(pathQuery, 'address'),
        addressID
      );
      expect(store.getPathToRecord(addressID)).toMatchPath(path);
    });

    it('writes paths to plural linked fields', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212', // directory assistance
          countryCode: '1',
        },
      };
      const query = getNode(Relay.QL`
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
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          allPhones: [phone],
        },
      };
      writePayload(store, writer, query, payload);

      // plural fields must be refetched through the parent
      // get linked records to verify the client id
      const allPhoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(allPhoneIDs.length).toBe(1);
      let path = RelayQueryPath.getPath(
        RelayQueryPath.create(query),
        getField(query, 'allPhones'),
        allPhoneIDs[0]
      );
      expect(store.getPathToRecord(allPhoneIDs[0])).toMatchPath(path);

      // plural items must be refetched through the parent plural field
      // get field to verify the client id is correct
      const phoneNoID = store.getLinkedRecordID(allPhoneIDs[0], 'phoneNumber');
      path = RelayQueryPath.getPath(
        RelayQueryPath.getPath(
          RelayQueryPath.create(query),
          getField(query, 'allPhones'),
          allPhoneIDs[0]
        ),
        getField(query, 'allPhones', 'phoneNumber'),
        phoneNoID
      );
      expect(store.getPathToRecord(phoneNoID)).toMatchPath(path);
    });

    it('writes paths to connection records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
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
      const payload = {
        node: {
          __typename: 'User',
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
      writePayload(store, writer, query, payload);

      // connections and edges must be refetched through the parent
      let path = RelayQueryPath.getPath(
        RelayQueryPath.create(query),
        getField(query, 'friends'),
        'client:1'
      );
      expect(store.getPathToRecord('client:1')).toMatchPath(path);
      path = RelayQueryPath.getPath(
        RelayQueryPath.getPath(
          RelayQueryPath.create(query),
          getField(query, 'friends'),
          'client:1'
        ),
        getField(query, 'friends', 'edges'),
        'client:client:1:node1'
      );
      expect(store.getPathToRecord('client:client:1:node1')).toMatchPath(path);

      // connection nodes with an ID are refetchable
      expect(store.getPathToRecord('node1')).toBe(undefined);

      // linked nodes use a minimal path from the nearest refetchable node
      const pathQuery = getNode(Relay.QL`query{node(id:"node1"){address{city}}}`);
      path = RelayQueryPath.getPath(
        RelayQueryPath.create(pathQuery),
        getField(pathQuery, 'address'),
        'client:2'
      );
      expect(store.getField('client:2', 'city')).toBe('San Francisco');
      expect(store.getPathToRecord('client:2')).toMatchPath(path);
    });

    it('writes paths with fragments', () => {
      const records = {};
      const rootCallMap = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      const fragment = Relay.QL`fragment on Viewer {
        actor {
          id
          __typename
          name
        }
      }`;
      const query = getVerbatimNode(Relay.QL`
        query {
          viewer {
            ${fragment}
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            name: 'Joe',
            __typename: 'User',
          },
        },
      };
      writePayload(store, writer, query, payload);

      const viewerID = store.getDataID('viewer');
      const actorID = store.getLinkedRecordID(viewerID, 'actor');

      const path = RelayQueryPath.getPath(
        RelayQueryPath.getPath(
          RelayQueryPath.create(query),
          getNode(fragment),
          viewerID
        ),
        getNode(fragment).getChildren()[0],
        actorID
      );
      expect(store.getPathToRecord(actorID)).toMatchPath(path);
    });
  });

  describe('query tracking', () => {
    it('tracks new root records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const tracker = new RelayQueryTracker();
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id,
            name,
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          name: 'Joe',
          __typename: 'User',
        },
      };
      writePayload(store, writer, query, payload, tracker);
      const trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(1);
      expect(trackedQueries[0][1]).toBe('123');
      expect(trackedQueries[0][0]).toEqualQueryRoot(query);
    });

    it('tracks new records in fragments', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const tracker = new RelayQueryTracker();

      // `address` will be encountered twice, both occurrences must be tracked
      const fragment = Relay.QL`fragment on Node{address{city}}`;
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            ${fragment},
            ${fragment},
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          address: {
            city: 'San Francisco',
          },
          __typename: 'User',
        },
      };
      writePayload(store, writer, query, payload, tracker);
      const trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(1);
      expect(trackedQueries[0][1]).toBe('123');
      expect(trackedQueries[0][0]).toEqualQueryNode(query);
    });

    it('tracks new linked records', () => {
      const records = {
        'client:1': {
          __dataID__: 'client:1',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              name,
            },
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            id: '123',
            name: 'Joe',
            __typename: 'User',
          },
        },
      };
      const tracker = new RelayQueryTracker();
      writePayload(store, writer, query, payload, tracker);
      const trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(1);
      expect(trackedQueries[0][1]).toBe('123');
      expect(trackedQueries[0][0]).toEqualQueryNode(query.getChildren()[0]);
    });

    it('tracks new plural linked records', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            actors {
              name
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          actors: [
            {
              id: '456',
              name: 'Alice',
            },
            {
              id: '789',
              name: 'Bob',
            },
          ],
        },
      };
      const tracker = new RelayQueryTracker();
      writePayload(store, writer, query, payload, tracker);
      const trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(2);
      expect(trackedQueries[0][1]).toBe('456');
      expect(trackedQueries[0][0]).toEqualQueryNode(
        getField(query, 'actors')
      );
      expect(trackedQueries[1][1]).toBe('789');
      expect(trackedQueries[1][0]).toEqualQueryNode(
        getField(query, 'actors')
      );
    });

    it('tracks new connections', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
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
      const payload = {
        node: {
          __typename: 'User',
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
      const tracker = new RelayQueryTracker();
      writePayload(store, writer, query, payload, tracker);
      const trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(1);
      // track edges.node
      expect(trackedQueries[0][1]).toBe('456');
      expect(trackedQueries[0][0]).toEqualQueryNode(
        getField(query, 'friends', 'edges', 'node')
      );
    });

    it('tracks edges and nodes added to an existing connection', () => {
      // write a range with first(1) edge
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      let query = getNode(Relay.QL`
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
      let payload = {
        node: {
          __typename: 'User',
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
      let tracker = new RelayQueryTracker();
      writePayload(store, writer, query, payload, tracker);
      expect(tracker.trackNodeForID.mock.calls.length).toBe(1);

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
      writePayload(store, writer, query, payload, tracker);
      const trackedQueries = tracker.trackNodeForID.mock.calls;
      expect(trackedQueries.length).toBe(1);
      // track new node
      expect(trackedQueries[0][1]).toBe('789');
      expect(trackedQueries[0][0]).toEqualQueryNode(
        getField(query, 'friends', 'edges', 'node')
      );
    });

    it('re-tracks all nodes if `updateTrackedQueries` is enabled', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
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
      const payload = {
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
          __typename: 'User',
        },
      };
      // populate the store and record the original tracked queries
      let queryTracker = new RelayQueryTracker();

      writePayload(
        store,
        writer,
        query,
        payload,
        queryTracker
      );
      const prevTracked = queryTracker.trackNodeForID.mock.calls.slice();
      expect(prevTracked.length).toBe(2);
      expect(prevTracked[0][1]).toBe('123'); // root
      expect(prevTracked[1][1]).toBe('456'); // friends.edges.node

      // rewriting the same payload by default does not track anything
      queryTracker = new RelayQueryTracker();
      queryTracker.trackNodeForID.mockClear();
      writePayload(
        store,
        writer,
        query,
        payload,
        queryTracker
      );
      expect(queryTracker.trackNodeForID.mock.calls.length).toBe(0);

      // force-tracking should track the original nodes again
      queryTracker = new RelayQueryTracker();
      queryTracker.trackNodeForID.mockClear();
      writePayload(
        store,
        writer,
        query,
        payload,
        queryTracker,
        {updateTrackedQueries: true}
      );
      const nextTracked = queryTracker.trackNodeForID.mock.calls;
      expect(nextTracked.length).toBe(prevTracked.length);
      nextTracked.forEach((tracked, ii) => {
        expect(tracked[1]).toBe(prevTracked[ii][1]); // dataID
        expect(tracked[0]).toEqualQueryNode(prevTracked[ii][0]); // dataID
      });
    });
  });

  it('skips non-matching fragments', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const writer = new RelayRecordWriter(records, {}, false);
    const query = getNode(Relay.QL`
      query {
        node(id: "123") {
          ...on User {
            name
          }
          ...on Comment {
            body {
              text
            }
          }
          ...on Node {
            firstName
          }
        }
      }
    `);
    const payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe',
        name: 'Joe',
        body: {
          text: 'Skipped!',
        },
      },
    };
    writeVerbatimPayload(store, writer, query, payload);
    expect(store.getField('123', 'firstName')).toBe('Joe');
    expect(store.getField('123', 'name')).toBe('Joe');
    // `body` only exists on `Comment` which does not match the record type
    expect(store.getLinkedRecordID('123', 'body')).toBe(undefined);
  });
});
