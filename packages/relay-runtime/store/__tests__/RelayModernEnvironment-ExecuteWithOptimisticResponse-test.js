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

const {ROOT_ID} = require('../RelayStoreUtils');
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
    jest.resetModules();

    expect.extend(matchers);
    ({ActorQuery: query} = generateAndCompile(`
        query ActorQuery($fetchSize: Boolean!) {
          me {
            name
            profilePicture(size: 42) @include(if: $fetchSize) {
              uri
            }
          }
        }
      `));
    variables = {fetchSize: false};
    operation = createOperationDescriptor(query, {
      ...variables,
      foo: 'bar', // should be filtered from network fetch
    });

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
    fetch = (_query, _variables, _cacheConfig) => {
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
    const selector = {
      dataID: ROOT_ID,
      node: query.fragment,
      variables,
    };
    const snapshot = environment.lookup(selector, operation);
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
    const selector = {
      dataID: ROOT_ID,
      node: query.fragment,
      variables,
    };
    const snapshot = environment.lookup(selector, operation);
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
    const selector = {
      dataID: ROOT_ID,
      node: query.fragment,
      variables,
    };
    const snapshot = environment.lookup(selector, operation);
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
    expect(callback.mock.calls[1][0].data).toEqual(undefined);
  });

  it('reverts optimistic response on error.', () => {
    const selector = {
      dataID: ROOT_ID,
      node: query.fragment,
      variables,
    };
    const snapshot = environment.lookup(selector, operation);
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
    expect(callback.mock.calls[1][0].data).toEqual(undefined);
  });

  it('reverts optimistic response if unsubscribed.', () => {
    const selector = {
      dataID: ROOT_ID,
      node: query.fragment,
      variables,
    };
    const snapshot = environment.lookup(selector, operation);
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
    expect(callback.mock.calls[1][0].data).toEqual(undefined);
  });

  it('calls error() if optimistic response is missing data', () => {
    const selector = {
      dataID: ROOT_ID,
      node: query.fragment,
      variables,
    };
    const snapshot = environment.lookup(selector, operation);
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
      'No data returned for operation `ActorQuery`',
    );
    expect(callback).toBeCalledTimes(0);
  });
});
