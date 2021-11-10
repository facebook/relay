/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';
import type {
  Variables,
  CacheConfig,
} from 'relay-runtime/util/RelayRuntimeTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {ROOT_ID} = require('../RelayStoreUtils');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('execute() with network that returns optimistic response', () => {
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let next;
  let operation;
  let query;
  let source;
  let store;
  let variables;

  beforeEach(() => {
    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithOptimisticResponseTestActorQuery(
        $fetchSize: Boolean!
      ) {
        me {
          name
          profilePicture(size: 42) @include(if: $fetchSize) {
            uri
          }
        }
      }
    `);
    variables = {fetchSize: false};
    operation = createOperationDescriptor(query, {
      ...variables,
      foo: 'bar', // should be filtered from network fetch
    });

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
    fetch = (
      _query: RequestParameters,
      _variables: Variables,
      _cacheConfig: CacheConfig,
    ) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    };
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  it('calls next() and publishes optimistic payload to the store', () => {
    const selector = createReaderSelector(
      query.fragment,
      ROOT_ID,
      variables,
      operation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    };
    dataSource.next({
      ...payload,
      extensions: {
        isOptimistic: true,
      },
    });
    jest.runAllTimers();

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Joe',
      },
    });
  });

  it('reverts the optimistic payload before applying regular response', () => {
    const selector = createReaderSelector(
      query.fragment,
      ROOT_ID,
      variables,
      operation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    const optimisticResponse = {
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    };

    const realResponse = {
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Jiyue',
        },
      },
    };

    dataSource.next({
      ...optimisticResponse,
      extensions: {
        isOptimistic: true,
      },
    });

    jest.runAllTimers();
    dataSource.next(realResponse);
    jest.runAllTimers();

    expect(next.mock.calls.length).toBe(2);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Joe',
      },
    });
    expect(callback.mock.calls[1][0].data).toEqual({
      me: {
        name: 'Jiyue',
      },
    });
  });

  it('reverts optimistic response on complete.', () => {
    const selector = createReaderSelector(
      query.fragment,
      ROOT_ID,
      variables,
      operation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    };
    dataSource.next({
      ...payload,
      extensions: {
        isOptimistic: true,
      },
    });
    jest.runAllTimers();
    dataSource.complete();

    expect(next.mock.calls.length).toBe(1);
    expect(complete).toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Joe',
      },
    });
    expect(callback.mock.calls[1][0].data).toEqual({me: undefined});
  });

  it('reverts optimistic response on error.', () => {
    const selector = createReaderSelector(
      query.fragment,
      ROOT_ID,
      variables,
      operation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    };
    dataSource.next({
      ...payload,
      extensions: {
        isOptimistic: true,
      },
    });
    jest.runAllTimers();
    const queryError = new Error('fail');
    dataSource.error(queryError);

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe(queryError);
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Joe',
      },
    });
    expect(callback.mock.calls[1][0].data).toEqual({me: undefined});
  });

  it('reverts optimistic response if unsubscribed.', () => {
    const selector = createReaderSelector(
      query.fragment,
      ROOT_ID,
      variables,
      operation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    const subscription = environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    };
    dataSource.next({
      ...payload,
      extensions: {
        isOptimistic: true,
      },
    });
    jest.runAllTimers();
    subscription.unsubscribe();

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Joe',
      },
    });
    expect(callback.mock.calls[1][0].data).toEqual({me: undefined});
  });

  it('calls error() if optimistic response is missing data', () => {
    const selector = createReaderSelector(
      query.fragment,
      ROOT_ID,
      variables,
      operation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    const subscription = environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      errors: [
        {
          message: 'wtf',
          locations: [],
          severity: 'ERROR',
        },
      ],
      extensions: {
        isOptimistic: true,
      },
    });
    jest.runAllTimers();
    subscription.unsubscribe();

    expect(next).toBeCalledTimes(0);
    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0].message).toContain(
      'No data returned for operation `RelayModernEnvironmentExecuteWithOptimisticResponseTestActorQuery`',
    );
    expect(callback).toBeCalledTimes(0);
  });

  it('does fill missing fields from server-sent optimistic response with nulls when treatMissingFieldsAsNull is enabled', () => {
    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2Query {
        me {
          name
          lastName
        }
      }
    `);
    operation = createOperationDescriptor(query, {});

    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
      treatMissingFieldsAsNull: true,
    });

    const selector = createReaderSelector(
      query.fragment,
      ROOT_ID,
      {},
      operation.request,
    );

    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
          // lastName is missing in the response
        },
      },
      extensions: {
        isOptimistic: true,
      },
    });
    jest.runAllTimers();

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Joe',
        // this field becomes null since treatMissingFieldsAsNull is enabled, which affects server-sent optimistic responses
        lastName: null,
      },
    });
    // and thus the snapshot does not have missing data
    expect(callback.mock.calls[0][0].isMissingData).toEqual(false);
  });
});
