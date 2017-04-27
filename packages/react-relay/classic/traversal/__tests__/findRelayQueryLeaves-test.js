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

const GraphQLRange = require('GraphQLRange');
const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayQuery = require('RelayQuery');
const RelayQueryPath = require('RelayQueryPath');
const RelayRecordStore = require('RelayRecordStore');
const RelayTestUtils = require('RelayTestUtils');

const findRelayQueryLeaves = require('findRelayQueryLeaves');
const mapObject = require('mapObject');

describe('findRelayQueryLeaves', () => {
  const {getNode} = RelayTestUtils;
  let HAS_NEXT_PAGE, HAS_PREV_PAGE;

  let dummyPath;

  function findLeaves(
    queryNode,
    dataID,
    path,
    records,
    cachedRecords,
    calls,
  ) {
    const store = new RelayRecordStore({
      records: records || {},
      cachedRecords: cachedRecords || {},
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

  function encode(node) {
    // Eliminates unnessary unique query ids in RelayQueryPath
    function stripDoubleUnderscoreID(obj) {
      return mapObject(obj, (value, key) => {
        if (typeof value === 'object' && value !== null) {
          return stripDoubleUnderscoreID(value);
        } else if (key === '__id__') {
          // ignore query ids
          return null;
        } else {
          return value;
        }
      });
    }
    return JSON.parse(JSON.stringify(node)).map(stripDoubleUnderscoreID);
  }

  beforeEach(() => {
    jest.resetModules();

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE} = RelayConnectionInterface);

    dummyPath = RelayQueryPath.create(getNode(Relay.QL`
      query {
        node(id:"dummy") {
          id
        }
      }
    `));

    jasmine.addMatchers({
      toMatchPendingNodeStates() {
        return {
          compare(actual, pendingNodeStates) {
            expect(encode(actual)).toEqual(encode(pendingNodeStates));
            return {
              pass: true,
            };
          },
        };
      },
    });
  });

  it('returns pendingNodeStates when node is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
      }
    `);
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
    );

    const pendingState = {
      dataID: '1055790163',
      node: queryNode,
      path: dummyPath,
      rangeCalls: undefined,
    };

    expect(result.pendingNodeStates).toMatchPendingNodeStates([pendingState]);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when node is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
      }
    `);
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      {'1055790163': undefined}
    );
    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('has all required data when node is in store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
      }
    `);
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {'1055790163': null},
      {}
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('has all required data when node is in cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
      }
    `);
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      {'1055790163': null}
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('returns pendingNodeStates when field is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        firstName
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([{
      dataID: '1055790163',
      node: queryNode.getFieldByStorageKey('firstName'),
      path: dummyPath,
      rangeCalls: undefined,
    }]);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when field is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        firstName
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('has all required data when field is in store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        firstName
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        firstName: 'Yuzhi',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('has all required data when field is in cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        firstName
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        firstName: 'Yuzhi',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('returns pendingNodeStates when linked node is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends {count}
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        friends: { __dataID__: 'friends_id'},
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );
    const friendsField =  queryNode.getFieldByStorageKey('friends');
    const countField = friendsField.getFieldByStorageKey('count');
    expect(result.pendingNodeStates).toMatchPendingNodeStates([{
      dataID: 'friends_id',
      node: countField,
      path: RelayQueryPath.getPath(dummyPath, friendsField, 'friends_id'),
      rangeCalls: [],
    }]);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when linked node is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends {count}
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        friends: { __dataID__: 'friends_id'},
        __dataID__: '1055790163',
        __typename: 'User',
      },
      'friends_id': undefined,
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records,
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('has all required data when linked node is in store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends {count}
      }
    `);
    const records = {
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
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('has all required data when linked node is in cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends {count}
      }
    `);
    const records = {
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
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('returns pendingNodeStates when plural node is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        screennames {service}
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [
          {__dataID__: 'client:screenname1'},
          {__dataID__: 'client:screenname2'},
        ],
      },
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );

    const screennamesField = queryNode.getFieldByStorageKey('screennames');
    const serviceField = screennamesField.getFieldByStorageKey('service');
    const path = RelayQueryPath.getPath(
      dummyPath,
      screennamesField,
      'client:screenname'
    );
    const partialPendingState = {
      node: serviceField,
      path,
      rangeCalls: undefined,
    };
    expect(result.pendingNodeStates).toMatchPendingNodeStates([
      {dataID: 'client:screenname1', ...partialPendingState},
      {dataID: 'client:screenname2', ...partialPendingState},
    ]);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when plural node is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        screennames {service}
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [
          {__dataID__: 'client:screenname1'},
          {__dataID__: 'client:screenname2'},
        ],
      },
      'client:screenname1': undefined,
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('has all required data when plural node is in store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        screennames {service}
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [
          {__dataID__: 'client:screenname1'},
          {__dataID__: 'client:screenname2'},
        ],
      },
      'client:screenname1': {
        __dataID__: 'client:screenname1',
        service: true,
      },
      'client:screenname2': {
        __dataID__: 'client:screenname2',
        service: true,
      },
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );
    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('has all required data when plural node is in cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        screennames {service}
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [
          {__dataID__: 'client:screenname1'},
          {__dataID__: 'client:screenname2'},
        ],
      },
      'client:screenname1': {
        __dataID__: 'client:screenname1',
        service: true,
      },
      'client:screenname2': {
        __dataID__: 'client:screenname2',
        service: true,
      },
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });


  it('returns pendingNodeStates when range node is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends(first: 10) {
          edges { node {id}}
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );

    const rangeField = queryNode.getFieldByStorageKey('friends');
    const calls = rangeField.getCallsWithValues();


    const pendingStates = rangeField.getChildren().map(node => ({
      dataID: 'friends_id',
      node,
      path: RelayQueryPath.getPath(dummyPath, rangeField, 'friends_id'),
      rangeCalls: calls,
    }));

    expect(result.pendingNodeStates).toMatchPendingNodeStates(pendingStates);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when range node is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends(first: 10) {
          edges { node {id}}
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      'friends_id': undefined,
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('returns pendingNodeStates when range field is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends(first: 10) {
          edges { node {id}}
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
      },
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );

    const friendField = queryNode.getFieldByStorageKey('friends');
    const calls = friendField.getCallsWithValues();
    const pendingStates = friendField.getChildren().map(node => ({
      dataID: 'friends_id',
      node,
      path: RelayQueryPath.getPath(dummyPath, friendField, 'friends_id'),
      rangeCalls: calls,
    }));
    expect(result.pendingNodeStates).toMatchPendingNodeStates(pendingStates);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when range field is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends(first: 10) {
          edges { node {id}}
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
      },
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('returns missingData when range has diffQuery in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends(first: 10) {
          edges { node {id}}
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
    };
    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [RelayTestUtils.createCall('first', 10)],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('returns missingData when range has diffQuery in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        friends(first: 10) {
          edges { node {id}}
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
    };
    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [RelayTestUtils.createCall('first', 10)],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('returns pendingNodeStates when edge node is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on FriendsConnection {
        edges { node {id}}
      }
    `);

    const records = {
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
    };

    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    const rangeCalls = [RelayTestUtils.createCall('first', 10)];
    const result = findLeaves(
      queryNode,
      'friends_id',
      dummyPath,
      records,
      {},
      rangeCalls
    );

    const mockRetrieveRange =
      records.friends_id.__range__.retrieveRangeInfoForQuery.mock;
    expect(mockRetrieveRange.calls.length).toBe(1);
    expect(mockRetrieveRange.calls[0][0]).toBe(rangeCalls);

    const edgeFields = queryNode
      .getFieldByStorageKey('edges')
      .getChildren();
    const pendingStates = edgeFields.map(node => ({
      dataID: 'edge_id',
      node,
      path: RelayQueryPath.getPath(dummyPath, edgeFields, 'edge_id'),
      rangeCalls: undefined,
    }));
    expect(result.pendingNodeStates).toMatchPendingNodeStates(pendingStates);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when edge node is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on FriendsConnection {
        edges { node {id}}
      }
    `);

    const records = {
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
      edge_id: undefined,
    };

    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    const rangeCalls = [RelayTestUtils.createCall('first', 10)];
    const result = findLeaves(
      queryNode,
      'friends_id',
      dummyPath,
      {},
      records,
      rangeCalls
    );

    const mockRetrieveRange =
      records.friends_id.__range__.retrieveRangeInfoForQuery.mock;
    expect(mockRetrieveRange.calls.length).toBe(1);
    expect(mockRetrieveRange.calls[0][0]).toBe(rangeCalls);
    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('has all required data when the range and edges are is in store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on FriendsConnection {
        edges { node {id}}
      }
    `);

    const records = {
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
      edge_id: {
        __dataID__: 'edge_id',
        node: {__dataID__: 'node_id'},
        cursor: 'cursor',
      },
      node_id: {
        __dataID__: 'node_id',
        id: 'node_id,',
      },
    };

    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    const rangeCalls = [RelayTestUtils.createCall('first', 10)];
    const result = findLeaves(
      queryNode,
      'friends_id',
      dummyPath,
      records,
      {},
      rangeCalls
    );

    const mockRetrieveRange =
      records.friends_id.__range__.retrieveRangeInfoForQuery.mock;
    expect(mockRetrieveRange.calls.length).toBe(1);
    expect(mockRetrieveRange.calls[0][0]).toBe(rangeCalls);
    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('has all required data when the range and edges are is in cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on FriendsConnection {
        edges { node {id}}
      }
    `);

    const records = {
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
      edge_id: {
        __dataID__: 'edge_id',
        node: {__dataID__: 'node_id'},
        cursor: 'cursor',
      },
      node_id: {
        __dataID__: 'node_id',
        id: 'node_id,',
      },
    };

    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    const rangeCalls = [RelayTestUtils.createCall('first', 10)];
    const result = findLeaves(
      queryNode,
      'friends_id',
      dummyPath,
      {},
      records,
      rangeCalls
    );

    const mockRetrieveRange =
      records.friends_id.__range__.retrieveRangeInfoForQuery.mock;
    expect(mockRetrieveRange.calls.length).toBe(1);
    expect(mockRetrieveRange.calls[0][0]).toBe(rangeCalls);
    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('returns pendingNodeStates when root node is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      query {
        node(id:"1055790163") {
          id
        }
      }
    `);
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
    );

    const pendingStates = queryNode.getChildren().map(node => ({
      dataID: '1055790163',
      node,
      path: dummyPath,
      rangeCalls: undefined,
    }));

    expect(result.pendingNodeStates).toMatchPendingNodeStates(pendingStates);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when root node is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      query {
        node(id:"1055790163") {
          id
        }
      }
    `);
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      {'1055790163': undefined}
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('returns pendingNodeStates when matched fragment is not in the store', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        ... on User {
          firstName
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );
    const userFragment = queryNode.getChildren().filter(
      item => item instanceof RelayQuery.Fragment
    )[0];
    expect(result.pendingNodeStates).toMatchPendingNodeStates([{
      dataID: '1055790163',
      node: userFragment.getFieldByStorageKey('firstName'),
      path: dummyPath,
      rangeCalls: undefined,
    }]);
    expect(result.missingData).toBe(false);
  });

  it('returns missingData when matched fragment is not in the cache', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        ... on User {
          firstName
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records,
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(true);
  });

  it('has all required data in store when ignoring unmatched fragment', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        ... on Page {
          name
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      records,
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });

  it('has all required data in cache when ignoring unmatched fragment', () => {
    const queryNode = getNode(Relay.QL`
      fragment on Node {
        id
        ... on Page {
          name
        }
      }
    `);
    const records = {
      '1055790163': {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };
    const result = findLeaves(
      queryNode,
      '1055790163',
      dummyPath,
      {},
      records
    );

    expect(result.pendingNodeStates).toMatchPendingNodeStates([]);
    expect(result.missingData).toBe(false);
  });
});
