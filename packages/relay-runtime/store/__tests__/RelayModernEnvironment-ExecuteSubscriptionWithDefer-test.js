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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('executeSubscrption() with @defer', () => {
  let callbacks;
  let commentFragment;
  let commentID;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetchFn;
  let subscribeFn;
  let fragmentCallback;
  let subscription;
  let next;
  let operation;
  let commentQuery;
  let queryOperation;
  let source;
  let store;
  let variables;
  let queryVariables;

  beforeEach(() => {
    jest.resetModules();
    commentID = '1';

    ({
      CommentFragment: commentFragment,
      CommentQuery: commentQuery,
      CommentCreateSubscription: subscription,
    } = generateAndCompile(`
        subscription CommentCreateSubscription($input: CommentCreateSubscriptionInput!) {
          commentCreateSubscribe(input: $input) {
            comment {
              id
              ...CommentFragment @defer
            }
          }
        }
        fragment CommentFragment on Comment {
          id
          actor {
            name @__clientField(handle: "name_handler")
          }
        }

        query CommentQuery($id: ID!) {
          node(id: $id) {
            id
            ...CommentFragment
          }
        }
      `));
    variables = {
      input: {
        clientMutationId: '0',
        feedbackId: '1',
      },
    };
    queryVariables = {
      id: commentID,
    };
    operation = createOperationDescriptor(subscription, variables);
    queryOperation = createOperationDescriptor(commentQuery, queryVariables);

    const NameHandler = {
      update(storeProxy, payload) {
        const record = storeProxy.get(payload.dataID);
        if (record != null) {
          const markup = record.getValue(payload.fieldKey);
          record.setValue(
            typeof markup === 'string' ? markup.toUpperCase() : null,
            payload.handleKey,
          );
        }
      },
    };

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
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
      handlerProvider: name => {
        switch (name) {
          case 'name_handler':
            return NameHandler;
        }
      },
    });

    const selector = createReaderSelector(
      commentFragment,
      commentID,
      {},
      queryOperation.request,
    );
    const fragmentSnapshot = environment.lookup(selector);
    fragmentCallback = jest.fn();
    environment.subscribe(fragmentSnapshot, fragmentCallback);
  });

  it('calls next() and publishes the initial payload to the store', () => {
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            __typename: 'Comment',
          },
        },
      },
    });
    jest.runAllTimers();

    expect(next).toBeCalledTimes(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();

    expect(fragmentCallback).toBeCalledTimes(1);
    const fragmentSnapshot = fragmentCallback.mock.calls[0][0];
    // data is missing since data for @defer'd fragment hasn't been received
    expect(fragmentSnapshot.isMissingData).toBe(true);
    expect(fragmentSnapshot.data).toEqual({
      id: commentID,
      actor: undefined,
    });

    // The subscription should be marked as in flight and affecting the
    // query owner now
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).not.toBe(null);
  });

  it('processes deferred payloads', () => {
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            __typename: 'Comment',
          },
        },
      },
    });
    jest.runAllTimers();

    expect(next).toBeCalledTimes(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(fragmentCallback).toBeCalledTimes(1);
    next.mockClear();
    fragmentCallback.mockClear();

    dataSource.next({
      data: {
        id: commentID,
        __typename: 'Comment',
        actor: {
          id: 'actor-id',
          __typename: 'User',
          name: 'actor-name',
        },
      },
      label: 'CommentCreateSubscription$defer$CommentFragment',
      path: ['commentCreateSubscribe', 'comment'],
      extensions: {
        is_final: true,
      },
    });
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(fragmentCallback).toBeCalledTimes(1);
    const fragmentSnapshot = fragmentCallback.mock.calls[0][0];
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(fragmentSnapshot.data).toEqual({
      id: commentID,
      actor: {
        name: 'ACTOR-NAME',
      },
    });

    // The subscription affecting the query should no longer be in flight
    // since all incremental payloads have been resolved
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });

  it('calls complete() if root network request completes after deferred payload resolves', () => {
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            __typename: 'Comment',
          },
        },
      },
    });
    jest.runAllTimers();

    expect(next).toBeCalledTimes(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(fragmentCallback).toBeCalledTimes(1);
    next.mockClear();
    fragmentCallback.mockClear();

    dataSource.next({
      data: {
        id: commentID,
        __typename: 'Comment',
        actor: {
          id: 'actor-id',
          __typename: 'User',
          name: 'actor-name',
        },
      },
      label: 'CommentCreateSubscription$defer$CommentFragment',
      path: ['commentCreateSubscribe', 'comment'],
      extensions: {
        is_final: true,
      },
    });
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(fragmentCallback).toBeCalledTimes(1);

    // The subscription affecting the query should no longer be in flight
    // since all incremental payloads have been resolved
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);

    dataSource.complete();

    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(fragmentCallback).toBeCalledTimes(1);

    // The subscription affecting the query should no longer be in flight
    // since all incremental payloads have been resolved
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });

  it('calls complete() if root network request completes before deferred payload resolves', () => {
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            __typename: 'Comment',
          },
        },
      },
    });
    jest.runAllTimers();

    expect(next).toBeCalledTimes(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(fragmentCallback).toBeCalledTimes(1);
    next.mockClear();
    fragmentCallback.mockClear();

    dataSource.complete();

    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(0);
    expect(fragmentCallback).toBeCalledTimes(0);

    // The subscription affecting the query should no longer be in flight
    // since the network completed without incremental payloads
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });

  it('calls error() if root network request errors before deferred payload resolves', () => {
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            __typename: 'Comment',
          },
        },
      },
    });
    jest.runAllTimers();

    expect(next).toBeCalledTimes(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(fragmentCallback).toBeCalledTimes(1);
    next.mockClear();
    fragmentCallback.mockClear();

    const err = new Error('Oops');
    dataSource.error(err);

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe(err);
    expect(next).toBeCalledTimes(0);
    expect(fragmentCallback).toBeCalledTimes(0);

    // The subscription affecting the query should no longer be in flight
    // since network errored without incremental payloads
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });
});
