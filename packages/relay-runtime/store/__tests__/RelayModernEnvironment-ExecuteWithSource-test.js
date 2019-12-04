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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('executeWithSource() with Observable network', () => {
  let callbacks;
  let complete;
  let environment;
  let error;
  let fetch;
  let fetchSource;
  let fetchSourceMock;
  let next;
  let operation;
  let query;
  let source;
  let store;
  let subject;
  let variables;

  beforeEach(() => {
    jest.resetModules();

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
    fetchSourceMock = jest.fn(sink =>
      fetch(
        operation.request.node.params,
        operation.request.variables,
      ).subscribe(sink),
    );
    fetchSource = RelayObservable.create(fetchSourceMock);
  });

  it('subscribes to source', () => {
    environment
      .executeWithSource({operation, source: fetchSource})
      .subscribe(callbacks);
    expect(fetchSourceMock.mock.calls.length).toBe(1);
  });

  it('calls next() when payloads return', () => {
    environment
      .executeWithSource({operation, source: fetchSource})
      .subscribe(callbacks);
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

  it('calls complete() when the network request completes', () => {
    environment
      .executeWithSource({operation, source: fetchSource})
      .subscribe(callbacks);
    subject.complete();
    expect(complete.mock.calls.length).toBe(1);
    expect(error).not.toBeCalled();
    expect(next).not.toBeCalled();
  });

  it('calls error() when the network has an error', () => {
    environment
      .executeWithSource({operation, source: fetchSource})
      .subscribe(callbacks);
    const e = new Error('wtf');
    subject.error(e);
    jest.runAllTimers();

    expect(error).toBeCalledWith(e);
    expect(complete).not.toBeCalled();
    expect(next.mock.calls.length).toBe(0);
  });

  it('calls next() and publishes payloads to the store', () => {
    const selector = createReaderSelector(
      query.fragment,
      ROOT_ID,
      variables,
      operation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment
      .executeWithSource({operation, source: fetchSource})
      .subscribe(callbacks);
    const payload = {
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
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
