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

const RelayNetwork = require('../../network/RelayNetwork');
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

describe('execute() with Promise network', () => {
  let callbacks;
  let complete;
  let deferred;
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
      query RelayModernEnvironmentExecuteWithPromiseNetworkTestActorQuery(
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
    fetch = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          deferred = {resolve, reject};
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
    operation = createOperationDescriptor(
      query,
      {
        ...variables,
        foo: 'bar', // should be filtered from network fetch
      },
      cacheConfig,
    );
    environment.execute({operation}).subscribe(callbacks);
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][0]).toEqual(query.params);
    expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
    expect(fetch.mock.calls[0][2]).toBe(cacheConfig);
  });

  it('calls complete() when the batch completes', () => {
    environment.execute({operation}).subscribe(callbacks);
    deferred.resolve({
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    });
    jest.runAllTimers();
    expect(complete.mock.calls.length).toBe(1);
    expect(next.mock.calls.length).toBe(1);
    expect(error).not.toBeCalled();
  });

  it('calls error() when the batch has an error', () => {
    environment.execute({operation}).subscribe(callbacks);
    const e = new Error('wtf');
    deferred.reject(e);
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
    deferred.resolve(payload);
    jest.runAllTimers();

    expect(next.mock.calls.length).toBe(1);
    expect(next).toBeCalledWith(payload);
    expect(complete).toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Joe',
      },
    });
  });
});
