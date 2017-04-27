/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

require('configureForRelayOSS');

jest
  .autoMockOff();

const RelayConnectionHandler = require('RelayConnectionHandler');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayRecordSourceMutator = require('RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('RelayRecordSourceProxy');
const RelayResponseNormalizer = require('RelayResponseNormalizer');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayModernTestUtils = require('RelayModernTestUtils');
const {
  END_CURSOR,
  HAS_NEXT_PAGE,
  HAS_PREV_PAGE,
  PAGE_INFO,
  START_CURSOR,
} = require('RelayConnectionInterface');

const formatStorageKey = require('formatStorageKey');
const getRelayHandleKey = require('getRelayHandleKey');
const simpleClone = require('simpleClone');

const {
  ID_KEY,
  REF_KEY,
  REFS_KEY,
  ROOT_ID,
  ROOT_TYPE,
  TYPENAME_KEY,
} = RelayStoreUtils;

describe('RelayConnectionHandler', () => {
  const {generateWithTransforms} = RelayModernTestUtils;
  let ConnectionQuery;
  let baseData;
  let baseSource;
  let mutator;
  let proxy;
  let sinkData;
  let sinkSource;

  function normalize(payload, variables) {
    RelayResponseNormalizer.normalize(
      baseSource,
      {
        dataID: ROOT_ID,
        node: ConnectionQuery,
        variables,
      },
      payload
    );
  }

  beforeEach(() => {
    jest.resetModules();
    jasmine.addMatchers(RelayModernTestUtils.matchers);

    baseData = {
      [ROOT_ID]: {
        [ID_KEY]: ROOT_ID,
        [TYPENAME_KEY]: ROOT_TYPE,
      },
    };
    baseSource = new RelayInMemoryRecordSource(baseData);
    sinkData = {};
    sinkSource = new RelayInMemoryRecordSource(sinkData);
    mutator = new RelayRecordSourceMutator(baseSource, sinkSource);
    proxy = new RelayRecordSourceProxy(mutator);

    ({ConnectionQuery} = generateWithTransforms(`
      query ConnectionQuery($id: ID!, $before: ID $count: Int, $after: ID, $orderby: [String]) {
        node(id: $id) {
          ... on User {
            friends(before: $before, after: $after, first: $count, orderby: $orderby)
            @__clientField(handle: "connection", filters: ["orderby"], key: "ConnectionQuery_friends") {
              edges {
                cursor
                node {
                  id
                }
              }
              pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
              }
            }
          }
        }
      }
    `));
  });

  describe('insertEdgeAfter()', () => {
    let connection;
    let connectionID;
    let newEdge;

    beforeEach(() => {
      normalize({
        node: {
          id: '4',
          __typename: 'User',
          friends: {
            edges: [{
              cursor: 'cursor:1',
              node: {
                id: '1',
              },
            }, {
              cursor: 'cursor:2',
              node: {
                id: '2',
              },
            }],
            [PAGE_INFO]: {
              [END_CURSOR]: 'cursor:1',
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
              [START_CURSOR]: 'cursor:1',
            },
          },
        },
      }, {
        after: null,
        before: null,
        count: 10,
        orderby: ['first name'],
        id: '4',
      });
      const args = {first: 10, orderby:['first name']};
      const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
        '{"orderby":["first name"]}';
      const payload = {
        args,
        dataID: '4',
        fieldKey: formatStorageKey('friends', args),
        handleKey,
      };
      RelayConnectionHandler.update(proxy, payload);
      const store = new RelayMarkSweepStore(baseSource);
      store.publish(sinkSource);
      baseData = simpleClone(baseData);
      baseSource =  new RelayInMemoryRecordSource(baseData);
      sinkData = {};
      sinkSource = new RelayInMemoryRecordSource(sinkData);
      mutator = new RelayRecordSourceMutator(baseSource, sinkSource);
      proxy = new RelayRecordSourceProxy(mutator);

      connection = RelayConnectionHandler.getConnection(
        proxy.get('4'),
        'ConnectionQuery_friends',
        {orderby: ['first name']},
      );
      connectionID = connection.getDataID();
      newEdge = proxy.create('newedge', 'FriendsEdge');
      newEdge.setValue('cursor:newedge', 'edge');
    });

    it('creates the edges array if it does not exist', () => {
      connection = proxy.create('connection', 'FriendsConnection');
      RelayConnectionHandler.insertEdgeAfter(connection, newEdge);
      expect(sinkData.connection).toEqual({
        [ID_KEY]: 'connection',
        [TYPENAME_KEY]: 'FriendsConnection',
        edges: {[REFS_KEY]: [
          'newedge',
        ]},
      });
    });

    it('appends the edge if no cursor is supplied', () => {
      RelayConnectionHandler.insertEdgeAfter(connection, newEdge);
      expect(sinkData[connectionID]).toEqual({
        [ID_KEY]: connectionID,
        [TYPENAME_KEY]: 'FriendsConnection',
        edges: {[REFS_KEY]: [
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
          'newedge',
        ]},
      });
    });

    it('appends the edge if the cursor is not found', () => {
      RelayConnectionHandler.insertEdgeAfter(connection, newEdge, 'bad-cursor');
      expect(sinkData[connectionID]).toEqual({
        [ID_KEY]: connectionID,
        [TYPENAME_KEY]: 'FriendsConnection',
        edges: {[REFS_KEY]: [
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
          'newedge',
        ]},
      });
    });

    it('inserts the edge after the edge with the given cursor', () => {
      RelayConnectionHandler.insertEdgeAfter(connection, newEdge, 'cursor:1');
      expect(sinkData[connectionID]).toEqual({
        [ID_KEY]: connectionID,
        [TYPENAME_KEY]: 'FriendsConnection',
        edges: {[REFS_KEY]: [
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
          'newedge',
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
        ]},
      });
    });
  });

  describe('insertEdgeBefore()', () => {
    let connection;
    let connectionID;
    let newEdge;

    beforeEach(() => {
      normalize({
        node: {
          id: '4',
          __typename: 'User',
          friends: {
            edges: [{
              cursor: 'cursor:1',
              node: {
                id: '1',
              },
            }, {
              cursor: 'cursor:2',
              node: {
                id: '2',
              },
            }],
            [PAGE_INFO]: {
              [END_CURSOR]: 'cursor:1',
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
              [START_CURSOR]: 'cursor:1',
            },
          },
        },
      }, {
        after: null,
        before: null,
        count: 10,
        orderby: ['first name'],
        id: '4',
      });
      const args = {first: 10, orderby:['first name']};
      const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
        '{"orderby":["first name"]}';
      const payload = {
        args,
        dataID: '4',
        fieldKey: formatStorageKey('friends', args),
        handleKey,
      };
      RelayConnectionHandler.update(proxy, payload);
      const store = new RelayMarkSweepStore(baseSource);
      store.publish(sinkSource);
      baseData = simpleClone(baseData);
      baseSource =  new RelayInMemoryRecordSource(baseData);
      sinkData = {};
      sinkSource = new RelayInMemoryRecordSource(sinkData);
      mutator = new RelayRecordSourceMutator(baseSource, sinkSource);
      proxy = new RelayRecordSourceProxy(mutator);

      connection = RelayConnectionHandler.getConnection(
        proxy.get('4'),
        'ConnectionQuery_friends',
        {orderby: ['first name']},
      );
      connectionID = connection.getDataID();
      newEdge = proxy.create('newedge', 'FriendsEdge');
      newEdge.setValue('cursor:newedge', 'edge');
    });

    it('creates the edges array if it does not exist', () => {
      connection = proxy.create('connection', 'FriendsConnection');
      RelayConnectionHandler.insertEdgeBefore(connection, newEdge);
      expect(sinkData.connection).toEqual({
        [ID_KEY]: 'connection',
        [TYPENAME_KEY]: 'FriendsConnection',
        edges: {[REFS_KEY]: [
          'newedge',
        ]},
      });
    });

    it('prepends the edge if no cursor is supplied', () => {
      RelayConnectionHandler.insertEdgeBefore(connection, newEdge);
      expect(sinkData[connectionID]).toEqual({
        [ID_KEY]: connectionID,
        [TYPENAME_KEY]: 'FriendsConnection',
        edges: {[REFS_KEY]: [
          'newedge',
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
        ]},
      });
    });

    it('prepends the edge if the cursor is not found', () => {
      RelayConnectionHandler.insertEdgeBefore(connection, newEdge, 'bad-cursor');
      expect(sinkData[connectionID]).toEqual({
        [ID_KEY]: connectionID,
        [TYPENAME_KEY]: 'FriendsConnection',
        edges: {[REFS_KEY]: [
          'newedge',
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
        ]},
      });
    });

    it('inserts the edge before the edge with the given cursor', () => {
      RelayConnectionHandler.insertEdgeBefore(connection, newEdge, 'cursor:2');
      expect(sinkData[connectionID]).toEqual({
        [ID_KEY]: connectionID,
        [TYPENAME_KEY]: 'FriendsConnection',
        edges: {[REFS_KEY]: [
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
          'newedge',
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
        ]},
      });
    });
  });

  describe('deleteNode()', () => {
    let connection;
    let connectionID;

    beforeEach(() => {
      normalize({
        node: {
          id: '4',
          __typename: 'User',
          friends: {
            edges: [{
              cursor: 'cursor:1',
              node: {
                id: '1',
              },
            }, {
              cursor: 'cursor:2',
              node: {
                id: '2',
              },
            }],
            [PAGE_INFO]: {
              [END_CURSOR]: 'cursor:1',
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
              [START_CURSOR]: 'cursor:1',
            },
          },
        },
      }, {
        after: null,
        before: null,
        count: 10,
        orderby: ['first name'],
        id: '4',
      });
      const args = {first: 10, orderby:['first name']};
      const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
        '{"orderby":["first name"]}';
      const payload = {
        args,
        dataID: '4',
        fieldKey: formatStorageKey('friends', args),
        handleKey,
      };
      RelayConnectionHandler.update(proxy, payload);
      const store = new RelayMarkSweepStore(baseSource);
      store.publish(sinkSource);
      baseData = simpleClone(baseData);
      baseSource =  new RelayInMemoryRecordSource(baseData);
      sinkData = {};
      sinkSource = new RelayInMemoryRecordSource(sinkData);
      mutator = new RelayRecordSourceMutator(baseSource, sinkSource);
      proxy = new RelayRecordSourceProxy(mutator);

      connection = RelayConnectionHandler.getConnection(
        proxy.get('4'),
        'ConnectionQuery_friends',
        {orderby: ['first name']},
      );
      connectionID = connection.getDataID();
    });

    it('does nothing if the node is not found', () => {
      RelayConnectionHandler.deleteNode(connection, '<not-in-connection>');
      expect(sinkData).toEqual({});
    });

    it('deletes the matching edge from the connection', () => {
      RelayConnectionHandler.deleteNode(connection, '1');
      expect(baseData[connectionID].edges[REFS_KEY]).toEqual([
        'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
        'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
      ]);
      expect(sinkData).toEqual({
        [connectionID]: {
          [ID_KEY]: connectionID,
          [TYPENAME_KEY]: 'FriendsConnection',
          edges: {[REFS_KEY]: [
            'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
          ]},
        },
      });
    });
  });

  describe('update()', () => {
    it('does nothing if the payload record does not exist', () => {
      const payload = {
        dataID: 'unfetched',
        fieldKey: 'friends',
        handleKey: getRelayHandleKey('connection', null, 'friends'),
      };
      RelayConnectionHandler.update(proxy, payload);
      expect(sinkData).toEqual({});
    });

    it('sets the handle as deleted if the server record is null', () => {
      // link to a deleted record
      baseData[ROOT_ID].friends = {[REF_KEY]: 'friends'};
      baseData.friends = null;

      const payload = {
        dataID: ROOT_ID,
        fieldKey: 'friends',
        handleKey: getRelayHandleKey('connection', null, 'friend'),
      };
      RelayConnectionHandler.update(proxy, payload);
      expect(sinkData).toEqual({
        [ROOT_ID]: {
          [ID_KEY]: ROOT_ID,
          [TYPENAME_KEY]: ROOT_TYPE,
          [payload.handleKey]: null,
        },
      });
    });

    it('sets the handle as deleted if the server record is undefined', () => {
      // link to an unfetched record
      baseData[ROOT_ID].friends = {[REF_KEY]: 'friends'};
      baseData.friends = null;

      const payload = {
        dataID: ROOT_ID,
        fieldKey: 'friends',
        handleKey: getRelayHandleKey('connection', null, 'friend'),
      };
      RelayConnectionHandler.update(proxy, payload);
      expect(sinkData).toEqual({
        [ROOT_ID]: {
          [ID_KEY]: ROOT_ID,
          [TYPENAME_KEY]: ROOT_TYPE,
          [payload.handleKey]: null,
        },
      });
    });

    it('creates a client connection with initial server data', () => {
      normalize({
        node: {
          id: '4',
          __typename: 'User',
          friends: {
            edges: [{
              cursor: 'cursor:1',
              node: {
                id: '1',
              },
            }],
            [PAGE_INFO]: {
              [END_CURSOR]: 'cursor:1',
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
              [START_CURSOR]: 'cursor:1',
            },
          },
        },
      }, {
        after: null,
        before: null,
        count: 10,
        orderby: ['first name'],
        id: '4',
      });
      const args = {first: 10, orderby:['first name']};
      const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
        '{"orderby":["first name"]}';
      const payload = {
        args,
        dataID: '4',
        fieldKey: formatStorageKey('friends', args),
        handleKey,
      };
      RelayConnectionHandler.update(proxy, payload);
      expect(sinkData).toEqual({
        4: { __id: '4',
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          [payload.handleKey]: {[REF_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}'},
        },
        'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
          [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
          [TYPENAME_KEY]: 'FriendsConnection',
          edges: {[REFS_KEY]: ['client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0']},
          [PAGE_INFO]: {[REF_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo'},
          __connection_next_edge_index: 1,
        },
        'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0': {
          [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
          [TYPENAME_KEY]: 'FriendsEdge',
          cursor: 'cursor:1',
          node: {[REF_KEY]: '1'},
        },
        'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
          [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
          [TYPENAME_KEY]: 'PageInfo',
          [END_CURSOR]: 'cursor:1',
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
          [START_CURSOR]: 'cursor:1',
        },
      });
    });

    it('populates default values for page info', () => {
      normalize({
        node: {
          id: '4',
          __typename: 'User',
          friends: {
            edges: [{
              cursor: 'cursor:1',
              node: {
                id: '1',
              },
            }],
            // no pageInfo
          },
        },
      }, {
        after: null,
        before: null,
        count: 10,
        orderby: ['first name'],
        id: '4',
      });
      const args = {first: 10, orderby:['first name']};
      const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
        '{"orderby":["first name"]}';
      const payload = {
        args,
        dataID: '4',
        fieldKey: formatStorageKey('friends', args),
        handleKey,
      };
      RelayConnectionHandler.update(proxy, payload);
      expect(sinkData).toEqual({
        4: { __id: '4',
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          [payload.handleKey]: {[REF_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}'},
        },
        'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
          [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
          [TYPENAME_KEY]: 'FriendsConnection',
          edges: {[REFS_KEY]: ['client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0']},
          [PAGE_INFO]: {[REF_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo'},
          __connection_next_edge_index: 1,
        },
        'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0': {
          [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
          [TYPENAME_KEY]: 'FriendsEdge',
          cursor: 'cursor:1',
          node: {[REF_KEY]: '1'},
        },
        'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
          [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
          [TYPENAME_KEY]: 'PageInfo',
          [END_CURSOR]: null,
          [HAS_NEXT_PAGE]: false,
          [HAS_PREV_PAGE]: false,
          [START_CURSOR]: null,
        },
      });
    });

    describe('subsequent fetches', () => {
      beforeEach(() => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:1',
                node: {
                  id: '1',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:1',
                [HAS_NEXT_PAGE]: true,
                [HAS_PREV_PAGE]: false,
                [START_CURSOR]: 'cursor:1',
              },
            },
          },
        }, {
          after: null,
          before: null,
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {first: 10, orderby:['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        const store = new RelayMarkSweepStore(baseSource);
        store.publish(sinkSource);
        baseData = simpleClone(baseData);
        baseSource =  new RelayInMemoryRecordSource(baseData);
        sinkData = {};
        sinkSource = new RelayInMemoryRecordSource(sinkData);
        mutator = new RelayRecordSourceMutator(baseSource, sinkSource);
        proxy = new RelayRecordSourceProxy(mutator);
      });

      it('appends new edges', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:2',
                node: {
                  id: '2',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:2',
                [HAS_NEXT_PAGE]: false,
                [HAS_PREV_PAGE]: false,
                [START_CURSOR]: 'cursor:2',
              },
            },
          },
        }, {
          after: 'cursor:1',
          before: null,
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {after: 'cursor:1', first: 10, orderby:['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            edges: {[REFS_KEY]: [
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            ]},
            __connection_next_edge_index: 2,
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:2',
            node: {[REF_KEY]: '2'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
            [TYPENAME_KEY]: 'PageInfo',
            [END_CURSOR]: 'cursor:2',
            [HAS_NEXT_PAGE]: false,
          },
        });
      });

      it('prepends new edges', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:0',
                node: {
                  id: '0',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:0',
                [HAS_PREV_PAGE]: false,
                [HAS_NEXT_PAGE]: false,
                [START_CURSOR]: 'cursor:0',
              },
            },
          },
        }, {
          after: null,
          before: 'cursor:1',
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {before: 'cursor:1', first: 10, orderby: ['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            edges: {[REFS_KEY]: [
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
            ]},
            __connection_next_edge_index: 2,
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:0',
            node: {[REF_KEY]: '0'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
            [TYPENAME_KEY]: 'PageInfo',
            [HAS_PREV_PAGE]: false,
            [START_CURSOR]: 'cursor:0',
          },
        });
      });

      it('resets the connection for head loads (no after/before args)', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:0',
                node: {
                  id: '0',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:0',
                [HAS_PREV_PAGE]: false,
                [HAS_NEXT_PAGE]: true,
                [START_CURSOR]: 'cursor:0',
              },
            },
          },
        }, {
          after: null,
          before: null,
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {first: 10, orderby:['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            edges: {[REFS_KEY]: [
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            ]},
            __connection_next_edge_index: 2,
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:0',
            node: {[REF_KEY]: '0'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
            [TYPENAME_KEY]: 'PageInfo',
            [END_CURSOR]: 'cursor:0',
            [HAS_NEXT_PAGE]: true,
          },
        });
      });

      it('appends new edges with null cursors', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: null,
                node: {
                  id: '2',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:2',
                [HAS_NEXT_PAGE]: false,
                [HAS_PREV_PAGE]: false,
                [START_CURSOR]: 'cursor:2',
              },
            },
          },
        }, {
          after: 'cursor:1',
          before: null,
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {after: 'cursor:1', first: 10, orderby: ['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            edges: {[REFS_KEY]: [
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            ]},
            __connection_next_edge_index: 2,
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: null,
            node: {[REF_KEY]: '2'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
            [TYPENAME_KEY]: 'PageInfo',
            [END_CURSOR]: 'cursor:2',
            [HAS_NEXT_PAGE]: false,
          },
        });
      });

      it('updates the end cursor using server page info', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:2',
                node: {
                  id: '2',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:updated',
                [HAS_NEXT_PAGE]: false,
                [HAS_PREV_PAGE]: false,
                [START_CURSOR]: null,
              },
            },
          },
        }, {
          after: 'cursor:1',
          before: null,
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {after: 'cursor:1', first: 10, orderby: ['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            edges: {[REFS_KEY]: [
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            ]},
            __connection_next_edge_index: 2,
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:2',
            node: {[REF_KEY]: '2'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
            [TYPENAME_KEY]: 'PageInfo',
            [END_CURSOR]: 'cursor:updated',
            [HAS_NEXT_PAGE]: false,
          },
        });
      });

      it('ignores null end cursors', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [],
              [PAGE_INFO]: {
                [END_CURSOR]: null,
                [HAS_NEXT_PAGE]: false,
                [HAS_PREV_PAGE]: false,
                [START_CURSOR]: null,
              },
            },
          },
        }, {
          after: 'cursor:1',
          before: null,
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {after: 'cursor:1', first: 10, orderby: ['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            edges: {[REFS_KEY]: [
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
            ]},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
            [TYPENAME_KEY]: 'PageInfo',
            [HAS_NEXT_PAGE]: false,
            // end_cursor is skipped
          },
        });
      });

      it('skips edges with duplicate node ids', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:2', // new cursor
                node: {
                  id: '1', // same as existing edge
                },
              }, {
                cursor: 'cursor:3',
                node: {
                  id: '3',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:3',
                [HAS_NEXT_PAGE]: true,
                [HAS_PREV_PAGE]: false,
                [START_CURSOR]: 'cursor:3',
              },
            },
          },
        }, {
          after: 'cursor:1',
          before: null,
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {after: 'cursor:1', first: 10, orderby:['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            edges: {[REFS_KEY]: [
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
              // '...edges:0' skipped bc of duplicate node id
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:2',
            ]},
            __connection_next_edge_index: 3,
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:2',
            node: {[REF_KEY]: '1'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:2': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:2',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:3',
            node: {[REF_KEY]: '3'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
            [TYPENAME_KEY]: 'PageInfo',
            [END_CURSOR]: 'cursor:3',
            [HAS_NEXT_PAGE]: true,
          },
        });
      });

      it('adds edges with duplicate cursors', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:1', // same cursor as existing edge
                node: {
                  id: '2', // different node id
                },
              }, {
                cursor: 'cursor:3',
                node: {
                  id: '3',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:3',
                [HAS_NEXT_PAGE]: true,
                [HAS_PREV_PAGE]: false,
                [START_CURSOR]: 'cursor:3',
              },
            },
          },
        }, {
          after: 'cursor:1',
          before: null,
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {after: 'cursor:1', first: 10, orderby:['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            edges: {[REFS_KEY]: [
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:0',
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
              'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:2',
            ]},
            __connection_next_edge_index: 3,
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:1',
            node: {[REF_KEY]: '2'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:2': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:2',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:3',
            node: {[REF_KEY]: '3'},
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:pageInfo',
            [TYPENAME_KEY]: 'PageInfo',
            [END_CURSOR]: 'cursor:3',
            [HAS_NEXT_PAGE]: true,
          },
        });
      });

      it('skips backward pagination payloads with unknown cursors', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:2',
                node: {
                  id: '2',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:2',
                [HAS_NEXT_PAGE]: false,
                [HAS_PREV_PAGE]: true,
                [START_CURSOR]: 'cursor:2',
              },
            },
          },
        }, {
          after: null,
          before: '<unknown-cursor>',
          count: 10,
          orderby: ['first name'],
          id: '4',
        });
        const args = {before: '<unknown-cursor>', first: 10, orderby:['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';

        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            __connection_next_edge_index: 2,
            // edges unchanged
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:2',
            node: {[REF_KEY]: '2'},
          },
          // page info unchanged
        });
      });

      it('skips forward pagination payloads with unknown cursors', () => {
        normalize({
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [{
                cursor: 'cursor:2',
                node: {
                  id: '2',
                },
              }],
              [PAGE_INFO]: {
                [END_CURSOR]: 'cursor:2',
                [HAS_NEXT_PAGE]: false,
                [HAS_PREV_PAGE]: true,
                [START_CURSOR]: 'cursor:2',
              },
            },
          },
        }, {
          after: '<unknown-cursor>',
          before: null,
          count: 10,
          orderby:['first name'],
          id: '4',
        });
        const args = {after: '<unknown-cursor>', first: 10, orderby:['first name']};
        const handleKey = getRelayHandleKey('connection', 'ConnectionQuery_friends', 'friends') +
          '{"orderby":["first name"]}';
        const payload = {
          args,
          dataID: '4',
          fieldKey: formatStorageKey('friends', args),
          handleKey,
        };
        RelayConnectionHandler.update(proxy, payload);
        expect(sinkData).toEqual({
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}',
            [TYPENAME_KEY]: 'FriendsConnection',
            __connection_next_edge_index: 2,
            // edges unchanged
          },
          'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1': {
            [ID_KEY]: 'client:4:__ConnectionQuery_friends_connection{"orderby":["first name"]}:edges:1',
            [TYPENAME_KEY]: 'FriendsEdge',
            cursor: 'cursor:2',
            node: {[REF_KEY]: '2'},
          },
          // page info unchanged
        });
      });
    });
  });
});
