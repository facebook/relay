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

var GraphQLRange = require('GraphQLRange');
var Relay = require('Relay');
var RelayQueryPath = require('RelayQueryPath');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayRecordStore = require('RelayRecordStore');
var findRelayQueryLeaves = require('findRelayQueryLeaves');

describe('findRelayQueryLeaves', () => {
  var {getNode} = RelayTestUtils;
  var HAS_NEXT_PAGE, HAS_PREV_PAGE;

  var dummyPath;

  function findLeaves(
    queryNode,
    dataID,
    path,
    records,
    cachedRecords,
    calls,
  ) {
    var store = new RelayRecordStore({
      records: records || {},
      cachedRecords: cachedRecords || {}
    });
    return findRelayQueryLeaves(
      store,
      cachedRecords,
      queryNode,
      dataID,
      path,
      calls
    );
  }

  function encode(obj) {
    // Eliminates unnessary unique query ids in RelayQueryPath
    return JSON.parse(JSON.stringify(obj));
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE} = RelayConnectionInterface);

    dummyPath = new RelayQueryPath(getNode(Relay.QL`
      query {
        node(id:"dummy") {
          id
        }
      }
    `));

    jest.addMatchers({
      toMatchPendingNodes(pendingNodes) {
        expect(encode(this.actual)).toEqual(encode(pendingNodes));
        return true;
      },
    });
  });

  it('returns pendingNodes when node is not in the store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id
      }
    `);
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
    );

    var pendingItems = queryNode.getChildren().map(node => {
      return {
        node,
        path: dummyPath,
        rangeCalls: undefined,
      };
    });

    expect(result.pendingNodes).toMatchPendingNodes(
      {'1055790163': pendingItems}
    );
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when node is not in the cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id
      }
    `);
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      {'1055790163': undefined}
    );
    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('has all required data when node is in store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id
      }
    `);
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {'1055790163': null},
      {}
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('has all required data when node is in cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id
      }
    `);
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      {'1055790163': null}
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('returns pendingNodes when field is not in the store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        firstName
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      }
    };
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );

    expect(result.pendingNodes).toMatchPendingNodes(
      {'1055790163': [{
        node: queryNode.getFieldByStorageKey('firstName'),
        path: dummyPath,
        rangeCalls: undefined
      }]}
    );
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when field is not in the cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        firstName
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      }
    };
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('has all required data when field is in store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        firstName
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        firstName: 'Yuzhi',
        __dataID__: '1055790163',
        __typename: 'User',
      }
    };
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('has all required data when field is in cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        firstName
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        firstName: 'Yuzhi',
        __dataID__: '1055790163',
        __typename: 'User',
      }
    };
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('returns pendingNodes when linked node is not in the store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends {count}
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        friends: { __dataID__: 'friends_id'},
        __dataID__: '1055790163',
        __typename: 'User',
      }
    };
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );
    var friendsField =  queryNode.getFieldByStorageKey('friends');
    var countField = friendsField.getFieldByStorageKey('count');
    console.log(result.pendingNodes.friends_id[0].rangeCalls);
    expect(result.pendingNodes).toMatchPendingNodes({'friends_id': [{
      node: countField,
      path: dummyPath.getPath(friendsField, 'friends_id'),
      rangeCalls: [],
    }]});
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when linked node is not in the cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends {count}
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        friends: { __dataID__: 'friends_id'},
        __dataID__: '1055790163',
        __typename: 'User',
      },
      'friends_id': undefined,
    };
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records,
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('has all required data when linked node is in store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends {count}
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        count: 500,
      },
    };
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('has all required data when linked node is in cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends {count}
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        count: 500,
      },
    };
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('returns pendingNodes when plural node is not in the store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        screennames {service}
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [
          {__dataID__: 'client:screenname1'},
          {__dataID__: 'client:screenname2'}
        ],
      },
    };

    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );

    var screennamesField = queryNode.getFieldByStorageKey('screennames');
    var serviceField = screennamesField.getFieldByStorageKey('service');
    var pendingItems = [{
      node: serviceField,
      path: dummyPath.getPath(screennamesField, 'client:screenname'),
      rangeCalls: undefined
    }];
    expect(result.pendingNodes).toMatchPendingNodes({
      'client:screenname1': pendingItems,
      'client:screenname2': pendingItems,
    });
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when plural node is not in the cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        screennames {service}
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [
          {__dataID__: 'client:screenname1'},
          {__dataID__: 'client:screenname2'}
        ],
      },
      'client:screenname1': undefined
    };

    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('has all required data when plural node is in store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        screennames {service}
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [
          {__dataID__: 'client:screenname1'},
          {__dataID__: 'client:screenname2'}
        ],
      },
      'client:screenname1': {
        __dataID__: 'client:screenname1',
        service: true
      },
      'client:screenname2': {
        __dataID__: 'client:screenname2',
        service: true
      }
    };

    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );
    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('has all required data when plural node is in cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        screennames {service}
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [
          {__dataID__: 'client:screenname1'},
          {__dataID__: 'client:screenname2'}
        ],
      },
      'client:screenname1': {
        __dataID__: 'client:screenname1',
        service: true
      },
      'client:screenname2': {
        __dataID__: 'client:screenname2',
        service: true
      }
    };

    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });


  it('returns pendingNodes when range node is not in the store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends(first:"10") {
          edges { node {id}}
        }
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
    };

    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );

    var rangeField = queryNode.getFieldByStorageKey('friends');
    var calls = rangeField.getCallsWithValues();


    var pendingItems = rangeField.getChildren().map(node => {
      return {
        node,
        path: dummyPath.getPath(rangeField, 'friends_id'),
        rangeCalls: calls,
      };
    });

    expect(result.pendingNodes)
      .toMatchPendingNodes({'friends_id': pendingItems});
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when range node is not in the cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends(first:"10") {
          edges { node {id}}
        }
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      'friends_id': undefined
    };

    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('returns pendingNodes when range field is not in the store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends(first:"10") {
          edges { node {id}}
        }
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
      }
    };

    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );

    var friendField = queryNode.getFieldByStorageKey('friends');
    var calls = friendField.getCallsWithValues();
    var pendingItems = friendField.getChildren().map(node => {
      return {
        node,
        path: dummyPath.getPath(friendField, 'friends_id'),
        rangeCalls: calls,
      };
    });
    expect(result.pendingNodes).toMatchPendingNodes({
      'friends_id': pendingItems
    });
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when range field is not in the cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends(first:"10") {
          edges { node {id}}
        }
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
      }
    };

    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('returns missingData when range has diffQuery in the store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends(first:"10") {
          edges { node {id}}
        }
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange()
      }
    };
    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [RelayTestUtils.createCall('first', 10)],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('returns missingData when range has diffQuery in the cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on Node {
        id,
        friends(first:"10") {
          edges { node {id}}
        }
      }
    `);
    var records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange()
      }
    };
    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [RelayTestUtils.createCall('first', 10)],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('returns pendingNodes when edge node is not in the store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on FriendsConnection {
        edges { node {id}}
      }
    `);

    var records = {
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange()
      },
    };

    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    var rangeCalls = [RelayTestUtils.createCall('first', 10)];
    var result = findLeaves(
      queryNode,
      'friends_id',
      dummyPath,
      records,
      {},
      rangeCalls
    );

    var mockRetrieveRange =
      records.friends_id.__range__.retrieveRangeInfoForQuery.mock;
    expect(mockRetrieveRange.calls.length).toBe(1);
    expect(mockRetrieveRange.calls[0][0]).toBe(rangeCalls);

    var edgeFields = queryNode
      .getFieldByStorageKey('edges')
      .getChildren();
    var pendingItems = edgeFields.map(node => {
      return {
        node,
        path: dummyPath.getPath(edgeFields, 'edge_id'),
        rangeCalls: undefined,
      };
    });
    expect(result.pendingNodes).toMatchPendingNodes({'edge_id': pendingItems});
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when edge node is not in the cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on FriendsConnection {
        edges { node {id}}
      }
    `);

    var records = {
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange()
      },
      edge_id: undefined,
    };

    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    var rangeCalls = [RelayTestUtils.createCall('first', 10)];
    var result = findLeaves(
      queryNode,
      'friends_id',
      dummyPath,
      {},
      records,
      rangeCalls
    );

    var mockRetrieveRange =
      records.friends_id.__range__.retrieveRangeInfoForQuery.mock;
    expect(mockRetrieveRange.calls.length).toBe(1);
    expect(mockRetrieveRange.calls[0][0]).toBe(rangeCalls);
    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });

  it('has all required data when the range and edges are is in store', () => {
    var queryNode = getNode(Relay.QL`
      fragment on FriendsConnection {
        edges { node {id}}
      }
    `);

    var records = {
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange()
      },
      edge_id: {
        __dataID__: 'edge_id',
        node: {__dataID__: 'node_id'},
        cursor: 'cursor'
      },
      node_id: {
        __dataID__: 'node_id',
        id: 'node_id,'
      }
    };

    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    var rangeCalls = [RelayTestUtils.createCall('first', 10)];
    var result = findLeaves(
      queryNode,
      'friends_id',
      dummyPath,
      records,
      {},
      rangeCalls
    );

    var mockRetrieveRange =
      records.friends_id.__range__.retrieveRangeInfoForQuery.mock;
    expect(mockRetrieveRange.calls.length).toBe(1);
    expect(mockRetrieveRange.calls[0][0]).toBe(rangeCalls);
    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('has all required data when the range and edges are is in cache', () => {
    var queryNode = getNode(Relay.QL`
      fragment on FriendsConnection {
        edges { node {id}}
      }
    `);

    var records = {
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange()
      },
      edge_id: {
        __dataID__: 'edge_id',
        node: {__dataID__: 'node_id'},
        cursor: 'cursor'
      },
      node_id: {
        __dataID__: 'node_id',
        id: 'node_id,'
      }
    };

    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    var rangeCalls = [RelayTestUtils.createCall('first', 10)];
    var result = findLeaves(
      queryNode,
      'friends_id',
      dummyPath,
      {},
      records,
      rangeCalls
    );

    var mockRetrieveRange =
      records.friends_id.__range__.retrieveRangeInfoForQuery.mock;
    expect(mockRetrieveRange.calls.length).toBe(1);
    expect(mockRetrieveRange.calls[0][0]).toBe(rangeCalls);
    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(false);
  });

  it('returns pendingNodes when root node is not in the store', () => {
    var queryNode = getNode(Relay.QL`
      query {
        node(id:"1055790163") {
          id
        }
      }
    `);
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
    );

    var pendingItems = queryNode.getChildren().map(node => {
      return {
        node,
        path: dummyPath,
        rangeCalls: undefined,
      };
    });

    expect(result.pendingNodes).toMatchPendingNodes(
      {'1055790163': pendingItems}
    );
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when root node is not in the cache', () => {
    var queryNode = getNode(Relay.QL`
      query {
        node(id:"1055790163") {
          id
        }
      }
    `);
    var result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      {'1055790163': undefined}
    );

    expect(result.pendingNodes).toMatchPendingNodes({});
    expect(result.missingData).toBe(true);
  });
});
