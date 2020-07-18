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
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('deleteFromStore', () => {
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
      jest.resetModules();
      commentId = 'comment-id';

      ({DeleteCommentMutation, CommentQuery} = generateAndCompile(`
        mutation DeleteCommentMutation($input: CommentDeleteInput) {
          commentDelete(input: $input) {
            deletedCommentId @deleteRecord
          }
        }

        query CommentQuery($id: ID!) {
          node(id: $id) {
            id
            body {
              text
            }
          }
        }
      `));
      variables = {
        input: {
          clientMutationId: '0',
          commentId,
        },
      };
      queryVariables = {
        id: commentId,
      };
      operation = createOperationDescriptor(DeleteCommentMutation, variables);
      queryOperation = createOperationDescriptor(CommentQuery, queryVariables);

      fetch = jest.fn((_query, _variables, _cacheConfig) =>
        RelayObservable.create(sink => {
          subject = sink;
        }),
      );
      source = RelayRecordSource.create();
      store = new RelayModernStore(source);
      environment = new RelayModernEnvironment({
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
      const anotherQueryOperation = createOperationDescriptor(CommentQuery, {
        id: anotherCommentId,
      });
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

      const serverSnapshot = environment.lookup(anotherQueryOperation.fragment);
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
      expect(environment.lookup(anotherQueryOperation.fragment).data).toEqual({
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
    let queryOperation;
    let source;
    let store;
    let subject;
    let variables;
    let queryVariables;
    let firstCommentQueryOperation;
    let secondCommentQueryOperation;

    beforeEach(() => {
      jest.resetModules();
      firstCommentId = 'comment-id-1';
      secondCommentId = 'comment-id-2';
      commentIds = [firstCommentId, secondCommentId];

      ({DeleteCommentsMutation, CommentQuery} = generateAndCompile(`
        mutation DeleteCommentsMutation($input: CommentsDeleteInput) {
          commentsDelete(input: $input) {
            deletedCommentIds @deleteRecord
          }
        }

        query CommentQuery($id: ID!) {
          node(id: $id) {
            id
            body {
              text
            }
          }
        }
      `));
      variables = {
        input: {
          clientMutationId: '0',
          commentIds,
        },
      };
      operation = createOperationDescriptor(DeleteCommentsMutation, variables);
      firstCommentQueryOperation = createOperationDescriptor(CommentQuery, {
        id: firstCommentId,
      });
      secondCommentQueryOperation = createOperationDescriptor(CommentQuery, {
        id: secondCommentId,
      });

      fetch = jest.fn((_query, _variables, _cacheConfig) =>
        RelayObservable.create(sink => {
          subject = sink;
        }),
      );
      source = RelayRecordSource.create();
      store = new RelayModernStore(source);
      environment = new RelayModernEnvironment({
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
      const secondCommentSnaphsot = environment.lookup(
        secondCommentQueryOperation.fragment,
      );
      expect(secondCommentSnaphsot.data).toEqual({
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
      const secondCommentSnaphsot = environment.lookup(
        secondCommentQueryOperation.fragment,
      );
      expect(secondCommentSnaphsot.data).toEqual({
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
      const anotherQueryOperation = createOperationDescriptor(CommentQuery, {
        id: anotherCommentId,
      });
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

      const serverSnapshot = environment.lookup(anotherQueryOperation.fragment);
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
      expect(environment.lookup(anotherQueryOperation.fragment).data).toEqual({
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

describe('connection mutations', () => {
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
  let appendOperation;
  let prependOperation;
  const clientID =
    'client:<feedbackid>:__FeedbackFragment_comments_connection(orderby:"date")';

  beforeEach(() => {
    jest.resetModules();
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    ({
      FeedbackQuery: query,
      AppendCommentMutation,
      PrependCommentMutation,
    } = generateAndCompile(`
      query FeedbackQuery($id: ID!) {
        node(id: $id) {
          comments(first: 2, orderby: "date") @connection(
            key: "FeedbackFragment_comments"
            filters: ["orderby"]
          ) {
            __id
            edges {
              node {
                id
              }
            }
          }
        }
      }

      mutation AppendCommentMutation(
        $connections: [String!]!
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

      mutation PrependCommentMutation(
        $connections: [String!]!
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
    `));
    const variables = {
      id: '<feedbackid>',
    };
    operation = createOperationDescriptor(query, variables);
    appendOperation = createOperationDescriptor(AppendCommentMutation, {
      connections: [clientID],
      input: {},
    });
    prependOperation = createOperationDescriptor(PrependCommentMutation, {
      connections: [clientID],
      input: {},
    });

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
                cursor: 'cursor-1',
                node: {
                  __typename: 'Comment',
                  id: 'node-1',
                },
              },
              {
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
              cursor: 'cursor-1',
              node: {
                __typename: 'Comment',
                id: 'node-1',
              },
            },
            {
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
        cursor: 'cursor-1',
        node: {
          __typename: 'Comment',
          id: 'node-1',
        },
      },
      {
        cursor: 'cursor-2',
        node: {
          __typename: 'Comment',
          id: 'node-2',
        },
      },
      {
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
        cursor: 'cursor-prepend',
        node: {
          __typename: 'Comment',
          id: 'node-prepend',
        },
      },
      {
        cursor: 'cursor-1',
        node: {
          __typename: 'Comment',
          id: 'node-1',
        },
      },
      {
        cursor: 'cursor-2',
        node: {
          __typename: 'Comment',
          id: 'node-2',
        },
      },
      {
        cursor: 'cursor-append',
        node: {
          __typename: 'Comment',
          id: 'node-append',
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
        cursor: 'cursor-1',
        node: {
          __typename: 'Comment',
          id: 'node-1',
        },
      },
      {
        cursor: 'cursor-2',
        node: {
          __typename: 'Comment',
          id: 'node-2',
        },
      },
      {
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
        cursor: 'cursor-1',
        node: {
          __typename: 'Comment',
          id: 'node-1',
        },
      },
      {
        cursor: 'cursor-2',
        node: {
          __typename: 'Comment',
          id: 'node-2',
        },
      },
      {
        cursor: 'cursor-append',
        node: {
          __typename: 'Comment',
          id: 'node-append',
        },
      },
    ]);
  });
});
