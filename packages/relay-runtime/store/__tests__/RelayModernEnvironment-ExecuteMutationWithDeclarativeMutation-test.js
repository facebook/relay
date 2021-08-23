/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {
  getActorIdentifier,
  MultiActorEnvironment,
} = require('../../multi-actor-environment');
const {graphql, getRequest} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'deleteFromStore',
  environmentType => {
    describe(environmentType, () => {
      describe('single ids', () => {
        let callbacks;
        let commentId;
        let CommentQuery;
        let DeleteCommentMutation;
        let complete;
        let environment;
        let error;
        let fetch;
        let next;
        let operation;
        let queryOperation;
        let source;
        let store;
        let subject;
        let variables;
        let queryVariables;

        beforeEach(() => {
          commentId = 'comment-id';

          DeleteCommentMutation = getRequest(graphql`
            mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation(
              $input: CommentDeleteInput
            ) {
              commentDelete(input: $input) {
                deletedCommentId @deleteRecord
              }
            }
          `);

          CommentQuery = getRequest(graphql`
            query RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query(
              $id: ID!
            ) {
              node(id: $id) {
                id
                body {
                  text
                }
              }
            }
          `);
          variables = {
            input: {
              clientMutationId: '0',
              commentId,
            },
          };
          queryVariables = {
            id: commentId,
          };
          operation = createOperationDescriptor(
            DeleteCommentMutation,
            variables,
          );
          queryOperation = createOperationDescriptor(
            CommentQuery,
            queryVariables,
          );

          fetch = jest.fn((_query, _variables, _cacheConfig) =>
            RelayObservable.create(sink => {
              subject = sink;
            }),
          );
          source = RelayRecordSource.create();
          store = new RelayModernStore(source);
          const multiActorEnvironment = new MultiActorEnvironment({
            createNetworkForActor: _actorID => RelayNetwork.create(fetch),
            createStoreForActor: _actorID => store,
          });
          environment =
            environmentType === 'MultiActorEnvironment'
              ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
              : new RelayModernEnvironment({
                  network: RelayNetwork.create(fetch),
                  store,
                });
          complete = jest.fn();
          error = jest.fn();
          next = jest.fn();
          callbacks = {complete, error, next};

          environment.execute({operation: queryOperation}).subscribe({});
          subject.next({
            data: {
              node: {
                __typename: 'Comment',
                id: commentId,
                body: {
                  text: 'Comment',
                },
              },
            },
          });
          jest.runAllTimers();
        });

        it('commit the mutation, and remove the given id from the store', () => {
          const snapshot = environment.lookup(queryOperation.fragment);
          expect(snapshot.data).toEqual({
            node: {
              id: commentId,
              body: {
                text: 'Comment',
              },
            },
          });
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);

          environment
            .executeMutation({
              operation,
            })
            .subscribe(callbacks);

          callback.mockClear();
          subject.next({
            data: {
              commentDelete: {
                deletedCommentId: commentId,
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual({node: null});
        });

        it('executes the optimist response, and remove the given id from the store', () => {
          const snapshot = environment.lookup(queryOperation.fragment);
          expect(snapshot.data).toEqual({
            node: {
              id: commentId,
              body: {
                text: 'Comment',
              },
            },
          });
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);

          environment
            .executeMutation({
              operation,
              optimisticResponse: {
                commentDelete: {
                  deletedCommentId: commentId,
                },
              },
            })
            .subscribe(callbacks);

          expect(complete).not.toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual({node: null});
        });

        it('removes different `id`s in optimistic update and the server response', () => {
          const anotherCommentId = 'serverCommentId';
          const anotherQueryOperation = createOperationDescriptor(
            CommentQuery,
            {
              id: anotherCommentId,
            },
          );
          environment.execute({operation: anotherQueryOperation}).subscribe({});
          subject.next({
            data: {
              node: {
                __typename: 'Comment',
                id: anotherCommentId,
                body: {
                  text: 'Comment 2',
                },
              },
            },
          });
          jest.runAllTimers();

          const serverSnapshot = environment.lookup(
            anotherQueryOperation.fragment,
          );
          const clientSnapshot = environment.lookup(queryOperation.fragment);

          expect(serverSnapshot.data).toEqual({
            node: {
              id: anotherCommentId,
              body: {
                text: 'Comment 2',
              },
            },
          });
          const serverCallback = jest.fn();
          const clientCallback = jest.fn();
          environment.subscribe(serverSnapshot, serverCallback);
          environment.subscribe(clientSnapshot, clientCallback);

          environment
            .executeMutation({
              operation,
              optimisticResponse: {
                commentDelete: {
                  deletedCommentId: commentId,
                },
              },
            })
            .subscribe(callbacks);

          expect(complete).not.toBeCalled();
          expect(error).not.toBeCalled();
          // Removes `commentId`
          expect(clientCallback.mock.calls.length).toBe(1);
          expect(environment.lookup(queryOperation.fragment).data).toEqual({
            node: null,
          });
          // Doesn't remove `serverCommentId`
          expect(serverCallback.mock.calls.length).toBe(0);
          expect(
            environment.lookup(anotherQueryOperation.fragment).data,
          ).toEqual({
            node: {
              id: anotherCommentId,
              body: {
                text: 'Comment 2',
              },
            },
          });

          clientCallback.mockClear();
          serverCallback.mockClear();
          subject.next({
            data: {
              commentDelete: {
                deletedCommentId: anotherCommentId,
              },
            },
          });
          subject.complete();
          // Reverts `commentId`
          expect(clientCallback.mock.calls.length).toBe(1);
          expect(clientCallback.mock.calls[0][0].data).toEqual({
            node: {
              id: commentId,
              body: {
                text: 'Comment',
              },
            },
          });
          // Removes `serverCommentId`
          expect(serverCallback.mock.calls.length).toBe(1);
          expect(serverCallback.mock.calls[0][0].data).toEqual({node: null});
        });
      });

      describe('list of ids', () => {
        let callbacks;
        let commentIds;
        let firstCommentId;
        let secondCommentId;
        let CommentQuery;
        let DeleteCommentsMutation;
        let complete;
        let environment;
        let error;
        let fetch;
        let next;
        let operation;
        let source;
        let store;
        let subject;
        let variables;
        let firstCommentQueryOperation;
        let secondCommentQueryOperation;

        beforeEach(() => {
          firstCommentId = 'comment-id-1';
          secondCommentId = 'comment-id-2';
          commentIds = [firstCommentId, secondCommentId];

          DeleteCommentsMutation = getRequest(graphql`
            mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutation(
              $input: CommentsDeleteInput
            ) {
              commentsDelete(input: $input) {
                deletedCommentIds @deleteRecord
              }
            }
          `);

          CommentQuery = getRequest(graphql`
            query RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestCommentQuery(
              $id: ID!
            ) {
              node(id: $id) {
                id
                body {
                  text
                }
              }
            }
          `);
          variables = {
            input: {
              clientMutationId: '0',
              commentIds,
            },
          };
          operation = createOperationDescriptor(
            DeleteCommentsMutation,
            variables,
          );
          firstCommentQueryOperation = createOperationDescriptor(CommentQuery, {
            id: firstCommentId,
          });
          secondCommentQueryOperation = createOperationDescriptor(
            CommentQuery,
            {
              id: secondCommentId,
            },
          );

          fetch = jest.fn((_query, _variables, _cacheConfig) =>
            RelayObservable.create(sink => {
              subject = sink;
            }),
          );
          source = RelayRecordSource.create();
          store = new RelayModernStore(source);
          const multiActorEnvironment = new MultiActorEnvironment({
            createNetworkForActor: _actorID => RelayNetwork.create(fetch),
            createStoreForActor: _actorID => store,
          });
          environment =
            environmentType === 'MultiActorEnvironment'
              ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
              : new RelayModernEnvironment({
                  network: RelayNetwork.create(fetch),
                  store,
                });
          complete = jest.fn();
          error = jest.fn();
          next = jest.fn();
          callbacks = {complete, error, next};

          environment
            .execute({operation: firstCommentQueryOperation})
            .subscribe({});
          subject.next({
            data: {
              node: {
                __typename: 'Comment',
                id: firstCommentId,
                body: {
                  text: 'Comment 1',
                },
              },
            },
          });
          environment
            .execute({operation: secondCommentQueryOperation})
            .subscribe({});
          subject.next({
            data: {
              node: {
                __typename: 'Comment',
                id: secondCommentId,
                body: {
                  text: 'Comment 2',
                },
              },
            },
          });
          jest.runAllTimers();
        });

        it('commit the mutation, and remove the given ids from the store', () => {
          const firstCommentSnapshot = environment.lookup(
            firstCommentQueryOperation.fragment,
          );
          expect(firstCommentSnapshot.data).toEqual({
            node: {
              id: firstCommentId,
              body: {
                text: 'Comment 1',
              },
            },
          });
          const secondCommentSnaphshot = environment.lookup(
            secondCommentQueryOperation.fragment,
          );
          expect(secondCommentSnaphshot.data).toEqual({
            node: {
              id: secondCommentId,
              body: {
                text: 'Comment 2',
              },
            },
          });

          const firstCallback = jest.fn();
          const secondCallback = jest.fn();
          environment.subscribe(firstCommentSnapshot, firstCallback);
          environment.subscribe(firstCommentSnapshot, secondCallback);

          environment
            .executeMutation({
              operation,
            })
            .subscribe(callbacks);

          firstCallback.mockClear();
          secondCallback.mockClear();
          subject.next({
            data: {
              commentsDelete: {
                deletedCommentIds: commentIds,
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(firstCallback.mock.calls.length).toBe(1);
          expect(secondCallback.mock.calls.length).toBe(1);
          expect(firstCallback.mock.calls[0][0].data).toEqual({node: null});
          expect(secondCallback.mock.calls[0][0].data).toEqual({node: null});
        });

        it('executes the optimist response, and remove the given ids from the store', () => {
          const firstCommentSnapshot = environment.lookup(
            firstCommentQueryOperation.fragment,
          );
          expect(firstCommentSnapshot.data).toEqual({
            node: {
              id: firstCommentId,
              body: {
                text: 'Comment 1',
              },
            },
          });
          const secondCommentSnaphshot = environment.lookup(
            secondCommentQueryOperation.fragment,
          );
          expect(secondCommentSnaphshot.data).toEqual({
            node: {
              id: secondCommentId,
              body: {
                text: 'Comment 2',
              },
            },
          });

          const firstCallback = jest.fn();
          const secondCallback = jest.fn();
          environment.subscribe(firstCommentSnapshot, firstCallback);
          environment.subscribe(firstCommentSnapshot, secondCallback);

          environment
            .executeMutation({
              operation,
              optimisticResponse: {
                commentsDelete: {
                  deletedCommentIds: commentIds,
                },
              },
            })
            .subscribe(callbacks);

          expect(complete).not.toBeCalled();
          expect(error).not.toBeCalled();
          expect(firstCallback.mock.calls.length).toBe(1);
          expect(secondCallback.mock.calls.length).toBe(1);
          expect(firstCallback.mock.calls[0][0].data).toEqual({node: null});
          expect(secondCallback.mock.calls[0][0].data).toEqual({node: null});
        });

        it('removes different `id`s in optimistic update and the server response', () => {
          const anotherCommentId = 'serverCommentId';
          const anotherQueryOperation = createOperationDescriptor(
            CommentQuery,
            {
              id: anotherCommentId,
            },
          );
          environment.execute({operation: anotherQueryOperation}).subscribe({});
          subject.next({
            data: {
              node: {
                __typename: 'Comment',
                id: anotherCommentId,
                body: {
                  text: 'Comment 2',
                },
              },
            },
          });
          jest.runAllTimers();

          const serverSnapshot = environment.lookup(
            anotherQueryOperation.fragment,
          );
          const clientSnapshot = environment.lookup(
            firstCommentQueryOperation.fragment,
          );

          expect(serverSnapshot.data).toEqual({
            node: {
              id: anotherCommentId,
              body: {
                text: 'Comment 2',
              },
            },
          });
          const serverCallback = jest.fn();
          const clientCallback = jest.fn();
          environment.subscribe(serverSnapshot, serverCallback);
          environment.subscribe(clientSnapshot, clientCallback);

          environment
            .executeMutation({
              operation,
              optimisticResponse: {
                commentsDelete: {
                  deletedCommentIds: commentIds,
                },
              },
            })
            .subscribe(callbacks);

          expect(complete).not.toBeCalled();
          expect(error).not.toBeCalled();
          // Removes `commentId`
          expect(clientCallback.mock.calls.length).toBe(1);
          expect(
            environment.lookup(firstCommentQueryOperation.fragment).data,
          ).toEqual({
            node: null,
          });
          // Doesn't remove `serverCommentId`
          expect(serverCallback.mock.calls.length).toBe(0);
          expect(
            environment.lookup(anotherQueryOperation.fragment).data,
          ).toEqual({
            node: {
              id: anotherCommentId,
              body: {
                text: 'Comment 2',
              },
            },
          });

          clientCallback.mockClear();
          serverCallback.mockClear();
          subject.next({
            data: {
              commentsDelete: {
                deletedCommentIds: [anotherCommentId],
              },
            },
          });
          subject.complete();
          // Reverts `commentId`
          expect(clientCallback.mock.calls.length).toBe(1);
          expect(clientCallback.mock.calls[0][0].data).toEqual({
            node: {
              id: firstCommentId,
              body: {
                text: 'Comment 1',
              },
            },
          });
          // Removes `serverCommentId`
          expect(serverCallback.mock.calls.length).toBe(1);
          expect(serverCallback.mock.calls[0][0].data).toEqual({node: null});
        });
      });
    });

    describe('connection edge mutations', () => {
      let callbacks;
      let complete;
      let subject;
      let environment;
      let error;
      let fetch;
      let next;
      let operation;
      let query;
      let source;
      let store;
      let AppendCommentMutation;
      let AppendCommentsMutation;
      let PrependCommentMutation;
      let PrependCommentsMutation;
      let DeleteCommentMutation;
      let DeleteCommentsMutation;
      let appendOperation;
      let appendMultipleOperation;
      let prependOperation;
      let prependMultipleOperation;
      let deleteOperation;
      let deletePluralOperation;
      const clientID =
        'client:<feedbackid>:__FeedbackFragment_comments_connection(orderby:"date")';

      beforeEach(() => {
        query = getRequest(graphql`
          query RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query(
            $id: ID!
          ) {
            node(id: $id) {
              comments(first: 2, orderby: "date")
                @connection(
                  key: "FeedbackFragment_comments"
                  filters: ["orderby"]
                ) {
                __id
                edges {
                  __typename
                  node {
                    __typename
                    id
                  }
                }
              }
            }
          }
        `);

        AppendCommentMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComment2Mutation(
            $connections: [ID!]!
            $input: CommentCreateInput
          ) {
            commentCreate(input: $input) {
              feedbackCommentEdge @appendEdge(connections: $connections) {
                cursor
                node {
                  id
                }
              }
            }
          }
        `);

        AppendCommentsMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendComments3Mutation(
            $connections: [ID!]!
            $input: CommentsCreateInput
          ) {
            commentsCreate(input: $input) {
              feedbackCommentEdges @appendEdge(connections: $connections) {
                cursor
                node {
                  id
                }
              }
            }
          }
        `);

        PrependCommentMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentMutation(
            $connections: [ID!]!
            $input: CommentCreateInput
          ) {
            commentCreate(input: $input) {
              feedbackCommentEdge @prependEdge(connections: $connections) {
                cursor
                node {
                  id
                }
              }
            }
          }
        `);

        PrependCommentsMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComments2Mutation(
            $connections: [ID!]!
            $input: CommentsCreateInput
          ) {
            commentsCreate(input: $input) {
              feedbackCommentEdges @prependEdge(connections: $connections) {
                cursor
                node {
                  id
                }
              }
            }
          }
        `);

        DeleteCommentMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation(
            $connections: [ID!]!
            $input: CommentDeleteInput
          ) {
            commentDelete(input: $input) {
              deletedCommentId @deleteEdge(connections: $connections)
            }
          }
        `);

        DeleteCommentsMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation(
            $connections: [ID!]!
            $input: CommentsDeleteInput
          ) {
            commentsDelete(input: $input) {
              deletedCommentIds @deleteEdge(connections: $connections)
            }
          }
        `);
        const variables = {
          id: '<feedbackid>',
        };
        operation = createOperationDescriptor(query, variables);
        appendOperation = createOperationDescriptor(AppendCommentMutation, {
          connections: [clientID],
          input: {},
        });
        appendMultipleOperation = createOperationDescriptor(
          AppendCommentsMutation,
          {
            connections: [clientID],
            input: {},
          },
        );
        prependOperation = createOperationDescriptor(PrependCommentMutation, {
          connections: [clientID],
          input: {},
        });
        prependMultipleOperation = createOperationDescriptor(
          PrependCommentsMutation,
          {
            connections: [clientID],
            input: {},
          },
        );
        deleteOperation = createOperationDescriptor(DeleteCommentMutation, {
          connections: [clientID],
          input: {},
        });
        deletePluralOperation = createOperationDescriptor(
          DeleteCommentsMutation,
          {
            connections: [clientID],
            input: {},
          },
        );

        complete = jest.fn();
        error = jest.fn();
        next = jest.fn();
        callbacks = {complete, error, next};
        fetch = jest.fn((_query, _variables, _cacheConfig) => {
          return RelayObservable.create(sink => {
            subject = sink;
          });
        });
        source = RelayRecordSource.create();
        store = new RelayModernStore(source);
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(fetch),
          createStoreForActor: _actorID => store,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(fetch),
                store,
              });
        environment.execute({operation}).subscribe(callbacks);
        const payload = {
          data: {
            node: {
              __typename: 'Feedback',
              id: '<feedbackid>',
              comments: {
                edges: [
                  {
                    __typename: 'CommentsEdge',
                    cursor: 'cursor-1',
                    node: {
                      __typename: 'Comment',
                      id: 'node-1',
                    },
                  },
                  {
                    __typename: 'CommentsEdge',
                    cursor: 'cursor-2',
                    node: {
                      __typename: 'Comment',
                      id: 'node-2',
                    },
                  },
                ],
                pageInfo: {
                  hasNextPage: true,
                  endCursor: 'cursor-2',
                },
              },
            },
          },
        };
        subject.next(payload);
        jest.runAllTimers();
        expect(environment.lookup(operation.fragment).data).toEqual({
          node: {
            comments: {
              __id: clientID,
              edges: [
                {
                  __typename: 'CommentsEdge',
                  cursor: 'cursor-1',
                  node: {
                    __typename: 'Comment',
                    id: 'node-1',
                  },
                },
                {
                  __typename: 'CommentsEdge',
                  cursor: 'cursor-2',
                  node: {
                    __typename: 'Comment',
                    id: 'node-2',
                  },
                },
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-2',
              },
            },
          },
        });
        complete.mockClear();
        next.mockClear();
        error.mockClear();
      });

      describe('append and prepend edges', () => {
        it('commits the mutation and inserts comment edges into the connection', () => {
          const snapshot = environment.lookup(operation.fragment);
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);

          environment
            .executeMutation({
              operation: appendOperation,
            })
            .subscribe(callbacks);

          callback.mockClear();
          subject.next({
            data: {
              commentCreate: {
                feedbackCommentEdge: {
                  cursor: 'cursor-append',
                  node: {
                    __typename: 'Comment',
                    id: 'node-append',
                  },
                },
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback.mock.calls.length).toBe(1);
          // $FlowExpectedError[incompatible-use]
          expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-1',
              node: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-2',
              node: {
                __typename: 'Comment',
                id: 'node-2',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-append',
              node: {
                __typename: 'Comment',
                id: 'node-append',
              },
            },
          ]);

          environment
            .executeMutation({
              operation: prependOperation,
            })
            .subscribe(callbacks);

          callback.mockClear();
          subject.next({
            data: {
              commentCreate: {
                feedbackCommentEdge: {
                  cursor: 'cursor-prepend',
                  node: {
                    __typename: 'Comment',
                    id: 'node-prepend',
                  },
                },
              },
            },
          });
          subject.complete();
          expect(callback.mock.calls.length).toBe(1);
          // $FlowExpectedError[incompatible-use]
          expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-prepend',
              node: {
                __typename: 'Comment',
                id: 'node-prepend',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-1',
              node: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-2',
              node: {
                __typename: 'Comment',
                id: 'node-2',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-append',
              node: {
                __typename: 'Comment',
                id: 'node-append',
              },
            },
          ]);
        });

        it('does not insert nodes into connections where that node already exists', () => {
          const snapshot = environment.lookup(operation.fragment);
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);

          environment
            .executeMutation({
              operation: appendOperation,
            })
            .subscribe(callbacks);

          callback.mockClear();
          subject.next({
            data: {
              commentCreate: {
                feedbackCommentEdge: {
                  cursor: 'cursor-append',
                  node: {
                    __typename: 'Comment',
                    id: 'node-1',
                  },
                },
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback.mock.calls.length).toBe(0);
          expect(
            // $FlowExpectedError[incompatible-use]
            environment.lookup(operation.fragment).data.node.comments.edges,
          ).toEqual([
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-1',
              node: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-2',
              node: {
                __typename: 'Comment',
                id: 'node-2',
              },
            },
          ]);
        });

        it('commits the mutation and inserts multiple comment edges into the connection', () => {
          const snapshot = environment.lookup(operation.fragment);
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);

          environment
            .executeMutation({
              operation: appendMultipleOperation,
            })
            .subscribe(callbacks);

          callback.mockClear();
          subject.next({
            data: {
              commentsCreate: {
                feedbackCommentEdges: [
                  {
                    __typename: 'CommentsEdge',
                    cursor: 'node-append-1',
                    node: {
                      __typename: 'Comment',
                      id: 'node-append-1',
                    },
                  },
                  {
                    __typename: 'CommentsEdge',
                    cursor: 'node-append-2',
                    node: {
                      __typename: 'Comment',
                      id: 'node-append-2',
                    },
                  },
                ],
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback.mock.calls.length).toBe(1);
          // $FlowExpectedError[incompatible-use]
          expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-1',
              node: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-2',
              node: {
                __typename: 'Comment',
                id: 'node-2',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'node-append-1',
              node: {
                __typename: 'Comment',
                id: 'node-append-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'node-append-2',
              node: {
                __typename: 'Comment',
                id: 'node-append-2',
              },
            },
          ]);

          environment
            .executeMutation({
              operation: prependMultipleOperation,
            })
            .subscribe(callbacks);

          callback.mockClear();
          subject.next({
            data: {
              commentsCreate: {
                feedbackCommentEdges: [
                  {
                    __typename: 'CommentsEdge',
                    cursor: 'node-prepend-1',
                    node: {
                      __typename: 'Comment',
                      id: 'node-prepend-1',
                    },
                  },
                  {
                    __typename: 'CommentsEdge',
                    cursor: 'node-prepend-2',
                    node: {
                      __typename: 'Comment',
                      id: 'node-prepend-2',
                    },
                  },
                ],
              },
            },
          });
          subject.complete();
          expect(callback.mock.calls.length).toBe(1);
          // $FlowExpectedError[incompatible-use]
          expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
            {
              __typename: 'CommentsEdge',
              cursor: 'node-prepend-2',
              node: {
                __typename: 'Comment',
                id: 'node-prepend-2',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'node-prepend-1',
              node: {
                __typename: 'Comment',
                id: 'node-prepend-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-1',
              node: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-2',
              node: {
                __typename: 'Comment',
                id: 'node-2',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'node-append-1',
              node: {
                __typename: 'Comment',
                id: 'node-append-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'node-append-2',
              node: {
                __typename: 'Comment',
                id: 'node-append-2',
              },
            },
          ]);
        });

        it('inserts an comment edge during optmistic update, and reverts and inserts new edge when server payload resolves', () => {
          const snapshot = environment.lookup(operation.fragment);
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);

          environment
            .executeMutation({
              operation: appendOperation,
              optimisticResponse: {
                commentCreate: {
                  feedbackCommentEdge: {
                    cursor: 'cursor-optimistic-append',
                    node: {
                      __typename: 'Comment',
                      id: 'node-optimistic-append',
                    },
                  },
                },
              },
            })
            .subscribe(callbacks);

          expect(callback.mock.calls.length).toBe(1);
          // $FlowExpectedError[incompatible-use]
          expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-1',
              node: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-2',
              node: {
                __typename: 'Comment',
                id: 'node-2',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-optimistic-append',
              node: {
                __typename: 'Comment',
                id: 'node-optimistic-append',
              },
            },
          ]);

          callback.mockClear();
          subject.next({
            data: {
              commentCreate: {
                feedbackCommentEdge: {
                  cursor: 'cursor-append',
                  node: {
                    __typename: 'Comment',
                    id: 'node-append',
                  },
                },
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback.mock.calls.length).toBe(1);
          // $FlowExpectedError[incompatible-use]
          expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-1',
              node: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-2',
              node: {
                __typename: 'Comment',
                id: 'node-2',
              },
            },
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-append',
              node: {
                __typename: 'Comment',
                id: 'node-append',
              },
            },
          ]);
        });
      });

      describe('delete edges', () => {
        it('commits the mutation and deletes comment edges from the connection from a single id', () => {
          const snapshot = environment.lookup(operation.fragment);
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);

          environment
            .executeMutation({
              operation: deleteOperation,
            })
            .subscribe(callbacks);

          callback.mockClear();
          subject.next({
            data: {
              commentDelete: {
                deletedCommentId: 'node-1',
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback.mock.calls.length).toBe(1);
          // $FlowExpectedError[incompatible-use]
          expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
            {
              __typename: 'CommentsEdge',
              cursor: 'cursor-2',
              node: {
                __typename: 'Comment',
                id: 'node-2',
              },
            },
          ]);
        });

        it('commits the mutation and deletes comment edges from the connection from a list of ids', () => {
          const snapshot = environment.lookup(operation.fragment);
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);

          environment
            .executeMutation({
              operation: deletePluralOperation,
            })
            .subscribe(callbacks);

          callback.mockClear();
          subject.next({
            data: {
              commentsDelete: {
                deletedCommentIds: ['node-1', 'node-2'],
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback.mock.calls.length).toBe(1);
          // $FlowExpectedError[incompatible-use]
          expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual(
            [],
          );
        });
      });
    });

    describe('connection node mutations', () => {
      let callbacks;
      let complete;
      let subject;
      let environment;
      let error;
      let fetch;
      let next;
      let operation;
      let query;
      let source;
      let store;
      let AppendCommentMutation;
      let PrependCommentMutation;
      let AppendCommentWithLiteralEdgeMutation;
      let AppendCommentsMutation;
      let PrependCommentsMutation;
      let appendOperation;
      let appendWithLiteralEdgeOperation;
      let prependOperation;
      let appendMultipleOperation;
      let prependMultipleOperation;
      let edgeTypeName;
      const clientID =
        'client:<feedbackid>:__FeedbackFragment_comments_connection(orderby:"date")';

      beforeEach(() => {
        query = getRequest(graphql`
          query RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query(
            $id: ID!
          ) {
            node(id: $id) {
              comments(first: 2, orderby: "date")
                @connection(
                  key: "FeedbackFragment_comments"
                  filters: ["orderby"]
                ) {
                __id
                edges {
                  __typename
                  node {
                    id
                  }
                }
              }
            }
          }
        `);

        AppendCommentMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentMutation(
            $connections: [ID!]!
            $edgeTypeName: String!
            $input: CommentCreateInput
          ) {
            commentCreate(input: $input) {
              comment
                @appendNode(
                  connections: $connections
                  edgeTypeName: $edgeTypeName
                ) {
                id
              }
            }
          }
        `);

        AppendCommentWithLiteralEdgeMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentWithLiteralEdgeMutation(
            $connections: [ID!]!
            $input: CommentCreateInput
          ) {
            commentCreate(input: $input) {
              comment
                @appendNode(
                  connections: $connections
                  edgeTypeName: "CommentsEdge"
                ) {
                id
              }
            }
          }
        `);

        AppendCommentsMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestAppendCommentsMutation(
            $connections: [ID!]!
            $edgeTypeName: String!
            $input: CommentsCreateInput
          ) {
            commentsCreate(input: $input) {
              comments
                @appendNode(
                  connections: $connections
                  edgeTypeName: $edgeTypeName
                ) {
                id
              }
            }
          }
        `);

        PrependCommentMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependComment3Mutation(
            $connections: [ID!]!
            $edgeTypeName: String!
            $input: CommentCreateInput
          ) {
            commentCreate(input: $input) {
              comment
                @prependNode(
                  connections: $connections
                  edgeTypeName: $edgeTypeName
                ) {
                id
              }
            }
          }
        `);

        PrependCommentsMutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestPrependCommentsMutation(
            $connections: [ID!]!
            $edgeTypeName: String!
            $input: CommentsCreateInput
          ) {
            commentsCreate(input: $input) {
              comments
                @prependNode(
                  connections: $connections
                  edgeTypeName: $edgeTypeName
                ) {
                id
              }
            }
          }
        `);
        const variables = {
          id: '<feedbackid>',
        };
        edgeTypeName = 'CommentsEdge';
        operation = createOperationDescriptor(query, variables);
        appendOperation = createOperationDescriptor(AppendCommentMutation, {
          connections: [clientID],
          edgeTypeName,
          input: {},
        });
        appendWithLiteralEdgeOperation = createOperationDescriptor(
          AppendCommentWithLiteralEdgeMutation,
          {
            connections: [clientID],
            input: {},
          },
        );
        prependOperation = createOperationDescriptor(PrependCommentMutation, {
          connections: [clientID],
          edgeTypeName,
          input: {},
        });
        appendMultipleOperation = createOperationDescriptor(
          AppendCommentsMutation,
          {
            connections: [clientID],
            edgeTypeName,
            input: {},
          },
        );
        prependMultipleOperation = createOperationDescriptor(
          PrependCommentsMutation,
          {
            connections: [clientID],
            edgeTypeName,
            input: {},
          },
        );

        complete = jest.fn();
        error = jest.fn();
        next = jest.fn();
        callbacks = {complete, error, next};
        fetch = jest.fn((_query, _variables, _cacheConfig) => {
          return RelayObservable.create(sink => {
            subject = sink;
          });
        });
        source = RelayRecordSource.create();
        store = new RelayModernStore(source);
        environment = new RelayModernEnvironment({
          network: RelayNetwork.create(fetch),
          store,
        });
        environment.execute({operation}).subscribe(callbacks);
        const payload = {
          data: {
            node: {
              __typename: 'Feedback',
              id: '<feedbackid>',
              comments: {
                edges: [
                  {
                    __typename: 'CommentsEdge',
                    cursor: 'cursor-1',
                    node: {
                      __typename: 'Comment',
                      id: 'node-1',
                    },
                  },
                  {
                    __typename: 'CommentsEdge',
                    cursor: 'cursor-2',
                    node: {
                      __typename: 'Comment',
                      id: 'node-2',
                    },
                  },
                ],
                pageInfo: {
                  hasNextPage: true,
                  endCursor: 'cursor-2',
                },
              },
            },
          },
        };
        subject.next(payload);
        jest.runAllTimers();
        expect(environment.lookup(operation.fragment).data).toEqual({
          node: {
            comments: {
              __id: clientID,
              edges: [
                {
                  __typename: 'CommentsEdge',
                  cursor: 'cursor-1',
                  node: {
                    __typename: 'Comment',
                    id: 'node-1',
                  },
                },
                {
                  __typename: 'CommentsEdge',
                  cursor: 'cursor-2',
                  node: {
                    __typename: 'Comment',
                    id: 'node-2',
                  },
                },
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-2',
              },
            },
          },
        });
        complete.mockClear();
        next.mockClear();
        error.mockClear();
      });

      it('commits the mutation, creates edges for the comment and inserts the edges into the connection', () => {
        const snapshot = environment.lookup(operation.fragment);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment
          .executeMutation({
            operation: appendOperation,
          })
          .subscribe(callbacks);

        callback.mockClear();

        subject.next({
          data: {
            commentCreate: {
              comment: {
                __typename: 'Comment',
                id: 'node-append',
              },
            },
          },
        });
        subject.complete();

        expect(complete).toBeCalled();
        expect(error).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(1);
        // $FlowExpectedError[incompatible-use]
        expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append',
            },
          },
        ]);

        environment
          .executeMutation({
            operation: prependOperation,
          })
          .subscribe(callbacks);

        callback.mockClear();
        subject.next({
          data: {
            commentCreate: {
              comment: {
                __typename: 'Comment',
                id: 'node-prepend',
              },
            },
          },
        });
        subject.complete();
        expect(callback.mock.calls.length).toBe(1);
        // $FlowExpectedError[incompatible-use]
        expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-prepend',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append',
            },
          },
        ]);
      });

      it('does not insert nodes into connections where that node already exists', () => {
        const snapshot = environment.lookup(operation.fragment);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment
          .executeMutation({
            operation: appendOperation,
          })
          .subscribe(callbacks);

        callback.mockClear();
        subject.next({
          data: {
            commentCreate: {
              comment: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
          },
        });
        subject.complete();

        expect(complete).toBeCalled();
        expect(error).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(0);
        expect(
          // $FlowExpectedError[incompatible-use]
          environment.lookup(operation.fragment).data.node.comments.edges,
        ).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
        ]);
      });

      it('works when the edge name is a literal', () => {
        const snapshot = environment.lookup(operation.fragment);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment
          .executeMutation({
            operation: appendWithLiteralEdgeOperation,
          })
          .subscribe(callbacks);

        callback.mockClear();
        subject.next({
          data: {
            commentCreate: {
              comment: {
                __typename: 'Comment',
                id: 'node-append',
              },
            },
          },
        });
        subject.complete();

        expect(complete).toBeCalled();
        expect(error).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(1);
        // $FlowExpectedError[incompatible-use]
        expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append',
            },
          },
        ]);

        environment
          .executeMutation({
            operation: prependOperation,
          })
          .subscribe(callbacks);

        callback.mockClear();
        subject.next({
          data: {
            commentCreate: {
              comment: {
                __typename: 'Comment',
                id: 'node-prepend',
              },
            },
          },
        });
        subject.complete();
        expect(callback.mock.calls.length).toBe(1);
        // $FlowExpectedError[incompatible-use]
        expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-prepend',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append',
            },
          },
        ]);
      });

      it('handles lists of nodes', () => {
        const snapshot = environment.lookup(operation.fragment);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment
          .executeMutation({
            operation: appendMultipleOperation,
          })
          .subscribe(callbacks);

        callback.mockClear();
        subject.next({
          data: {
            commentsCreate: {
              comments: [
                {
                  __typename: 'Comment',
                  id: 'node-append-1',
                },
                {
                  __typename: 'Comment',
                  id: 'node-append-2',
                },
              ],
            },
          },
        });
        subject.complete();

        expect(complete).toBeCalled();
        expect(error).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(1);
        // $FlowExpectedError[incompatible-use]
        expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append-2',
            },
          },
        ]);

        environment
          .executeMutation({
            operation: prependMultipleOperation,
          })
          .subscribe(callbacks);

        callback.mockClear();
        subject.next({
          data: {
            commentsCreate: {
              comments: [
                {
                  __typename: 'Comment',
                  id: 'node-prepend-1',
                },
                {
                  __typename: 'Comment',
                  id: 'node-prepend-2',
                },
              ],
            },
          },
        });
        subject.complete();
        expect(callback.mock.calls.length).toBe(1);
        // $FlowExpectedError[incompatible-use]
        expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-prepend-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-prepend-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append-2',
            },
          },
        ]);
      });

      it('creates and inserts a comment edge during optmistic update', () => {
        const snapshot = environment.lookup(operation.fragment);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment
          .executeMutation({
            operation: appendOperation,
            optimisticResponse: {
              commentCreate: {
                comment: {
                  __typename: 'Comment',
                  id: 'node-optimistic-append',
                },
              },
            },
          })
          .subscribe(callbacks);

        expect(callback.mock.calls.length).toBe(1);
        // $FlowExpectedError[incompatible-use]
        expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-optimistic-append',
            },
          },
        ]);

        callback.mockClear();
        subject.next({
          data: {
            commentCreate: {
              comment: {
                __typename: 'Comment',
                id: 'node-append',
              },
            },
          },
        });
        subject.complete();

        expect(complete).toBeCalled();
        expect(error).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(1);
        // $FlowExpectedError[incompatible-use]
        expect(callback.mock.calls[0][0].data.node.comments.edges).toEqual([
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
            },
          },
          {
            __typename: 'CommentsEdge',
            cursor: null,
            node: {
              __typename: 'Comment',
              id: 'node-append',
            },
          },
        ]);
      });

      it('warns when the server returns an null for the node', () => {
        const snapshot = environment.lookup(operation.fragment);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment
          .executeMutation({
            operation: appendWithLiteralEdgeOperation,
          })
          .subscribe(callbacks);

        callback.mockClear();
        expectWarningWillFire(
          'MutationHandlers: Expected target node to exist.',
        );
        subject.next({
          data: {
            commentCreate: {
              comment: null,
            },
          },
        });
        subject.complete();
        expect(callback.mock.calls.length).toBe(0);
      });
    });
  },
);
