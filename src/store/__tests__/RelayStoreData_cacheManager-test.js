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
  .unmock('GraphQLRange')
  .unmock('getRangeBehavior')
  .unmock('GraphQLSegment');

const GraphQLMutatorConstants = require('GraphQLMutatorConstants');
const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayMockCacheManager = require('RelayMockCacheManager');
const RelayMutationType = require('RelayMutationType');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const transformRelayQueryPayload = require('transformRelayQueryPayload');

describe('RelayStoreData', function() {
  let cacheManager;
  let storeData;

  const {getNode} = RelayTestUtils;
  let CLIENT_MUTATION_ID, HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO;

  function getPathToRecord(dataID) {
    return storeData.getRecordStore().getPathToRecord(dataID);
  }

  function getRangeForRecord(dataID) {
    const nodeData = storeData.getNodeData();
    expect(Object.keys(nodeData)).toContain(dataID);
    return nodeData[dataID].__range__;
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    ({
      CLIENT_MUTATION_ID,
      HAS_NEXT_PAGE,
      HAS_PREV_PAGE,
      PAGE_INFO,
    } = RelayConnectionInterface);

    cacheManager = RelayMockCacheManager.genCacheManager();
    storeData = new RelayStoreData();
    storeData.injectCacheManager(cacheManager);

    jasmine.addMatchers({
      toContainCalledMethods: () => ({
        compare: (actual, calls) => {
          let message;
          const pass = Object.keys(calls).every(methodName => {
            const expected = calls[methodName];
            const value = actual[methodName].mock.calls.length;
            const eachPass = expected === value;

            const expTimes = expected + ' time' + (expected === 1 ? '' : 's');
            const actTimes = value + ' time' + (value === 1 ? '' : 's');
            const not = eachPass ? 'not ' : '';
            message = 'Expected `' + methodName + '` ' + not + 'to be called ' +
              expTimes + ', was called ' + actTimes + '.';
            return eachPass;
          });
          return {pass, message};
        },
      }),
      toBeCalledWithNodeFields: (util, customEqualityTesters) => ({
        compare: (actual, nodeFields) => {
          let message;
          const pass = Object.keys(nodeFields).every(
            expectedID => Object.keys(nodeFields[expectedID]).every(
              expectedFieldName => {
                message =
                  'Expected function to be called with (' +
                  expectedID + ', ' +
                  expectedFieldName + ', ' +
                  nodeFields[expectedID][expectedFieldName] + ').';
                return actual.mock.calls.some(
                  ([actualID, actualFieldName, actualFieldValue]) => (
                    actualID === expectedID &&
                    actualFieldName === expectedFieldName &&
                    util.equals(
                      actualFieldValue,
                      nodeFields[expectedID][actualFieldName],
                      customEqualityTesters
                    )
                  )
                );
              }
            )
          );
          return {pass, message};
        },
      }),
    });
  });

  it('caches node metadata', () => {
    const query = getNode(Relay.QL`query{node(id:"123"){id}}`);
    const response = {
      node: {
        __typename: 'User',
        id: '123',
      },
    };
    storeData.handleQueryPayload(query, response);
    const {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 3,
      writeRootCall: 0,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        __typename: 'User',
        id: '123',
      },
    });
  });

  it('caches custom root calls', () => {
    const query = getNode(Relay.QL`query{username(name:"yuzhi"){id}}`);
    const response = {
      username: {
        __typename: 'User',
        id: '123',
      },
    };
    storeData.handleQueryPayload(query, response);
    const {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 3,
      writeRootCall: 1,
    });
    expect(queryWriter.writeRootCall).toBeCalledWith(
      'username',
      'yuzhi',
      '123'
    );
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        __typename: 'User',
        id: '123',
      },
    });
  });

  it('caches nodes with client IDs', () => {
    const query = getNode(Relay.QL`query{viewer{isFbEmployee}}`);
    const response = {
      viewer: {
        __typename: 'User',
        isFbEmployee: true,
      },
    };
    storeData.handleQueryPayload(query, response);
    const {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 2,
      writeRootCall: 1,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      'client:1': {
        __dataID__: 'client:1',
        // __typename: 'User',
        isFbEmployee: true,
      },
    });
  });

  it('caches linked records', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          hometown {
            id,
            url,
          },
        }
      }
    `);
    const response = {
      node: {
        __typename: 'User',
        id: '123',
        hometown: {
          __typename: 'Page',
          id: '456',
          url: 'http://...',
        },
      },
    };
    storeData.handleQueryPayload(query, response);
    const {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 7,
      writeRootCall: 0,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        __typename: 'User',
        id: '123',
        hometown: {__dataID__: '456'},
      },
      '456': {
        __dataID__: '456',
        // __typename: 'Page',
        id: '456',
        url: 'http://...',
      },
    });
  });

  it('caches plural fields', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          screennames {
            service,
          },
        }
      }
    `);
    const response = {
      node: {
        __typename: 'User',
        id: '123',
        screennames: [
          {service: 'GTALK'},
          {service: 'TWITTER'},
        ],
      },
    };
    storeData.handleQueryPayload(query, response);
    const {queryWriter} = cacheManager.mocks;

    expect(getPathToRecord('client:1')).toEqual(getPathToRecord('client:2'));
    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 8,
      writeRootCall: 0,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        __typename: 'User',
        id: '123',
        screennames: [
          {__dataID__: 'client:1'},
          {__dataID__: 'client:2'},
        ],
      },
      'client:1': {
        __dataID__: 'client:1',
        // __typename: 'Screenname',
        service: 'GTALK',
      },
      'client:2': {
        __dataID__: 'client:2',
        // __typename: 'Screenname',
        service: 'TWITTER',
      },
    });
  });

  it('caches connection fields', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          friends(first:"2") {
            edges {
              node {
                id
              },
              cursor,
            },
            pageInfo {
              hasPreviousPage,
              hasNextPage,
            },
          },
        }
      }
    `);
    const response = transformRelayQueryPayload(query, {
      node: {
        __typename: 'User',
        id: '123',
        friends: {
          edges: [
            {
              node: {
                __typename: 'User',
                id: '1',
              },
              cursor: '1',
            },
            {
              node: {
                __typename: 'User',
                id: '2',
              },
              cursor: '2',
            },
          ],
          [PAGE_INFO]: {
            [HAS_PREV_PAGE]: false,
            [HAS_NEXT_PAGE]: true,
          },
        },
      },
    });
    storeData.handleQueryPayload(query, response);
    const {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 19,
      writeRootCall: 0,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        __typename: 'User',
        id: '123',
        friends: {__dataID__: 'client:1'},
      },
      'client:1': {
        __dataID__: 'client:1',
        __filterCalls__: [],
        __forceIndex__: 0,
        __range__: getRangeForRecord('client:1'),
        // __typename: 'FriendsConnection',
      },
      'client:client:1:1': {
        __dataID__: 'client:client:1:1',
        // __typename: 'FriendsEdge',
        node: {__dataID__: '1'},
        cursor: '1',
      },
      '1': {
        __dataID__: '1',
        // __typename: 'User',
        id: '1',
      },
      'client:client:1:2': {
        __dataID__: 'client:client:1:2',
        // __typename: 'FriendsEdge',
        node: {__dataID__: '2'},
        cursor: '2',
      },
      '2': {
        __dataID__: '2',
        // __typename: 'User',
        id: '2',
      },
    });
  });

  it('caches connection fields with no edges', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          friends(first:"2") {
            edges {
              node {
                id
              },
              cursor,
            },
            pageInfo {
              hasPreviousPage,
              hasNextPage,
            },
          },
        }
      }
    `);
    const response = transformRelayQueryPayload(query, {
      node: {
        __typename: 'User',
        id: '123',
        friends: {
          edges: [],
          [PAGE_INFO]: {
            [HAS_PREV_PAGE]: false,
            [HAS_NEXT_PAGE]: true,
          },
        },
      },
    });
    storeData.handleQueryPayload(query, response);
    const {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 9,
      writeRootCall: 0,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        id: '123',
        friends: {__dataID__: 'client:1'},
      },
      'client:1': {
        __dataID__: 'client:1',
        __filterCalls__: [],
        __forceIndex__: 0,
        __range__: getRangeForRecord('client:1'),
        // __typename: 'FriendsConnection',
      },
    });
  });

  it('caches simple mutations', () => {
    const query = getNode(Relay.QL`query{node(id:"123"){id,doesViewerLike}}`);
    const response = {
      node: {
        __typename: 'User',
        id: '123',
        doesViewerLike: false,
      },
    };
    storeData.handleQueryPayload(query, response);
    const {mutationWriter} = cacheManager.mocks;

    const mutationQuery = getNode(Relay.QL`
      mutation {
        feedbackLike(input:$input) {
          clientMutationId,
          feedback {
            id,
            doesViewerLike,
          },
        }
      }
    `);
    const payload = {
      [CLIENT_MUTATION_ID]: 'abc',
      feedback: {
        id: '123',
        doesViewerLike: true,
      },
    };
    storeData.handleUpdatePayload(
      mutationQuery,
      payload,
      {configs: [], isOptimisticUpdate: false}
    );

    expect(mutationWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 2, // both scalar fields are updated
      writeRootCall: 0,
    });
    expect(mutationWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        doesViewerLike: true,
      },
    });
  });

  it('caches mutation that inserts an edge', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          comments(first:"1") {
            count,
            edges {
              node {
                id,
              },
              cursor,
            },
            pageInfo {
              hasPreviousPage,
              hasNextPage,
            },
          }
        }
      }
    `);
    const response = transformRelayQueryPayload(query, {
      node: {
        __typename: 'Story',
        id: '123',
        comments: {
          count: 2,
          edges: [
            {
              node: {
                id: '1',
              },
              cursor: '1',
            },
          ],
          [PAGE_INFO]: {
            [HAS_PREV_PAGE]: false,
            [HAS_NEXT_PAGE]: true,
          },
        },
      },
    });
    storeData.handleQueryPayload(query, response);
    const {mutationWriter} = cacheManager.mocks;

    const configs = [{
      type: RelayMutationType.RANGE_ADD,
      connectionName: 'comments',
      edgeName: 'feedbackCommentEdge',
      rangeBehaviors: {'': GraphQLMutatorConstants.PREPEND},
    }];

    const mutationQuery = getNode(Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId,
          feedback {
            id,
            comments {
              count,
            },
          },
          feedbackCommentEdge {
            node {
              id,
            },
            cursor,
            source {
              id,
            },
          },
        }
      }
    `);
    const payload = {
      [CLIENT_MUTATION_ID]: 'abc',
      feedback: {
        comments: {
          count: 3,
        },
        id: '123',
      },
      feedbackCommentEdge: {
        __typename: 'User',
        node: {
          id: '2',
        },
        cursor: '2',
        source: {
          id: '123',
        },
      },
    };
    storeData.handleUpdatePayload(
      mutationQuery,
      payload,
      {configs, isOptimisticUpdate: false}
    );

    expect(mutationWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 11,
      writeRootCall: 0,
    });
    expect(mutationWriter.writeField).toBeCalledWithNodeFields({
      'client:1': {
        __range__: getRangeForRecord('client:1'),
        count: 3,
      },
      'client:client:1:2': {
        __dataID__: 'client:client:1:2',
        node: {__dataID__: '2'},
        cursor: '2',
        source: {__dataID__: '123'},
      },
      '2': {
        __dataID__: '2',
        id: '2',
      },
    });
  });

  it('caches mutation that deletes an edge', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          comments(first:"1") {
            count,
            edges {
              node {
                id,
              },
              cursor,
            },
            pageInfo {
              hasPreviousPage,
              hasNextPage,
            },
          }
        }
      }
    `);
    const response = transformRelayQueryPayload(query, {
      node: {
        __typename: 'Story',
        id: '123',
        comments: {
          count: 2,
          edges: [
            {
              node: {
                id: '1',
              },
              cursor: '1',
            },
          ],
          [PAGE_INFO]: {
            [HAS_PREV_PAGE]: false,
            [HAS_NEXT_PAGE]: true,
          },
        },
      },
    });
    storeData.handleQueryPayload(query, response);
    const {mutationWriter} = cacheManager.mocks;

    const configs = [{
      type: RelayMutationType.RANGE_DELETE,
      pathToConnection: ['feedback', 'comments'],
      deletedIDFieldName: 'deletedCommentId',
    }];

    const mutationQuery = getNode(Relay.QL`
      mutation {
        commentDelete(input:$input) {
          clientMutationId,
          deletedCommentId,
          feedback {
            id,
            comments {
              count,
            },
          },
        }
      }
    `);
    const payload = {
      [CLIENT_MUTATION_ID]: 'abc',
      deletedCommentId: '1',
      feedback: {
        id: '123',
        comments: {
          count: 1,
        },
      },
    };
    storeData.handleUpdatePayload(
      mutationQuery,
      payload,
      {configs, isOptimisticUpdate: false}
    );

    expect(mutationWriter).toContainCalledMethods({
      writeNode: 1,
      writeField: 4,
      writeRootCall: 0,
    });
    expect(mutationWriter.writeField).toBeCalledWithNodeFields({
      'client:1': {
        __range__: getRangeForRecord('client:1'),
        count: 1,
      },
    });
  });

  it('clears cache manager', () => {
    storeData.clearCacheManager();
    expect(storeData.hasCacheManager()).toBe(false);
  });
});
