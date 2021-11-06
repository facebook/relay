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

import type {ConcreteRequest, GraphQLTaggedNode} from 'relay-runtime';

const {loadQuery, useTrackLoadQueryInRender} = require('../loadQuery');
// Need React require for OSS build
// eslint-disable-next-line no-unused-vars
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  Network,
  Observable,
  PreloadableQueryRegistry,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('loadQuery', () => {
  const q: GraphQLTaggedNode = graphql`
    query loadQueryTestQuery($id: ID!) {
      node(id: $id) {
        id
      }
    }
  `;

  const query: ConcreteRequest = getRequest(q);
  // Only queries with an ID are preloadable
  const ID = '12345';
  (query.params: $FlowFixMe).id = ID;
  (query.params: $FlowFixMe).cacheID = ID;

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

  let networkUnsubscribe;

  let disposeEnvironmentRetain;

  let resolvedModule;
  let mockAvailability;
  let disposeOnloadCallback;
  let executeOnloadCallback;

  beforeEach(() => {
    fetch = jest.fn((_query, _variables, _cacheConfig) => {
      const observable = Observable.create(_sink => {
        sink = _sink;
      });
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      const originalSubscribe = observable.subscribe.bind(observable);
      networkUnsubscribe = jest.fn();
      jest.spyOn(observable, 'subscribe').mockImplementation((...args) => {
        const subscription = originalSubscribe(...args);
        jest
          .spyOn(subscription, 'unsubscribe')
          .mockImplementation(() => networkUnsubscribe());
        return subscription;
      });
      return observable;
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

    const originalExecuteWithSource =
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.executeWithSource.getMockImplementation();
    executeObservable = undefined;
    executeUnsubscribe = undefined;

    jest
      .spyOn(environment, 'executeWithSource')
      .mockImplementation((...params) => {
        executeObservable = originalExecuteWithSource(...params);
        const originalSubscribe =
          executeObservable.subscribe.bind(executeObservable);
        jest
          .spyOn(executeObservable, 'subscribe')
          .mockImplementation(subscriptionCallbacks => {
            const executeSubscription = originalSubscribe(
              subscriptionCallbacks,
            );
            const originalUnsubscribe =
              executeSubscription.unsubscribe.bind(executeSubscription);
            executeUnsubscribe = jest.fn(originalUnsubscribe);
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
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(PreloadableQueryRegistry.get).toHaveBeenCalled();
    });

    describe('when the query AST is available synchronously', () => {
      it('synchronously checks whether the query can be fulfilled by the store', () => {
        loadQuery(environment, preloadableConcreteRequest, variables);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.executeWithSource).not.toHaveBeenCalled();
          expect(source).toEqual(undefined);
          // Query should still be retained even if we don't fetch
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.retain).toHaveBeenCalled();
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
            // $FlowFixMe[method-unbinding] added when improving typing for this parameters
            expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
            // $FlowFixMe[method-unbinding] added when improving typing for this parameters
            expect(environment.executeWithSource).toHaveBeenCalledWith(
              expect.objectContaining({
                operation: expect.objectContaining({
                  request: expect.objectContaining({
                    identifier: expect.stringContaining(ID),
                    variables: variables,
                    cacheConfig: {force: true},
                  }),
                }),
              }),
            );
            // $FlowFixMe[method-unbinding] added when improving typing for this parameters
            expect(environment.retain).toHaveBeenCalled();

            PreloadableQueryRegistry.set(ID, query);
            expect(nextCallback).not.toHaveBeenCalled();

            sink.next(response);
            expect(nextCallback).toHaveBeenCalledWith(response);
          });

          it('should mark failed network requests', () => {
            const preloadedQuery = loadQuery(
              environment,
              preloadableConcreteRequest,
              variables,
              {
                fetchPolicy: 'store-or-network',
              },
            );

            expect(preloadedQuery.networkError).toBeNull();

            const networkError = new Error('network request failed');
            sink.error(networkError);

            expect(preloadedQuery.networkError).toBe(networkError);
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
            // $FlowFixMe[method-unbinding] added when improving typing for this parameters
            expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
            // $FlowFixMe[method-unbinding] added when improving typing for this parameters
            expect(environment.executeWithSource).toHaveBeenCalledWith(
              expect.objectContaining({
                operation: expect.objectContaining({
                  request: expect.objectContaining({
                    identifier: expect.stringContaining(ID),
                    variables: variables,
                    cacheConfig: {force: true},
                  }),
                }),
              }),
            );
            // $FlowFixMe[method-unbinding] added when improving typing for this parameters
            expect(environment.retain).toHaveBeenCalled();
            expect(executeObservable).toBeDefined();
            if (executeObservable != null) {
              expect(executeObservable.subscribe).toHaveBeenCalledTimes(1);
              expect(executeUnsubscribe).toBeDefined();
            }

            expect(preloadedQuery.isDisposed).toBe(false);
            preloadedQuery.dispose();
            expect(preloadedQuery.isDisposed).toBe(true);
            expect(executeUnsubscribe).not.toBe(null);
            if (executeUnsubscribe != null) {
              expect(executeUnsubscribe).toHaveBeenCalledTimes(1);
              expect(disposeEnvironmentRetain).toHaveBeenCalled();
            }
          });

          it('calling dispose unsubscribes from the network request', () => {
            // This ensures that live queries stop issuing network requests
            const preloadedQuery = loadQuery(
              environment,
              preloadableConcreteRequest,
              variables,
              {
                fetchPolicy: 'store-or-network',
              },
            );
            preloadedQuery.dispose();

            expect(networkUnsubscribe).not.toBe(null);
            if (networkUnsubscribe != null) {
              expect(networkUnsubscribe).toHaveBeenCalledTimes(1);
            }
          });
        });
      });

      describe("with fetchPolicy === 'store-only'", () => {
        it('should not call fetch if the query can be fulfilled by the store', () => {
          const {source} = loadQuery(
            environment,
            preloadableConcreteRequest,
            variables,
            {
              fetchPolicy: 'store-only',
            },
          );
          expect(fetch).not.toHaveBeenCalled();
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.executeWithSource).not.toHaveBeenCalled();
          expect(source).toEqual(undefined);
          // Query should still be retained even if we don't fetch
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.retain).toHaveBeenCalled();
        });

        it('should not call fetch if the query cannot be fulfilled by the store', () => {
          mockAvailability = {status: 'missing'};
          const {source} = loadQuery(
            environment,
            preloadableConcreteRequest,
            variables,
            {
              fetchPolicy: 'store-only',
            },
          );
          expect(fetch).not.toHaveBeenCalled();
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.executeWithSource).not.toHaveBeenCalled();
          expect(source).toEqual(undefined);
          // Query should still be retained even if we don't fetch
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.retain).toHaveBeenCalled();
        });

        it('calling dispose releases the query', () => {
          const preloadedQuery = loadQuery(
            environment,
            preloadableConcreteRequest,
            variables,
            {
              fetchPolicy: 'store-or-network',
            },
          );
          preloadedQuery.dispose();
          expect(disposeEnvironmentRetain).toHaveBeenCalledTimes(1);
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
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).not.toHaveBeenCalled();

        executeOnloadCallback(query);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledWith(
          expect.objectContaining({
            operation: expect.objectContaining({
              request: expect.objectContaining({
                identifier: expect.stringContaining(ID),
                variables: variables,
                cacheConfig: {force: true},
              }),
            }),
          }),
        );
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
        expect(nextCallback).not.toHaveBeenCalled();

        sink.next(response);
        expect(nextCallback).toHaveBeenCalledWith(response);
      });
      it('should mark failed network requests', () => {
        const preloadedQuery = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-or-network',
          },
        );

        expect(preloadedQuery.networkError).toBeNull();

        const networkError = new Error('network request failed');
        sink.error(networkError);

        expect(preloadedQuery.networkError).toBe(networkError);
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

        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledWith(
          expect.objectContaining({
            operation: expect.objectContaining({
              request: expect.objectContaining({
                identifier: expect.stringContaining(ID),
                variables: variables,
                cacheConfig: {force: true},
              }),
            }),
          }),
        );
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
        expect(executeObservable).toBeDefined();
        if (executeObservable != null) {
          expect(executeObservable.subscribe).toHaveBeenCalledTimes(1);
          expect(executeUnsubscribe).toBeDefined();
        }

        expect(preloadedQuery.isDisposed).toBe(false);
        preloadedQuery.dispose();
        expect(preloadedQuery.isDisposed).toBe(true);

        expect(executeUnsubscribe).not.toBe(null);
        if (executeUnsubscribe != null) {
          expect(executeUnsubscribe).toHaveBeenCalledTimes(1);
          expect(disposeEnvironmentRetain).toHaveBeenCalled();
        }
      });

      it('calling dispose after the AST loads unsubscribes from the network request', () => {
        // This ensures that live queries stop issuing network requests
        const preloadedQuery = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-or-network',
          },
        );
        executeOnloadCallback(query);
        preloadedQuery.dispose();

        expect(networkUnsubscribe).not.toBe(null);
        if (networkUnsubscribe != null) {
          expect(networkUnsubscribe).toHaveBeenCalledTimes(1);
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
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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

      it('passes a callback to onLoad that calls executeWithSource', () => {
        loadQuery(environment, preloadableConcreteRequest, variables);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).not.toHaveBeenCalled();
        executeOnloadCallback(query);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledWith(
          expect.objectContaining({
            operation: expect.objectContaining({
              request: expect.objectContaining({
                identifier: expect.stringContaining(ID),
                variables: variables,
                cacheConfig: {force: true},
              }),
            }),
          }),
        );
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
      });
    });

    describe("with fetchPolicy === 'store-only'", () => {
      it('should not call fetch if the query can be fulfilled by the store', () => {
        const {source} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-only',
          },
        );
        expect(fetch).not.toHaveBeenCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).not.toHaveBeenCalled();
        expect(source).toEqual(undefined);
        // Query should still be retained even if we don't fetch
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
      });

      it('should not call fetch if the query cannot be fulfilled by the store', () => {
        mockAvailability = {status: 'missing'};
        const {source} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-only',
          },
        );
        expect(fetch).not.toHaveBeenCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).not.toHaveBeenCalled();
        expect(source).toEqual(undefined);
        // Query should still be retained even if we don't fetch
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
      });

      it('calling dispose releases the query', () => {
        const preloadedQuery = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-or-network',
          },
        );
        preloadedQuery.dispose();
        expect(disposeEnvironmentRetain).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when passed a query AST', () => {
    it('checks whether the query can be fulfilled by the store synchronously', () => {
      loadQuery(environment, query, variables);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.check).toHaveBeenCalled();
    });
    describe('when the query can be fulfilled by the store', () => {
      it("when fetchPolicy === 'store-or-network', it avoids a network request", () => {
        loadQuery(environment, query, variables, {
          fetchPolicy: 'store-or-network',
        });
        expect(fetch).not.toHaveBeenCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).not.toHaveBeenCalled();
        // Query should still be retained even if we don't fetch
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
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
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.executeWithSource).toHaveBeenCalledWith(
            expect.objectContaining({
              operation: expect.objectContaining({
                request: expect.objectContaining({
                  identifier: expect.stringContaining(ID),
                  variables: variables,
                  cacheConfig: {force: true},
                }),
              }),
            }),
          );
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.retain).toHaveBeenCalled();
          expect(nextCallback).not.toHaveBeenCalled();

          sink.next(response);
          expect(nextCallback).toHaveBeenCalledWith(response);
        });

        it('should mark failed network requests', () => {
          const preloadedQuery = loadQuery(environment, query, variables, {
            fetchPolicy: 'network-only',
          });

          expect(preloadedQuery.networkError).toBeNull();

          const networkError = new Error('network request failed');
          sink.error(networkError);

          expect(preloadedQuery.networkError).toBe(networkError);
        });

        it('calling dispose unsubscribes from environment.executeWithSource', () => {
          // This ensures that no data is written to the store
          const preloadedQuery = loadQuery(environment, query, variables, {
            fetchPolicy: 'network-only',
          });
          expect(fetch).toHaveBeenCalled();
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.executeWithSource).toHaveBeenCalledWith(
            expect.objectContaining({
              operation: expect.objectContaining({
                request: expect.objectContaining({
                  identifier: expect.stringContaining(ID),
                  variables: variables,
                  cacheConfig: {force: true},
                }),
              }),
            }),
          );
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          expect(environment.retain).toHaveBeenCalled();
          expect(executeObservable).toBeDefined();
          if (executeObservable != null) {
            expect(executeObservable.subscribe).toHaveBeenCalledTimes(1);
            expect(executeUnsubscribe).toBeDefined();
          }

          expect(preloadedQuery.isDisposed).toBe(false);
          preloadedQuery.dispose();
          expect(preloadedQuery.isDisposed).toBe(true);

          expect(executeUnsubscribe).not.toBe(null);
          if (executeUnsubscribe != null) {
            expect(executeUnsubscribe).toHaveBeenCalledTimes(1);
            expect(disposeEnvironmentRetain).toHaveBeenCalled();
          }
        });

        it('calling dispose unsubscribes from the network request', () => {
          // This ensures that live queries stop issuing network requests
          const preloadedQuery = loadQuery(environment, query, variables, {
            fetchPolicy: 'network-only',
          });
          preloadedQuery.dispose();

          expect(networkUnsubscribe).not.toBe(null);
          if (networkUnsubscribe != null) {
            expect(networkUnsubscribe).toHaveBeenCalledTimes(1);
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
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledWith(
          expect.objectContaining({
            operation: expect.objectContaining({
              request: expect.objectContaining({
                identifier: expect.stringContaining(ID),
                variables: variables,
                cacheConfig: {force: true},
              }),
            }),
          }),
        );
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
        expect(nextCallback).not.toHaveBeenCalled();

        sink.next(response);
        expect(nextCallback).toHaveBeenCalledWith(response);
      });

      it('should mark failed network requests', () => {
        const preloadedQuery = loadQuery(environment, query, variables);

        expect(preloadedQuery.networkError).toBeNull();

        const networkError = new Error('network request failed');
        sink.error(networkError);

        expect(preloadedQuery.networkError).toBe(networkError);
      });

      it('calling dispose unsubscribes from environment.executeWithSource', () => {
        // This ensures that no data is written to the store
        const preloadedQuery = loadQuery(environment, query, variables);
        expect(fetch).toHaveBeenCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
        expect(executeObservable).toBeDefined();
        if (executeObservable != null) {
          expect(executeObservable.subscribe).toHaveBeenCalledTimes(1);
          expect(executeUnsubscribe).toBeDefined();
        }

        expect(preloadedQuery.isDisposed).toBe(false);
        preloadedQuery.dispose();
        expect(preloadedQuery.isDisposed).toBe(true);

        expect(executeUnsubscribe).not.toBe(null);
        if (executeUnsubscribe != null) {
          expect(executeUnsubscribe).toHaveBeenCalledTimes(1);
          expect(disposeEnvironmentRetain).toHaveBeenCalled();
        }
      });

      it('calling dispose unsubscribes from the network request', () => {
        // This ensures that live queries stop issuing network requests
        const preloadedQuery = loadQuery(environment, query, variables);
        preloadedQuery.dispose();

        expect(networkUnsubscribe).not.toBe(null);
        if (networkUnsubscribe != null) {
          expect(networkUnsubscribe).toHaveBeenCalledTimes(1);
        }
      });
    });

    describe("with fetchPolicy === 'store-only'", () => {
      it('should not call fetch if the query can be fulfilled by the store', () => {
        const {source} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-only',
          },
        );
        expect(fetch).not.toHaveBeenCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).not.toHaveBeenCalled();
        expect(source).toEqual(undefined);
        // Query should still be retained even if we don't fetch
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
      });

      it('should not call fetch if the query cannot be fulfilled by the store', () => {
        mockAvailability = {status: 'missing'};
        const {source} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-only',
          },
        );
        expect(fetch).not.toHaveBeenCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).not.toHaveBeenCalled();
        expect(source).toEqual(undefined);
        // Query should still be retained even if we don't fetch
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalled();
      });

      it('calling dispose releases the query', () => {
        const preloadedQuery = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'store-or-network',
          },
        );
        preloadedQuery.dispose();
        expect(disposeEnvironmentRetain).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('warnings', () => {
    let Container;
    let LoadDuringRender;

    beforeEach(() => {
      jest.mock('warning');
      Container = props => {
        useTrackLoadQueryInRender();
        return props.children;
      };
      LoadDuringRender = (props: {|name?: ?string|}) => {
        loadQuery(environment, preloadableConcreteRequest, variables, {
          fetchPolicy: 'store-or-network',
          __nameForWarning: props.name,
        });
        return null;
      };
    });

    it('warns if called during render', () => {
      const warning = require('warning');
      // $FlowFixMe[prop-missing]
      warning.mockClear();

      ReactTestRenderer.act(() => {
        ReactTestRenderer.create(
          <Container>
            <LoadDuringRender />
          </Container>,
        );
      });
      expect(warning).toHaveBeenCalledTimes(1);
      // $FlowFixMe[prop-missing]
      expect(warning.mock.calls[0][1]).toContain(
        'should not be called inside a React render function',
      );
      // $FlowFixMe[prop-missing]
      expect(warning.mock.calls[0][2]).toEqual('loadQuery');
    });

    it('uses provided name for warning', () => {
      const warning = require('warning');
      // $FlowFixMe[prop-missing]
      warning.mockClear();

      ReactTestRenderer.act(() => {
        ReactTestRenderer.create(
          <Container>
            <LoadDuringRender name="refetch" />
          </Container>,
        );
      });
      expect(warning).toHaveBeenCalledTimes(1);
      // $FlowFixMe[prop-missing]
      expect(warning.mock.calls[0][1]).toContain(
        'should not be called inside a React render function',
      );
      // $FlowFixMe[prop-missing]
      expect(warning.mock.calls[0][2]).toEqual('refetch');
    });
  });
});
