/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {loadQuery} = require('../loadQuery');
const {
  Network,
  Observable,
  PreloadableQueryRegistry,
} = require('relay-runtime');
const {
  generateAndCompile,
  createMockEnvironment,
} = require('relay-test-utils-internal');

import type {ConcreteRequest} from 'relay-runtime';

const query: ConcreteRequest = generateAndCompile(`
  query TestQuery($id: ID!) {
    node(id: $id) {
      id
    }
  }
`).TestQuery;

// Only queries with an ID are preloadable
const ID = '12345';
(query.params: $FlowFixMe).id = ID;

const preloadableConcreteRequest = {
  kind: 'PreloadableConcreteRequest',
  params: query.params,
};

const response = {
  data: {
    node: {
      __typename: 'User',
      id: '4',
    },
  },
  extensions: {
    is_final: true,
  },
};

const variables = {id: '4'};

let sink;
let fetch;
let environment;

let executeUnsubscribe;
let executeObservable;

let disposeEnvironmentRetain;

let resolvedModule;
let mockAvailability;
let disposeOnloadCallback;
let executeOnloadCallback;

beforeEach(() => {
  fetch = jest.fn((_query, _variables, _cacheConfig) => {
    return Observable.create(_sink => {
      sink = _sink;
    });
  });
  environment = createMockEnvironment({network: Network.create(fetch)});

  jest.clearAllTimers();
  jest.useFakeTimers();
  resolvedModule = query;
  mockAvailability = {
    status: 'available',
    fetchTime: Date.now(),
  };

  jest
    .spyOn(PreloadableQueryRegistry, 'get')
    .mockImplementation(() => resolvedModule);

  jest
    .spyOn(PreloadableQueryRegistry, 'onLoad')
    .mockImplementation((key, cb) => {
      executeOnloadCallback = cb;
      disposeOnloadCallback = jest.fn();
      return {dispose: disposeOnloadCallback};
    });

  const originalExecuteWithSource = environment.executeWithSource.getMockImplementation();
  executeObservable = undefined;
  executeUnsubscribe = undefined;

  jest
    .spyOn(environment, 'executeWithSource')
    .mockImplementation((...params) => {
      executeObservable = originalExecuteWithSource(...params);
      const originalSubscribe = executeObservable.subscribe.bind(
        executeObservable,
      );
      jest
        .spyOn(executeObservable, 'subscribe')
        .mockImplementation(subscriptionCallbacks => {
          originalSubscribe(subscriptionCallbacks);
          executeUnsubscribe = jest.fn();
          return {unsubscribe: executeUnsubscribe};
        });
      return executeObservable;
    });

  disposeEnvironmentRetain = undefined;
  jest.spyOn(environment, 'retain').mockImplementation(() => {
    disposeEnvironmentRetain = jest.fn();
    return {
      dispose: disposeEnvironmentRetain,
    };
  });

  jest.spyOn(environment, 'check').mockImplementation(() => mockAvailability);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('when passed a PreloadableConcreteRequest', () => {
  it('checks whether the query ast is available synchronously', () => {
    loadQuery(environment, preloadableConcreteRequest, variables);
    expect(PreloadableQueryRegistry.get).toHaveBeenCalled();
  });

  describe('when the query AST is available synchronously', () => {
    it('synchronously checks whether the query can be fulfilled by the store', () => {
      loadQuery(environment, preloadableConcreteRequest, variables);
      expect(environment.check).toHaveBeenCalled();
    });

    describe("with fetchPolicy === 'store-or-network'", () => {
      it('should not call fetch if the query can be fulfilled by the store', () => {
        const {source} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-or-network',
          },
        );
        expect(fetch).not.toHaveBeenCalled();
        expect(source).toEqual(undefined);
      });

      describe('when the query cannot be fulfilled by the store', () => {
        beforeEach(() => {
          mockAvailability = {status: 'missing'};
        });
        it('makes a network request', done => {
          const {source} = loadQuery(
            environment,
            preloadableConcreteRequest,
            variables,
            {
              fetchPolicy: 'store-or-network',
            },
          );
          const nextCallback = jest.fn(() => done());
          if (source) {
            source.subscribe({
              next: nextCallback,
            });
          }
          expect(fetch).toHaveBeenCalled();
          expect(source).toBeDefined();
          expect(environment.executeWithSource).toHaveBeenCalled();
          expect(environment.retain).toHaveBeenCalled();

          PreloadableQueryRegistry.set(ID, query);
          expect(nextCallback).not.toHaveBeenCalled();

          sink.next(response);
          expect(nextCallback).toHaveBeenCalledWith(response);
        });

        it('calling dispose unsubscribes from executeWithSource', () => {
          // This ensures that no data is written to the store
          const preloadedQuery = loadQuery(
            environment,
            preloadableConcreteRequest,
            variables,
            {
              fetchPolicy: 'store-or-network',
            },
          );
          expect(fetch).toHaveBeenCalled();
          expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
          expect(environment.retain).toHaveBeenCalled();
          expect(executeObservable).toBeDefined();
          if (executeObservable != null) {
            expect(executeObservable.subscribe).toHaveBeenCalledTimes(1);
            expect(executeUnsubscribe).toBeDefined();
          }

          expect(preloadedQuery.isDisposed).toBe(false);
          preloadedQuery.dispose();
          expect(preloadedQuery.isDisposed).toBe(true);
          if (executeUnsubscribe != null) {
            expect(executeUnsubscribe).toHaveBeenCalledTimes(1);
            expect(disposeEnvironmentRetain).toHaveBeenCalled();
          }
        });
      });
    });
  });

  describe('when the query AST is unavailable synchronously', () => {
    beforeEach(() => {
      resolvedModule = null;
    });
    it('should make a network request', done => {
      const {source} = loadQuery(
        environment,
        preloadableConcreteRequest,
        variables,
        {
          fetchPolicy: 'store-or-network',
        },
      );
      const nextCallback = jest.fn(() => done());
      if (source) {
        source.subscribe({
          next: nextCallback,
        });
      }
      expect(fetch).toHaveBeenCalled();
      expect(source).toBeDefined();
      expect(environment.executeWithSource).not.toHaveBeenCalled();

      executeOnloadCallback(query);
      expect(environment.executeWithSource).toHaveBeenCalled();
      expect(environment.retain).toHaveBeenCalled();
      expect(nextCallback).not.toHaveBeenCalled();

      sink.next(response);
      expect(nextCallback).toHaveBeenCalledWith(response);
    });

    it('calling dispose after the AST loads unsubscribes from executeWithSource', () => {
      // This ensures that no data is written to the store
      const preloadedQuery = loadQuery(
        environment,
        preloadableConcreteRequest,
        variables,
        {
          fetchPolicy: 'store-or-network',
        },
      );
      expect(fetch).toHaveBeenCalled();

      expect(executeOnloadCallback).toBeDefined();
      executeOnloadCallback(query);

      expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
      expect(environment.retain).toHaveBeenCalled();
      expect(executeObservable).toBeDefined();
      if (executeObservable != null) {
        expect(executeObservable.subscribe).toHaveBeenCalledTimes(1);
        expect(executeUnsubscribe).toBeDefined();
      }

      expect(preloadedQuery.isDisposed).toBe(false);
      preloadedQuery.dispose();
      expect(preloadedQuery.isDisposed).toBe(true);
      if (executeUnsubscribe != null) {
        expect(executeUnsubscribe).toHaveBeenCalledTimes(1);
        expect(disposeEnvironmentRetain).toHaveBeenCalled();
      }
    });

    it('calling dispose before the AST loads clears the onLoad callback', () => {
      const preloadedQuery = loadQuery(
        environment,
        preloadableConcreteRequest,
        variables,
        {
          fetchPolicy: 'store-or-network',
        },
      );
      expect(fetch).toHaveBeenCalled();
      expect(PreloadableQueryRegistry.onLoad).toHaveBeenCalledTimes(1);
      expect(disposeOnloadCallback).toBeDefined();
      expect(disposeOnloadCallback).not.toHaveBeenCalled();

      expect(preloadedQuery.isDisposed).toBe(false);
      preloadedQuery.dispose();
      expect(preloadedQuery.isDisposed).toBe(true);
      if (disposeOnloadCallback != null) {
        expect(disposeOnloadCallback).toHaveBeenCalledTimes(1);
      }
    });

    it('should execute an onError callback if the query AST is not loaded in time and onQueryAstLoadTimeout is passed in', done => {
      const onQueryAstLoadTimeout = jest.fn(() => done());
      const LOAD_QUERY_AST_MAX_TIMEOUT = 15 * 1000;
      loadQuery(environment, preloadableConcreteRequest, variables, {
        onQueryAstLoadTimeout,
      });
      jest.advanceTimersByTime(LOAD_QUERY_AST_MAX_TIMEOUT - 1);
      expect(onQueryAstLoadTimeout).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(onQueryAstLoadTimeout).toHaveBeenCalled();
    });

    it('completes the source if the AST times out', () => {
      const LOAD_QUERY_AST_MAX_TIMEOUT = 15 * 1000;
      const loaded = loadQuery(
        environment,
        preloadableConcreteRequest,
        variables,
      );
      const events = [];
      const source = loaded.source;
      if (source) {
        source.subscribe({
          complete: () => events.push('complete'),
          error: error => events.push('error', error),
          next: payload => events.push('next', payload),
        });
      }
      jest.advanceTimersByTime(LOAD_QUERY_AST_MAX_TIMEOUT - 1);
      expect(events).toEqual([]);
      jest.advanceTimersByTime(1);
      expect(events).toEqual(['complete']);
    });

    it('passes a callback to onLoad that calls executeWithSource', () => {
      loadQuery(environment, preloadableConcreteRequest, variables);
      expect(environment.executeWithSource).not.toHaveBeenCalled();
      executeOnloadCallback(query);
      expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
      expect(environment.retain).toHaveBeenCalled();
    });
  });
});

describe('when passed a query AST', () => {
  it('checks whether the query can be fulfilled by the store synchronously', () => {
    loadQuery(environment, query, variables);
    expect(environment.check).toHaveBeenCalled();
  });
  describe('when the query can be fulfilled by the store', () => {
    it("when fetchPolicy === 'store-or-network', it avoids a network request", () => {
      loadQuery(environment, query, variables, {
        fetchPolicy: 'store-or-network',
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    describe("when fetchPolicy === 'network-only'", () => {
      it('should make a network request', done => {
        const {source} = loadQuery(environment, query, variables, {
          fetchPolicy: 'network-only',
        });
        const nextCallback = jest.fn(() => done());
        if (source) {
          source.subscribe({
            next: nextCallback,
          });
        }
        expect(fetch).toHaveBeenCalled();
        expect(source).toBeDefined();
        expect(environment.executeWithSource).toHaveBeenCalled();
        expect(environment.retain).toHaveBeenCalled();
        expect(nextCallback).not.toHaveBeenCalled();

        sink.next(response);
        expect(nextCallback).toHaveBeenCalledWith(response);
      });

      it('calling dispose unsubscribes from environment.executeWithSource', () => {
        // This ensures that no data is written to the store
        const preloadedQuery = loadQuery(environment, query, variables, {
          fetchPolicy: 'network-only',
        });
        expect(fetch).toHaveBeenCalled();
        expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
        expect(environment.retain).toHaveBeenCalled();
        expect(executeObservable).toBeDefined();
        if (executeObservable != null) {
          expect(executeObservable.subscribe).toHaveBeenCalledTimes(1);
          expect(executeUnsubscribe).toBeDefined();
        }

        expect(preloadedQuery.isDisposed).toBe(false);
        preloadedQuery.dispose();
        expect(preloadedQuery.isDisposed).toBe(true);
        if (executeUnsubscribe != null) {
          expect(executeUnsubscribe).toHaveBeenCalledTimes(1);
          expect(disposeEnvironmentRetain).toHaveBeenCalled();
        }
      });
    });
  });

  describe('when the query cannot be fulfilled from the store', () => {
    beforeEach(() => {
      mockAvailability = {status: 'missing'};
    });

    it('should make a network request', done => {
      const {source} = loadQuery(environment, query, variables);
      const nextCallback = jest.fn(() => done());
      if (source) {
        source.subscribe({
          next: nextCallback,
        });
      }
      expect(fetch).toHaveBeenCalled();
      expect(source).toBeDefined();
      expect(environment.executeWithSource).toHaveBeenCalled();
      expect(environment.retain).toHaveBeenCalled();
      expect(nextCallback).not.toHaveBeenCalled();

      sink.next(response);
      expect(nextCallback).toHaveBeenCalledWith(response);
    });

    it('calling dispose unsubscribes from environment.executeWithSource', () => {
      // This ensures that no data is written to the store
      const preloadedQuery = loadQuery(environment, query, variables);
      expect(fetch).toHaveBeenCalled();
      expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
      expect(environment.retain).toHaveBeenCalled();
      expect(executeObservable).toBeDefined();
      if (executeObservable != null) {
        expect(executeObservable.subscribe).toHaveBeenCalledTimes(1);
        expect(executeUnsubscribe).toBeDefined();
      }

      expect(preloadedQuery.isDisposed).toBe(false);
      preloadedQuery.dispose();
      expect(preloadedQuery.isDisposed).toBe(true);
      if (executeUnsubscribe != null) {
        expect(executeUnsubscribe).toHaveBeenCalledTimes(1);
        expect(disposeEnvironmentRetain).toHaveBeenCalled();
      }
    });
  });
});
