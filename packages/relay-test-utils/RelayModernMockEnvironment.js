/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

'use strict';

/* global jest */

const areEqual = require('areEqual');
const invariant = require('invariant');

const {
  RecordSource,
  Store,
  QueryResponseCache,
  Observable,
  Environment,
  Network,
} = require('relay-runtime');

import type {HandlerProvider} from 'relay-runtime/handlers/RelayDefaultHandlerProvider';
import type {Sink} from 'relay-runtime/network/RelayObservable';
import type {MissingFieldHandler} from 'relay-runtime/store/RelayStoreTypes';
import type {
  RequestParameters,
  Variables,
  CacheConfig,
  ConcreteRequest,
  GraphQLResponse,
  IEnvironment,
} from 'relay-runtime';

type PendingRequest = {|
  +request: RequestParameters,
  +variables: Variables,
  +cacheConfig: CacheConfig,
  +sink: Sink<GraphQLResponse>,
|};

const MAX_SIZE = 10;
const MAX_TTL = 5 * 60 * 1000; // 5 min

function mockInstanceMethod(object: $FlowFixMe, key: string) {
  object[key] = jest.fn(object[key].bind(object));
}

function mockDisposableMethod(object: $FlowFixMe, key: string) {
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

function mockObservableMethod(object: $FlowFixMe, key: string) {
  const fn = object[key].bind(object);
  object[key] = jest.fn((...args) =>
    fn(...args).do({
      start: subscription => {
        object[key].mock.subscriptions.push(subscription);
      },
    }),
  );
  object[key].mock.subscriptions = [];
  const mockClear = object[key].mockClear.bind(object[key]);
  object[key].mockClear = () => {
    mockClear();
    object[key].mock.subscriptions = [];
  };
}

interface MockEnvironment {
  +mock: {|
    +cachePayload: (
      request: ConcreteRequest,
      variables: Variables,
      payload: GraphQLResponse,
    ) => void,
    +clearCache: () => void,
    +isLoading: (
      request: ConcreteRequest,
      variables: Variables,
      cacheConfig?: CacheConfig,
    ) => boolean,
    +reject: (request: ConcreteRequest, error: Error | string) => void,
    +nextValue: (request: ConcreteRequest, payload: GraphQLResponse) => void,
    +complete: (request: ConcreteRequest) => void,
    +resolve: (request: ConcreteRequest, payload: GraphQLResponse) => void,
  |};
  +mockClear: () => void;
}

interface RelayMockEnvironment extends MockEnvironment, IEnvironment {}

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
 * - `isLoading(query, variables): boolean`: Determine whether the given query
 *   is currently being loaded (not yet rejected/resolved).
 * - `reject(query, error: Error): void`: Reject a query that has been fetched
 *   by the environment.
 * - `resolve(query, payload: PayloadData): void`: Resolve a query that has been
 *   fetched by the environment.
 */
function createMockEnvironment(options?: {|
  +handlerProvider?: HandlerProvider,
  +missingFieldHandlers?: $ReadOnlyArray<MissingFieldHandler>,
|}): RelayMockEnvironment {
  const handlerProvider = options?.handlerProvider;
  const missingFieldHandlers = options?.missingFieldHandlers;
  const source = new RecordSource();
  const store = new Store(source);
  const cache = new QueryResponseCache({
    size: MAX_SIZE,
    ttl: MAX_TTL,
  });

  let pendingRequests: $ReadOnlyArray<PendingRequest> = [];
  // Mock the network layer
  const execute = (
    request: RequestParameters,
    variables: Variables,
    cacheConfig: CacheConfig,
  ) => {
    const {id, text} = request;
    const cacheID = id ?? text;

    let cachedPayload = null;
    if (
      (cacheConfig?.force == null || cacheConfig?.force === false) &&
      cacheID != null
    ) {
      cachedPayload = cache.get(cacheID, variables);
    }
    if (cachedPayload !== null) {
      return Observable.from(cachedPayload);
    }

    return Observable.create(sink => {
      const nextRequest = {request, variables, cacheConfig, sink};
      pendingRequests = pendingRequests.concat([nextRequest]);

      return () => {
        pendingRequests = pendingRequests.filter(
          pending => !areEqual(pending, nextRequest),
        );
      };
    });
  };

  // The same request may be made by multiple query renderers
  function getRequests(
    request: ConcreteRequest,
  ): $ReadOnlyArray<PendingRequest> {
    const foundRequests = pendingRequests.filter(pending =>
      areEqual(pending.request, request.params),
    );
    invariant(
      foundRequests.length,
      'MockEnvironment: Cannot respond to request, it has not been requested yet.',
    );
    foundRequests.forEach(foundRequest => {
      invariant(
        foundRequest.sink,
        'MockEnvironment: Cannot respond to `%s`, it has not been requested yet.',
        request.params.name,
      );
    });
    return foundRequests;
  }

  function ensureValidPayload(payload: GraphQLResponse) {
    invariant(
      typeof payload === 'object' &&
        payload !== null &&
        payload.hasOwnProperty('data'),
      'MockEnvironment(): Expected payload to be an object with a `data` key.',
    );
    return payload;
  }

  const cachePayload = (
    request: ConcreteRequest,
    variables: Variables,
    payload: GraphQLResponse,
  ) => {
    const {id, text} = request.params;
    const cacheID = id ?? text;
    invariant(cacheID != null, 'CacheID should not be null');
    cache.set(cacheID, variables, payload);
  };

  const clearCache = (): void => {
    cache.clear();
  };

  // Helper to determine if a given query/variables pair is pending
  const isLoading = (
    request: ConcreteRequest,
    variables: Variables,
    cacheConfig?: CacheConfig = {},
  ): boolean => {
    return pendingRequests.some(
      pending =>
        areEqual(pending.request, request.params) &&
        areEqual(pending.variables, variables) &&
        areEqual(pending.cacheConfig, cacheConfig),
    );
  };

  // Helpers to reject or resolve the payload for an individual request.
  const reject = (request: ConcreteRequest, error: Error | string): void => {
    const rejectError = typeof error === 'string' ? new Error(error) : error;
    getRequests(request).forEach(foundRequest => {
      const {sink} = foundRequest;
      invariant(sink !== null, 'Sink should be defined.');
      sink.error(rejectError);
    });
  };

  const nextValue = (
    request: ConcreteRequest,
    payload: GraphQLResponse,
  ): void => {
    getRequests(request).forEach(foundRequest => {
      const {sink} = foundRequest;
      invariant(sink !== null, 'Sink should be defined.');
      sink.next(ensureValidPayload(payload));
    });
  };

  const complete = (request: ConcreteRequest): void => {
    getRequests(request).forEach(foundRequest => {
      const {sink} = foundRequest;
      invariant(sink !== null, 'Sink should be defined.');
      sink.complete();
    });
  };

  const resolve = (
    request: ConcreteRequest,
    payload: GraphQLResponse,
  ): void => {
    getRequests(request).forEach(foundRequest => {
      const {sink} = foundRequest;
      invariant(sink !== null, 'Sink should be defined.');
      sink.next(ensureValidPayload(payload));
      sink.complete();
    });
  };

  // $FlowExpectedError
  const environment: RelayMockEnvironment = new Environment({
    configName: 'RelayModernMockEnvironment',
    handlerProvider,
    missingFieldHandlers,
    network: Network.create(execute, execute),
    store,
  });

  // Mock all the functions with their original behavior
  mockDisposableMethod(environment, 'applyUpdate');
  mockInstanceMethod(environment, 'commitPayload');
  mockInstanceMethod(environment, 'getStore');
  mockInstanceMethod(environment, 'lookup');
  mockInstanceMethod(environment, 'check');
  mockDisposableMethod(environment, 'subscribe');
  mockDisposableMethod(environment, 'retain');
  mockObservableMethod(environment, 'execute');
  mockObservableMethod(environment, 'executeMutation');

  mockInstanceMethod(store, 'getSource');
  mockInstanceMethod(store, 'lookup');
  mockInstanceMethod(store, 'notify');
  mockInstanceMethod(store, 'publish');
  mockDisposableMethod(store, 'retain');
  mockDisposableMethod(store, 'subscribe');

  // $FlowExpectedError
  environment.mock = {
    cachePayload,
    clearCache,
    isLoading,
    reject,
    resolve,
    nextValue,
    complete,
  };

  // $FlowExpectedError
  environment.mockClear = () => {
    environment.applyUpdate.mockClear();
    environment.commitPayload.mockClear();
    environment.getStore.mockClear();
    environment.lookup.mockClear();
    environment.check.mockClear();
    environment.subscribe.mockClear();
    environment.retain.mockClear();
    environment.execute.mockClear();
    environment.executeMutation.mockClear();

    store.getSource.mockClear();
    store.lookup.mockClear();
    store.notify.mockClear();
    store.publish.mockClear();
    store.retain.mockClear();
    store.subscribe.mockClear();

    cache.clear();

    pendingRequests = [];
  };

  return environment;
}

module.exports = {createMockEnvironment};
