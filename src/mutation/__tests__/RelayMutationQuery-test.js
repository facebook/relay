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

jest.dontMock('RelayMutationQuery');

describe('RelayMutationQuery', () => {
  var GraphQLMutatorConstants;
  var Relay;
  var RelayConnectionInterface;
  var RelayMutationQuery;
  var RelayMutationType;
  var RelayQueryTracker;

  var filterRelayQuery;
  var flattenRelayQuery;
  var fromGraphQL;
  var intersectRelayQuery;

  function getNodeChildren(query) {
    return fromGraphQL.Node(query).getChildren();
  }
  function getNodeWithoutSource(...args) {
    var filterCallback = RelayConnectionInterface.EDGES_HAVE_SOURCE_FIELD ?
      () => true :
      node => !node.getSchemaName || node.getSchemaName() !== 'source';
    return filterRelayQuery(RelayTestUtils.getNode(...args), filterCallback);
  }

  var tracker;

  beforeEach(() => {
    jest.resetModuleRegistry();

    Relay = require('Relay');
    GraphQLMutatorConstants = require('GraphQLMutatorConstants');
    RelayConnectionInterface = require('RelayConnectionInterface');
    RelayMutationQuery = require('RelayMutationQuery');
    RelayMutationType = require('RelayMutationType');
    RelayQueryTracker = require('RelayQueryTracker');

    filterRelayQuery = require('filterRelayQuery');
    flattenRelayQuery = require('flattenRelayQuery');
    fromGraphQL = require('fromGraphQL');
    intersectRelayQuery = require('intersectRelayQuery');

    tracker = new RelayQueryTracker();

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('fields', () => {
    it('throws for invalid field names', () => {
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on ActorSubscribeResponsePayload {
          subscribee {
            subscribers,
            subscribeStatus
          }
        }
      `);
      expect(() => {
        RelayMutationQuery.buildFragmentForFields({
          fatQuery,
          tracker,
          fieldIDs: {
            unsubscribee: '4'
          }
        });
      }).toFailInvariant(
        'RelayMutationQuery: Invalid field name on fat query, `unsubscribee`.'
      );
    });

    it('maps a field to a single ID', () => {
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            doesViewerLike,
            likers,
          }
        }
      `);
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          likers,
          url
        }
      `));
      var node = RelayMutationQuery.buildFragmentForFields({
        fatQuery,
        tracker,
        fieldIDs: {
          feedback: '123'
        }
      });
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            likers
          }
        }
      `);
      expect(flattenRelayQuery(node))
        .toEqualQueryNode(flattenRelayQuery(expected));
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123']
      ]);
    });

    it('maps a plural field to an array of IDs', () => {
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on ViewerNotificationsUpdateAllSeenStateResponsePayload {
          stories {
            seenState
          }
        }
      `);
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Story {
          message {
            text
          },
          seenState
        }
      `));
      var node = RelayMutationQuery.buildFragmentForFields({
        fatQuery,
        tracker,
        fieldIDs: {
          stories: ['123']
        }
      });
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on ViewerNotificationsUpdateAllSeenStateResponsePayload {
          stories {
            seenState
          }
        }
      `);
      expect(flattenRelayQuery(node))
        .toEqualQueryNode(flattenRelayQuery(expected));
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123']
      ]);
    });

    it('merges tracked nodes for IDs of plural fields', () => {
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on ViewerNotificationsUpdateAllSeenStateResponsePayload {
          stories {
            seenState
          }
        }
      `);
      var trackedNodes = {
        '123': fromGraphQL.Node(Relay.QL`
          fragment on Story {
            message {
              text
            }
          }
        `),
        '456': fromGraphQL.Node(Relay.QL`
          fragment on Story {
            actors {
              name
            },
            seenState
          }
        `),
      };
      tracker.getTrackedChildrenForID.mockImplementation(
        dataID => [trackedNodes[dataID]]
      );
      RelayMutationQuery.buildFragmentForFields({
        fatQuery,
        tracker,
        fieldIDs: {
          stories: ['123', '456']
        }
      });
      var node = intersectRelayQuery.mock.calls[0][0];
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on Story {
          actors {
            name
          },
          message {
            text
          },
          seenState
        }
      `);
      // Clone because the root node will differ, but that's okay.
      expect(flattenRelayQuery(expected.clone(node.getChildren())))
        .toEqualQueryNode(flattenRelayQuery(expected));
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123'],
        ['456']
      ]);
    });
  });

  describe('edge deletion', () => {
    var fatQuery;
    beforeEach(() => {
      fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentDeleteResponsePayload {
          feedback {
            comments,
            topLevelComments
          }
        }
      `);
    });

    it('throws for invalid parent name', () => {
      expect(() => {
        RelayMutationQuery.buildFragmentForEdgeDeletion({
          fatQuery,
          tracker,
          connectionName: 'comments',
          parentID: '123',
          parentName: 'story',
        });
      }).toFailInvariant(
        'RelayMutationQuery: Invalid field name on fat query, `story`.'
      );
    });

    it('creates a fragment for connection metadata', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          doesViewerLike,
          comments(first:"10") {
            count,
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
        }
      `));
      var node = RelayMutationQuery.buildFragmentForEdgeDeletion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        parentName: 'feedback',
      });
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentDeleteResponsePayload {
          feedback {
            comments(first:"10") {
              count
            }
          }
        }
      `);
      expect(flattenRelayQuery(node))
        .toEqualQueryNode(flattenRelayQuery(expected));
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123']
      ]);
    });
  });

  describe('edge insertion', () => {
    var GraphQLMutatorConstants;
    var fatQuery, rangeBehaviors;

    beforeEach(() => {
      GraphQLMutatorConstants = require('GraphQLMutatorConstants');

      fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments,
            topLevelComments
          },
          comment,
          feedbackCommentEdge {
            cursor,
            node,
            source
          }
        }
      `);
      rangeBehaviors = {
        '': GraphQLMutatorConstants.PREPEND,
        'orderby(toplevel)': GraphQLMutatorConstants.PREPEND,
      };
    });

    it('includes edge fields for connections with range config', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(orderby:"toplevel",first:"10") {
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
        }
      `));
      var node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors
      });
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedbackCommentEdge {
            cursor,
            node {
              body {
                text
              },
              id
            },
            source {
              id
            }
          }
        }
      `);
      expect(flattenRelayQuery(node))
        .toEqualQueryNode(flattenRelayQuery(expected));
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123']
      ]);
    });

    it('includes fields from multiple tracked edges', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            count,
            edges {
              node {
                body {
                  text
                }
              }
            }
          },
          comments(last:10) {
            edges {
              node {
                author {
                  name
                }
              }
            }
          }
        }
      `));
      var node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors
      });
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedbackCommentEdge {
            cursor,
            node {
              author {
                name
              },
              body {
                text
              },
              id
            },
            source {
              id
            }
          }
        }
      `);
      expect(flattenRelayQuery(node))
        .toEqualQueryNode(flattenRelayQuery(expected));
    });

    it('excludes fields from tracked edges with different filters', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            count,
            edges {
              node {
                body {
                  text
                }
              }
            }
          },
          comments(orderby:"ranked_threaded",first:"10") {
            edges {
              node {
                author {
                  name
                }
              }
            }
          }
        }
      `));
      var node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors
      });
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedbackCommentEdge {
            cursor,
            node {
              body {
                text
              },
              id
            },
            source {
              id
            }
          }
        }
      `);
      expect(flattenRelayQuery(node))
        .toEqualQueryNode(flattenRelayQuery(expected));
    });

    it('refetches connections in the absence of a range config', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(orderby:"ranked_threaded",first:"10") {
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
        }
      `));
      var node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        parentName: 'feedback',
        rangeBehaviors
      });
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments(orderby:"ranked_threaded",first:"10") {
              edges {
                node {
                  body {
                    text
                  }
                }
              }
            }
          }
        }
      `);
      expect(flattenRelayQuery(node))
        .toEqualQueryNode(flattenRelayQuery(expected));
    });

    it('includes non-edge fields for connections', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments {
            count
          }
        }
      `));
      var node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        parentName: 'feedback',
        rangeBehaviors
      });
      var expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments {
              count
            }
          }
        }
      `);
      expect(flattenRelayQuery(node))
        .toEqualQueryNode(flattenRelayQuery(expected));
    });

    it('throws for invalid parent name', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments {
            count
          }
        }
      `));
      expect(() => {
        RelayMutationQuery.buildFragmentForEdgeInsertion({
          fatQuery,
          tracker,
          connectionName: 'comments',
          parentID: '123',
          edgeName: 'feedbackCommentEdge',
          parentName: 'story',
          rangeBehaviors
        });
      }).toFailInvariant(
        'RelayMutationQuery: Invalid field name on fat query, `story`.'
      );
    });
  });

  describe('optimistic update', () => {
    var inferRelayFieldsFromData;

    beforeEach(() => {
      inferRelayFieldsFromData = require('inferRelayFieldsFromData');
    });

    it('infers fields', () => {
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            doesViewerLike,
            likers
          }
        }
      `);

      var mockData = {};
      RelayMutationQuery.buildFragmentForOptimisticUpdate({
        response: mockData,
        fatQuery
      });

      expect(inferRelayFieldsFromData.mock.calls.length).toBe(1);
      expect(inferRelayFieldsFromData.mock.calls[0][0]).toBe(mockData);
    });

    it('builds query', () => {
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            doesViewerLike,
            likers,
          }
        }
      `);
      var mutation = Relay.QL`mutation{feedbackLike(input:$input)}`;

      var query = RelayMutationQuery.buildQueryForOptimisticUpdate({
        response: {
          [RelayConnectionInterface.CLIENT_MUTATION_ID]: '1',
          feedback: {
            doesViewerLike: true,
            id: '1',
            likers: {
              count: 4
            },
          },
        },
        fatQuery,
        mutation,
      });

      var variables = {input: ''};
      var expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          feedbackLike(input:$input) {
            clientMutationId,
            feedback {
              doesViewerLike,
              id,
              likers {
                count,
              },
            },
          }
        }
      `, variables);

      expect(flattenRelayQuery(query))
        .toEqualQueryNode(flattenRelayQuery(expectedMutationQuery));
    });
  });

  describe('query', () => {
    it('creates a query for RANGE_ADD', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
        }
      `));
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments,
          },
          comment,
          feedbackCommentEdge {
            cursor,
            node,
            source,
          },
        }
      `);
      var parentName = 'feedback';
      var parentID = '123';
      var connectionName = 'comments';
      var edgeName = 'feedbackCommentEdge';
      var rangeBehaviors = {
        '': GraphQLMutatorConstants.PREPEND,
      };
      var configs = [
        {
          type: RelayMutationType.RANGE_ADD,
          parentName,
          parentID,
          connectionName,
          edgeName,
          rangeBehaviors,
        },
      ];

      var mutation = Relay.QL`mutation{commentCreate(input:$input)}`;
      var mutationName = 'CommentAddMutation';
      var variables = {input: ''};
      var query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      var expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            clientMutationId,
            feedback {
              id
            },
            feedbackCommentEdge {
              cursor,
              node {
                body {
                  text
                },
                id
              },
              source{
                id
              }
            }
          }
        }
      `, variables);

      expect(flattenRelayQuery(query))
        .toEqualQueryNode(flattenRelayQuery(expectedMutationQuery));
    });

    it('creates a query for NODE_DELETE', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
        }
      `));
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentDeleteResponsePayload {
          feedback {
            comments,
            topLevelComments
          }
        }
      `);
      var parentName = 'feedback';
      var parentID = '123';
      var connectionName = 'comments';
      var deletedIDFieldName = 'deletedCommentId';
      var configs = [
        {
          type: RelayMutationType.NODE_DELETE,
          parentName,
          parentID,
          connectionName,
          deletedIDFieldName,
        },
      ];

      var mutation = Relay.QL`mutation{commentDelete(input:$input)}`;
      var mutationName = 'CommentDeleteMutation';
      var variables = {input: ''};
      var query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      var expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            clientMutationId,
            deletedCommentId,
            feedback {
              id
            }
          }
        }
      `, variables);

      expect(flattenRelayQuery(query))
        .toEqualQueryNode(flattenRelayQuery(expectedMutationQuery));
    });

    it('creates a query for RANGE_DELETE', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
        }
      `));
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentDeleteResponsePayload {
          feedback {
            comments,
            topLevelComments
          }
        }
      `);
      var parentName = 'feedback';
      var parentID = '123';
      var connectionName = 'comments';
      var deletedIDFieldName = 'deletedCommentId';
      var configs = [
        {
          type: RelayMutationType.RANGE_DELETE,
          parentName,
          parentID,
          connectionName,
          deletedIDFieldName,
        },
      ];

      var mutation = Relay.QL`mutation{commentDelete(input:$input)}`;
      var mutationName = 'CommentDeleteMutation';
      var variables = {input: ''};
      var query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      var expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            clientMutationId,
            deletedCommentId,
            feedback {
              id
            }
          }
        }
      `, variables);

      expect(flattenRelayQuery(query))
        .toEqualQueryNode(flattenRelayQuery(expectedMutationQuery));
    });

    it('creates a query for FIELDS_CHANGE', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          likers,
          url
        }
      `));
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            doesViewerLike,
            likers
          }
        }
      `);
      var fieldIDs = {
        feedback: '123',
      };
      var configs = [
        {
          type: RelayMutationType.FIELDS_CHANGE,
          fieldIDs,
        },
      ];

      var mutation = Relay.QL`mutation{feedbackLike(input:$input)}`;
      var mutationName = 'FeedbackLikeMutation';
      var variables = {input: ''};
      var query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      var expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          feedbackLike(input:$input) {
            clientMutationId,
            feedback {
              id,
              likers
            }
          }
        }
      `, variables);

      expect(flattenRelayQuery(query))
        .toEqualQueryNode(flattenRelayQuery(expectedMutationQuery));
    });

    it('creates a query with additional required fragments', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
        }
      `));
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments,
          },
          comment,
          feedbackCommentEdge {
            cursor,
            node,
            source,
          },
        }
      `);
      var parentName = 'feedback';
      var parentID = '123';
      var connectionName = 'comments';
      var edgeName = 'feedbackCommentEdge';
      var rangeBehaviors = {
        '': GraphQLMutatorConstants.PREPEND,
      };
      var configs = [
        {
          type: RelayMutationType.RANGE_ADD,
          parentName,
          parentID,
          connectionName,
          edgeName,
          rangeBehaviors,
        },
        {
          type: RelayMutationType.REQUIRED_CHILDREN,
          children: [Relay.QL`
            fragment on CommentCreateResponsePayload {
              feedback {
                doesViewerLike,
              },
            }
          `],
        }
      ];

      var mutation = Relay.QL`mutation{commentCreate(input:$input)}`;
      var mutationName = 'CommentAddMutation';
      var variables = {input: ''};
      var query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      var expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            clientMutationId,
            feedback {
              doesViewerLike,
              id
            },
            feedbackCommentEdge {
              cursor,
              node {
                body {
                  text
                },
                id
              },
              source {
                id
              }
            }
          }
        }
      `, variables);

      expect(flattenRelayQuery(query))
        .toEqualQueryNode(flattenRelayQuery(expectedMutationQuery));
    });

    it('creates a query for RANGE_ADD and FIELDS_CHANGE', () => {
      // Fictitious mutation that does multiple things
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            edges {
              node {
                body {
                  text
                }
              }
            }
          },
          likers,
          url
        }
      `));
      var fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments,
            doesViewerLike,
            likers
          },
          comment,
          feedbackCommentEdge {
            cursor,
            node,
            source,
          },
        }
      `);
      var parentName = 'feedback';
      var parentID = '123';
      var connectionName = 'comments';
      var edgeName = 'feedbackCommentEdge';
      var rangeBehaviors = {
        '': GraphQLMutatorConstants.PREPEND,
      };
      var fieldIDs = {
        feedback: '123',
      };
      var configs = [
        {
          type: RelayMutationType.RANGE_ADD,
          parentName,
          parentID,
          connectionName,
          edgeName,
          rangeBehaviors
        },
        {
          type: RelayMutationType.FIELDS_CHANGE,
          fieldIDs,
        },
      ];

      var mutation = Relay.QL`mutation{commentCreate(input:$input)}`;
      var mutationName = 'CommentAddAndLikeMutation';
      var variables = {input: ''};
      var query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      var expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            clientMutationId,
            feedback {
              comments(first:"10") {
                edges {
                  cursor,
                  node {
                    body {
                      text
                    },
                    id
                  }
                },
                pageInfo {
                  hasNextPage,
                  hasPreviousPage
                }
              },
              id,
              likers
            },
            feedbackCommentEdge {
              cursor,
              node {
                body {
                  text
                },
                id
              },
              source {
                id
              }
            }
          }
        }
      `, variables);

      expect(flattenRelayQuery(query))
        .toEqualQueryNode(flattenRelayQuery(expectedMutationQuery));
    });
  });
});
