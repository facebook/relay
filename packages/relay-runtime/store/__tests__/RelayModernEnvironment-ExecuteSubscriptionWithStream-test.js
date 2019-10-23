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

describe('executeSubscrption() with @stream', () => {
  let callbacks;
  let feedbackFragment;
  let feedbackID;
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
  let feedbackQuery;
  let queryOperation;
  let source;
  let store;
  let variables;
  let queryVariables;

  beforeEach(() => {
    jest.resetModules();
    feedbackID = '1';

    ({
      FeedbackFragment: feedbackFragment,
      FeedbackQuery: feedbackQuery,
      CommentCreateSubscription: subscription,
    } = generateAndCompile(`
        subscription CommentCreateSubscription($input: CommentCreateSubscriptionInput!) {
          commentCreateSubscribe(input: $input) {
            feedback {
              ...FeedbackFragment
            }
          }
        }

        fragment FeedbackFragment on Feedback {
          id
          actors @stream(label: "actors", initial_count: 0) {
            name @__clientField(handle: "name_handler")
          }
        }

        # keep in sync with above
        fragment ActorFragment on Actor {
          name @__clientField(handle: "name_handler")
        }

        query FeedbackQuery($id: ID!) {
          node(id: $id) {
            id
            ...FeedbackFragment
          }
        }
      `));
    variables = {
      input: {
        clientMutationId: '0',
        feedbackId: feedbackID,
      },
    };
    queryVariables = {
      id: feedbackID,
    };
    operation = createOperationDescriptor(subscription, variables);
    queryOperation = createOperationDescriptor(feedbackQuery, queryVariables);

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
      feedbackFragment,
      feedbackID,
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
          feedback: {
            id: feedbackID,
            __typename: 'Feedback',
            actors: [],
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
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(fragmentSnapshot.data).toEqual({
      id: feedbackID,
      actors: [],
    });

    // The subscription should be marked as in flight and affecting the
    // query owner now
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).not.toBe(null);
  });

  it('processes streamed payloads', () => {
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        commentCreateSubscribe: {
          feedback: {
            id: feedbackID,
            __typename: 'Feedback',
            actors: [],
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
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['commentCreateSubscribe', 'feedback', 'actors', 0],
    });
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(fragmentCallback).toBeCalledTimes(1);
    const fragmentSnapshot = fragmentCallback.mock.calls[0][0];
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(fragmentSnapshot.data).toEqual({
      id: feedbackID,
      actors: [
        {
          name: 'ALICE',
        },
      ],
    });

    // The subscription affecting the query should still be in flight since
    // we are still streaming
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).not.toBe(null);

    dataSource.next({
      data: {
        __typename: 'User',
        id: '3',
        name: 'Bob',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['commentCreateSubscribe', 'feedback', 'actors', 1],
      extensions: {
        is_final: true,
      },
    });
    expect(next).toBeCalledTimes(2);
    expect(fragmentCallback).toBeCalledTimes(2);
    const fragmentSnapshot2 = fragmentCallback.mock.calls[1][0];
    expect(fragmentSnapshot2.isMissingData).toBe(false);
    expect(fragmentSnapshot2.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);

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
          feedback: {
            id: feedbackID,
            __typename: 'Feedback',
            actors: [],
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
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['commentCreateSubscribe', 'feedback', 'actors', 0],
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
          feedback: {
            id: feedbackID,
            __typename: 'Feedback',
            actors: [],
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
    // since all incremental payloads have been resolved
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
          feedback: {
            id: feedbackID,
            __typename: 'Feedback',
            actors: [],
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
    // since all incremental payloads have been resolved
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });
});
