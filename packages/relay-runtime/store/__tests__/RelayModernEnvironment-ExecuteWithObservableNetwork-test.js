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

describe('execute() with Observable network', () => {
  let callbacks;
  let complete;
  let environment;
  let error;
  let fetch;
  let next;
  let operation;
  let query;
  let source;
  let store;
  let subject;
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
    fetch = jest.fn((_query, _variables, _cacheConfig) =>
      RelayObservable.create(sink => {
        subject = sink;
      }),
    );
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create((fetch: $FlowFixMe)),
      store,
    });
  });

  it('fetches queries', () => {
    environment.execute({operation}).subscribe(callbacks);
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][0]).toEqual(query.params);
    expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
    expect(fetch.mock.calls[0][2]).toEqual({});
  });

  it('fetches queries with force:true', () => {
    const cacheConfig = {force: true};
    environment.execute({cacheConfig, operation}).subscribe(callbacks);
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][0]).toEqual(query.params);
    expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
    expect(fetch.mock.calls[0][2]).toBe(cacheConfig);
  });

  it('calls next() when payloads return', () => {
    environment.execute({operation}).subscribe(callbacks);
    subject.next({
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    });
    jest.runAllTimers();
    expect(next.mock.calls.length).toBe(1);
    subject.next({
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joseph',
        },
      },
    });
    jest.runAllTimers();
    expect(next.mock.calls.length).toBe(2);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
  });

  it('calls next() and runs updater when payloads return', () => {
    const updater = jest.fn();
    environment.execute({operation, updater}).subscribe(callbacks);
    subject.next({
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    });
    jest.runAllTimers();
    expect(next.mock.calls.length).toBe(1);
    subject.next({
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joseph',
        },
      },
    });
    jest.runAllTimers();
    expect(next.mock.calls.length).toBe(2);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(updater).toBeCalled();
  });

  it('calls complete() when the network request completes', () => {
    environment.execute({operation}).subscribe(callbacks);
    subject.complete();
    expect(complete.mock.calls.length).toBe(1);
    expect(error).not.toBeCalled();
    expect(next).not.toBeCalled();
  });

  it('calls error() when the batch has an error', () => {
    environment.execute({operation}).subscribe(callbacks);
    const e = new Error('wtf');
    subject.error(e);
    jest.runAllTimers();

    expect(error).toBeCalledWith(e);
    expect(complete).not.toBeCalled();
    expect(next.mock.calls.length).toBe(0);
  });

  it('calls next() and publishes payloads to the store', () => {
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
      errors: undefined,
    };
    subject.next(payload);
    jest.runAllTimers();

    expect(next.mock.calls.length).toBe(1);
    expect(next).toBeCalledWith(payload);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Joe',
      },
    });
  });
});
