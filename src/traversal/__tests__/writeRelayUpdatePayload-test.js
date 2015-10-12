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
  .dontMock('GraphQLMutatorConstants')
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment')
  .mock('warning');

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var Relay = require('Relay');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayQueryTracker = require('RelayQueryTracker');
var RelayChangeTracker = require('RelayChangeTracker');
var RelayMutationType = require('RelayMutationType');
var RelayQueryWriter = require('RelayQueryWriter');
var GraphQLMutatorConstants = require('GraphQLMutatorConstants');
var generateClientEdgeID = require('generateClientEdgeID');
var writeRelayUpdatePayload = require('writeRelayUpdatePayload');

describe('writePayload()', () => {
  var RelayRecordStore;

  var {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('range delete mutations', () => {
    var store, queueStore, commentID, connectionID, edgeID;

    beforeEach(() => {
      var records = {};
      var queuedRecords = {};
      var nodeConnectionMap = {};
      var rootCallMaps = {rootCallMap: {}};

      commentID = '123';

      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        nodeConnectionMap
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        nodeConnectionMap,
        undefined, /* cacheManager */
        'mutationID'
      );

      var query = getNode(Relay.QL`
        query {
          node(id:"feedback_id") {
            topLevelComments(first:"1") {
              count,
              edges {
                node {
                  id,
                },
              },
            },
          }
        }
      `);
      var payload = {
        node: {
          id: 'feedback_id',
          topLevelComments: {
            count: 1,
            edges: [
              {
                cursor: commentID + ':cursor',
                node: {
                  id: commentID,
                },
              },
            ],
          },
        },
      };
      writePayload(store, query, payload);
      connectionID = store.getLinkedRecordID(
        'feedback_id',
        'topLevelComments'
      );
      edgeID = generateClientEdgeID(connectionID, commentID);
    });

    it('optimistically removes range edges', () => {
      // create the mutation and payload
      var input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: commentID,
      };
      var mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId,
            feedback {
              topLevelComments {
                count,
              },
            },
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      var configs = [{
        type: RelayMutationType.RANGE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
        pathToConnection: ['feedback', 'topLevelComments'],
      }];

      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedCommentId: commentID,
        feedback: {
          id: 'feedback_id',
          topLevelComments: {
            count: 0,
          },
        },
      };

      // write to the queued store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        queueStore,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [connectionID]: true, // range edge deleted & count changed
          [edgeID]: true, // edge deleted
          // `commentID` is not modified
        },
      });

      expect(queueStore.getField(connectionID, 'count')).toBe(0);
      expect(queueStore.getRecordState(edgeID)).toBe('NONEXISTENT');
      expect(queueStore.getRecordState(commentID)).toBe('EXISTENT');
      // the range no longer returns this edge
      expect(queueStore.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '1'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([]);

      expect(store.getField(connectionID, 'count')).toBe(1);
      expect(store.getRecordState(edgeID)).toBe('EXISTENT');
      // the range still contains this edge
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '1'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
      ]);
    });

    it('non-optimistically removes range edges', () => {
      // create the mutation and payload
      var input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: commentID,
      };
      var mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId,
            feedback {
              topLevelComments {
                count,
              },
            },
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      var configs = [{
        type: RelayMutationType.RANGE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
        pathToConnection: ['feedback', 'topLevelComments'],
      }];

      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedCommentId: commentID,
        feedback: {
          id: 'feedback_id',
          topLevelComments: {
            count: 0,
          },
        },
      };

      // write to the queued store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        store,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: false}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [connectionID]: true, // range edge deleted & count changed
          [edgeID]: true, // edge deleted
          // `commentID` is not modified
        },
      });

      expect(store.getField(connectionID, 'count')).toBe(0);
      expect(store.getRecordState(edgeID)).toBe('NONEXISTENT');
      expect(store.getRecordState(commentID)).toBe('EXISTENT');
      // the range no longer returns this edge
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '1'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([]);
    });
  });

  describe('node/range delete mutations', () => {
    var store, queueStore, feedbackID, connectionID, firstCommentID,
      secondCommentID, firstEdgeID, secondEdgeID;

    beforeEach(() => {
      var records = {};
      var queuedRecords = {};
      var nodeConnectionMap = {};
      var rootCallMaps = {rootCallMap: {}};

      feedbackID = 'feedback123';
      firstCommentID = 'comment456';
      secondCommentID = 'comment789';
      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        nodeConnectionMap
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        nodeConnectionMap,
        undefined, /* cacheManager */
        'mutationID'
      );

      var query = getNode(Relay.QL`
        query {
          node(id:"feedback123") {
            topLevelComments(first:"1") {
              count,
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: feedbackID,
          topLevelComments: {
            count: 1,
            edges: [
              {
                cursor: firstCommentID + ':cursor',
                node: {
                  id: firstCommentID,
                },
              },
              {
                cursor: secondCommentID + ':cursor',
                node: {
                  id: secondCommentID,
                },
              },
            ],
          },
        },
      };

      writePayload(store, query, payload);
      connectionID = store.getLinkedRecordID(feedbackID, 'topLevelComments');
      firstEdgeID = generateClientEdgeID(connectionID, firstCommentID);
      secondEdgeID = generateClientEdgeID(connectionID, secondCommentID);
    });

    it('optimistically deletes comments', () => {
      // create the mutation and payload
      var input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: firstCommentID,
      };
      var mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId,
            feedback {
              id,
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      var configs = [{
        type: RelayMutationType.NODE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
      }];

      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedCommentId: firstCommentID,
        feedback: {
          id: feedbackID,
          topLevelComments: {
            count: 0,
          },
        },
      };

      // write to the queued store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        queueStore,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [connectionID]: true, // range item deleted & count changed
          [firstEdgeID]: true, // edge deleted
          [firstCommentID]: true, // node deleted
        },
      });

      // node is deleted
      expect(queueStore.getRecordState(firstCommentID)).toBe('NONEXISTENT');
      expect(queueStore.getRecordState(secondCommentID)).toBe('EXISTENT');
      // corresponding edge is deleted for every range this node appears in
      expect(queueStore.getRecordState(firstEdgeID)).toBe('NONEXISTENT');
      expect(queueStore.getRecordState(secondEdgeID)).toBe('EXISTENT');
      // the range no longer returns this edge
      expect(queueStore.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '2'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([
        secondEdgeID,
      ]);
      // connection metadata is merged into the queued store
      expect(queueStore.getField(connectionID, 'count')).toBe(0);

      // base records are not modified: node & edge exist, the edge is still
      // in the range, and the connection metadata is unchanged
      expect(store.getRecordState(firstCommentID)).toBe('EXISTENT');
      expect(store.getRecordState(secondCommentID)).toBe('EXISTENT');
      expect(store.getRecordState(firstEdgeID)).toBe('EXISTENT');
      expect(store.getRecordState(secondEdgeID)).toBe('EXISTENT');
      expect(store.getField(connectionID, 'count')).toBe(1);
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '2'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([
        firstEdgeID,
        secondEdgeID,
      ]);
    });

    it('non-optimistically deletes comments', () => {
      // create the mutation and payload
      var input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: firstCommentID,
      };
      var mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId,
            feedback {
              id,
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      var configs = [{
        type: RelayMutationType.NODE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
      }];

      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedCommentId: firstCommentID,
        feedback: {
          id: feedbackID,
          topLevelComments: {
            count: 0,
          },
        },
      };

      // write to the base store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        store,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: false}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [connectionID]: true, // range item deleted & count changed
          [firstEdgeID]: true, // edge deleted
          [firstCommentID]: true, // node deleted
        },
      });

      // node is deleted
      expect(store.getRecordState(firstCommentID)).toBe('NONEXISTENT');
      expect(store.getRecordState(secondCommentID)).toBe('EXISTENT');
      // corresponding edge is deleted for every range this node appears in
      expect(store.getRecordState(firstEdgeID)).toBe('NONEXISTENT');
      expect(store.getRecordState(secondEdgeID)).toBe('EXISTENT');
      // the range no longer returns this edge
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '1'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([
        secondEdgeID,
      ]);
      // connection metadata is merged into the queued store
      expect(store.getField(connectionID, 'count')).toBe(0);
    });
  });

  describe('plural node delete mutation', () => {
    var store, queueStore, firstRequestID, secondRequestID, thirdRequestID;

    beforeEach(() => {
      var records = {};
      var queuedRecords = {};
      var rootCallMaps = {rootCallMap: {}};

      firstRequestID = 'request1';
      secondRequestID = 'request2';
      thirdRequestID = 'request3';

      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        {}
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        {},
        undefined, /* cacheManager */
        'mutationID'
      );

      var query = getNode(Relay.QL`
        query {
          nodes(ids:["request1","request2","request3"]) {
            id
          }
        }
      `);
      var payload = {
        nodes: [
          {id: firstRequestID},
          {id: secondRequestID},
          {id: thirdRequestID},
        ],
      };

      writePayload(store, query, payload);

    });
    it('optimistically deletes requests', () => {
      // create the mutation and payload
      var input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedRequestIds: [firstRequestID, secondRequestID],
      };
      var mutation = getNode(Relay.QL`
        mutation {
          applicationRequestDeleteAll(input:$input) {
            deletedRequestIds,
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      var configs = [{
        type: RelayMutationType.NODE_DELETE,
        deletedIDFieldName: 'deletedRequestIds',
      }];

      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedRequestIds: [firstRequestID, secondRequestID],
      };

      // write to the queued store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        queueStore,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [firstRequestID]: true, // node deleted
          [secondRequestID]: true, // node deleted
        },
      });

      // node is deleted
      expect(queueStore.getRecordState(firstRequestID)).toBe('NONEXISTENT');
      expect(queueStore.getRecordState(secondRequestID)).toBe('NONEXISTENT');
      // third node is not deleted
      expect(queueStore.getRecordState(thirdRequestID)).toBe('EXISTENT');

      // base records are not modified: node & edge exist, the edge is still
      // in the range, and the connection metadata is unchanged
      expect(store.getRecordState(firstRequestID)).toBe('EXISTENT');
      expect(store.getRecordState(secondRequestID)).toBe('EXISTENT');
      expect(store.getRecordState(thirdRequestID)).toBe('EXISTENT');
    });

    it('non-optimistically deletes requests', () => {
      // create the mutation and payload
      var input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedRequestIds: [firstRequestID, secondRequestID],
      };
      var mutation = getNode(Relay.QL`
        mutation {
          applicationRequestDeleteAll(input:$input) {
            deletedRequestIds,
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      var configs = [{
        type: RelayMutationType.NODE_DELETE,
        deletedIDFieldName: 'deletedRequestIds',
      }];

      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedRequestIds: [firstRequestID, secondRequestID]
      };

      // write to the base store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        store,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: false}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [firstRequestID]: true, // node deleted
          [secondRequestID]: true,
        },
      });

      // node is deleted
      expect(store.getRecordState(firstRequestID)).toBe('NONEXISTENT');
      expect(store.getRecordState(secondRequestID)).toBe('NONEXISTENT');
      // third node is not deleted
      expect(store.getRecordState(thirdRequestID)).toBe('EXISTENT');
    });
  });

  describe('range add mutations', () => {
    var store, queueStore, feedbackID, connectionID, commentID, edgeID;

    beforeEach(() => {
      var records = {};
      var queuedRecords = {};
      var nodeConnectionMap = {};
      var rootCallMaps = {rootCallMap: {}};

      feedbackID = 'feedback123';
      commentID = 'comment456';
      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        nodeConnectionMap
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        nodeConnectionMap,
        undefined, /* cacheManager */
        'mutationID'
      );

      var query = getNode(Relay.QL`
        query {
          node(id:"feedback123") {
            topLevelComments(first:"1") {
              count,
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: feedbackID,
          topLevelComments: {
            count: 1,
            edges: [
              {
                cursor: commentID + ':cursor',
                node: {
                  id: commentID,
                },
              },
            ],
          },
        },
      };

      writePayload(store, query, payload);
      connectionID = store.getLinkedRecordID(feedbackID, 'topLevelComments');
      edgeID = generateClientEdgeID(connectionID, commentID);
    });

    it('warns if the created `edge` field is missing in the payload', () => {
      var input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
      };
      var mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id,
              topLevelComments {
                count,
              },
            },
          }
        }
      `, {input: JSON.stringify(input)}
      );
      var configs = [{
        type: RelayMutationType.RANGE_ADD,
        connectionName: 'topLevelComments',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: {'': GraphQLMutatorConstants.PREPEND},
      }];
      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: feedbackID,
          topLevelComments: {
            count: 2,
          },
        },
      };

      // write to queued store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        queueStore,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect([
        'writeRelayUpdatePayload(): Expected response payload to include the ' +
        'newly created edge `%s` and its `node` field. Did you forget to ' +
        'update the `RANGE_ADD` mutation config?',
        'feedbackCommentEdge',
      ]).toBeWarnedNTimes(1);

      // feedback is updated, but the edge is not added
      expect(queueStore.getField(connectionID, 'count')).toBe(2);
      expect(queueStore.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '2'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([edgeID]);
    });

    it('optimistically prepends comments', () => {
      // create the mutation and payload
      var input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
        message: {
          text: 'Hello!',
          ranges: [],
        }
      };

      var mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id,
              topLevelComments {
                count,
              },
            },
            feedbackCommentEdge {
              cursor,
              node {
                id,
                body {
                  text,
                },
              },
              source {
                id,
              },
            },
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      var configs = [{
        type: RelayMutationType.RANGE_ADD,
        connectionName: 'topLevelComments',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: {'': GraphQLMutatorConstants.PREPEND},
      }];

      var nextCursor = 'comment789:cursor';
      var nextNodeID = 'comment789';
      var bodyID = 'client:2';
      var nextEdgeID = generateClientEdgeID(connectionID, nextNodeID);
      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: feedbackID,
          topLevelComments: {
            count: 2,
          },
        },
        feedbackCommentEdge: {
          cursor: nextCursor,
          node: {
            id: nextNodeID,
            body: {
              text: input.message.text,
            },
          },
          source: {
            id: feedbackID,
          },
        },
      };

      // write to queued store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        queueStore,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          [nextNodeID]: true, // node added
          [nextEdgeID]: true, // edge added
          [bodyID]: true, // `body` subfield
        },
        updated: {
          [connectionID]: true, // range item added & count changed
        },
      });

      // queued records are updated: edge/node added
      expect(queueStore.getField(connectionID, 'count')).toBe(2);
      expect(queueStore.getLinkedRecordID(nextEdgeID, 'source')).toBe(
        feedbackID
      );
      expect(queueStore.getField(nextEdgeID, 'cursor')).toBe(nextCursor);
      expect(queueStore.getLinkedRecordID(nextEdgeID, 'node')).toBe(nextNodeID);
      expect(queueStore.getField(nextNodeID, 'id')).toBe(nextNodeID);
      expect(queueStore.getLinkedRecordID(nextNodeID, 'body')).toBe(bodyID);
      expect(queueStore.getField(bodyID, 'text')).toBe(input.message.text);
      expect(queueStore.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '2'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([
        nextEdgeID,
        edgeID
      ]);

      // base records are not modified
      expect(store.getField(connectionID, 'count')).toBe(1);
      expect(store.getRecordState(nextEdgeID)).toBe('UNKNOWN');
      expect(store.getRecordState(nextNodeID)).toBe('UNKNOWN');
      expect(store.getRecordState(bodyID)).toBe('UNKNOWN');
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '2'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([
        edgeID
      ]);
    });

    it('non-optimistically prepends comments', () => {
      // create the mutation and payload
      var input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
        message: {
          text: 'Hello!',
          ranges: [],
        }
      };

      var mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id,
              topLevelComments {
                count,
              },
            },
            feedbackCommentEdge {
              cursor,
              node {
                id,
                body {
                  text,
                },
              },
              source {
                id,
              },
            },
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      var configs = [{
        type: RelayMutationType.RANGE_ADD,
        connectionName: 'topLevelComments',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: {'': GraphQLMutatorConstants.PREPEND},
      }];

      var nextCursor = 'comment789:cursor';
      var nextNodeID = 'comment789';
      var bodyID = 'client:2';
      var nextEdgeID = generateClientEdgeID(connectionID, nextNodeID);
      var payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: feedbackID,
          topLevelComments: {
            count: 2,
          },
        },
        feedbackCommentEdge: {
          cursor: nextCursor,
          node: {
            id: nextNodeID,
            body: {
              text: input.message.text,
            },
          },
          source: {
            id: feedbackID,
          },
        },
      };

      // write to base store
      var changeTracker = new RelayChangeTracker();
      var queryTracker = new RelayQueryTracker();
      var writer = new RelayQueryWriter(
        store,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        writer,
        mutation,
        payload,
        {configs, isOptimisticUpdate: false}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          [nextNodeID]: true, // node added
          [nextEdgeID]: true, // edge added
          [bodyID]: true, // `body` subfield
        },
        updated: {
          [connectionID]: true, // range item added & count changed
        },
      });

      // base records are updated: edge/node added
      expect(store.getField(connectionID, 'count')).toBe(2);
      expect(store.getLinkedRecordID(nextEdgeID, 'source')).toBe(
        feedbackID
      );
      expect(store.getField(nextEdgeID, 'cursor')).toBe(nextCursor);
      expect(store.getLinkedRecordID(nextEdgeID, 'node')).toBe(nextNodeID);
      expect(store.getField(nextNodeID, 'id')).toBe(nextNodeID);
      expect(store.getType(nextNodeID)).toBe('Comment');
      expect(store.getLinkedRecordID(nextNodeID, 'body')).toBe(bodyID);
      expect(store.getField(bodyID, 'text')).toBe(input.message.text);
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '2'}]
      ).requestedEdges.map(edge => edge.edgeID)).toEqual([
        nextEdgeID,
        edgeID
      ]);
    });
  });
});
