/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';
import type {GraphQLResponse} from 'relay-runtime/network/RelayNetworkTypes';

const preloadQuery_DEPRECATED = require('../preloadQuery_DEPRECATED');
const {
  Environment,
  Network,
  Observable,
  PreloadableQueryRegistry,
  RecordSource,
  Store,
  createOperationDescriptor,
  getRequest,
  graphql,
} = require('relay-runtime');
const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('relay-runtime/multi-actor-environment');

const query = getRequest(graphql`
  query preloadQueryDEPRECATEDTestQuery($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

// Only queries with an ID are preloadable
// $FlowFixMe[cannot-write]
query.params.id = '12345';

const params = {
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

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'preloadQuery',
  environmentType => {
    describe(environmentType, () => {
      describe('with an environment not set for SSR', () => {
        let check;
        let environment;
        let fetch;
        let sink;
        let variables;
        let operation;

        beforeEach(() => {
          fetch = jest.fn((_query, _variables, _cacheConfig) => {
            return Observable.create(_sink => {
              sink = _sink;
            });
          });

          const multiActorEnvironment = new MultiActorEnvironment({
            createNetworkForActor: _actorID => Network.create(fetch),
            createStoreForActor: _actorID =>
              new Store(new RecordSource(), {
                gcReleaseBufferSize: 1,
              }),
          });
          environment =
            environmentType === 'MultiActorEnvironment'
              ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
              : new Environment({
                  network: Network.create(fetch),
                  store: new Store(new RecordSource(), {
                    gcReleaseBufferSize: 1,
                  }),
                });

          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          const environmentCheck = environment.check;
          check = jest.fn((...args) =>
            environmentCheck.apply(environment, args),
          );
          (environment: $FlowFixMe).check = check;
          variables = {id: '4'};
          operation = createOperationDescriptor(query, variables);
          PreloadableQueryRegistry.clear();
        });

        function createObserver() {
          const events = [];
          const observer = {
            complete: () => events.push('complete'),
            error: (error: Error) => events.push('error', error),
            next: (resp: GraphQLResponse) => events.push('next', resp),
          };
          return [events, observer];
        }

        describe('store-or-network', () => {
          it('fetches from the network if data is available but query is not', () => {
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

            // load data in store
            environment.commitPayload(operation, response.data);
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });
            check.mockClear();

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(preloaded.status).toEqual({
              cacheConfig: {force: true},
              source: 'network',
              fetchTime: null,
            });
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});

            const [events, observer] = createObserver();
            if (preloaded.source) {
              preloaded.source.subscribe(observer);
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual(['next', response, 'complete']);
          });

          it('fetches from the network if data is not available but query is', () => {
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(preloaded.status).toEqual({
              cacheConfig: {force: true},
              source: 'network',
              fetchTime: null,
            });
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });

          it('fetches from the network if data is not available with concrete query', () => {
            const preloaded = preloadQuery_DEPRECATED(
              environment,
              query,
              variables,
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(preloaded.status).toEqual({
              cacheConfig: {force: true},
              source: 'network',
              fetchTime: null,
            });
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });

          it('returns a cached entry wo refetching if a previous fetch is pending', () => {
            const preloaded1 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            const preloaded2 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
            const [events, observer] = createObserver();
            if (preloaded1.source) {
              preloaded1.source.subscribe({...observer});
            }
            if (preloaded2.source) {
              preloaded2.source.subscribe({...observer});
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual([
              'next',
              response,
              'next',
              response,
              'complete',
              'complete',
            ]);
          });

          it('fetches from the network if data/query are still missing and cache entry is consumed', () => {
            const preloaded1 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            fetch.mockClear();
            const [events, observer] = createObserver();
            if (preloaded1.source) {
              preloaded1.source.subscribe({...observer});
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual(['next', response, 'complete']);
            const preloaded2 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded2.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });

          it('fetches from the network if data/query are still missing and cache entry has expired', () => {
            preloadQuery_DEPRECATED(environment, params, variables);
            fetch.mockClear();
            sink.next(response);
            sink.complete();
            jest.runAllTimers();
            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });

          it('resolves from cache if data and query are available', () => {
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

            environment.commitPayload(operation, response.data);
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });
            check.mockClear();
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded.source).toBe(null);
            expect(preloaded.status).toEqual({
              cacheConfig: {force: true},
              source: 'cache',
              fetchTime: fetchTime,
            });
            expect(check).toBeCalledTimes(1);
            expect(fetch).toBeCalledTimes(0);
            expect(preloaded.source).toBe(null);
          });

          it('resolves from cache with fetchTime if data and query are available and operation is retained', () => {
            environment.retain(operation);
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
            environment.commitPayload(operation, response.data);
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });
            check.mockClear();
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded.source).toBe(null);
            expect(preloaded.status).toEqual({
              cacheConfig: {force: true},
              source: 'cache',
              fetchTime: fetchTime,
            });
            expect(check).toBeCalledTimes(1);
            expect(fetch).toBeCalledTimes(0);
            expect(preloaded.source).toBe(null);
          });

          it('resolves from cache with fetchTime if data and query are available and operation is in the release buffer', () => {
            const disposable = environment.retain(operation);
            disposable.dispose();
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
            environment.commitPayload(operation, response.data);
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });
            check.mockClear();
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded.source).toBe(null);
            expect(preloaded.status).toEqual({
              cacheConfig: {force: true},
              source: 'cache',
              fetchTime: fetchTime,
            });
            expect(check).toBeCalledTimes(1);
            expect(fetch).toBeCalledTimes(0);
            expect(preloaded.source).toBe(null);
          });

          it('resolves from cache if data is available with a concrete query', () => {
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

            environment.commitPayload(operation, response.data);
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });
            check.mockClear();

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              query,
              variables,
            );
            expect(preloaded.source).toBe(null);
            expect(preloaded.status).toEqual({
              cacheConfig: {force: true},
              source: 'cache',
              fetchTime: fetchTime,
            });
            expect(check).toBeCalledTimes(1);
            expect(fetch).toBeCalledTimes(0);
            expect(preloaded.source).toBe(null);
          });

          it('resolves from cache if data & query become available after previously fetching', () => {
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

            preloadQuery_DEPRECATED(environment, params, variables);
            fetch.mockClear();

            environment.commitPayload(operation, response.data);
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });
            check.mockClear();
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(check).toBeCalledTimes(1);
            expect(fetch).toBeCalledTimes(0);
            expect(preloaded.source).toBe(null);
            expect(preloaded.status).toEqual({
              cacheConfig: {force: true},
              source: 'cache',
              fetchTime: fetchTime,
            });
          });

          it('fetches from the network (without resolving from cache) if the query has become stale', () => {
            environment.commitPayload(operation, response.data);
            environment.commitUpdate(store => {
              store.invalidateStore();
            });
            expect(environment.check(operation)).toEqual({status: 'stale'});
            check.mockClear();
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });

          it('resolves from cache and rechecks if data/query are available but cache entry has expired', () => {
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

            environment.commitPayload(operation, response.data);
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });
            check.mockClear();
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );

            preloadQuery_DEPRECATED(environment, params, variables);
            check.mockClear();
            jest.runAllTimers();

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
            );
            expect(preloaded.source).toBe(null);
            expect(check).toBeCalledTimes(1); //  rechecked after a timeout
            expect(fetch).toBeCalledTimes(0);
            expect(preloaded.source).toBe(null);
          });
        });

        describe('store-and-network', () => {
          it('fetches from the network even if query/data are available', () => {
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

            environment.commitPayload(operation, response.data);
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'store-and-network',
              },
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});

            const [events, observer] = createObserver();
            if (preloaded.source) {
              preloaded.source.subscribe(observer);
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual(['next', response, 'complete']);
          });

          it('does not fetch again if a previous fetch is pending', () => {
            const preloaded1 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'store-and-network',
              },
            );
            const preloaded2 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'store-and-network',
              },
            );
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
            const [events, observer] = createObserver();
            if (preloaded1.source) {
              preloaded1.source.subscribe({...observer});
            }
            if (preloaded2.source) {
              preloaded2.source.subscribe({...observer});
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual([
              'next',
              response,
              'next',
              response,
              'complete',
              'complete',
            ]);
          });

          it('fetches from the network if data/query are still missing and cache entry is consumed', () => {
            const preloaded1 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'store-and-network',
              },
            );
            fetch.mockClear();
            const [events, observer] = createObserver();
            if (preloaded1.source) {
              preloaded1.source.subscribe({...observer});
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual(['next', response, 'complete']);
            const preloaded2 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'store-and-network',
              },
            );
            expect(preloaded2.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });

          it('fetches from the network if data/query are still missing and cache entry has expired', () => {
            preloadQuery_DEPRECATED(environment, params, variables, {
              fetchPolicy: 'store-and-network',
            });
            fetch.mockClear();
            sink.next(response);
            sink.complete();
            jest.runAllTimers();
            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'store-and-network',
              },
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });
        });

        describe('network-only', () => {
          it('fetches from the network even if query/data are available', () => {
            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

            environment.commitPayload(operation, response.data);
            PreloadableQueryRegistry.set(
              query.params.id === null ? query.params.cacheID : query.params.id,
              query,
            );
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });

            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'network-only',
              },
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});

            const [events, observer] = createObserver();
            if (preloaded.source) {
              preloaded.source.subscribe(observer);
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual(['next', response, 'complete']);
          });

          it('does not fetch again if a previous fetch is pending', () => {
            const preloaded1 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'network-only',
              },
            );
            const preloaded2 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'network-only',
              },
            );
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
            const [events, observer] = createObserver();
            if (preloaded1.source) {
              preloaded1.source.subscribe({...observer});
            }
            if (preloaded2.source) {
              preloaded2.source.subscribe({...observer});
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual([
              'next',
              response,
              'next',
              response,
              'complete',
              'complete',
            ]);
          });

          it('fetches from the network if data/query are still missing and cache entry is consumed', () => {
            const preloaded1 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'network-only',
              },
            );
            fetch.mockClear();
            const [events, observer] = createObserver();
            if (preloaded1.source) {
              preloaded1.source.subscribe({...observer});
            }
            sink.next(response);
            sink.complete();
            expect(events).toEqual(['next', response, 'complete']);
            const preloaded2 = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'network-only',
              },
            );
            expect(preloaded2.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });

          it('fetches from the network if data/query are still missing and cache entry has expired', () => {
            preloadQuery_DEPRECATED(environment, params, variables, {
              fetchPolicy: 'network-only',
            });
            fetch.mockClear();
            sink.next(response);
            sink.complete();
            jest.runAllTimers();
            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'network-only',
              },
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe(query.params);
            expect(fetch.mock.calls[0][1]).toEqual(variables);
            expect(fetch.mock.calls[0][2]).toEqual({force: true});
          });
        });
      });

      describe('with an environment set for SSR', () => {
        let environment;
        let fetch;
        let sink;
        // $FlowFixMe[invalid-declaration]
        let variables;

        beforeEach(() => {
          fetch = jest.fn((_query, _variables, _cacheConfig) => {
            return Observable.create(_sink => {
              sink = _sink;
            });
          });
          const multiActorEnvironment = new MultiActorEnvironment({
            createNetworkForActor: _actorID => Network.create(fetch),
            createStoreForActor: _actorID =>
              new Store(new RecordSource(), {
                gcReleaseBufferSize: 1,
              }),
            isServer: true,
          });
          environment =
            environmentType === 'MultiActorEnvironment'
              ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
              : new Environment({
                  network: Network.create(fetch),
                  store: new Store(new RecordSource(), {
                    gcReleaseBufferSize: 1,
                  }),
                  isServer: true,
                });
          PreloadableQueryRegistry.clear();
        });
        describe('network-only', () => {
          it('does not fetch from the network again because cached entry never expires in server environment', () => {
            preloadQuery_DEPRECATED(environment, params, variables, {
              fetchPolicy: 'network-only',
            });
            expect(fetch).toBeCalledTimes(1);
            sink.next(response);
            sink.complete();
            // Even though we run all the timers, the cached entry from the first call to
            // preloadQuery_DEPRECATED will never expire in a server environment.
            // This means that the second call to preloadQuery_DEPRECATED should not
            // produce a second call to the network.
            jest.runAllTimers();
            const preloaded = preloadQuery_DEPRECATED(
              environment,
              params,
              variables,
              {
                fetchPolicy: 'network-only',
              },
            );
            expect(preloaded.source).toEqual(expect.any(Observable));
            expect(fetch).toBeCalledTimes(1);
          });
          it('does not trigger timers', () => {
            jest.useFakeTimers();
            preloadQuery_DEPRECATED(environment, params, variables, {
              fetchPolicy: 'network-only',
            });
            expect(fetch).toBeCalledTimes(1);
            sink.next(response);
            sink.complete();
            expect(setTimeout).not.toHaveBeenCalled();
          });
        });
      });
    });
  },
);
