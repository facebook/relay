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
      callbacks
    );

    return {cacheManager, callbacks};
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    jest.clearAllTimers();

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

    var {cacheManager, callbacks} = readDiskCache(queries, diskData);

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

    var {cacheManager, callbacks} = readDiskCache(
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

    var {cacheManager, callbacks} = readDiskCache(
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

    var {cacheManager, callbacks} = readDiskCache(queries, diskData);

    expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
    expect(cacheManager.readNode.mock.calls.length).toBe(1);
    expect(cacheManager.readNode.mock.calls[0][0]).toBe('1055790163');

    jest.runAllTimers();
    expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
    expect(cacheManager.readNode.mock.calls.length).toBe(1);
    expect(callbacks.onFailure.mock.calls.length).toBe(1);
    expect(callbacks.onSuccess.mock.calls.length).toBe(0);
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

    var {cacheManager, callbacks} = readDiskCache(queries, diskData);

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

    var {cacheManager, callbacks} = readDiskCache(queries, diskData);

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

    var {cacheManager, callbacks} = readDiskCache(queries, diskData);

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
    var {cacheManager, callbacks} = readDiskCache(queries, diskData);

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
    var {cacheManager, callbacks} = readDiskCache(queries, diskData);

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
      'edge_id': {
        __dataID__: 'edge_id',
        cursor: '1234',
        node: {__dataID__: 'friend_id'},
      },
      'friend_id': {
        __dataID__: 'friend_id',
        id: 'friend_id',
        name: 'name',
      },
    };

    diskData.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {},
    });
    var {cacheManager, callbacks} = readDiskCache(queries, diskData);

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

    jest.runOnlyPendingTimers();
    expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
    expect(cacheManager.readNode.mock.calls.length).toBe(4);
    expect(cacheManager.readNode.mock.calls[3][0]).toBe('friend_id');

    jest.runAllTimers();
    expect(cacheManager.readRootCall.mock.calls.length).toBe(0);
    expect(cacheManager.readNode.mock.calls.length).toBe(4);
    expect(callbacks.onFailure.mock.calls.length).toBe(0);
    expect(callbacks.onSuccess.mock.calls.length).toBe(1);
  });
});
