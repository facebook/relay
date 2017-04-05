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

jest.mock('warning');
jest.useFakeTimers();

require('configureForRelayOSS');

const GraphQLRange = require('GraphQLRange');
const Relay = require('Relay');
const RelayChangeTracker = require('RelayChangeTracker');
const RelayGarbageCollector = require('RelayGarbageCollector');
const RelayQueryPath = require('RelayQueryPath');
const RelayRecordStore = require('RelayRecordStore');
const RelayTestUtils = require('RelayTestUtils');

const invariant = require('invariant');
const {
  restoreFragmentDataFromCache,
  restoreQueriesDataFromCache,
} = require('restoreRelayCacheData');

describe('restoreRelayCacheData', () => {
  const {getNode} = RelayTestUtils;

  function performFragmentRestore(dataID, fragment, path, options) {
    return _performRestore({
      dataID,
      fragment,
      path,
      ...options,
    });
  }

  function performQueriesRestore(queries, options) {
    return _performRestore({queries, ...options});
  }

  function _performRestore({
    cachedRecords,
    cachedRootCallMap,
    dataID,
    diskCacheData,
    fragment,
    garbageCollector,
    path,
    queries,
    records,
    rootCallMap,
  }) {
    cachedRecords = cachedRecords || {};
    cachedRootCallMap = cachedRootCallMap || {};
    diskCacheData = diskCacheData || {};

    const store = new RelayRecordStore(
      {
        records: records || {},
        cachedRecords,
      },
      {
        rootCallMap: rootCallMap || {},
        cachedRootCallMap,
      }
    );

    const cacheManager = {
      readNode: jest.fn((id, callback) => {
        setTimeout(() => {
          callback(undefined, diskCacheData[id]);
        });
      }),
      readRootCall: jest.fn(
        (callName, callArg, callback) => {
          const rootKey = callName + '*' + callArg;
          setTimeout(() => {
            callback(undefined, diskCacheData[rootKey]);
          });
        }
      ),
    };

    const changeTracker = new RelayChangeTracker();

    const callbacks = {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
    };

    let abort;
    if (queries) {
      ({abort} = restoreQueriesDataFromCache(
        queries,
        store,
        cachedRecords,
        cachedRootCallMap,
        garbageCollector,
        cacheManager,
        changeTracker,
        callbacks
      ));
    } else if (dataID && fragment && path) {
      ({abort} = restoreFragmentDataFromCache(
        dataID,
        fragment,
        path,
        store,
        cachedRecords,
        cachedRootCallMap,
        garbageCollector,
        cacheManager,
        changeTracker,
        callbacks
      ));
    } else {
      invariant(false, 'Input did not match for reading queries nor fragments');
    }

    return {abort, cacheManager, callbacks, changeTracker, store};
  }

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllTimers();
    jasmine.addMatchers(RelayTestUtils.matchers);

  });

  describe('restoreQueriesDataFromCache', () => {
    it('reads disk for custom root call', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {username(name:"yuzhi") {id}}
        `),
      };
      const {cacheManager} = performQueriesRestore(queries);

      const mockReadRoot = cacheManager.readRootCall.mock;
      expect(mockReadRoot.calls.length).toBe(1);
      expect(mockReadRoot.calls[0].slice(0, 2)).toEqual(['username', 'yuzhi']);
    });

    it('does not read disk for node root call', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {node(id:"1055790163") {id}}
        `),
      };
      const {cacheManager} = performQueriesRestore(queries);

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
    });

    it('calls `onFailure` when custom root call is not on disk', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {username(name:"yuzhi") {id}}
        `),
      };
      const {cacheManager, callbacks} = performQueriesRestore(queries);

      const mockReadRoot = cacheManager.readRootCall.mock;
      expect(mockReadRoot.calls.length).toBe(1);
      expect(mockReadRoot.calls[0].slice(0, 2)).toEqual(['username', 'yuzhi']);

      jest.runAllTimers();
      expect(mockReadRoot.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls.length).toBe(0);
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);
    });

    it('calls `onSuccess` when custom root call is on disk ', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {username(name:"yuzhi") {id}}
        `),
      };
      const diskCacheData = {
        'username*yuzhi': '1055790163',
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData});

      const mockReadRoot = cacheManager.readRootCall.mock;
      expect(mockReadRoot.calls.length).toBe(1);
      expect(mockReadRoot.calls[0].slice(0, 2)).toEqual(['username', 'yuzhi']);

      jest.runAllTimers();

      expect(mockReadRoot.calls.length).toBe(1);
      const mockReadNode = cacheManager.readNode.mock;
      expect(mockReadNode.calls.length).toBe(1);
      expect(mockReadNode.calls[0][0]).toEqual('1055790163');
      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);
      expect(store.getDataID('username', 'yuzhi')).toBe('1055790163');
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getType('1055790163')).toBe('User');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          1055790163: true,
        },
        updated: {},
      });
    });

    it('calls `onSuccess` when custom root call is in store ', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {username(name:"yuzhi") {id}}
        `),
      };
      const records = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
      };
      const rootCallMap = {username: {yuzhi: '1055790163'}};

      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {records, rootCallMap});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(0);
      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);
      expect(store.getDataID('username', 'yuzhi')).toBe('1055790163');
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getType('1055790163')).toBe('User');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {},
      });
    });

    it('calls `onSuccess` when custom root call is in cached store ', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {username(name:"yuzhi") {id}}
        `),
      };
      const cachedRecords = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
      };
      const cachedRootCallMap = {username: {yuzhi: '1055790163'}};

      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {cachedRecords, cachedRootCallMap});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(0);
      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);
      expect(store.getDataID('username', 'yuzhi')).toBe('1055790163');
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getType('1055790163')).toBe('User');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {},
      });
    });

    it('calls `onFailure` when node is not on disk', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {node(id:"1055790163") {id}}
        `),
      };
      const {cacheManager, callbacks} = performQueriesRestore(queries);

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

      jest.runAllTimers();
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);
    });

    it('calls `onFailure` when a field is not on disk', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {node(id:"1055790163") {id, name}}
        `),
      };

      // Missing `name`
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

      jest.runAllTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);

      // Confirm that partial data was read into the cache:
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getType('1055790163')).toBe('User');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          '1055790163': true,
        },
        updated: {},
      });
    });

    it('calls `onFailure` when a nested node is not on disk', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {node(id:"1055790163") {id, hometown {name}}}
        `),
      };

      // Missing `hometownid`
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          hometown: {__dataID__: 'hometownid'},
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(2);
      expect(cacheManager.readNode.mock.calls[1][0]).toBe('hometownid');

      jest.runAllTimers();
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);

      // Confirm that partial data was read into the cache:
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getLinkedRecordID('1055790163', 'hometown'))
        .toBe('hometownid');
      expect(store.getType('1055790163')).toBe('User');
      expect(store.getRecordState('hometownid')).toBe('UNKNOWN');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          '1055790163': true,
        },
        updated: {},
      });
    });

    it('calls `onFailure` when one of the plural nodes is not on disk', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {node(id:"1055790163") {id, screennames {service}}}
        `),
      };

      // Missing `sn2`
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          screennames: [{__dataID__: 'sn1'}, {__dataID__: 'sn2'}],
        },
        'sn1': {
          __dataID__: 'sn1',
          service: 'GTALK',
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(3);
      expect(cacheManager.readNode.mock.calls[1][0]).toBe('sn1');
      expect(cacheManager.readNode.mock.calls[2][0]).toBe('sn2');

      jest.runAllTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(3);
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);

      // Confirm that partial data was read into the cache:
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getLinkedRecordIDs('1055790163', 'screennames'))
        .toEqual(['sn1', 'sn2']);
      expect(store.getType('1055790163')).toBe('User');
      expect(store.getRecordState('sn1')).toBe('EXISTENT');
      expect(store.getField('sn1', 'service')).toBe('GTALK');
      expect(store.getRecordState('sn2')).toBe('UNKNOWN');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          '1055790163': true,
          'sn1': true,
        },
        updated: {},
      });
    });

    it('calls `onFailure` when range field is not on disk', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {
            node(id:"1055790163") {
              friends(first: 5) {
                edges {
                  node {
                    name
                  }
                  cursor
                }
              }
            }
          }
        `),
      };

      // Missing `__range__`
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          friends: {__dataID__: 'friends_id'},
        },
        'friends_id': {
          __dataID__: 'friends_id',
          count: 500,
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(2);
      expect(cacheManager.readNode.mock.calls[1][0]).toBe('friends_id');

      jest.runAllTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(2);
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);

      // Confirm that partial data was read into the cache:
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getLinkedRecordID('1055790163', 'friends'))
        .toBe('friends_id');
      expect(store.getType('1055790163')).toBe('User');
      expect(store.getRecordState('friends_id')).toBe('EXISTENT');
      expect(store.getField('friends_id', 'count')).toBe(500);
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          '1055790163': true,
          'friends_id': true,
        },
        updated: {},
      });
    });

    it('calls `onFailure` when range on disk has diff calls', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {
            node(id:"1055790163") {
              friends(first: 5) {
                edges {
                  node {
                    name
                  }
                  cursor
                }
              }
            }
          }
        `),
      };

      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          friends: {__dataID__: 'friends_id'},
        },
        'friends_id': {
          __dataID__: 'friends_id',
          __range__: new GraphQLRange(),
        },
      };

      diskCacheData.friends_id.__range__.retrieveRangeInfoForQuery
        .mockReturnValue({
          requestedEdgeIDs: [],
          diffCalls: [RelayTestUtils.createCall('first', 5)],
          pageInfo: {},
        });
      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(2);
      expect(cacheManager.readNode.mock.calls[1][0]).toBe('friends_id');

      jest.runAllTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(2);
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);

      // Confirm that partial data was read into the cache:
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getLinkedRecordID('1055790163', 'friends'))
        .toBe('friends_id');
      expect(store.getType('1055790163')).toBe('User');
      expect(store.getRecordState('friends_id')).toBe('EXISTENT');
      expect(store.hasRange('friends_id')).toBe(true);
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          '1055790163': true,
          'friends_id': true,
        },
        updated: {},
      });
    });

    it('calls `onFailure` when edge node is not on disk', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {
            node(id:"1055790163") {
              friends(first: 5) {
                edges {
                  node {
                    name
                  }
                  cursor
                }
              }
            }
          }
        `),
      };

      // Missing `edge_id`
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          friends: {__dataID__: 'friends_id'},
        },
        'friends_id': {
          __dataID__: 'friends_id',
          __range__: new GraphQLRange(),
        },
      };

      diskCacheData.friends_id.__range__.retrieveRangeInfoForQuery
        .mockReturnValue({
          requestedEdgeIDs: ['edge_id'],
          diffCalls: [],
          pageInfo: {},
        });
      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(2);
      expect(cacheManager.readNode.mock.calls[1][0]).toBe('friends_id');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(3);
      expect(cacheManager.readNode.mock.calls[2][0]).toBe('edge_id');

      jest.runAllTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(3);
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);

      // Confirm that partial data was read into the cache:
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getLinkedRecordID('1055790163', 'friends'))
        .toBe('friends_id');
      expect(store.getType('1055790163')).toBe('User');
      expect(store.getRecordState('friends_id')).toBe('EXISTENT');
      expect(store.hasRange('friends_id')).toBe(true);
      expect(store.getRecordState('edge_id')).toBe('UNKNOWN');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          '1055790163': true,
          'friends_id': true,
        },
        updated: {},
      });
    });

    it('calls `onSuccess` when connection is on disk', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {
            node(id:"1055790163") {
              friends(first: 5) {
                edges {
                  node {
                    name
                  }
                  cursor
                }
              }
            }
          }
        `),
      };

      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          friends: {__dataID__: 'client:friends_id'},
        },
        'client:friends_id': {
          __dataID__: 'client:friends_id',
          __range__: new GraphQLRange(),
        },
        'client:edge_id': {
          __dataID__: 'client:edge_id',
          cursor: '1234',
          node: {__dataID__: 'friend_id'},
        },
        'friend_id': {
          __dataID__: 'friend_id',
          id: 'friend_id',
          name: 'name',
        },
      };

      const rangeInfo = {
        requestedEdgeIDs: ['client:edge_id'],
        diffCalls: [],
        pageInfo: {},
      };
      diskCacheData['client:friends_id'].__range__.retrieveRangeInfoForQuery
        .mockReturnValue(rangeInfo);
      const {cacheManager, callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData});

      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(1);
      expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(2);
      expect(cacheManager.readNode.mock.calls[1][0]).toBe('client:friends_id');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(3);
      expect(cacheManager.readNode.mock.calls[2][0]).toBe('client:edge_id');

      jest.runOnlyPendingTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(4);
      expect(cacheManager.readNode.mock.calls[3][0]).toBe('friend_id');

      jest.runAllTimers();
      expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
      expect(cacheManager.readNode.mock.calls.length).toBe(4);
      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getType('1055790163')).toBe('User');
      expect(store.getLinkedRecordID('1055790163', 'friends'))
        .toBe('client:friends_id');
      expect(store.getRecordState('client:friends_id')).toBe('EXISTENT');
      const query = queries.q0;
      const friendsField = query.getFieldByStorageKey('friends');
      const friendsPath = RelayQueryPath.getPath(
        RelayQueryPath.create(query),
        query.getFieldByStorageKey('friends'),
        'client:friends_id'
      );
      expect(store.getPathToRecord('client:friends_id'))
        .toMatchPath(friendsPath);
      expect(store.getRangeMetadata(
        'client:friends_id',
        [{name:'first', value: '5'}]
      )).toEqual({
        ...rangeInfo,
        filterCalls: [],
        filteredEdges: [{
          edgeID: 'client:edge_id',
          nodeID: 'friend_id',
        }],
      });
      expect(store.getRecordState('client:edge_id')).toBe('EXISTENT');
      const edgePath = RelayQueryPath.getPath(
        friendsPath,
        friendsField.getFieldByStorageKey('edges'),
        'client:edge_id'
      );
      expect(store.getPathToRecord('client:edge_id')).toMatchPath(edgePath);
      expect(store.getField('client:edge_id', 'cursor')).toBe('1234');
      expect(store.getLinkedRecordID('client:edge_id', 'node'))
        .toBe('friend_id');
      expect(store.getRecordState('friend_id')).toBe('EXISTENT');
      expect(store.getField('friend_id', 'id')).toBe('friend_id');
      expect(store.getField('friend_id', 'name')).toBe('name');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          '1055790163': true,
          'client:friends_id': true,
          'client:edge_id': true,
          'friend_id': true,
        },
        updated: {},
      });
    });

    it('marks records as updated when more fields are read from cache', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {
            node(id:"1055790163") {
              id
              screennames {
                service
              }
            }
          }
        `),
      };
      const records = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
      };
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          screennames: [{__dataID__: 'sn1'}],
        },
        'sn1': {
          __dataID__: 'sn1',
          service: 'GTALK',
        },
      };
      const {callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData, records});

      jest.runAllTimers();

      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);

      // Updates the top-level record which existed in node data and creates the
      // linked record.
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getType('1055790163')).toBe('User');
      expect(store.getLinkedRecordIDs('1055790163', 'screennames'))
        .toEqual(['sn1']);
      expect(store.getRecordState('sn1')).toBe('EXISTENT');
      expect(store.getField('sn1', 'service')).toBe('GTALK');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          'sn1': true,
        },
        updated: {
          '1055790163': true,
        },
      });
    });

    it('marks records as created if they are null in the cache', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {
            node(id:"1055790163") {
              id
              screennames {
                service
              }
            }
          }
        `),
      };
      const records = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
      };
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          screennames: [{__dataID__: 'sn1'}, {__dataID__: 'sn2'}],
        },
        'sn1': null,
        'sn2': undefined,
      };
      const {callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData, records});

      jest.runAllTimers();

      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);

      // Updates the top-level record which existed in node data and creates the
      // linked record.
      expect(store.getRecordState('sn1')).toBe('NONEXISTENT');
      expect(store.getRecordState('sn2')).toBe('UNKNOWN');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          'sn1': true,
          // sn2 not created since the value is unknown in the cache
        },
        updated: {
          '1055790163': true,
        },
      });
    });

    it('does not mark deleted records as updated', () => {
      const queries = {
        q0: getNode(Relay.QL`
          query {
            node(id:"1055790163") {
              id
              screennames {
                service
              }
            }
          }
        `),
      };
      const records = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
        // linked from the above in diskCache only
        'sn1': null,
      };
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
          screennames: [{__dataID__: 'sn1'}],
        },
        'sn1': {
          __dataID__: 'sn1',
          service: 'GTALK',
        },
      };
      const {callbacks, changeTracker, store} =
        performQueriesRestore(queries, {diskCacheData, records});

      jest.runAllTimers();

      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);
      expect(store.getLinkedRecordIDs('1055790163', 'screennames'))
        .toEqual(['sn1']);
      expect(store.getRecordState('sn1')).toBe('NONEXISTENT');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          '1055790163': true,
        },
      });
    });

    it('registers new records with the garbage collector', () => {
      const garbageCollector = new RelayGarbageCollector();
      RelayGarbageCollector.prototype.register = jest.fn();
      const queries = {
        q0: getNode(Relay.QL`
          query {
            node(id: "123") {
              id
            }
          }
        `),
      };
      const records = {
      };
      const diskCacheData = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
        },
      };
      performQueriesRestore(queries, {
        diskCacheData,
        garbageCollector,
        records,
      });

      jest.runAllTimers();

      expect(garbageCollector.register.mock.calls.length).toBe(1);
      expect(garbageCollector.register.mock.calls[0][0]).toBe('123');
    });
  });

  // Most field types are already tested in the normal read function above.
  // This will test the various cases for the root node in
  // `restoreFragmentDataFromCache`.

  describe('restoreFragmentDataFromCache', () => {
    it('calls `onFailure` when node is not in disk', () => {
      const fragment = getNode(Relay.QL`
        fragment on Node {
          id
          name
        }
      `);
      const path = RelayQueryPath.create(getNode(Relay.QL`
        query {
          node(id: "1055790163") {id}
        }
     `));
      const dataID = '1055790163';
      const diskCacheData = {};

      const {cacheManager, callbacks, changeTracker, store} =
        performFragmentRestore(dataID, fragment, path, {diskCacheData});

      jest.runAllTimers();

      const mockReadNode = cacheManager.readNode.mock;
      expect(mockReadNode.calls.length).toBe(1);
      expect(mockReadNode.calls[0][0]).toEqual('1055790163');
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);
      expect(store.getRecordState('1055790163')).toBe('UNKNOWN');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {},
      });
    });

    it('calls `onFailure` when a field is not on disk', () => {
      const fragment = getNode(Relay.QL`
        fragment on Node {
          id
          name
        }
      `);
      const path = RelayQueryPath.create(getNode(Relay.QL`
        query {
          node(id: "1055790163") {id}
        }
     `));
      const dataID = '1055790163';
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performFragmentRestore(dataID, fragment, path, {diskCacheData});

      jest.runAllTimers();

      const mockReadNode = cacheManager.readNode.mock;
      expect(mockReadNode.calls.length).toBe(1);
      expect(mockReadNode.calls[0][0]).toEqual('1055790163');
      expect(callbacks.onFailure.mock.calls.length).toBe(1);
      expect(callbacks.onSuccess.mock.calls.length).toBe(0);
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getField('1055790163', 'name')).toBe(undefined);
      expect(store.getType('1055790163')).toBe('User');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          1055790163: true,
        },
        updated: {},
      });
    });

    it('calls `onSuccess` when node is in disk', () => {
      const fragment = getNode(Relay.QL`
        fragment on Node {
          id
          name
        }
      `);
      const path = RelayQueryPath.create(getNode(Relay.QL`
        query {
          node(id: "1055790163") {id}
        }
     `));
      const dataID = '1055790163';
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          name: 'Yuzhi Zheng',
          __typename: 'User',
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performFragmentRestore(dataID, fragment, path, {diskCacheData});

      jest.runAllTimers();

      const mockReadNode = cacheManager.readNode.mock;
      expect(mockReadNode.calls.length).toBe(1);
      expect(mockReadNode.calls[0][0]).toEqual('1055790163');
      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getField('1055790163', 'name')).toBe('Yuzhi Zheng');
      expect(store.getType('1055790163')).toBe('User');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          1055790163: true,
        },
        updated: {},
      });
    });

    it('calls `onSuccess` when node is in cached store', () => {
      const fragment = getNode(Relay.QL`
        fragment on Node {
          id
          name
        }
      `);
      const path = RelayQueryPath.create(getNode(Relay.QL`
        query {
          node(id: "1055790163") {id}
        }
     `));
      const dataID = '1055790163';
      const cachedRecords = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          name: 'Yuzhi Zheng',
          __typename: 'User',
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performFragmentRestore(dataID, fragment, path, {cachedRecords});

      jest.runAllTimers();

      const mockReadNode = cacheManager.readNode.mock;
      expect(mockReadNode.calls.length).toBe(0);
      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getField('1055790163', 'name')).toBe('Yuzhi Zheng');
      expect(store.getType('1055790163')).toBe('User');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {},
      });
    });

    it('calls `onSuccess` when node is in store', () => {
      const fragment = getNode(Relay.QL`
        fragment on Node {
          id
          name
        }
      `);
      const path = RelayQueryPath.create(getNode(Relay.QL`
        query {
          node(id: "1055790163") {id}
        }
     `));
      const dataID = '1055790163';
      const records = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          name: 'Yuzhi Zheng',
          __typename: 'User',
        },
      };

      const {cacheManager, callbacks, changeTracker, store} =
        performFragmentRestore(dataID, fragment, path, {records});

      jest.runAllTimers();

      const mockReadNode = cacheManager.readNode.mock;
      expect(mockReadNode.calls.length).toBe(0);
      expect(callbacks.onFailure.mock.calls.length).toBe(0);
      expect(callbacks.onSuccess.mock.calls.length).toBe(1);
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getField('1055790163', 'name')).toBe('Yuzhi Zheng');
      expect(store.getType('1055790163')).toBe('User');
      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {},
      });
    });
  });

  describe('abort', () => {
    it('does not call `onSuccess` if aborted', () => {
      const fragment = getNode(Relay.QL`
        fragment on Node {
          id
          name
        }
      `);
      const path = RelayQueryPath.create(getNode(Relay.QL`
        query {
          node(id: "1055790163") {id}
        }
     `));
      const dataID = '1055790163';
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          name: 'Yuzhi Zheng',
          __typename: 'User',
        },
      };

      const {abort, callbacks, store} =
        performFragmentRestore(dataID, fragment, path, {diskCacheData});

      abort();
      // this would read 1055790163 from cache if not aborted
      jest.runAllTimers();

      expect(store.getRecordState('1055790163')).toBe('UNKNOWN');
      expect(callbacks.onFailure).not.toBeCalled();
      expect(callbacks.onSuccess).not.toBeCalled();
    });

    it('does not `onFailure` if aborted', () => {
      const fragment = getNode(Relay.QL`
        fragment on Node {
          id
          name
        }
      `);
      const path = RelayQueryPath.create(getNode(Relay.QL`
        query {
          node(id: "1055790163") {id}
        }
     `));
      const dataID = '1055790163';
      const diskCacheData = {
        '1055790163': {
          __dataID__: '1055790163',
          id: '1055790163',
          __typename: 'User',
        },
      };

      const {abort, callbacks, store} =
        performFragmentRestore(dataID, fragment, path, {diskCacheData});

      abort();
      // The read would fail since `name` is missing from cached data.
      jest.runAllTimers();

      expect(store.getRecordState('1055790163')).toBe('UNKNOWN');
      expect(callbacks.onFailure).not.toBeCalled();
      expect(callbacks.onSuccess).not.toBeCalled();
    });
  });
});
