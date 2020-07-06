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
