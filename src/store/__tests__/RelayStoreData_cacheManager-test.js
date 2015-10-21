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

jest
  .dontMock('GraphQLMutatorConstants')
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment')
  .dontMock('RelayStoreData');

var GraphQLMutatorConstants = require('GraphQLMutatorConstants');
var Relay = require('Relay');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayMockCacheManager = require('RelayMockCacheManager');
var RelayMutationType = require('RelayMutationType');
var RelayStoreData = require('RelayStoreData');

var transformRelayQueryPayload = require('transformRelayQueryPayload');

describe('RelayStoreData', function() {
  var cacheManager;
  var storeData;

  var {getNode} = RelayTestUtils;
  var CLIENT_MUTATION_ID, HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO;

  function getPathToRecord(dataID) {
    return storeData.getRecordStore().getPathToRecord(dataID);
  }

  function getRangeForRecord(dataID) {
    var nodeData = storeData.getNodeData();
    expect(Object.keys(nodeData)).toContain(dataID);
    return nodeData[dataID].__range__;
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    ({
      CLIENT_MUTATION_ID,
      HAS_NEXT_PAGE,
      HAS_PREV_PAGE,
      PAGE_INFO
    } = RelayConnectionInterface);

    cacheManager = RelayMockCacheManager.genCacheManager();
    storeData = RelayStoreData.getDefaultInstance();
    storeData.injectCacheManager(cacheManager);

    jest.addMatchers({
      toContainCalledMethods(calls) {
        return Object.keys(calls).every(methodName => {
          var expected = calls[methodName];
          var actual = this.actual[methodName].mock.calls.length;
          this.message = () => {
            var expTimes = expected + ' time' + (expected === 1 ? '' : 's');
            var actTimes = actual + ' time' + (actual === 1 ? '' : 's');
            var not = this.isNot ? 'not ' : '';
            return (
              'Expected `' + methodName + '` ' + not + 'to be called ' +
              expTimes + ', ' + 'was called ' + actTimes + '.'
            );
          };
          return expected === actual;
        });
      },
      toBeCalledWithNodeFields(nodeFields) {
        return Object.keys(nodeFields).every(
          expectedID => Object.keys(nodeFields[expectedID]).every(
            expectedFieldName => {
              this.message = () => (
                'Expected function to be called with (' +
                expectedID + ', ' +
                expectedFieldName + ', ' +
                nodeFields[expectedID][expectedFieldName] + ').'
              );
              return this.actual.mock.calls.some(
                ([actualID, actualFieldName, actualFieldValue]) => (
                  actualID === expectedID &&
                  actualFieldName === expectedFieldName &&
                  this.env.equals_(
                    actualFieldValue,
                    nodeFields[expectedID][actualFieldName]
                  )
                )
              );
            }
          )
        );
      },
    });
  });

  it('caches node metadata', () => {
    var query = getNode(Relay.QL`query{node(id:"123"){id}}`);
    var response = {node: {id: '123'}};
    storeData.handleQueryPayload(query, response);
    var {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 2,
      writeRootCall: 0,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        id: '123',
      }
    });
  });

  it('caches custom root calls', () => {
    var query = getNode(Relay.QL`query{username(name:"yuzhi"){id}}`);
    var response = {username: {id: '123'}};
    storeData.handleQueryPayload(query, response);
    var {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 2,
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
        id: '123',
      }
    });
  });

  it('caches nodes with client IDs', () => {
    var query = getNode(Relay.QL`query{viewer{isFbEmployee}}`);
    var response = {viewer: {isFbEmployee: true}};
    storeData.handleQueryPayload(query, response);
    var {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 3,
      writeRootCall: 1,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      'client:1': {
        __dataID__: 'client:1',
        __path__: getPathToRecord('client:1'),
        isFbEmployee: true,
      }
    });
  });

  it('caches linked records', () => {
    var query = getNode(Relay.QL`
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
    var response = {
      node: {
        id: '123',
        hometown: {
          id: '456',
          url: 'http://...',
        },
      },
    };
    storeData.handleQueryPayload(query, response);
    var {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 6,
      writeRootCall: 0,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        id: '123',
        hometown: {__dataID__: '456'},
      },
      '456': {
        __dataID__: '456',
        id: '456',
        url: 'http://...',
      },
    });
  });

  it('caches plural fields', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          screennames {
            service,
          },
        }
      }
    `);
    var response = {
      node: {
        id: '123',
        screennames: [
          {service: 'GTALK'},
          {service: 'TWITTER'},
        ],
      }
    };
    storeData.handleQueryPayload(query, response);
    var {queryWriter} = cacheManager.mocks;

    expect(getPathToRecord('client:1')).toEqual(getPathToRecord('client:2'));
    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 9,
      writeRootCall: 0,
    });
    expect(queryWriter.writeField).toBeCalledWithNodeFields({
      '123': {
        __dataID__: '123',
        id: '123',
        screennames: [
          {__dataID__: 'client:1'},
          {__dataID__: 'client:2'},
        ],
      },
      'client:1': {
        __dataID__: 'client:1',
        __path__: getPathToRecord('client:1'),
        service: 'GTALK',
      },
      'client:2': {
        __dataID__: 'client:2',
        __path__: getPathToRecord('client:2'),
        service: 'TWITTER',
      },
    });
  });

  it('caches connection fields', () => {
    var query = getNode(Relay.QL`
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
    var response = transformRelayQueryPayload(query, {
      node: {
        id: '123',
        friends: {
          edges: [
            {
              node: {
                id: '1'
              },
              cursor: '1',
            },
            {
              node: {
                id: '2'
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
    var {queryWriter} = cacheManager.mocks;

    expect(queryWriter).toContainCalledMethods({
      writeNode: 0,
      writeField: 21,
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
        __path__: getPathToRecord('client:1'),
        __filterCalls__: [],
        __forceIndex__: 0,
        __range__: getRangeForRecord('client:1'),
      },
      'client:client:1:1': {
        __dataID__: 'client:client:1:1',
        __path__: getPathToRecord('client:client:1:1'),
        node: {__dataID__: '1'},
        cursor: '1',
      },
      '1': {
        __dataID__: '1',
        id: '1',
      },
      'client:client:1:2': {
        __dataID__: 'client:client:1:2',
        __path__: getPathToRecord('client:client:1:2'),
        node: {__dataID__: '2'},
        cursor: '2',
      },
      '2': {
        __dataID__: '2',
        id: '2',
      },
    });
  });

  it('caches connection fields with no edges', () => {
    var query = getNode(Relay.QL`
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
    var response = transformRelayQueryPayload(query, {
      node: {
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
    var {queryWriter} = cacheManager.mocks;

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
        __path__: getPathToRecord('client:1'),
        __filterCalls__: [],
        __forceIndex__: 0,
        __range__: getRangeForRecord('client:1'),
      },
    });
  });

  it('caches simple mutations', () => {
    var query = getNode(Relay.QL`query{node(id:"123"){id,doesViewerLike}}`);
    var response = {node: {id: '123', doesViewerLike: false}};
    storeData.handleQueryPayload(query, response);
    var {mutationWriter} = cacheManager.mocks;

    var mutationQuery = getNode(Relay.QL`
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
    var payload = {
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
    var query = getNode(Relay.QL`
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
    var response = transformRelayQueryPayload(query, {
      node: {
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
      }
    });
    storeData.handleQueryPayload(query, response);
    var {mutationWriter} = cacheManager.mocks;

    var configs = [{
      type: RelayMutationType.RANGE_ADD,
      connectionName: 'comments',
      edgeName: 'feedbackCommentEdge',
      rangeBehaviors: {'': GraphQLMutatorConstants.PREPEND},
    }];

    var mutationQuery = getNode(Relay.QL`
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
    var payload = {
      [CLIENT_MUTATION_ID]: 'abc',
      feedback: {
        comments: {
          count: 3,
        },
        id: '123',
      },
      feedbackCommentEdge: {
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
      writeField: 12,
      writeRootCall: 0,
    });
    expect(mutationWriter.writeField).toBeCalledWithNodeFields({
      'client:1': {
        __range__: getRangeForRecord('client:1'),
        count: 3,
      },
      'client:client:1:2': {
        __dataID__: 'client:client:1:2',
        __path__: getPathToRecord('client:client:1:2'),
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
    var query = getNode(Relay.QL`
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
    var response = transformRelayQueryPayload(query, {
      node: {
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
      }
    });
    storeData.handleQueryPayload(query, response);
    var {mutationWriter} = cacheManager.mocks;

    var configs = [{
      type: RelayMutationType.RANGE_DELETE,
      pathToConnection: ['feedback', 'comments'],
      deletedIDFieldName: 'deletedCommentId',
    }];

    var mutationQuery = getNode(Relay.QL`
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
    var payload = {
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
});
