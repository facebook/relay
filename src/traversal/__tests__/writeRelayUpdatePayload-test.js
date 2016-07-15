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
  .unmock('GraphQLSegment')
  .mock('warning');

const GraphQLMutatorConstants = require('GraphQLMutatorConstants');
const Relay = require('Relay');
const RelayChangeTracker = require('RelayChangeTracker');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayMutationType = require('RelayMutationType');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayQueryWriter = require('RelayQueryWriter');
const RelayRecordStore = require('RelayRecordStore');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayTestUtils = require('RelayTestUtils');

const generateClientEdgeID = require('generateClientEdgeID');
const writeRelayUpdatePayload = require('writeRelayUpdatePayload');

describe('writeRelayUpdatePayload()', () => {
  const {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('fields changed mutations', () => {
    let commentID;
    let connectionID;
    let query;
    let queueStore;
    let queueWriter;
    let store;
    let writer;

    beforeEach(() => {
      const records = {};
      const queuedRecords = {};
      const nodeConnectionMap = {};
      const rootCallMap = {};
      const rootCallMaps = {rootCallMap};

      commentID = 'comment123';

      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        nodeConnectionMap
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        nodeConnectionMap
      );
      writer = new RelayRecordWriter(
        records,
        rootCallMap,
        false,
        nodeConnectionMap
      );
      queueWriter = new RelayRecordWriter(
        queuedRecords,
        rootCallMap,
        true,
        nodeConnectionMap,
        null,
        'mutationID'
      );
      query = getNode(Relay.QL`
        query TestQuery {
          node(id:"feedback_id") {
            topLevelComments(first:"1") {
              count
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'Feedback',
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
      writePayload(store, writer, query, payload);
      connectionID = store.getLinkedRecordID(
        'feedback_id',
        'topLevelComments'
      );
    });

    it('unspecified optimistic fields does not overwrite existing store data', () => {
      // create the mutation and payload
      const input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: commentID,
      };
      const mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            feedback {
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.FIELDS_CHANGE,
        fieldIDs: {feedback: 'feedback_id'},
      }];

      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: 'feedback_id',
          topLevelComments: {},
        },
      };

      // write to the queued store
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {},
      });

      expect(queueStore.getField(connectionID, 'count')).toBe(1);
    });

    it('reports useful debug info for unexpectedly missing records', () => {
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        store,
        writer,
        queryTracker,
        changeTracker,
      );
      const configs = [{
        type: RelayMutationType.FIELDS_CHANGE,
        fieldIDs: {feedback: 'feedback_id'},
      }];
      const input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: commentID,
      };
      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: null, // Malformed response.
          topLevelComments: {},
        },
      };
      expect(() => writeRelayUpdatePayload(queryWriter, query, payload, {configs}))
        .toFailInvariant(
          'writeRelayUpdatePayload(): Expected a record ID in the response ' +
          'payload supplied to update the store for field `feedback`, ' +
          'payload keys [id, topLevelComments], operation name `TestQuery`.'
        );
    });
  });

  describe('range delete mutations', () => {
    let store, queueStore, writer, queueWriter, commentID, connectionID, edgeID;

    beforeEach(() => {
      const records = {};
      const queuedRecords = {};
      const nodeConnectionMap = {};
      const rootCallMap = {};
      const rootCallMaps = {rootCallMap};

      commentID = 'comment123';

      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        nodeConnectionMap
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        nodeConnectionMap
      );
      writer = new RelayRecordWriter(
        records,
        rootCallMap,
        false,
        nodeConnectionMap
      );
      queueWriter = new RelayRecordWriter(
        queuedRecords,
        rootCallMap,
        true,
        nodeConnectionMap,
        null,
        'mutationID'
      );

      const query = getNode(Relay.QL`
        query {
          node(id:"feedback_id") {
            topLevelComments(first:"1") {
              count
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'Feedback',
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
      writePayload(store, writer, query, payload);
      connectionID = store.getLinkedRecordID(
        'feedback_id',
        'topLevelComments'
      );
      edgeID = generateClientEdgeID(connectionID, commentID);
    });

    it('optimistically removes range edges', () => {
      // create the mutation and payload
      const input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: commentID,
      };
      const mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId
            feedback {
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
        pathToConnection: ['feedback', 'topLevelComments'],
      }];

      const payload = {
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
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
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
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([]);

      expect(store.getField(connectionID, 'count')).toBe(1);
      expect(store.getRecordState(edgeID)).toBe('EXISTENT');
      // the range still contains this edge
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '1'}]
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
      ]);
    });

    it('non-optimistically removes range edges', () => {
      // create the mutation and payload
      const input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: commentID,
      };
      const mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId
            feedback {
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
        pathToConnection: ['feedback', 'topLevelComments'],
      }];

      const payload = {
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
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        store,
        writer,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        queryWriter,
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
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([]);
    });

    it('removes range edge with a "deleted field ID path"', () => {
      writePayload(
        store,
        writer,
        getNode(Relay.QL`
          query {
            viewer {
              actor {
                friends(first: "1") {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        `),
        {
          viewer: {
            actor: {
              __typename: 'User',
              id: '123',
              friends: {
                edges: [
                  {
                    node: {
                      id: '456',
                    },
                  },
                ],
              },
            },
          },
        }
      );
      const friendConnectionID = store.getLinkedRecordID('123', 'friends');
      const friendEdgeID = generateClientEdgeID(friendConnectionID, '456');

      const input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        friendId: '456',
      };
      const mutation = getNode(Relay.QL`
        mutation {
          unfriend(input: $input) {
            actor {
              id
            }
            formerFriend {
              id
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_DELETE,
        parentName: 'actor',
        parentID: '123',
        connectionName: 'friends',
        deletedIDFieldName: ['formerFriend'],
        pathToConnection: ['actor', 'friends'],
      }];

      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        actor: {
          id: '123',
          __typename: 'User',
        },
        formerFriend: {
          id: '456',
        },
      };
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        store,
        writer,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: false}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [friendConnectionID]: true,
          [friendEdgeID]: true,
        },
      });

      expect(store.getRecordState(friendEdgeID)).toBe('NONEXISTENT');
      expect(store.getRecordState('456')).toBe('EXISTENT');
      // the range no longer returns this edge
      expect(store.getRangeMetadata(
        friendConnectionID,
        [{name: 'first', value: '1'}]
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([]);
    });
  });

  describe('plural range delete mutation', () => {
    let store, queueStore, writer, queueWriter, commentIDs, connectionID, edgeIDs;

    beforeEach(() => {
      const records = {};
      const queuedRecords = {};
      const nodeConnectionMap = {};
      const rootCallMap = {};
      const rootCallMaps = {rootCallMap};

      commentIDs = ['comment123', 'comment456', 'comment789'];

      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        nodeConnectionMap
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        nodeConnectionMap
      );
      writer = new RelayRecordWriter(
        records,
        rootCallMap,
        false,
        nodeConnectionMap
      );
      queueWriter = new RelayRecordWriter(
        queuedRecords,
        rootCallMap,
        true,
        nodeConnectionMap,
        null,
        'mutationID'
      );

      const query = getNode(Relay.QL`
        query {
          node(id:"feedback_id") {
            topLevelComments(first:"3") {
              count
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'Feedback',
          id: 'feedback_id',
          topLevelComments: {
            count: commentIDs.length,
            edges: commentIDs.map(id => {
              return {
                cursor: id + ':cursor',
                node: {
                  id,
                },
              };
            }),
          },
        },
      };
      writePayload(store, writer, query, payload);
      connectionID = store.getLinkedRecordID(
        'feedback_id',
        'topLevelComments'
      );
      edgeIDs = commentIDs.map(id => {
        return generateClientEdgeID(connectionID, id);
      });
    });

    it('optimistically deletes requests', () => {
      // create the mutation and payload
      const input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: commentIDs,
      };
      const mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId
            feedback {
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
        pathToConnection: ['feedback', 'topLevelComments'],
      }];

      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedCommentId: commentIDs,
        feedback: {
          id: 'feedback_id',
          topLevelComments: {
            count: 0,
          },
        },
      };

      // write to the queued store
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [connectionID]: true, // range edge deleted & count changed
          ...edgeIDs.reduce((edgeMap, id) => { // edges are deleted
            return {
              ...edgeMap,
              [id]: true,
            };
          }, {}),
          // `commentID` is not modified
        },
      });

      expect(queueStore.getField(connectionID, 'count')).toBe(0);
      edgeIDs.forEach(edgeID => {
        expect(queueStore.getRecordState(edgeID)).toBe('NONEXISTENT');
      });
      commentIDs.forEach(commentID => {
        expect(queueStore.getRecordState(commentID)).toBe('EXISTENT');
      });
      // the range no longer returns this edge
      expect(queueStore.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '1'}]
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([]);

      expect(store.getField(connectionID, 'count')).toBe(3);
      edgeIDs.forEach(edgeID => {
        // the range still contains this edge
        expect(store.getRecordState(edgeID)).toBe('EXISTENT');
      });
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: commentIDs.length}]
      ).filteredEdges.map(edge => edge.edgeID)).toEqual(edgeIDs);
    });

    it('non-optimistically deletes requests', () => {
      // create the mutation and payload
      const input = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: commentIDs,
      };
      const mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId
            feedback {
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
        pathToConnection: ['feedback', 'topLevelComments'],
      }];

      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedCommentId: commentIDs,
        feedback: {
          id: 'feedback_id',
          topLevelComments: {
            count: 0,
          },
        },
      };

      // write to the queued store
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        store,
        writer,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: false}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {},
        updated: {
          [connectionID]: true, // range edge deleted & count changed
          ...edgeIDs.reduce((edgeMap, id) => { // edges are deleted
            return {
              ...edgeMap,
              [id]: true,
            };
          }, {}),
          // `commentID` is not modified
        },
      });

      expect(store.getField(connectionID, 'count')).toBe(0);
      edgeIDs.forEach(edgeID => {
        expect(store.getRecordState(edgeID)).toBe('NONEXISTENT');
      });
      commentIDs.forEach(commentID => {
        expect(store.getRecordState(commentID)).toBe('EXISTENT');
      });
      // the range no longer returns this edge
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '1'}]
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([]);
    });
  });

  describe('node/range delete mutations', () => {
    let store, queueStore, writer, queueWriter, feedbackID, connectionID, firstCommentID, secondCommentID, firstEdgeID, secondEdgeID;

    beforeEach(() => {
      const records = {};
      const queuedRecords = {};
      const nodeConnectionMap = {};
      const rootCallMap = {};
      const rootCallMaps = {rootCallMap};

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
        nodeConnectionMap
      );
      writer = new RelayRecordWriter(
        records,
        rootCallMap,
        false,
        nodeConnectionMap
      );
      queueWriter = new RelayRecordWriter(
        queuedRecords,
        rootCallMap,
        true,
        nodeConnectionMap,
        null,
        'mutationID'
      );

      const query = getNode(Relay.QL`
        query {
          node(id:"feedback123") {
            topLevelComments(first:"1") {
              count
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'Feedback',
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

      writePayload(store, writer, query, payload);
      connectionID = store.getLinkedRecordID(feedbackID, 'topLevelComments');
      firstEdgeID = generateClientEdgeID(connectionID, firstCommentID);
      secondEdgeID = generateClientEdgeID(connectionID, secondCommentID);
    });

    it('optimistically deletes comments', () => {
      // create the mutation and payload
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: firstCommentID,
      };
      const mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId
            feedback {
              id
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.NODE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
      }];

      const payload = {
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
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
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
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([
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
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([
        firstEdgeID,
        secondEdgeID,
      ]);
    });

    it('non-optimistically deletes comments', () => {
      // create the mutation and payload
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedCommentId: firstCommentID,
      };
      const mutation = getNode(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            deletedCommentId
            feedback {
              id
              topLevelComments {
                count
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.NODE_DELETE,
        deletedIDFieldName: 'deletedCommentId',
      }];

      const payload = {
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
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        store,
        writer,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        queryWriter,
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
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([
        secondEdgeID,
      ]);
      // connection metadata is merged into the queued store
      expect(store.getField(connectionID, 'count')).toBe(0);
    });
  });

  describe('plural node delete mutation', () => {
    let store, queueStore, writer, queueWriter, firstRequestID, secondRequestID, thirdRequestID;

    beforeEach(() => {
      const records = {};
      const queuedRecords = {};
      const rootCallMap = {};
      const rootCallMaps = {rootCallMap};

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
        {}
      );
      writer = new RelayRecordWriter(
        records,
        rootCallMap,
        false
      );
      queueWriter = new RelayRecordWriter(
        queuedRecords,
        rootCallMap,
        true,
        {},
        null,
        'mutationID'
      );

      const query = getNode(Relay.QL`
        query {
          nodes(ids:["request1","request2","request3"]) {
            id
          }
        }
      `);
      const payload = {
        nodes: [
          {__typename: 'User', id: firstRequestID},
          {__typename: 'User', id: secondRequestID},
          {__typename: 'User', id: thirdRequestID},
        ],
      };

      writePayload(store, writer, query, payload);

    });
    it('optimistically deletes requests', () => {
      // create the mutation and payload
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedRequestIds: [firstRequestID, secondRequestID],
      };
      const mutation = getNode(Relay.QL`
        mutation {
          applicationRequestDeleteAll(input:$input) {
            deletedRequestIds
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.NODE_DELETE,
        deletedIDFieldName: 'deletedRequestIds',
      }];

      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedRequestIds: [firstRequestID, secondRequestID],
      };

      // write to the queued store
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
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
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        deletedRequestIds: [firstRequestID, secondRequestID],
      };
      const mutation = getNode(Relay.QL`
        mutation {
          applicationRequestDeleteAll(input:$input) {
            deletedRequestIds
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.NODE_DELETE,
        deletedIDFieldName: 'deletedRequestIds',
      }];

      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        deletedRequestIds: [firstRequestID, secondRequestID],
      };

      // write to the base store
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        store,
        writer,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        queryWriter,
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

  describe('simple list range add mutations', () => {
    // let connectionIDs;
    let feedbackID;
    let queueStore;
    let queueWriter;
    let store;
    let writer;

    beforeEach(() => {
      const records = {};
      const queuedRecords = {};
      const nodeConnectionMap = {};
      const rootCallMap = {};
      const rootCallMaps = {rootCallMap};

      feedbackID = 'feedback123';
      const commentID = 'comment456';
      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        nodeConnectionMap
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        nodeConnectionMap
      );
      writer = new RelayRecordWriter(
        records,
        rootCallMap,
        false,
        nodeConnectionMap
      );
      queueWriter = new RelayRecordWriter(
        queuedRecords,
        rootCallMap,
        true,
        nodeConnectionMap,
        null,
        'mutationID'
      );

      const query = getNode(Relay.QL`
        query {
          node(id:"feedback123") {
            ...on Feedback {
              simpleTopLevelComments {
                id
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          id: feedbackID,
          __typename: 'Feedback',
          simpleTopLevelComments: [
            {
              id: commentID
            },
          ],
        },
      };
      writePayload(store, writer, query, payload);
    });


    it('optimistically prepends comments', () => {
      // create the mutation and payload
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
        message: {
          text: 'Hello World!',
          ranges: [],
        },
      };

      const mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id
            }
            feedbackCommentElement {
              id
              body {
                text
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_ADD,
        parentName: 'feedback',
        listName: 'simpleTopLevelComments',
        newElementName: 'feedbackCommentElement',
        rangeBehaviors: () => GraphQLMutatorConstants.PREPEND,
      }];

      const nextNodeID = 'comment789';
      const bodyID = 'client:1';
      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: feedbackID,
        },
        feedbackCommentElement: {
          __typename: 'Comment',
          id: nextNodeID,
          body: {
            text: input.message.text,
          },
        },
      };

      // write to queued store
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      // queued records are updated: element added
      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          [nextNodeID]: true, // node added
          [bodyID]: true, // `body` subfield
        },
        updated: {
          [feedbackID]: true, // range item added & count changed
        },
      });


      expect(Object.keys(queueStore.getField(feedbackID, 'simpleTopLevelComments')).length).toBe(2);
      expect(queueStore.getField(nextNodeID, 'id')).toBe(nextNodeID);
      expect(queueStore.getLinkedRecordID(nextNodeID, 'body')).toBe(bodyID);
      expect(queueStore.getField(bodyID, 'text')).toBe(input.message.text);

      // base records are not modified
      expect(Object.keys(store.getField(feedbackID, 'simpleTopLevelComments')).length).toBe(1);
      expect(store.getRecordState(nextNodeID)).toBe('UNKNOWN');
      expect(store.getRecordState(bodyID)).toBe('UNKNOWN');
    });


    it('non-optimistically prepends comments', () => {
      // create the mutation and payload
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
        message: {
          text: 'Hello!',
          ranges: [],
        },
      };

      const mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id
            }
            feedbackCommentElement {
              id
              body {
                text
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_ADD,
        parentName: 'feedback',
        listName: 'simpleTopLevelComments',
        newElementName: 'feedbackCommentElement',
        rangeBehaviors: () => GraphQLMutatorConstants.PREPEND,
      }];

      const nextNodeID = 'comment789';
      const bodyID = 'client:1';
      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: feedbackID
        },
        feedbackCommentElement: {
          __typename: 'Comment',
          id: nextNodeID,
          body: {
            text: input.message.text,
          },
        },
      };

      // write to base store
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        store,
        writer,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: false}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {
          [nextNodeID]: true, // node added
          [bodyID]: true, // `body` subfield
        },
        updated: {
          [feedbackID]: true
        }
      });

      // base records are updated: element added
      expect(Object.keys(store.getField(feedbackID, 'simpleTopLevelComments')).length).toBe(2);
      expect(store.getField(nextNodeID, 'id')).toBe(nextNodeID);
      expect(store.getType(nextNodeID)).toBe('Comment');
      expect(store.getLinkedRecordID(nextNodeID, 'body')).toBe(bodyID);
      expect(store.getField(bodyID, 'text')).toBe(input.message.text);
      const connectionIDs = store.getLinkedRecordIDs(feedbackID, 'simpleTopLevelComments');
      expect(connectionIDs.length).toEqual(2)
      expect(connectionIDs[0]).toEqual(nextNodeID)
    });
  });

  describe('range add mutations', () => {
    let connectionID;
    let edgeID;
    let feedbackID;
    let queueStore;
    let queueWriter;
    let store;
    let writer;

    beforeEach(() => {
      const records = {};
      const queuedRecords = {};
      const nodeConnectionMap = {};
      const rootCallMap = {};
      const rootCallMaps = {rootCallMap};

      feedbackID = 'feedback123';
      const commentID = 'comment456';
      store = new RelayRecordStore(
        {records},
        rootCallMaps,
        nodeConnectionMap
      );
      queueStore = new RelayRecordStore(
        {records, queuedRecords},
        rootCallMaps,
        nodeConnectionMap
      );
      writer = new RelayRecordWriter(
        records,
        rootCallMap,
        false,
        nodeConnectionMap
      );
      queueWriter = new RelayRecordWriter(
        queuedRecords,
        rootCallMap,
        true,
        nodeConnectionMap,
        null,
        'mutationID'
      );

      const query = getNode(Relay.QL`
        query {
          node(id:"feedback123") {
            topLevelComments(first:"1") {
              count
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          id: feedbackID,
          __typename: 'Feedback',
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

      writePayload(store, writer, query, payload);
      connectionID = store.getLinkedRecordID(feedbackID, 'topLevelComments');
      edgeID = generateClientEdgeID(connectionID, commentID);
    });

    it('handles case when created `edge` field is missing in payload', () => {
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
      };
      const mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id
              topLevelComments {
                count
              }
            }
          }
        }
      `, {input: JSON.stringify(input)}
      );
      const configs = [{
        type: RelayMutationType.RANGE_ADD,
        connectionName: 'topLevelComments',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: {'': GraphQLMutatorConstants.PREPEND},
      }];
      const payload = {
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
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      // feedback is updated, but the edge is not added
      expect(queueStore.getField(connectionID, 'count')).toBe(2);
      expect(queueStore.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '2'}]
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([edgeID]);
    });

    it('warns when using null as a rangeBehavior value instead of IGNORE', () => {
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
        message: {
          text: 'Hello!',
          ranges: [],
        },
      };

      const mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id
              topLevelComments {
                count
              }
            }
            feedbackCommentEdge {
              cursor
              node {
                id
                body {
                  text
                }
              }
              source {
                id
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_ADD,
        connectionName: 'topLevelComments',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: {'': null},
      }];

      const nextCursor = 'comment789:cursor';
      const nextNodeID = 'comment789';
      const payload = {
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

      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect([
        'Using `null` as a rangeBehavior value is deprecated. Use `ignore` to avoid ' +
        'refetching a range.',
      ]).toBeWarnedNTimes(1);
    });

    it('ignores node when rangeBehavior value is IGNORE', () => {
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
        message: {
          text: 'Hello!',
          ranges: [],
        },
      };

      const mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id
              topLevelComments {
                count
              }
            }
            feedbackCommentEdge {
              cursor
              node {
                id
                body {
                  text
                }
              }
              source {
                id
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_ADD,
        connectionName: 'topLevelComments',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: {'': GraphQLMutatorConstants.IGNORE},
      }];

      const nextCursor = 'comment789:cursor';
      const nextNodeID = 'comment789';
      const payload = {
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

      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
        mutation,
        payload,
        {configs, isOptimisticUpdate: true}
      );

      expect(changeTracker.getChangeSet()).toEqual({
        created: {}, // No node added
        updated: {
          [connectionID]: true,
        },
      });
    });

    it('optimistically prepends comments', () => {
      // create the mutation and payload
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
        message: {
          text: 'Hello!',
          ranges: [],
        },
      };

      const mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id
              topLevelComments {
                count
              }
            }
            feedbackCommentEdge {
              cursor
              node {
                id
                body {
                  text
                }
              }
              source {
                id
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_ADD,
        connectionName: 'topLevelComments',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: {'': GraphQLMutatorConstants.PREPEND},
      }];

      const nextCursor = 'comment789:cursor';
      const nextNodeID = 'comment789';
      const bodyID = 'client:2';
      const nextEdgeID = generateClientEdgeID(connectionID, nextNodeID);
      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: feedbackID,
          topLevelComments: {
            count: 2,
          },
        },
        feedbackCommentEdge: {
          __typename: 'CommentsEdge',
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
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        queueStore,
        queueWriter,
        queryTracker,
        changeTracker,
        {isOptimisticUpdate: true}
      );

      writeRelayUpdatePayload(
        queryWriter,
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
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([
        nextEdgeID,
        edgeID,
      ]);

      // base records are not modified
      expect(store.getField(connectionID, 'count')).toBe(1);
      expect(store.getRecordState(nextEdgeID)).toBe('UNKNOWN');
      expect(store.getRecordState(nextNodeID)).toBe('UNKNOWN');
      expect(store.getRecordState(bodyID)).toBe('UNKNOWN');
      expect(store.getRangeMetadata(
        connectionID,
        [{name: 'first', value: '2'}]
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
      ]);
    });

    it('non-optimistically prepends comments', () => {
      // create the mutation and payload
      const input = {
        actor_id: 'actor:123',
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        feedback_id: feedbackID,
        message: {
          text: 'Hello!',
          ranges: [],
        },
      };

      const mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id
              topLevelComments {
                count
              }
            }
            feedbackCommentEdge {
              cursor
              node {
                id
                body {
                  text
                }
              }
              source {
                id
              }
            }
          }
        }
      `, {
        input: JSON.stringify(input),
      });
      const configs = [{
        type: RelayMutationType.RANGE_ADD,
        connectionName: 'topLevelComments',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: {'': GraphQLMutatorConstants.PREPEND},
      }];

      const nextCursor = 'comment789:cursor';
      const nextNodeID = 'comment789';
      const bodyID = 'client:2';
      const nextEdgeID = generateClientEdgeID(connectionID, nextNodeID);
      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]:
          input[RelayConnectionInterface.CLIENT_MUTATION_ID],
        feedback: {
          id: feedbackID,
          topLevelComments: {
            count: 2,
          },
        },
        feedbackCommentEdge: {
          __typename: 'CommentsEdge',
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
      const changeTracker = new RelayChangeTracker();
      const queryTracker = new RelayQueryTracker();
      const queryWriter = new RelayQueryWriter(
        store,
        writer,
        queryTracker,
        changeTracker
      );

      writeRelayUpdatePayload(
        queryWriter,
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
      ).filteredEdges.map(edge => edge.edgeID)).toEqual([
        nextEdgeID,
        edgeID,
      ]);
    });
  });
});
