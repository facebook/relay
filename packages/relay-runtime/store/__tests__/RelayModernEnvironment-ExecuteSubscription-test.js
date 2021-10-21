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

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('execute()', () => {
  let callbacks;
  const commentID = 'comment-id';
  let CommentFragment;
  let CommentQuery;
  let complete;
  let CommentCreateSubscription;
  let environment;
  let error;
  let fetchFn;
  let subscribeFn;
  let operation;
  let queryOperation;
  let source;
  let store;
  let dataSource;
  let variables;
  let queryVariables;

  beforeEach(() => {
    CommentCreateSubscription = getRequest(graphql`
      subscription RelayModernEnvironmentExecuteSubscriptionTestCommentCreateSubscription(
        $input: CommentCreateSubscriptionInput!
      ) {
        commentCreateSubscribe(input: $input) {
          comment {
            id
            body {
              text
            }
          }
        }
      }
    `);
    CommentFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteSubscriptionTestCommentFragment on Comment {
        id
        body {
          text
        }
      }
    `);
    CommentQuery = getRequest(graphql`
      query RelayModernEnvironmentExecuteSubscriptionTestCommentQuery(
        $id: ID!
      ) {
        node(id: $id) {
          id
          ...RelayModernEnvironmentExecuteSubscriptionTestCommentFragment
        }
      }
    `);
    variables = {
      input: {
        clientMutationId: '0',
        feedbackId: '1',
      },
    };
    queryVariables = {
      id: commentID,
    };
    operation = createOperationDescriptor(CommentCreateSubscription, variables);
    queryOperation = createOperationDescriptor(CommentQuery, queryVariables);

    fetchFn = jest.fn((_query, _variables, _cacheConfig) =>
      RelayObservable.create(sink => {}),
    );
    subscribeFn = jest.fn((_query, _variables, _cacheConfig) =>
      RelayObservable.create(sink => {
        dataSource = sink;
      }),
    );
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetchFn, subscribeFn),
      store,
    });
    complete = jest.fn();
    error = jest.fn();
    callbacks = {complete, error};
  });

  it('fetches the subscription with the provided subscribe function', () => {
    environment.executeSubscription({operation}).subscribe({});
    expect(subscribeFn.mock.calls.length).toBe(1);
    expect(subscribeFn.mock.calls[0][0]).toEqual(
      CommentCreateSubscription.params,
    );
    expect(subscribeFn.mock.calls[0][1]).toEqual(variables);
  });

  it('commits the server payload and runs the updater, subscription not marked in flight in operation tracker', () => {
    const selector = createReaderSelector(
      CommentFragment,
      commentID,
      {},
      queryOperation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment
      .executeSubscription({
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
    dataSource.next({
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            body: {
              text: 'Gave Relay', // server data is lowercase
            },
          },
        },
      },
    });

    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      id: commentID,
      body: {
        text: 'GAVE RELAY', // converted to uppercase by updater
      },
    });

    // The Subscription affecting the query should not be marked as in flight
    // since it has no incremental payloads
    expect(
      environment
        .getOperationTracker()
        .getPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });

  it('does not commit the server payload if disposed', () => {
    const selector = createReaderSelector(
      CommentFragment,
      commentID,
      {},
      queryOperation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    const subscription = environment
      .executeSubscription({
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

    subscription.unsubscribe();
    callback.mockClear();
    dataSource.next({
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            body: {
              text: 'Gave Relay',
            },
          },
        },
      },
    });
    dataSource.complete();
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback).toBeCalledTimes(0);

    // The Subscription affecting the query should not be marked as in flight
    // since it was disposed
    expect(
      environment
        .getOperationTracker()
        .getPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });
});
