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

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {generateAndCompile, matchers} = require('relay-test-utils-internal');

function createOperationDescriptor(...args) {
  const operation = RelayModernOperationDescriptor.createOperationDescriptor(
    ...args,
  );
  // For convenience of the test output, override toJSON to print
  // a more succint description of the operation.
  // $FlowFixMe
  operation.toJSON = () => {
    return {
      name: operation.fragment.node.name,
      variables: operation.variables,
    };
  };
  return operation;
}

describe('executeMutation()', () => {
  let callbacks;
  let CommentFragment;
  let complete;
  let CreateCommentMutation;
  let CreateCommentWithSpreadMutation;
  let environment;
  let error;
  let fetch;
  let operation;
  let source;
  let store;
  let subject;
  let variables;

  beforeEach(() => {
    jest.resetModules();

    expect.extend(matchers);
    ({
      CreateCommentMutation,
      CreateCommentWithSpreadMutation,
      CommentFragment,
    } = generateAndCompile(`
        mutation CreateCommentMutation($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            comment {
              id
              body {
                text
              }
            }
          }
        }

        fragment CommentFragment on Comment {
          id
          body {
            text
          }
        }

        mutation CreateCommentWithSpreadMutation($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            comment {
              ...CommentFragment
            }
          }
        }
      `));
    variables = {
      input: {
        clientMutationId: '0',
        feedbackId: '1',
      },
    };
    operation = createOperationDescriptor(CreateCommentMutation, variables);

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
    callbacks = {complete, error};
  });

  it('fetches the mutation with the provided fetch function', () => {
    environment.executeMutation({operation}).subscribe({});
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][0]).toEqual(CreateCommentMutation.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });

  it('executes the optimistic updater immediately', () => {
    const commentID = 'comment';
    const selector = {
      dataID: commentID,
      node: CommentFragment,
      variables: {},
    };
    const snapshot = environment.lookup(selector, operation);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment
      .executeMutation({
        operation,
        optimisticUpdater: _store => {
          const comment = _store.create(commentID, 'Comment');
          comment.setValue(commentID, 'id');
          const body = _store.create(commentID + '.text', 'Text');
          comment.setLinkedRecord(body, 'body');
          body.setValue('Give Relay', 'text');
        },
      })
      .subscribe(callbacks);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      id: commentID,
      body: {
        text: 'Give Relay',
      },
    });
  });

  it('reverts the optimistic update if disposed', () => {
    const commentID = 'comment';
    const selector = {
      dataID: commentID,
      node: CommentFragment,
      variables: {},
    };
    const snapshot = environment.lookup(selector, operation);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    const subscription = environment
      .executeMutation({
        operation,
        optimisticUpdater: _store => {
          const comment = _store.create(commentID, 'Comment');
          comment.setValue(commentID, 'id');
          const body = _store.create(commentID + '.text', 'Text');
          comment.setLinkedRecord(body, 'body');
          body.setValue('Give Relay', 'text');
        },
      })
      .subscribe(callbacks);
    callback.mockClear();
    subscription.unsubscribe();
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual(undefined);
  });

  it('reverts the optimistic update and commits the server payload', () => {
    const commentID = 'comment';
    const selector = {
      dataID: commentID,
      node: CommentFragment,
      variables: {},
    };
    const snapshot = environment.lookup(selector, operation);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment
      .executeMutation({
        operation,
        optimisticUpdater: _store => {
          const comment = _store.create(commentID, 'Comment');
          comment.setValue(commentID, 'id');
          const body = _store.create(commentID + '.text', 'Text');
          comment.setLinkedRecord(body, 'body');
          body.setValue('Give Relay', 'text');
        },
      })
      .subscribe(callbacks);

    callback.mockClear();
    subject.next({
      data: {
        commentCreate: {
          comment: {
            id: commentID,
            body: {
              text: 'Gave Relay',
            },
          },
        },
      },
    });
    subject.complete();

    expect(complete).toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      id: commentID,
      body: {
        text: 'Gave Relay',
      },
    });
  });

  it('commits the server payload and runs the updater', () => {
    const commentID = 'comment';
    const selector = {
      dataID: commentID,
      node: CommentFragment,
      variables: {},
    };
    const snapshot = environment.lookup(selector, operation);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment
      .executeMutation({
        operation,
        updater: _store => {
          const comment = _store.get(commentID);
          if (!comment) {
            throw new Error('Expected comment to be in the store');
          }
          const body = comment.getLinkedRecord('body');
          if (!body) {
            throw new Error('Expected comment to have a body');
          }
          const bodyValue: string = (body.getValue('text'): $FlowFixMe);
          if (bodyValue == null) {
            throw new Error('Expected comment body to have text');
          }
          body.setValue(bodyValue.toUpperCase(), 'text');
        },
      })
      .subscribe(callbacks);

    callback.mockClear();
    subject.next({
      data: {
        commentCreate: {
          comment: {
            id: commentID,
            body: {
              text: 'Gave Relay', // server data is lowercase
            },
          },
        },
      },
    });
    subject.complete();

    expect(complete).toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      id: commentID,
      body: {
        text: 'GAVE RELAY', // converted to uppercase by updater
      },
    });
  });

  it('reverts the optimistic update if the fetch is rejected', () => {
    const commentID = 'comment';
    const selector = {
      dataID: commentID,
      node: CommentFragment,
      variables: {},
    };
    const snapshot = environment.lookup(selector, operation);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment
      .executeMutation({
        operation,
        optimisticUpdater: _store => {
          const comment = _store.create(commentID, 'Comment');
          comment.setValue(commentID, 'id');
          const body = _store.create(commentID + '.text', 'Text');
          comment.setLinkedRecord(body, 'body');
          body.setValue('Give Relay', 'text');
        },
      })
      .subscribe(callbacks);

    callback.mockClear();
    subject.error(new Error('wtf'));

    expect(complete).not.toBeCalled();
    expect(error).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual(undefined);
  });

  it('commits optimistic response with fragment spread', () => {
    operation = createOperationDescriptor(
      CreateCommentWithSpreadMutation,
      variables,
    );

    const commentID = 'comment';
    const selector = {
      dataID: commentID,
      node: CommentFragment,
      variables: {},
    };
    const snapshot = environment.lookup(selector, operation);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment
      .executeMutation({
        operation,
        optimisticResponse: {
          commentCreate: {
            comment: {
              id: commentID,
              body: {
                text: 'Give Relay',
              },
            },
          },
        },
      })
      .subscribe(callbacks);

    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      id: commentID,
      body: {
        text: 'Give Relay',
      },
    });
  });

  it('does not commit the server payload if disposed', () => {
    const commentID = 'comment';
    const selector = {
      dataID: commentID,
      node: CommentFragment,
      variables: {},
    };
    const snapshot = environment.lookup(selector, operation);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    const subscription = environment
      .executeMutation({
        operation,
        optimisticUpdater: _store => {
          const comment = _store.create(commentID, 'Comment');
          comment.setValue(commentID, 'id');
          const body = _store.create(commentID + '.text', 'Text');
          comment.setLinkedRecord(body, 'body');
          body.setValue('Give Relay', 'text');
        },
      })
      .subscribe(callbacks);

    subscription.unsubscribe();
    callback.mockClear();
    subject.next({
      data: {
        commentCreate: {
          comment: {
            id: commentID,
            body: {
              text: 'Gave Relay',
            },
          },
        },
      },
    });
    subject.complete();
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    // The optimistic update has already been reverted
    expect(callback.mock.calls.length).toBe(0);
  });
});
