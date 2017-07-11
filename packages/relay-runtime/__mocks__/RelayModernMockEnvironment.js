/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayModernEnvironment = require('RelayModernEnvironment');
const RelayModernTestUtils = require('RelayModernTestUtils');
const RelayNetwork = require('RelayNetwork');
const RelayRecordSourceInspector = require('RelayRecordSourceInspector');
const RelayTestSchema = require('RelayTestSchema');

const areEqual = require('areEqual');
const invariant = require('invariant');

function mockInstanceMethod(object, key) {
  object[key] = jest.fn(object[key].bind(object));
}

function mockDisposableMethod(object, key) {
  const fn = object[key].bind(object);
  object[key] = jest.fn((...args) => {
    const disposable = fn(...args);
    const dispose = jest.fn(() => disposable.dispose());
    object[key].mock.dispose = dispose;
    return {dispose};
  });
  const mockClear = object[key].mockClear.bind(object[key]);
  object[key].mockClear = () => {
    mockClear();
    object[key].mock.dispose = null;
  };
}

/**
 * Creates an instance of the `Environment` interface defined in
 * RelayStoreTypes with a mocked network layer.
 *
 * Usage:
 *
 * ```
 * const environment = RelayModernMockEnvironment.createMockEnvironment();
 * ```
 *
 * Mock API:
 *
 * Helpers are available as `environment.mock.<helper>`:
 *
 * - `compile(text: string): {[queryName]: Query}`: Create a query.
 * - `isLoading(query, variables): boolean`: Determine whether the given query
 *   is currently being loaded (not yet rejected/resolved).
 * - `reject(query, error: Error): void`: Reject a query that has been fetched
 *   by the environment.
 * - `resolve(query, payload: PayloadData): void`: Resolve a query that has been
 *   fetched by the environment.
 * - `storeInspector: RelayRecordSourceInspector`: An instance of a store
 *   inspector that allows introspecting the state of the store at any time.
 */
function createMockEnvironment(options: {
  schema?: ?GraphQLSchema,
  handlerProvider?: ?HandlerProvider,
}) {
  const schema = options && options.schema;
  const handlerProvider = options && options.handlerProvider;
  const source = new RelayInMemoryRecordSource();
  const store = new RelayMarkSweepStore(source);

  // Mock the network layer
  let pendingFetches = [];
  const fetch = (query, variables, cacheConfig) => {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    pendingFetches.push({
      cacheConfig,
      promise,
      resolve,
      reject,
      query,
      variables,
    });
    return promise;
  };

  let validSubscriptions = [];
  const subscribe = (query, variables, cacheConfig, observer) => {
    const currentSubscription = {
      query,
      variables,
      cacheConfig,
      observer,
    };
    validSubscriptions.push(currentSubscription);
    return {
      dispose: () => {
        validSubscriptions = validSubscriptions.filter(
          subscription => subscription !== currentSubscription,
        );
      },
    };
  };

  if (!schema) {
    global.__RELAYOSS__ = true;
  }

  // Helper to compile a query with the given schema (or the test schema by
  // default).
  const compile = text => {
    return RelayModernTestUtils.generateAndCompile(
      text,
      schema || RelayTestSchema,
    );
  };

  // Helper to determine if a given query/variables pair is pending
  const isLoading = (query, variables, cacheConfig) => {
    return pendingFetches.some(
      pending =>
        pending.query === query &&
        areEqual(pending.variables, variables) &&
        areEqual(pending.cacheConfig, cacheConfig),
    );
  };

  // Helpers to reject or resolve the payload for an individual query
  const reject = (query, error) => {
    const pendingFetch = pendingFetches.find(
      pending => pending.query === query,
    );
    invariant(
      pendingFetch,
      'MockEnvironment#reject(): Cannot reject query `%s`, it has not been fetched yet.',
      query.name,
    );
    if (typeof error === 'string') {
      error = new Error(error);
    }
    pendingFetches = pendingFetches.filter(pending => pending !== pendingFetch);
    pendingFetch.reject(error);
    jest.runOnlyPendingTimers();
    return new Promise(resolve => {
      pendingFetch.promise.catch(() => {
        // setImmediate so all handlers for pendingFetch are called before
        // tests are run
        setImmediate(resolve);
      });
    });
  };
  const resolve = (query, payload) => {
    invariant(
      typeof payload === 'object' &&
        payload !== null &&
        payload.hasOwnProperty('data'),
      'MockEnvironment#resolve(): Expected payload to be an object with a `data` key.',
    );
    const pendingFetch = pendingFetches.find(
      pending => pending.query === query,
    );
    invariant(
      pendingFetch,
      'MockEnvironment#resolve(): Cannot resolve query `%s`, it has not been fetched yet.',
      query.name,
    );
    pendingFetches = pendingFetches.filter(pending => pending !== pendingFetch);
    pendingFetch.resolve(payload);
    jest.runOnlyPendingTimers();
    return new Promise(_resolve => {
      pendingFetch.promise.then(() => {
        // setImmediate so all handlers for pendingFetch are called before
        // tests are run
        setImmediate(_resolve);
      });
    });
  };

  const resolveSubscriptionPayload = (query, payload) => {
    invariant(
      typeof payload === 'object' &&
        payload !== null &&
        payload.hasOwnProperty('data'),
      'MockEnvironment#resolveSubscriptionPayload(): Expected payload to be an object with a `data` key.',
    );
    const validSubscription = validSubscriptions.find(
      subscription => subscription.query === query,
    );
    invariant(
      validSubscription,
      'MockEnvironment#resolveSubscriptionPayload(): Cannot resolve query `%s`, it has not been ' +
        'fetched yet.',
    );
    validSubscriptions = validSubscriptions.filter(
      subscription => subscription !== validSubscription,
    );
    const {observer} = validSubscription;
    if (observer) {
      observer.onNext && observer.onNext(payload);
    }
    jest.runOnlyPendingTimers();
  };

  // Initialize a store debugger to help resolve test issues
  const storeInspector = new RelayRecordSourceInspector(source);

  // Mock instance
  const environment = new RelayModernEnvironment({
    handlerProvider,
    network: RelayNetwork.create(fetch, subscribe),
    store,
  });
  // Mock all the functions with their original behavior
  mockDisposableMethod(environment, 'applyUpdate');
  mockInstanceMethod(environment, 'commitPayload');
  mockInstanceMethod(environment, 'getStore');
  mockInstanceMethod(environment, 'lookup');
  mockDisposableMethod(environment, 'retain');
  mockDisposableMethod(environment, 'sendMutation');
  mockDisposableMethod(environment, 'sendQuery');
  mockDisposableMethod(environment, 'streamQuery');
  mockDisposableMethod(environment, 'subscribe');
  mockInstanceMethod(store, 'getSource');
  mockInstanceMethod(store, 'lookup');
  mockInstanceMethod(store, 'notify');
  mockInstanceMethod(store, 'publish');
  mockInstanceMethod(store, 'resolve');
  mockDisposableMethod(store, 'retain');
  mockDisposableMethod(store, 'subscribe');

  environment.mock = {
    compile,
    isLoading,
    reject,
    resolve,
    storeInspector,
    resolveSubscriptionPayload,
  };

  environment.mockClear = () => {
    environment.applyUpdate.mockClear();
    environment.commitPayload.mockClear();
    environment.getStore.mockClear();
    environment.lookup.mockClear();
    environment.retain.mockClear();
    environment.sendMutation.mockClear();
    environment.sendQuery.mockClear();
    environment.streamQuery.mockClear();
    environment.subscribe.mockClear();

    store.getSource.mockClear();
    store.lookup.mockClear();
    store.notify.mockClear();
    store.publish.mockClear();
    store.resolve.mockClear();
    store.retain.mockClear();
    store.subscribe.mockClear();

    pendingFetches.length = 0;
  };

  return environment;
}

module.exports = {createMockEnvironment};
