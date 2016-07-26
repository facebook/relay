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
  .unmock('RelayMutationQuery')
  .mock('warning');

const GraphQLMutatorConstants = require('GraphQLMutatorConstants');
const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayMutationQuery = require('RelayMutationQuery');
const RelayMutationType = require('RelayMutationType');
const RelayOptimisticMutationUtils = require('RelayOptimisticMutationUtils');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

const filterRelayQuery = require('filterRelayQuery');
const fromGraphQL = require('fromGraphQL');
const intersectRelayQuery = require('intersectRelayQuery');

describe('RelayMutationQuery', () => {
  const {filterGeneratedFields, getNode} = RelayTestUtils;

  function getNodeChildren(fragment) {
    return fromGraphQL.Fragment(fragment).getChildren();
  }
  function getNodeWithoutSource(...args) {
    const filterCallback = RelayConnectionInterface.EDGES_HAVE_SOURCE_FIELD ?
      () => true :
      node => !node.getSchemaName || node.getSchemaName() !== 'source';
    return filterRelayQuery(RelayTestUtils.getNode(...args), filterCallback);
  }

  let tracker;

  beforeEach(() => {
    jest.resetModuleRegistry();

    tracker = new RelayQueryTracker();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('fields', () => {
    it('throws for invalid field names', () => {
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on ActorSubscribeResponsePayload {
          subscribee {
            subscribers
            subscribeStatus
          }
        }
      `);
      expect(() => {
        RelayMutationQuery.buildFragmentForFields({
          fatQuery,
          tracker,
          fieldIDs: {
            unsubscribee: '4',
          },
        });
      }).toFailInvariant(
        'RelayMutationQuery: Invalid field name on fat query, `unsubscribee`.'
      );
    });

    it('maps a field to a single ID', () => {
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            doesViewerLike
            likers
          }
        }
      `);
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          likers
          url
        }
      `));
      const node = RelayMutationQuery.buildFragmentForFields({
        fatQuery,
        tracker,
        fieldIDs: {
          feedback: '123',
        },
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            likers
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123'],
      ]);
    });

    it('maps a plural field to an array of IDs', () => {
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
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
          }
          seenState
        }
      `));
      const node = RelayMutationQuery.buildFragmentForFields({
        fatQuery,
        tracker,
        fieldIDs: {
          stories: ['123'],
        },
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on ViewerNotificationsUpdateAllSeenStateResponsePayload {
          stories {
            seenState
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123'],
      ]);
    });

    it('merges tracked nodes for IDs of plural fields', () => {
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on ViewerNotificationsUpdateAllSeenStateResponsePayload {
          stories {
            seenState
          }
        }
      `);
      const trackedNodes = {
        '123': fromGraphQL.Fragment(Relay.QL`
          fragment on Story {
            message {
              text
            }
          }
        `),
        '456': fromGraphQL.Fragment(Relay.QL`
          fragment on Story {
            actors {
              name
            }
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
          stories: ['123', '456'],
        },
      });
      const node = intersectRelayQuery.mock.calls[0][0];
      const expected = RelayTestUtils.getVerbatimNode(Relay.QL`
        fragment on Story {
          ... on Story {
            id
            message {
              text
            }
          }
          ... on Story {
            id
            actors {
              __typename
              id
              name
            }
            seenState
          }
        }
      `);
      // Clone because the root node will differ, but that's okay.
      expect(expected.clone(node.getChildren()))
        .toEqualQueryNode(expected);
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123'],
        ['456'],
      ]);
    });
  });

  describe('edge deletion', () => {
    let fatQuery;
    beforeEach(() => {
      fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentDeleteResponsePayload {
          feedback {
            comments
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
          doesViewerLike
          comments(first:"10") {
            count
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
      const node = RelayMutationQuery.buildFragmentForEdgeDeletion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        parentName: 'feedback',
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentDeleteResponsePayload {
          feedback {
            comments(first:"10") {
              count
            }
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123'],
      ]);
    });

    describe('handling invalid connection names', () => {
      it('throws when explicit in the fat query', () => {
        fatQuery = fromGraphQL.Fragment(Relay.QL`
          fragment on CommentDeleteResponsePayload {
            feedback {
              doesViewerLike
            }
          }
        `);

        // Note that validation works even when we don't have a tracked query.
        tracker.getTrackedChildrenForID.mockReturnValue([]);

        expect(() => {
          RelayMutationQuery.buildFragmentForEdgeDeletion({
            fatQuery,
            tracker,
            connectionName: 'doesViewerLike',
            parentID: '123',
            parentName: 'feedback',
          });
        }).toFailInvariant(
          'RelayMutationQuery: Expected field `doesViewerLike` on `feedback` ' +
          'to be a connection.'
        );
      });

      it('throws when not explicit in the fat query', () => {
        fatQuery = fromGraphQL.Fragment(Relay.QL`
          fragment on CommentDeleteResponsePayload {
            feedback
          }
        `);

        // As long as we have it in a tracked query.
        tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
          fragment on Feedback {
            doesViewerLike
          }
        `));
        expect(() => {
          RelayMutationQuery.buildFragmentForEdgeDeletion({
            fatQuery,
            tracker,
            connectionName: 'doesViewerLike',
            parentID: '123',
            parentName: 'feedback',
          });
        }).toFailInvariant(
          'RelayMutationQuery: Expected field `doesViewerLike` on `feedback` ' +
          'to be a connection.'
        );

        // Note that if the tracked query doesn't have the field then we can't
        // validate.
        tracker.getTrackedChildrenForID.mockReturnValue(
          getNodeChildren(Relay.QL`
            fragment on Feedback {
              comments { count }
            }
          `)
        );
        expect(() => {
          RelayMutationQuery.buildFragmentForEdgeDeletion({
            fatQuery,
            tracker,
            connectionName: 'doesViewerLike',
            parentID: '123',
            parentName: 'feedback',
          });
        }).not.toThrow();
      });
    });
  });

  describe('edge insertion', () => {
    let fatQuery, rangeBehaviors;

    beforeEach(() => {
      fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments
            topLevelComments
          }
          comment
          feedbackCommentEdge {
            cursor
            node
            source
          }
        }
      `);
      rangeBehaviors = {
        '': GraphQLMutatorConstants.PREPEND,
        'orderby(toplevel)': GraphQLMutatorConstants.PREPEND,
      };
    });

    it('refetches the whole range when the rangeBehavior is REFETCH', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(orderby: "ranked_threaded", first: "10") {
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
      const node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        parentName: 'feedback',
        rangeBehaviors: {
          'orderby(ranked_threaded)': GraphQLMutatorConstants.REFETCH,
        },
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments(orderby: "ranked_threaded", first: "10") {
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
      expect(node)
        .toEqualQueryNode(expected);
    });

    it('range is not refetched at all when rangeBehavior is IGNORE', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(orderby: "ranked_threaded", first: "10") {
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
      const node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        parentName: 'feedback',
        rangeBehaviors: {
          'orderby(ranked_threaded)': GraphQLMutatorConstants.IGNORE,
        },
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment MutationQuery on CommentCreateResponsePayload {
          feedback {
            id
          }
          feedbackCommentEdge {
            __typename
            cursor
            node{
              body {
                text
              }
              id
            }
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
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
      const node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors,
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedbackCommentEdge {
            __typename
            cursor
            node {
              body {
                text
              }
              id
            }
            source {
              id
            }
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123'],
      ]);
    });

    it('includes edge fields for connections with rangeBehaviors function', () => {
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
      const node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors: ({orderby}) => {
          if (orderby === 'toplevel') {
            return 'append';
          } else {
            return 'refetch';
          }
        },
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedbackCommentEdge {
            __typename
            cursor
            node {
              body {
                text
              }
              id
            }
            source {
              id
            }
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
      expect(tracker.getTrackedChildrenForID.mock.calls).toEqual([
        ['123'],
      ]);
    });


    it('includes fields from multiple tracked edges', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            count
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
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
      const node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors,
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedbackCommentEdge {
            __typename
            cursor
            node {
              author {
                name
              }
              body {
                text
              }
              id
            }
            source {
              id
            }
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
    });

    it('excludes fields from tracked edges with different filters', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments(first:"10") {
            count
            edges {
              node {
                body {
                  text
                }
              }
            }
          }
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
      const node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        rangeBehaviors,
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedbackCommentEdge {
            __typename
            cursor
            node {
              body {
                text
              }
              id
            }
            source {
              id
            }
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
    });

    it('warns when rangeBehaviors don\'t match tracked connections', () => {
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
      RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        parentName: 'feedback',
        rangeBehaviors: {
          '': 'append',
          'orderby(recent)': 'append',
        },
      });

      expect([
        'RelayMutation: The connection `%s` on the mutation field `%s` ' +
        'that corresponds to the ID `%s` did not match any of the ' +
        '`rangeBehaviors` specified in your RANGE_ADD config. This means ' +
        'that the entire connection will be refetched. Configure a range ' +
        'behavior for this mutation in order to fetch only the new edge ' +
        'and to enable optimistic mutations or use `refetch` to squelch ' +
        'this warning.',
        'comments{orderby:"ranked_threaded"}',
        'feedback',
        '123',
      ]).toBeWarnedNTimes(1);
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
      const node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        parentName: 'feedback',
        rangeBehaviors,
      });
      const expected = getNodeWithoutSource(Relay.QL`
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
      expect(node)
        .toEqualQueryNode(expected);
    });

    it('includes non-edge fields for connections', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          comments {
            count
          }
        }
      `));
      const node = RelayMutationQuery.buildFragmentForEdgeInsertion({
        fatQuery,
        tracker,
        connectionName: 'comments',
        parentID: '123',
        edgeName: 'feedbackCommentEdge',
        parentName: 'feedback',
        rangeBehaviors,
      });
      const expected = getNodeWithoutSource(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments {
              count
            }
          }
        }
      `);
      expect(node)
        .toEqualQueryNode(expected);
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
          rangeBehaviors,
        });
      }).toFailInvariant(
        'RelayMutationQuery: Invalid field name on fat query, `story`.'
      );
    });

    describe('handling invalid connection names', () => {
      it('throws when explicit in the fat query', () => {
        fatQuery = fromGraphQL.Fragment(Relay.QL`
          fragment on CommentCreateResponsePayload {
            feedback {
              doesViewerLike
            }
          }
        `);

        // Note that validation works even when we don't have tracked query.
        tracker.getTrackedChildrenForID.mockReturnValue([]);

        expect(() => {
          RelayMutationQuery.buildFragmentForEdgeInsertion({
            fatQuery,
            tracker,
            connectionName: 'doesViewerLike',
            parentID: '123',
            edgeName: 'feedbackCommentEdge',
            parentName: 'feedback',
            rangeBehaviors,
          });
        }).toFailInvariant(
          'RelayMutationQuery: Expected field `doesViewerLike` on `feedback` ' +
          'to be a connection.'
        );
      });
    });

    it('throws when not explicit in fat query', () => {
      fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback
        }
      `);

      // As long as we have it in a tracked query.
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          doesViewerLike
        }
      `));
      expect(() => {
        RelayMutationQuery.buildFragmentForEdgeInsertion({
          fatQuery,
          tracker,
          connectionName: 'doesViewerLike',
          parentID: '123',
          edgeName: 'feedbackCommentEdge',
          parentName: 'feedback',
          rangeBehaviors,
        });
      }).toFailInvariant(
        'RelayMutationQuery: Expected field `doesViewerLike` on ' +
        '`feedback` to be a connection.'
      );

      // Note that if the tracked query doesn't have the field then we can't
      // validate.
      tracker.getTrackedChildrenForID.mockReturnValue(
        getNodeChildren(Relay.QL`
          fragment on Feedback {
            comments { count }
          }
        `)
      );
      expect(() => {
        RelayMutationQuery.buildFragmentForEdgeInsertion({
          fatQuery,
          tracker,
          connectionName: 'doesViewerLike',
          parentID: '123',
          edgeName: 'feedbackCommentEdge',
          parentName: 'feedback',
          rangeBehaviors,
        });
      }).not.toThrow();
    });
  });

  describe('optimistic update', () => {
    it('infers fields', () => {
      RelayOptimisticMutationUtils.inferRelayFieldsFromData = jest.fn();
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            doesViewerLike
            likers
          }
        }
      `);

      const mockData = {};
      RelayMutationQuery.buildFragmentForOptimisticUpdate({
        response: mockData,
        fatQuery,
      });

      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData.mock.calls.length
      ).toBe(1);
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData.mock.calls[0][0]
      ).toBe(mockData);
    });

    it('builds query', () => {
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            doesViewerLike
            likers
          }
        }
      `);
      const mutation = Relay.QL`mutation{feedbackLike(input:$input)}`;

      const query = RelayMutationQuery.buildQueryForOptimisticUpdate({
        response: {
          [RelayConnectionInterface.CLIENT_MUTATION_ID]: '1',
          feedback: {
            doesViewerLike: true,
            id: '1',
            likers: {
              count: 4,
            },
          },
        },
        fatQuery,
        mutation,
      });

      const variables = {input: ''};
      const expectedMutationQuery = filterGeneratedFields(
          getNodeWithoutSource(Relay.QL`
          mutation {
            feedbackLike(input:$input) {
              ${Relay.QL`
                fragment on FeedbackLikeResponsePayload {
                  clientMutationId,
                  feedback {
                    doesViewerLike,
                    id,
                    likers {
                      count,
                    },
                  }
                }
              `},
            }
          }
        `, variables)
      );

      expect(query)
        .toEqualQueryNode(expectedMutationQuery);
    });
  });

  describe('query', () => {
    it('creates a query for RANGE_ADD', () => {
      tracker.getTrackedChildrenForID.mockReturnValue([getNode(Relay.QL`
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
      `)]);
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments
          }
          comment
          feedbackCommentEdge {
            cursor
            node
            source
          }
        }
      `);
      const parentName = 'feedback';
      const parentID = '123';
      const connectionName = 'comments';
      const edgeName = 'feedbackCommentEdge';
      const rangeBehaviors = {
        '': GraphQLMutatorConstants.PREPEND,
      };
      const configs = [
        {
          type: RelayMutationType.RANGE_ADD,
          parentName,
          parentID,
          connectionName,
          edgeName,
          rangeBehaviors,
        },
      ];

      const mutation = Relay.QL`mutation{commentCreate(input:$input)}`;
      const mutationName = 'CommentAddMutation';
      const variables = {input: ''};
      const query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      const expectedMutationQuery = filterGeneratedFields(
        getNodeWithoutSource(Relay.QL`
          mutation {
            commentCreate(input:$input) {
              clientMutationId
              ... on CommentCreateResponsePayload {
                feedback {
                  ... on Feedback {
                    id
                  }
                }
                feedbackCommentEdge {
                  __typename
                  cursor
                  node {
                    body {
                      text
                    }
                    id
                  }
                  source{
                    id
                  }
                }
              }
            }
          }
        `, variables)
      );

      expect(query)
        .toEqualQueryNode(expectedMutationQuery);
    });

    fit('creates a query for simple list RANGE_ADD', () => {
      tracker.getTrackedChildrenForID.mockReturnValue([getNode(Relay.QL`
        fragment on Feedback {
          simpleTopLevelComments {
            body {
              text
            }
          }
        }
      `)]);
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          comment
        }
      `);
      // const parentName = 'feedback';
      const parentID = '123';
      const listName = 'simpleTopLevelComments';
      const newElementName = 'comment';
      const rangeBehaviors = () => GraphQLMutatorConstants.PREPEND;
      const configs = [
        {
          type: RelayMutationType.RANGE_ADD,
          // parentName,
          parentID,
          listName,
          newElementName,
          rangeBehaviors,
        },
      ];

      const mutation = Relay.QL`mutation{commentCreate(input:$input)}`;
      const mutationName = 'CommentAddMutation';
      const variables = {input: ''};
      const query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      const expectedMutationQuery = filterGeneratedFields(
        getNodeWithoutSource(Relay.QL`
          mutation {
            commentCreate(input:$input) {
              clientMutationId
              ... on CommentCreateResponsePayload {
                comment {
                  __typename
                  body {
                    text
                  }
                  id
                }
              }
            }
          }
        `, variables)
      );

      expect(query)
        .toEqualQueryNode(expectedMutationQuery);
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
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentDeleteResponsePayload {
          feedback {
            comments
            topLevelComments
          }
        }
      `);
      const parentName = 'feedback';
      const parentID = '123';
      const connectionName = 'comments';
      const deletedIDFieldName = 'deletedCommentId';
      const configs = [
        {
          type: RelayMutationType.NODE_DELETE,
          parentName,
          parentID,
          connectionName,
          deletedIDFieldName,
        },
      ];

      const mutation = Relay.QL`mutation{commentDelete(input:$input)}`;
      const mutationName = 'CommentDeleteMutation';
      const variables = {input: ''};
      const query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      const expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            clientMutationId
            ${Relay.QL`
              fragment on CommentDeleteResponsePayload {
                feedback {
                  id
                }
              }
            `},
            ${Relay.QL`
              fragment on CommentDeleteResponsePayload {
                deletedCommentId
              }
            `},
          }
        }
      `, variables);

      expect(query)
        .toEqualQueryNode(expectedMutationQuery);
    });

    it('creates a query for RANGE_DELETE with a shallow deleted field', () => {
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
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentDeleteResponsePayload {
          feedback {
            comments
            topLevelComments
          }
        }
      `);
      const parentName = 'feedback';
      const parentID = '123';
      const connectionName = 'comments';
      const deletedIDFieldName = 'deletedCommentId';
      const configs = [
        {
          type: RelayMutationType.RANGE_DELETE,
          parentName,
          parentID,
          connectionName,
          deletedIDFieldName,
        },
      ];

      const mutation = Relay.QL`mutation{commentDelete(input:$input)}`;
      const mutationName = 'CommentDeleteMutation';
      const variables = {input: ''};
      const query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      const expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          commentDelete(input:$input) {
            clientMutationId
            ${Relay.QL`
              fragment on CommentDeleteResponsePayload {
                feedback {
                  id
                }
              }
            `},
            ${Relay.QL`
              fragment on CommentDeleteResponsePayload {
                deletedCommentId
              }
            `},
          }
        }
      `, variables);

      expect(query)
        .toEqualQueryNode(expectedMutationQuery);
    });

    it('creates a query for RANGE_DELETE with a deep deleted field', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            edges {
              node {
                name
              }
            }
          }
        }
      `));
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on UnfriendResponsePayload {
          actor {
            friends
          }
          clientMutationId
        }
      `);
      const configs = [
        {
          type: RelayMutationType.RANGE_DELETE,
          parentName: 'actor',
          parentID: '123',
          connectionName: 'friends',
          deletedIDFieldName: ['formerFriend'],
          pathToConnection: ['actor', 'friends'],
        },
      ];

      const mutation = Relay.QL`mutation{ unfriend(input: $input) }`;
      const mutationName = 'UnfriendMutation';
      const variables = {input: ''};
      const query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      const expectedConcreteNode = Relay.QL`
        mutation {
          unfriend(input: $input) {
            clientMutationId
            ${Relay.QL`
              fragment on UnfriendResponsePayload {
                actor {
                  id
                }
              }
            `},
            ${Relay.QL`
              fragment on UnfriendResponsePayload {
                formerFriend {
                  id
                }
              }
            `},
          }
        }
      `;
      expect(query).toEqualQueryNode(
        getNodeWithoutSource(expectedConcreteNode, variables)
      );
    });

    it('creates a query for FIELDS_CHANGE', () => {
      tracker.getTrackedChildrenForID.mockReturnValue(getNodeChildren(Relay.QL`
        fragment on Feedback {
          likers
          url
        }
      `));
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on FeedbackLikeResponsePayload {
          feedback {
            doesViewerLike
            likers
          }
        }
      `);
      const fieldIDs = {
        feedback: '123',
      };
      const configs = [
        {
          type: RelayMutationType.FIELDS_CHANGE,
          fieldIDs,
        },
      ];

      const mutation = Relay.QL`mutation{feedbackLike(input:$input)}`;
      const mutationName = 'FeedbackLikeMutation';
      const variables = {input: ''};
      const query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      const expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          feedbackLike(input:$input) {
            clientMutationId
            ${Relay.QL`
              fragment on FeedbackLikeResponsePayload {
                feedback {
                  id,
                  likers
                }
              }
            `},
          }
        }
      `, variables);

      expect(query)
        .toEqualQueryNode(expectedMutationQuery);
    });

    it('creates a query with additional required fragments', () => {
      tracker.getTrackedChildrenForID.mockReturnValue([getNode(Relay.QL`
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
      `)]);
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments
          }
          comment
          feedbackCommentEdge {
            cursor
            node
            source
          }
        }
      `);
      const parentName = 'feedback';
      const parentID = '123';
      const connectionName = 'comments';
      const edgeName = 'feedbackCommentEdge';
      const rangeBehaviors = {
        '': GraphQLMutatorConstants.PREPEND,
      };
      const configs = [
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
                doesViewerLike
              }
            }
          `],
        },
      ];

      const mutation = Relay.QL`mutation{commentCreate(input:$input)}`;
      const mutationName = 'CommentAddMutation';
      const variables = {input: ''};
      const query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      const expectedMutationQuery = filterGeneratedFields(
        getNodeWithoutSource(Relay.QL`
          mutation {
            commentCreate(input:$input) {
              clientMutationId
              ... on CommentCreateResponsePayload {
                feedback {
                  ... on Feedback {
                    id
                  }
                }
                feedbackCommentEdge {
                  __typename
                  cursor
                  node {
                    body {
                      text
                    }
                    id
                  }
                  source {
                    id
                  }
                }
              }
              ... on CommentCreateResponsePayload {
                feedback {
                  doesViewerLike
                  id
                }
              }
            }
          }
        `, variables)
      );

      expect(query)
        .toEqualQueryNode(expectedMutationQuery);
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
          }
          likers
          url
        }
      `));
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on CommentCreateResponsePayload {
          feedback {
            comments
            doesViewerLike
            likers
          }
          comment
          feedbackCommentEdge {
            cursor
            node
            source
          }
        }
      `);
      const parentName = 'feedback';
      const parentID = '123';
      const connectionName = 'comments';
      const edgeName = 'feedbackCommentEdge';
      const rangeBehaviors = {
        '': GraphQLMutatorConstants.PREPEND,
      };
      const fieldIDs = {
        feedback: '123',
      };
      const configs = [
        {
          type: RelayMutationType.RANGE_ADD,
          parentName,
          parentID,
          connectionName,
          edgeName,
          rangeBehaviors,
        },
        {
          type: RelayMutationType.FIELDS_CHANGE,
          fieldIDs,
        },
      ];

      const mutation = Relay.QL`mutation{commentCreate(input:$input)}`;
      const mutationName = 'CommentAddAndLikeMutation';
      const variables = {input: ''};
      const query = RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      });

      const expectedMutationQuery = getNodeWithoutSource(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            clientMutationId
            ${Relay.QL`
              fragment on CommentCreateResponsePayload {
                feedback {
                  id,
                  likers,
                },
                feedbackCommentEdge {
                  __typename
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
            `},
            ${Relay.QL`
              fragment on CommentCreateResponsePayload {
                feedback {
                  comments(first:"10") {
                    edges {
                      cursor
                      node {
                        body {
                          text
                        }
                        id
                      }
                    }
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                    }
                  }
                  id
                  likers
                }
              }
            `},
          }
        }
      `, variables);

      expect(query)
        .toEqualQueryNode(expectedMutationQuery);
    });

    it('complains about unknown config types', () => {
      const fatQuery = fromGraphQL.Fragment(Relay.QL`
        fragment on UnfriendResponsePayload {
          clientMutationId
        }
      `);
      const configs = [
        {
          type: 'COSMIC_RAY_BIT_FLIP',
        },
      ];

      const mutation = Relay.QL`mutation{ unfriend(input: $input) }`;
      const mutationName = 'UnfriendMutation';
      expect(() => RelayMutationQuery.buildQuery({
        tracker,
        fatQuery,
        configs,
        mutationName,
        mutation,
      })).toFailInvariant(
        'RelayMutationQuery: Unrecognized config key `COSMIC_RAY_BIT_FLIP` ' +
        'for `UnfriendMutation`.'
      );
    });
  });
});
