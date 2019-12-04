/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

// flowlint ambiguous-object-type:error

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
  CacheConfig,
  ConcreteRequest,
  GraphQLResponse,
  IEnvironment,
  OperationDescriptor,
  OperationLoader,
  OperationTracker,
  RequestParameters,
  Variables,
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

type OperationMockResolver = (
  operation: OperationDescriptor,
) => ?GraphQLResponse | ?Error;

type MockFunctions = {|
  +clearCache: () => void,
  +cachePayload: (
    request: ConcreteRequest | OperationDescriptor,
    variables: Variables,
    payload: GraphQLResponse,
  ) => void,
  +isLoading: (
    request: ConcreteRequest | OperationDescriptor,
    variables: Variables,
    cacheConfig?: CacheConfig,
  ) => boolean,
  +reject: (
    request: ConcreteRequest | OperationDescriptor,
    error: Error | string,
  ) => void,
  +nextValue: (
    request: ConcreteRequest | OperationDescriptor,
    payload: GraphQLResponse,
  ) => void,
  +complete: (request: ConcreteRequest | OperationDescriptor) => void,
  +resolve: (
    request: ConcreteRequest | OperationDescriptor,
    payload: GraphQLResponse,
  ) => void,
  +getAllOperations: () => $ReadOnlyArray<OperationDescriptor>,
  +findOperation: (
    findFn: (operation: OperationDescriptor) => boolean,
  ) => OperationDescriptor,
  +getMostRecentOperation: () => OperationDescriptor,
  +resolveMostRecentOperation: (
    payload:
      | GraphQLResponse
      | ((operation: OperationDescriptor) => GraphQLResponse),
  ) => void,
  +rejectMostRecentOperation: (
    error: Error | ((operation: OperationDescriptor) => Error),
  ) => void,
  +queueOperationResolver: (resolver: OperationMockResolver) => void,
|};

interface MockEnvironment {
  +mock: MockFunctions;
  +mockClear: () => void;
}

export interface RelayMockEnvironment extends MockEnvironment, IEnvironment {}

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
 * - `nextValue(...) - will add payload to the processing, but won't complete
 *   the request ()
 * - getAllOperations() - every time there is an operation created by
 *   the Relay Component (query, mutation, subscription) this operation will be
 *   added to the internal list on the Mock Environment. This method will return
 *   an array of all pending operations in the order they occurred.
 * - findOperation(findFn) - should find operation if findFn(...) return `true`
 *   for it. Otherwise, it will throw.
 * - getMostRecentOperation(...) - should return the most recent operation
 *   generated by Relay Component.
 * - resolveMostRecentOperation(...) - is accepting `GraphQLResponse` or a
 *   callback function that will receive `operation` and should return
 *  `GraphQLResponse`
 * - rejectMostRecentOperation(...) - should reject the most recent operation
 *   with a specific error
 */
function createMockEnvironment(config?: {|
  +handlerProvider?: HandlerProvider,
  +missingFieldHandlers?: $ReadOnlyArray<MissingFieldHandler>,
  +operationTracker?: OperationTracker,
  +operationLoader?: OperationLoader,
  +store?: Store,
  +options?: mixed,
|}): RelayMockEnvironment {
  const store = config?.store ?? new Store(new RecordSource());
  const cache = new QueryResponseCache({
    size: MAX_SIZE,
    ttl: MAX_TTL,
  });

  let pendingRequests: $ReadOnlyArray<PendingRequest> = [];
  let pendingOperations: $ReadOnlyArray<OperationDescriptor> = [];
  let resolversQueue: $ReadOnlyArray<OperationMockResolver> = [];

  const queueOperationResolver = (resolver: OperationMockResolver): void => {
    resolversQueue = resolversQueue.concat([resolver]);
  };

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

    const currentOperation = pendingOperations.find(
      op =>
        op.request.node.params === request &&
        op.request.variables === variables,
    );

    // Handle network responses added by
    if (currentOperation != null && resolversQueue.length > 0) {
      const currentResolver = resolversQueue[0];
      const result = currentResolver(currentOperation);
      if (result != null) {
        resolversQueue = resolversQueue.filter(res => res !== currentResolver);
        pendingOperations = pendingOperations.filter(
          op => op !== currentOperation,
        );
        if (result instanceof Error) {
          return Observable.create(sink => {
            sink.error(result);
          });
        } else {
          return Observable.from(result);
        }
      }
    }

    return Observable.create(sink => {
      const nextRequest = {request, variables, cacheConfig, sink};
      pendingRequests = pendingRequests.concat([nextRequest]);

      return () => {
        pendingRequests = pendingRequests.filter(
          pending => !areEqual(pending, nextRequest),
        );
        pendingOperations = pendingOperations.filter(
          op => op !== currentOperation,
        );
      };
    });
  };

  function getConcreteRequest(
    input: ConcreteRequest | OperationDescriptor,
  ): ConcreteRequest {
    if (input.kind === 'Request') {
      const request: ConcreteRequest = (input: $FlowFixMe);
      return request;
    } else {
      const operationDescriptor: OperationDescriptor = (input: $FlowFixMe);
      invariant(
        pendingOperations.includes(operationDescriptor),
        'RelayModernMockEnvironment: Operation "%s" was not found in the list of pending operations',
        operationDescriptor.request.node.operation.name,
      );
      return operationDescriptor.request.node;
    }
  }

  // The same request may be made by multiple query renderers
  function getRequests(
    input: ConcreteRequest | OperationDescriptor,
  ): $ReadOnlyArray<PendingRequest> {
    let concreteRequest: ConcreteRequest;
    let operationDescriptor: OperationDescriptor;
    if (input.kind === 'Request') {
      concreteRequest = (input: $FlowFixMe);
    } else {
      operationDescriptor = (input: $FlowFixMe);
      concreteRequest = operationDescriptor.request.node;
    }
    const foundRequests = pendingRequests.filter(pending => {
      if (!areEqual(pending.request, concreteRequest.params)) {
        return false;
      }
      if (operationDescriptor) {
        // If we handling `OperationDescriptor` we also need to check variables
        // and return only pending request with equal variables
        return areEqual(
          operationDescriptor.request.variables,
          pending.variables,
        );
      } else {
        // In the case we received `ConcreteRequest` as input we will return
        // all pending request, even if they have different variables
        return true;
      }
    });
    invariant(
      foundRequests.length,
      'MockEnvironment: Cannot respond to request, it has not been requested yet.',
    );
    foundRequests.forEach(foundRequest => {
      invariant(
        foundRequest.sink,
        'MockEnvironment: Cannot respond to `%s`, it has not been requested yet.',
        concreteRequest.params.name,
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
    request: ConcreteRequest | OperationDescriptor,
    variables: Variables,
    payload: GraphQLResponse,
  ): void => {
    const {id, text} = getConcreteRequest(request).params;
    const cacheID = id ?? text;
    invariant(cacheID != null, 'CacheID should not be null');
    cache.set(cacheID, variables, payload);
  };

  const clearCache = (): void => {
    cache.clear();
  };

  // Helper to determine if a given query/variables pair is pending
  const isLoading = (
    request: ConcreteRequest | OperationDescriptor,
    variables: Variables,
    cacheConfig?: CacheConfig,
  ): boolean => {
    return pendingRequests.some(
      pending =>
        areEqual(pending.request, getConcreteRequest(request).params) &&
        areEqual(pending.variables, variables) &&
        areEqual(pending.cacheConfig, cacheConfig ?? {}),
    );
  };

  // Helpers to reject or resolve the payload for an individual request.
  const reject = (
    request: ConcreteRequest | OperationDescriptor,
    error: Error | string,
  ): void => {
    const rejectError = typeof error === 'string' ? new Error(error) : error;
    getRequests(request).forEach(foundRequest => {
      const {sink} = foundRequest;
      invariant(sink !== null, 'Sink should be defined.');
      sink.error(rejectError);
    });
  };

  const nextValue = (
    request: ConcreteRequest | OperationDescriptor,
    payload: GraphQLResponse,
  ): void => {
    getRequests(request).forEach(foundRequest => {
      const {sink} = foundRequest;
      invariant(sink !== null, 'Sink should be defined.');
      sink.next(ensureValidPayload(payload));
    });
  };

  const complete = (request: ConcreteRequest | OperationDescriptor): void => {
    getRequests(request).forEach(foundRequest => {
      const {sink} = foundRequest;
      invariant(sink !== null, 'Sink should be defined.');
      sink.complete();
    });
  };

  const resolve = (
    request: ConcreteRequest | OperationDescriptor,
    payload: GraphQLResponse,
  ): void => {
    getRequests(request).forEach(foundRequest => {
      const {sink} = foundRequest;
      invariant(sink !== null, 'Sink should be defined.');
      sink.next(ensureValidPayload(payload));
      sink.complete();
    });
  };

  const getMostRecentOperation = (): OperationDescriptor => {
    const mostRecentOperation = pendingOperations[pendingOperations.length - 1];
    invariant(
      mostRecentOperation != null,
      'RelayModernMockEnvironment: There are no pending operations in the list',
    );
    return mostRecentOperation;
  };

  const findOperation = (
    findFn: (operation: OperationDescriptor) => boolean,
  ): OperationDescriptor => {
    const pendingOperation = pendingOperations.find(findFn);
    invariant(
      pendingOperation != null,
      'RelayModernMockEnvironment: Operation was not found in the list of pending operations',
    );
    return pendingOperation;
  };

  // $FlowExpectedError
  const environment: RelayMockEnvironment = new Environment({
    configName: 'RelayModernMockEnvironment',
    loggerProvider: {
      getLogger() {
        return null;
      },
    },
    network: Network.create(execute, execute),
    store,
    ...config,
  });

  const createExecuteProxy = (
    env: IEnvironment,
    fn:
      | $PropertyType<IEnvironment, 'execute'>
      | $PropertyType<IEnvironment, 'executeMutation'>,
  ) => {
    return (...argumentsList) => {
      const [{operation}] = argumentsList;
      pendingOperations = pendingOperations.concat([operation]);
      return fn.apply(env, argumentsList);
    };
  };

  // $FlowExpectedError
  environment.execute = createExecuteProxy(environment, environment.execute);
  // $FlowExpectedError
  environment.executeMutation = createExecuteProxy(
    environment,
    environment.executeMutation,
  );

  if (global?.process?.env?.NODE_ENV === 'test') {
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
  }

  const mock: MockFunctions = {
    cachePayload,
    clearCache,
    isLoading,
    reject,
    resolve,
    nextValue,
    complete,
    getMostRecentOperation,
    resolveMostRecentOperation(payload): void {
      const operation = getMostRecentOperation();
      const data = typeof payload === 'function' ? payload(operation) : payload;
      return resolve(operation, data);
    },
    rejectMostRecentOperation(error): void {
      const operation = getMostRecentOperation();
      const rejector = typeof error === 'function' ? error(operation) : error;
      return reject(operation, rejector);
    },
    findOperation,
    getAllOperations() {
      return pendingOperations;
    },
    queueOperationResolver,
  };

  // $FlowExpectedError
  environment.mock = mock;

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
    pendingOperations = [];
    pendingRequests = [];
  };

  return environment;
}

module.exports = {createMockEnvironment};
