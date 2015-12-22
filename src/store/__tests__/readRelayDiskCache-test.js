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

require('configureForRelayOSS');

const GraphQLRange = require('GraphQLRange');
const Relay = require('Relay');
const RelayChangeTracker = require('RelayChangeTracker');
const RelayQueryPath = require('RelayQueryPath');
const RelayRecordStore = require('RelayRecordStore');
const RelayTestUtils = require('RelayTestUtils');

const readRelayDiskCache = require('readRelayDiskCache');

describe('readRelayDiskCache', () => {
  var {getNode} = RelayTestUtils;

  function readDiskCache(
    queries,
    diskCacheData,
    records,
    cachedRecords,
    rootCallMap,
    cachedRootCallMap,
  ) {
    cachedRecords = cachedRecords || {};
    cachedRootCallMap = cachedRootCallMap || {};
    diskCacheData = diskCacheData || {};

    var store = new RelayRecordStore(
      {
        records: records || {},
        cachedRecords,
      },
      {
        rootCallMap: rootCallMap || {},
        cachedRootCallMap,
      }
    );

    var cacheManager = {
      readNode: jest.genMockFunction().mockImplementation((id, callback) => {
        setTimeout(() => {
          callback(undefined, diskCacheData[id]);
        });
      }),
      readRootCall: jest.genMockFunction().mockImplementation(
        (callName, callArg, callback) => {
          var rootKey = callName + '*' + callArg;
          setTimeout(() => {
            callback(undefined, diskCacheData[rootKey]);
          });
        }
      ),
    };

    var changeTracker = new RelayChangeTracker();

    var callbacks = {
      onSuccess: jest.genMockFunction(),
      onFailure: jest.genMockFunction(),
    };

    readRelayDiskCache(
      queries,
      store,
      cachedRecords,
      cachedRootCallMap,
      cacheManager,
      changeTracker,
      callbacks
    );

    return {cacheManager, callbacks, changeTracker, store};
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    jest.clearAllTimers();
    jasmine.addMatchers(RelayTestUtils.matchers);

  });

  it('reads disk for custom root call', () => {
    var queries = {
      q0: getNode(Relay.QL`
        query {username(name:"yuzhi") {id}}
      `),
    };
    var {cacheManager} = readDiskCache(queries);

    var mockReadRoot = cacheManager.readRootCall.mock;
    expect(mockReadRoot.calls.length).toBe(1);
    expect(mockReadRoot.calls[0].slice(0, 2)).toEqual(['username', 'yuzhi']);
  });

  it('does not read disk for node root call', () => {
    var queries = {
      q0: getNode(Relay.QL`
        query {node(id:"1055790163") {id}}
      `),
    };
    var {cacheManager} = readDiskCache(queries);

    expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
  });

  it('calls `onFailure` when custom root call is not on disk', () => {
    var queries = {
      q0: getNode(Relay.QL`
        query {username(name:"yuzhi") {id}}
      `),
    };
    var {cacheManager, callbacks} = readDiskCache(queries);

    var mockReadRoot = cacheManager.readRootCall.mock;
    expect(mockReadRoot.calls.length).toBe(1);
    expect(mockReadRoot.calls[0].slice(0, 2)).toEqual(['username', 'yuzhi']);

    jest.runAllTimers();
    expect(mockReadRoot.calls.length).toBe(1);
    expect(cacheManager.readNode.mock.calls.length).toBe(0);
    expect(callbacks.onFailure.mock.calls.length).toBe(1);
    expect(callbacks.onSuccess.mock.calls.length).toBe(0);
  });

  it('calls `onSuccess` when custom root call is on disk ', () => {
    var queries = {
      q0: getNode(Relay.QL`
        query {username(name:"yuzhi") {id}}
      `),
    };
    var diskData = {
      'username*yuzhi': '1055790163',
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
      },
    };

    var {cacheManager, callbacks, changeTracker, store} =
      readDiskCache(queries, diskData);

    var mockReadRoot = cacheManager.readRootCall.mock;
    expect(mockReadRoot.calls.length).toBe(1);
    expect(mockReadRoot.calls[0].slice(0, 2)).toEqual(['username', 'yuzhi']);

    jest.runAllTimers();

    expect(mockReadRoot.calls.length).toBe(1);
    var mockReadNode = cacheManager.readNode.mock;
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
    var queries = {
      q0: getNode(Relay.QL`
        query {username(name:"yuzhi") {id}}
      `),
    };
    var records = {
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
      },
    };
    var rootCallMap = {username: {yuzhi: '1055790163'}};

    var {cacheManager, callbacks, changeTracker, store} = readDiskCache(
      queries,
      undefined,
      records,
      undefined,
      rootCallMap
    );

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
    var queries = {
      q0: getNode(Relay.QL`
        query {username(name:"yuzhi") {id}}
      `),
    };
    var cachedRecords = {
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
      },
    };
    var cachedRootCallMap = {username: {yuzhi: '1055790163'}};

    var {cacheManager, callbacks, changeTracker, store} = readDiskCache(
      queries,
      undefined,
      undefined,
      cachedRecords,
      undefined,
      cachedRootCallMap
    );

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
    var queries = {
      q0: getNode(Relay.QL`
        query {node(id:"1055790163") {id}}
      `),
    };
    var {cacheManager, callbacks} = readDiskCache(queries);

    expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
    expect(cacheManager.readNode.mock.calls.length).toBe(1);
    expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

    jest.runAllTimers();
    expect(callbacks.onFailure.mock.calls.length).toBe(1);
    expect(callbacks.onSuccess.mock.calls.length).toBe(0);
  });

  it('calls `onFailure` when a field is not on disk', () => {
    var queries = {
      q0: getNode(Relay.QL`
        query {node(id:"1055790163") {id, name}}
      `),
    };

    // Missing `name`
    var diskData = {
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
      },
    };

    var {cacheManager, callbacks, changeTracker, store} =
      readDiskCache(queries, diskData);

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
    var queries = {
      q0: getNode(Relay.QL`
        query {node(id:"1055790163") {id, hometown {name}}}
      `),
    };

    // Missing `hometownid`
    var diskData = {
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
        hometown: {__dataID__: 'hometownid'},
      },
    };

    var {cacheManager, callbacks, changeTracker, store} =
      readDiskCache(queries, diskData);

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
    var queries = {
      q0: getNode(Relay.QL`
        query {node(id:"1055790163") {id, screennames {service}}}
      `),
    };

    // Missing `sn2`
    var diskData = {
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

    var {cacheManager, callbacks, changeTracker, store} =
      readDiskCache(queries, diskData);

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
    var queries = {
      q0: getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            friends(first:"5") {
              edges {
                node {
                  name,
                },
                cursor
              }
            }
          }
        }
      `),
    };

    // Missing `__range__`
    var diskData = {
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

    var {cacheManager, callbacks, changeTracker, store} =
      readDiskCache(queries, diskData);

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
    var queries = {
      q0: getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            friends(first:"5") {
              edges {
                node {
                  name,
                },
                cursor
              }
            }
          }
        }
      `),
    };

    var diskData = {
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

    diskData.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [RelayTestUtils.createCall('first', 5)],
      pageInfo: {},
    });
    var {cacheManager, callbacks, changeTracker, store} =
      readDiskCache(queries, diskData);

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
    var queries = {
      q0: getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            friends(first:"5") {
              edges {
                node {
                  name,
                },
                cursor
              }
            }
          }
        }
      `),
    };

    // Missing `edge_id`
    var diskData = {
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

    diskData.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {},
    });
    var {cacheManager, callbacks, changeTracker, store} =
      readDiskCache(queries, diskData);

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
    var queries = {
      q0: getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            friends(first:"5") {
              edges {
                node {
                  name,
                },
                cursor
              }
            }
          }
        }
      `),
    };

    var diskData = {
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

    var rangeInfo = {
      requestedEdgeIDs: ['client:edge_id'],
      diffCalls: [],
      pageInfo: {},
    };
    diskData['client:friends_id'].__range__.retrieveRangeInfoForQuery
      .mockReturnValue(rangeInfo);
    var {cacheManager, callbacks, changeTracker, store} =
      readDiskCache(queries, diskData);

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
    var query = queries.q0;
    var friendsField = query.getFieldByStorageKey('friends');
    var friendsPath = new RelayQueryPath(query)
        .getPath(query.getFieldByStorageKey('friends'), 'client:friends_id');
    expect(store.getPathToRecord(`client:friends_id`)).toMatchPath(friendsPath);
    expect(
      store.getRangeMetadata('client:friends_id', [{name:'first', value: '5'}])
    ).toEqual({
      ...rangeInfo,
      filterCalls: [],
      filteredEdges: [{
        edgeID: 'client:edge_id',
        nodeID: 'friend_id',
      }],
    });
    expect(store.getRecordState('client:edge_id')).toBe('EXISTENT');
    var edgePath = friendsPath
      .getPath(friendsField.getFieldByStorageKey('edges'), 'client:edge_id');
    expect(store.getPathToRecord(`client:edge_id`)).toMatchPath(edgePath);
    expect(store.getField('client:edge_id', 'cursor')).toBe('1234');
    expect(store.getLinkedRecordID('client:edge_id', 'node')).toBe('friend_id');
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

  it('marks records as updated when more fields are loaded from cache', () => {
    var queries = {
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
    var nodeData = {
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
      },
    };
    var diskData = {
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
    var {callbacks, changeTracker, store} =
      readDiskCache(queries, diskData, nodeData);

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
    var queries = {
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
    var nodeData = {
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
      },
    };
    var diskData = {
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
        screennames: [{__dataID__: 'sn1'}, {__dataID__: 'sn2'}],
      },
      'sn1': null,
      'sn2': undefined,
    };
    var {callbacks, changeTracker, store} =
      readDiskCache(queries, diskData, nodeData);

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
    var queries = {
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
    var nodeData = {
      '1055790163': {
        __dataID__: '1055790163',
        id: '1055790163',
        __typename: 'User',
      },
      // linked from the above in diskCache only
      'sn1': null,
    };
    var diskData = {
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
    var {callbacks, changeTracker, store} =
      readDiskCache(queries, diskData, nodeData);

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
});
