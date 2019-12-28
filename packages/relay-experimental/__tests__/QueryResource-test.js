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

const {getQueryResourceForEnvironment} = require('../QueryResource');
const {
  Observable,
  ROOT_ID,
  __internal: {fetchQuery},
  createOperationDescriptor,
  RecordSource,
  Store,
} = require('relay-runtime');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

import type {Subscription} from 'relay-runtime';

describe('QueryResource', () => {
  let environment;
  let QueryResource;
  let fetchPolicy;
  let fetchObservable;
  let fetchObservableMissingData;
  let gqlQuery;
  let query;
  let queryMissingData;
  let gqlQueryMissingData;
  let release;
  let renderPolicy;
  let store;
  const variables = {
    id: '4',
  };

  beforeEach(() => {
    jest.mock('../ExecutionEnvironment', () => ({
      isServer: false,
    }));
    store = new Store(new RecordSource());
    environment = createMockEnvironment({store});
    QueryResource = getQueryResourceForEnvironment(environment);
    gqlQuery = generateAndCompile(
      `query UserQuery($id: ID!) {
        node(id: $id) {
          ... on User {
            id
          }
        }
      }
    `,
    ).UserQuery;
    gqlQueryMissingData = generateAndCompile(
      `query UserQuery($id: ID!) {
        node(id: $id) {
          ... on User {
            id
            name
          }
        }
      }
    `,
    ).UserQuery;

    query = createOperationDescriptor(gqlQuery, variables);
    queryMissingData = createOperationDescriptor(
      gqlQueryMissingData,
      variables,
    );
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '4',
      },
    });

    fetchObservable = fetchQuery(environment, query, {
      networkCacheConfig: {force: true},
    });
    fetchObservableMissingData = fetchQuery(environment, queryMissingData, {
      networkCacheConfig: {force: true},
    });

    release = jest.fn();
    environment.retain.mockImplementation((...args) => {
      return {
        dispose: release,
      };
    });

    renderPolicy = 'partial';
  });

  describe('prepare', () => {
    describe('fetchPolicy: store-or-network', () => {
      beforeEach(() => {
        fetchPolicy = 'store-or-network';
      });

      describe('renderPolicy: partial', () => {
        beforeEach(() => {
          renderPolicy = 'partial';
        });
        it('should return result and not send a network request if all data is locally available', () => {
          expect(environment.check(query)).toEqual('available');

          const result = QueryResource.prepare(
            query,
            fetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(environment.execute).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should return result and send a network request if data is missing for the query', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          const result = QueryResource.prepare(
            queryMissingData,
            fetchObservableMissingData,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          });
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should suspend and send a network request if data for query is cached but stale', () => {
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });
          expect(environment.check(query)).toEqual('stale');

          let thrown = false;
          try {
            QueryResource.prepare(
              query,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toBe(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should send a single network request when same query is read multiple times', () => {
          const result1 = QueryResource.prepare(
            queryMissingData,
            fetchObservableMissingData,
            fetchPolicy,
            renderPolicy,
          );

          // Assert query is temporarily retained during call to prepare
          expect(release).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          const result2 = QueryResource.prepare(
            queryMissingData,
            fetchObservableMissingData,
            fetchPolicy,
            renderPolicy,
          );

          // Assert query is still temporarily retained during second call to prepare
          expect(release).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          const expected = {
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          };
          expect(result1).toEqual(expected);
          expect(result2).toEqual(expected);
          expect(environment.execute).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors', () => {
          let thrown = false;
          let sink;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(s => {
            networkExecute();
            sink = s;
          });
          QueryResource.prepare(
            queryMissingData,
            errorFetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          if (!sink) {
            throw new Error('Expect sink to be defined');
          }
          try {
            sink.error(new Error('Oops'));
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);

          // Assert query is temporarily retained during call to prepare
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should return result and send a network request if data is missing for the query and observable returns synchronously', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          const networkExecute = jest.fn();
          const syncFetchObservable = Observable.create(sink => {
            environment.commitPayload(queryMissingData, {
              node: {
                __typename: 'User',
                id: '4',
                name: 'User 4',
              },
            });
            const snapshot = environment.lookup(queryMissingData.fragment);
            networkExecute();
            sink.next((snapshot: $FlowFixMe));
            sink.complete();
          });
          const result = QueryResource.prepare(
            queryMissingData,
            syncFetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          });
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors synchronously', () => {
          let thrown = false;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(sink => {
            networkExecute();
            sink.error(new Error('Oops'));
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        describe('when using fragments', () => {
          it('should return result and not send a network request if all data is locally available', () => {
            const {UserQuery} = generateAndCompile(
              `
              fragment UserFragment on User {
                id
              }
              query UserQuery($id: ID!) {
                node(id: $id) {
                  __typename
                  ...UserFragment
                }
              }
            `,
            );
            const queryWithFragments = createOperationDescriptor(
              UserQuery,
              variables,
            );
            const fetchObservableWithFragments = fetchQuery(
              environment,
              queryWithFragments,
              {
                networkCacheConfig: {force: true},
              },
            );
            expect(environment.check(queryWithFragments)).toEqual('available');

            const result = QueryResource.prepare(
              queryWithFragments,
              fetchObservableWithFragments,
              fetchPolicy,
              renderPolicy,
            );
            expect(result).toEqual({
              cacheKey: expect.any(String),
              fragmentNode: queryWithFragments.fragment.node,
              fragmentRef: {
                __id: ROOT_ID,
                __fragments: {
                  UserQuery: variables,
                },
                __fragmentOwner: queryWithFragments.request,
              },
              operation: queryWithFragments,
            });
            expect(environment.execute).toBeCalledTimes(0);
            expect(environment.retain).toBeCalledTimes(1);

            // Assert that query is released after enough time has passed without
            // calling QueryResource.retain
            jest.runAllTimers();
            expect(release).toBeCalledTimes(1);
          });

          it('should return result and send a network request when some data is missing in fragment', () => {
            const {UserQuery} = generateAndCompile(
              `
                fragment UserFragment on User {
                  id
                  username
                }
                query UserQuery($id: ID!) {
                  node(id: $id) {
                    __typename
                    ...UserFragment
                  }
                }
              `,
            );
            const queryWithFragments = createOperationDescriptor(
              UserQuery,
              variables,
            );
            const fetchObservableWithFragments = fetchQuery(
              environment,
              queryWithFragments,
              {
                networkCacheConfig: {force: true},
              },
            );
            expect(environment.check(queryWithFragments)).toEqual('missing');

            const result = QueryResource.prepare(
              queryWithFragments,
              fetchObservableWithFragments,
              fetchPolicy,
              renderPolicy,
            );
            expect(result).toEqual({
              cacheKey: expect.any(String),
              fragmentNode: queryWithFragments.fragment.node,
              fragmentRef: {
                __id: ROOT_ID,
                __fragments: {
                  UserQuery: variables,
                },
                __fragmentOwner: queryWithFragments.request,
              },
              operation: queryWithFragments,
            });
            expect(environment.execute).toBeCalledTimes(1);
            expect(environment.retain).toBeCalledTimes(1);

            // Assert that query is released after enough time has passed without
            // calling QueryResource.retain
            jest.runAllTimers();
            expect(release).toBeCalledTimes(1);
          });

          it('should suspend and send a network request if data for query is cached but stale', () => {
            const {UserQuery} = generateAndCompile(
              `
              fragment UserFragment on User {
                id
              }
              query UserQuery($id: ID!) {
                node(id: $id) {
                  __typename
                  ...UserFragment
                }
              }
            `,
            );
            const queryWithFragments = createOperationDescriptor(
              UserQuery,
              variables,
            );
            environment.commitPayload(queryWithFragments, {
              node: {
                __typename: 'User',
                id: '4',
              },
            });
            const fetchObservableWithFragments = fetchQuery(
              environment,
              queryWithFragments,
              {
                networkCacheConfig: {force: true},
              },
            );

            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });
            expect(environment.check(queryWithFragments)).toEqual('stale');

            let thrown = false;
            try {
              QueryResource.prepare(
                queryWithFragments,
                fetchObservableWithFragments,
                fetchPolicy,
                renderPolicy,
              );
            } catch (promise) {
              expect(typeof promise.then).toBe('function');
              thrown = true;
            }
            expect(environment.execute).toBeCalledTimes(1);
            expect(environment.retain).toBeCalledTimes(1);
            expect(thrown).toBe(true);

            // Assert that query is released after enough time has passed without
            // calling QueryResource.retain
            jest.runAllTimers();
            expect(release).toBeCalledTimes(1);
          });
        });
      });

      describe('renderPolicy: full', () => {
        beforeEach(() => {
          renderPolicy = 'full';
        });
        it('should return result and not send a network request if all data is locally available', () => {
          expect(environment.check(query)).toEqual('available');

          const result = QueryResource.prepare(
            query,
            fetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(environment.execute).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should suspend and send a network request if data is missing for the query', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          let thrown = false;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toBe(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should cache a single promise and send a single network request when same query is read multiple times', () => {
          let promise1;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (p) {
            expect(typeof p.then).toBe('function');
            promise1 = p;
          }

          // Assert query is temporarily retained during call to prepare
          expect(release).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          let promise2;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (p) {
            expect(typeof p.then).toBe('function');
            promise2 = p;
          }

          // Assert query is still temporarily retained during second call to prepare
          expect(release).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that same promise was thrown
          expect(promise1).toBe(promise2);
          // Assert that network was only called once
          expect(environment.execute).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors', () => {
          let thrown = false;
          let sink;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(s => {
            networkExecute();
            sink = s;
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (p) {
            expect(typeof p.then).toBe('function');
          }

          if (!sink) {
            throw new Error('Expect sink to be defined');
          }

          try {
            sink.error(new Error('Oops'));
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);

          // Assert query is temporarily retained during call to prepare
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should return result and send a network request if data is missing for the query and observable returns synchronously', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          const networkExecute = jest.fn();
          const syncFetchObservable = Observable.create(sink => {
            environment.commitPayload(queryMissingData, {
              node: {
                __typename: 'User',
                id: '4',
                name: 'User 4',
              },
            });
            const snapshot = environment.lookup(queryMissingData.fragment);
            networkExecute();
            sink.next((snapshot: $FlowFixMe));
            sink.complete();
          });
          const result = QueryResource.prepare(
            queryMissingData,
            syncFetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          });
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors synchronously', () => {
          let thrown = false;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(sink => {
            networkExecute();
            sink.error(new Error('Oops'));
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should discard old promise cache when query observable is unsubscribed, and create a new promise on a new request', () => {
          let promise1;
          let subscription;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
              {
                start: sub => {
                  subscription = sub;
                },
              },
            );
          } catch (p) {
            expect(typeof p.then).toBe('function');
            promise1 = p;
          }
          subscription && subscription.unsubscribe();

          // Assert cache is cleared
          expect(
            QueryResource.getCacheEntry(
              queryMissingData,
              fetchPolicy,
              renderPolicy,
            ),
          ).toBeUndefined();

          let promise2;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (p) {
            expect(typeof p.then).toBe('function');
            promise2 = p;
          }

          // Assert that different promises were thrown
          expect(promise1).not.toBe(promise2);
          expect(environment.execute).toBeCalledTimes(2);
        });

        describe('when using fragments', () => {
          it('should return result and not send a network request if all data is locally available', () => {
            const {UserQuery} = generateAndCompile(
              `
              fragment UserFragment on User {
                id
              }
              query UserQuery($id: ID!) {
                node(id: $id) {
                  __typename
                  ...UserFragment
                }
              }
            `,
            );
            const queryWithFragments = createOperationDescriptor(
              UserQuery,
              variables,
            );
            const fetchObservableWithFragments = fetchQuery(
              environment,
              queryWithFragments,
              {
                networkCacheConfig: {force: true},
              },
            );
            expect(environment.check(queryWithFragments)).toEqual('available');

            const result = QueryResource.prepare(
              queryWithFragments,
              fetchObservableWithFragments,
              fetchPolicy,
              renderPolicy,
            );
            expect(result).toEqual({
              cacheKey: expect.any(String),
              fragmentNode: queryWithFragments.fragment.node,
              fragmentRef: {
                __id: ROOT_ID,
                __fragments: {
                  UserQuery: variables,
                },
                __fragmentOwner: queryWithFragments.request,
              },
              operation: queryWithFragments,
            });
            expect(environment.execute).toBeCalledTimes(0);
            expect(environment.retain).toBeCalledTimes(1);

            // Assert that query is released after enough time has passed without
            // calling QueryResource.retain
            jest.runAllTimers();
            expect(release).toBeCalledTimes(1);
          });

          it('should suspend and send a network request when some data is missing in fragment', () => {
            const {UserQuery} = generateAndCompile(
              `
                fragment UserFragment on User {
                  id
                  username
                }
                query UserQuery($id: ID!) {
                  node(id: $id) {
                    __typename
                    ...UserFragment
                  }
                }
              `,
            );
            const queryWithFragments = createOperationDescriptor(
              UserQuery,
              variables,
            );
            const fetchObservableWithFragments = fetchQuery(
              environment,
              queryWithFragments,
              {
                networkCacheConfig: {force: true},
              },
            );
            expect(environment.check(queryWithFragments)).toEqual('missing');

            let thrown = false;
            try {
              QueryResource.prepare(
                queryWithFragments,
                fetchObservableWithFragments,
                fetchPolicy,
                renderPolicy,
              );
            } catch (p) {
              expect(typeof p.then).toBe('function');
              thrown = true;
            }

            expect(environment.execute).toBeCalledTimes(1);
            expect(environment.retain).toBeCalledTimes(1);
            expect(thrown).toEqual(true);

            // Assert that query is released after enough time has passed without
            // calling QueryResource.retain
            jest.runAllTimers();
            expect(release).toBeCalledTimes(1);
          });
        });

        describe('when using incremental data', () => {
          it('should suspend and send a network request when some data is missing in fragment', () => {
            const {UserQuery} = generateAndCompile(
              `
                fragment UserFragment on User {
                  id
                  username
                }
                query UserQuery($id: ID!) {
                  node(id: $id) {
                    __typename
                    id
                    ...UserFragment @defer
                  }
                }
              `,
            );
            const queryWithFragments = createOperationDescriptor(
              UserQuery,
              variables,
            );
            const fetchObservableWithFragments = fetchQuery(
              environment,
              queryWithFragments,
              {
                networkCacheConfig: {force: true},
              },
            );
            expect(environment.check(queryWithFragments)).toEqual('missing');

            // Should suspend until first payload is received
            let thrown = false;
            try {
              QueryResource.prepare(
                queryWithFragments,
                fetchObservableWithFragments,
                fetchPolicy,
                renderPolicy,
              );
            } catch (p) {
              expect(typeof p.then).toBe('function');
              thrown = true;
            }

            expect(environment.execute).toBeCalledTimes(1);
            expect(environment.retain).toBeCalledTimes(1);
            expect(thrown).toEqual(true);

            // Resolve first payload
            environment.mock.nextValue(queryWithFragments, {
              data: {
                node: {
                  id: '4',
                  __typename: 'User',
                },
              },
            });
            // Data should still be missing after first payload
            expect(environment.check(queryWithFragments)).toEqual('missing');

            // Calling prepare again shouldn't suspend; the fragment with
            // the deferred data would suspend further down the tree
            const result = QueryResource.prepare(
              queryWithFragments,
              fetchObservableWithFragments,
              fetchPolicy,
              renderPolicy,
            );
            const expectedResult = {
              cacheKey: expect.any(String),
              fragmentNode: queryWithFragments.fragment.node,
              fragmentRef: {
                __id: ROOT_ID,
                __fragments: {
                  UserQuery: variables,
                },
                __fragmentOwner: queryWithFragments.request,
              },
              operation: queryWithFragments,
            };
            expect(result).toEqual(expectedResult);

            expect(environment.execute).toBeCalledTimes(1);
            expect(environment.retain).toBeCalledTimes(1);
            expect(thrown).toEqual(true);

            // Resolve deferred payload
            environment.mock.nextValue(queryWithFragments, {
              data: {
                id: '1',
                __typename: 'User',
                username: 'zuck',
              },
              label: 'UserQuery$defer$UserFragment',
              path: ['node'],
            });
            // Data should not be missing anymore
            expect(environment.check(queryWithFragments)).toEqual('available');

            // Calling prepare again should return same result
            const result2 = QueryResource.prepare(
              queryWithFragments,
              fetchObservableWithFragments,
              fetchPolicy,
              renderPolicy,
            );
            expect(result2).toEqual(expectedResult);

            // Assert that query is released after enough time has passed without
            // calling QueryResource.retain
            jest.runAllTimers();
            expect(release).toBeCalledTimes(1);
          });
        });
      });
    });

    describe('fetchPolicy: store-and-network', () => {
      beforeEach(() => {
        fetchPolicy = 'store-and-network';
      });

      describe('renderPolicy: partial', () => {
        beforeEach(() => {
          renderPolicy = 'partial';
        });

        it('should return result and send a network request even when data is locally available', () => {
          expect(environment.check(query)).toEqual('available');

          const result = QueryResource.prepare(
            query,
            fetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should return result and send a network request if data is missing for the query', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          const result = QueryResource.prepare(
            queryMissingData,
            fetchObservableMissingData,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          });
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should suspend and send a network request if data for query is cached but stale', () => {
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });
          expect(environment.check(query)).toEqual('stale');

          let thrown = false;
          try {
            QueryResource.prepare(
              query,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toBe(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should send a single network request when same query is read multiple times', () => {
          const result1 = QueryResource.prepare(
            queryMissingData,
            fetchObservableMissingData,
            fetchPolicy,
            renderPolicy,
          );
          const result2 = QueryResource.prepare(
            queryMissingData,
            fetchObservableMissingData,
            fetchPolicy,
            renderPolicy,
          );
          const expected = {
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          };
          expect(result1).toEqual(expected);
          expect(result2).toEqual(expected);
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors', () => {
          let thrown = false;
          let sink;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(s => {
            networkExecute();
            sink = s;
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
            if (!sink) {
              throw new Error('Expect sink to be defined');
            }
            sink.error(new Error('Oops'));
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          // Assert query is temporarily retained during call to prepare
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should return result and send a network request if data is missing for the query and observable returns synchronously', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          const networkExecute = jest.fn();
          const syncFetchObservable = Observable.create(sink => {
            environment.commitPayload(queryMissingData, {
              node: {
                __typename: 'User',
                id: '4',
                name: 'User 4',
              },
            });
            const snapshot = environment.lookup(queryMissingData.fragment);
            networkExecute();
            sink.next((snapshot: $FlowFixMe));
            sink.complete();
          });
          const result = QueryResource.prepare(
            queryMissingData,
            syncFetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          });
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors synchronously', () => {
          let thrown = false;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(sink => {
            networkExecute();
            sink.error(new Error('Oops'));
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });
      });

      describe('renderPolicy: full', () => {
        beforeEach(() => {
          renderPolicy = 'full';
        });

        it('should return result and send a network request even when data is locally available', () => {
          expect(environment.check(query)).toEqual('available');

          const result = QueryResource.prepare(
            query,
            fetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should suspend and send a network request if data is missing for the query', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          let thrown;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (p) {
            expect(typeof p.then).toEqual('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toEqual(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should cache a single promise and send a single network request when same query is read multiple times', () => {
          let promise1;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (p) {
            expect(typeof p.then).toBe('function');
            promise1 = p;
          }

          // Assert query is temporarily retained during call to prepare
          expect(release).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          let promise2;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (p) {
            expect(typeof p.then).toBe('function');
            promise2 = p;
          }

          // Assert query is still temporarily retained during second call to prepare
          expect(release).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that same promise was thrown
          expect(promise1).toBe(promise2);
          // Assert that network was only called once
          expect(environment.execute).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors', () => {
          let thrown = false;
          let sink;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(s => {
            networkExecute();
            sink = s;
          });
          551;
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (p) {
            expect(typeof p.then).toBe('function');
          }
          if (!sink) {
            throw new Error('Expect sink to be defined');
          }
          try {
            sink.error(new Error('Oops'));
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          // Assert query is temporarily retained during call to prepare
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should return result and send a network request if data is missing for the query and observable returns synchronously', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          const networkExecute = jest.fn();
          const syncFetchObservable = Observable.create(sink => {
            environment.commitPayload(queryMissingData, {
              node: {
                __typename: 'User',
                id: '4',
                name: 'User 4',
              },
            });
            const snapshot = environment.lookup(queryMissingData.fragment);
            networkExecute();
            sink.next((snapshot: $FlowFixMe));
            sink.complete();
          });
          const result = QueryResource.prepare(
            queryMissingData,
            syncFetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          });
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors synchronously', () => {
          let thrown = false;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(sink => {
            networkExecute();
            sink.error(new Error('Oops'));
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });
      });
    });

    describe('fetchPolicy: network-only', () => {
      beforeEach(() => {
        fetchPolicy = 'network-only';
      });

      describe('renderPolicy: partial', () => {
        beforeEach(() => {
          renderPolicy = 'partial';
        });
        it('should suspend and send a network request even if data is available locally', () => {
          expect(environment.check(query)).toEqual('available');

          let thrown = false;
          try {
            QueryResource.prepare(
              query,
              fetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toBe(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should suspend and send a network request when query has missing data', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          let thrown = false;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toBe(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should suspend and send a network request if data for query is cached but stale', () => {
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });
          expect(environment.check(query)).toEqual('stale');

          let thrown = false;
          try {
            QueryResource.prepare(
              query,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toBe(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors', () => {
          let thrownPromise = false;
          let thrownError = false;
          let sink;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(s => {
            networkExecute();
            sink = s;
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrownPromise = true;
          }
          expect(thrownPromise).toEqual(true);
          if (!sink) {
            throw new Error('Expect sink to be defined');
          }
          sink.error(new Error('Oops'));

          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrownError = true;
          }
          expect(thrownError).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          // Assert query is temporarily retained during call to prepare
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should return result if network observable returns synchronously', () => {
          const networkExecute = jest.fn();
          const syncFetchObservable = Observable.create(sink => {
            const snapshot = environment.lookup(query.fragment);
            networkExecute();
            sink.next((snapshot: $FlowFixMe));
            sink.complete();
          });
          const result = QueryResource.prepare(
            query,
            syncFetchObservable,
            fetchPolicy,
            renderPolicy,
          );

          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors synchronously', () => {
          let thrown = false;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(sink => {
            networkExecute();
            const error = new Error('Oops');
            sink.error(error);
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });
      });

      describe('renderPolicy: full', () => {
        beforeEach(() => {
          renderPolicy = 'full';
        });
        it('should suspend and send a network request even if data is available locally', () => {
          expect(environment.check(query)).toEqual('available');

          let thrown = false;
          try {
            QueryResource.prepare(
              query,
              fetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toBe(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should suspend and send a network request when query has missing data', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          let thrown = false;
          try {
            QueryResource.prepare(
              queryMissingData,
              fetchObservableMissingData,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrown = true;
          }
          expect(environment.execute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);
          expect(thrown).toBe(true);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors', () => {
          let thrownPromise = false;
          let thrownError = false;
          let sink;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(s => {
            networkExecute();
            sink = s;
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (promise) {
            expect(typeof promise.then).toBe('function');
            thrownPromise = true;
          }
          expect(thrownPromise).toEqual(true);
          if (!sink) {
            throw new Error('Expect sink to be defined');
          }
          sink.error(new Error('Oops'));

          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrownError = true;
          }
          expect(thrownError).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          // Assert query is temporarily retained during call to prepare
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should return result if network observable returns synchronously', () => {
          const networkExecute = jest.fn();
          const syncFetchObservable = Observable.create(sink => {
            const snapshot = environment.lookup(query.fragment);
            networkExecute();
            sink.next((snapshot: $FlowFixMe));
            sink.complete();
          });
          const result = QueryResource.prepare(
            query,
            syncFetchObservable,
            fetchPolicy,
            renderPolicy,
          );

          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should throw error if network request errors synchronously', () => {
          let thrown = false;
          const networkExecute = jest.fn();
          const errorFetchObservable = Observable.create(sink => {
            networkExecute();
            const error = new Error('Oops');
            sink.error(error);
          });
          try {
            QueryResource.prepare(
              queryMissingData,
              errorFetchObservable,
              fetchPolicy,
              renderPolicy,
            );
          } catch (e) {
            expect(e instanceof Error).toEqual(true);
            expect(e.message).toEqual('Oops');
            thrown = true;
          }
          expect(thrown).toEqual(true);
          expect(networkExecute).toBeCalledTimes(1);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });
      });
    });

    describe('fetchPolicy: store-only', () => {
      beforeEach(() => {
        fetchPolicy = 'store-only';
      });

      describe('renderPolicy: partial', () => {
        beforeEach(() => {
          renderPolicy = 'partial';
        });

        it('should not send network request if data is available locally', () => {
          expect(environment.check(query)).toEqual('available');

          const result = QueryResource.prepare(
            query,
            fetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(environment.execute).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should not send network request even if data is missing', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          const result = QueryResource.prepare(
            queryMissingData,
            fetchObservableMissingData,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          });
          expect(environment.execute).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should not send a network request if data for query is cached but stale', () => {
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });
          expect(environment.check(query)).toEqual('stale');

          const result = QueryResource.prepare(
            query,
            fetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(environment.execute).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });
      });

      describe('renderPolicy: full', () => {
        beforeEach(() => {
          renderPolicy = 'full';
        });

        it('should not send network request if data is available locally', () => {
          expect(environment.check(query)).toEqual('available');

          const result = QueryResource.prepare(
            query,
            fetchObservable,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: query.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: query.request,
            },
            operation: query,
          });
          expect(environment.execute).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });

        it('should not send network request even if data is missing', () => {
          expect(environment.check(queryMissingData)).toEqual('missing');

          const result = QueryResource.prepare(
            queryMissingData,
            fetchObservableMissingData,
            fetchPolicy,
            renderPolicy,
          );
          expect(result).toEqual({
            cacheKey: expect.any(String),
            fragmentNode: queryMissingData.fragment.node,
            fragmentRef: {
              __id: ROOT_ID,
              __fragments: {
                UserQuery: variables,
              },
              __fragmentOwner: queryMissingData.request,
            },
            operation: queryMissingData,
          });
          expect(environment.execute).toBeCalledTimes(0);
          expect(environment.retain).toBeCalledTimes(1);

          // Assert that query is released after enough time has passed without
          // calling QueryResource.retain
          jest.runAllTimers();
          expect(release).toBeCalledTimes(1);
        });
      });
    });
  });

  describe('retain', () => {
    beforeEach(() => {
      fetchPolicy = 'store-or-network';
    });

    it('should permanently retain the query that was retained during `prepare`', () => {
      const result = QueryResource.prepare(
        queryMissingData,
        fetchObservableMissingData,
        fetchPolicy,
        renderPolicy,
      );
      expect(environment.execute).toBeCalledTimes(1);
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

      // Data retention ownership is established permanently:
      // - Temporary retain is released
      // - New permanent retain is established
      const disposable = QueryResource.retain(result);
      expect(release).toBeCalledTimes(0);
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

      // Running timers won't release the query since it has been
      // permanently retained
      jest.runAllTimers();
      expect(release).toBeCalledTimes(0);
      // Should not clear the cache entry
      expect(
        QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        ),
      ).toBeDefined();

      // Assert that disposing releases the query
      disposable.dispose();
      expect(release).toBeCalledTimes(1);
      expect(environment.retain).toBeCalledTimes(1);
    });

    it('should auto-release if enough time has passed before `retain` is called after `prepare`', () => {
      const result = QueryResource.prepare(
        queryMissingData,
        fetchObservableMissingData,
        fetchPolicy,
        renderPolicy,
      );
      expect(environment.execute).toBeCalledTimes(1);
      expect(release).toBeCalledTimes(0);
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

      // Running timers before calling `retain` auto-releases the query
      // retained during `read`
      jest.runAllTimers();
      expect(release).toBeCalledTimes(1);

      // Cache entry should be removed
      expect(
        QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        ),
      ).toBeUndefined();

      // Calling retain after query has been auto-released should retain
      // the query again.
      const disposable = QueryResource.retain(result);
      expect(release).toBeCalledTimes(1);
      expect(environment.retain).toBeCalledTimes(2);
      expect(environment.retain.mock.calls[1][0]).toEqual(queryMissingData);

      // Assert that disposing releases the query
      disposable.dispose();
      expect(release).toBeCalledTimes(2);
      expect(environment.retain).toBeCalledTimes(2);
    });

    it("retains the query during `prepare` even if a network request wasn't started", () => {
      const result = QueryResource.prepare(
        query,
        fetchObservable,
        fetchPolicy,
        renderPolicy,
      );
      expect(environment.execute).toBeCalledTimes(0);
      expect(release).toBeCalledTimes(0);
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(query);

      // Running timers before calling `retain` auto-releases the query
      // retained during `read`
      jest.runAllTimers();
      expect(release).toBeCalledTimes(1);

      // Calling retain should retain the query.
      const disposable = QueryResource.retain(result);
      expect(release).toBeCalledTimes(1);
      expect(environment.retain).toBeCalledTimes(2);
      expect(environment.retain.mock.calls[1][0]).toEqual(query);

      // Assert that disposing releases the query
      disposable.dispose();
      expect(release).toBeCalledTimes(2);
      expect(environment.retain).toBeCalledTimes(2);
    });

    it('cancels the query after releasing a query that was retaned if request is still in flight', () => {
      const result = QueryResource.prepare(
        queryMissingData,
        fetchObservableMissingData,
        fetchPolicy,
        renderPolicy,
      );
      // Assert query is temporarily retained
      expect(release).toBeCalledTimes(0);
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

      // Assert rerquest was started
      expect(environment.execute).toBeCalledTimes(1);
      expect(
        environment.mock.isLoading(
          queryMissingData.request.node,
          queryMissingData.request.variables,
          {force: true},
        ),
      ).toEqual(true);

      const disposable = QueryResource.retain(result);
      disposable.dispose();

      // Assert request was canceled
      expect(
        environment.mock.isLoading(
          queryMissingData.request.node,
          queryMissingData.request.variables,
          {force: true},
        ),
      ).toEqual(false);
    });

    describe('when retaining the same query multiple times', () => {
      it('correctly retains query after temporarily retaining multiple times during render phase', () => {
        QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is temporarily retained
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

        // Assert that retain count is 1
        const cacheEntry = QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        );
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        const result = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is still temporarily retained
        expect(release).toHaveBeenCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert network is only called once
        expect(environment.execute).toBeCalledTimes(1);

        // Permanently retain the second result, which is what would happen
        // if the second render got committed
        const disposable = QueryResource.retain(result);

        // Assert permanent retain is established and nothing is released
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert that disposing correctly releases the query
        disposable.dispose();
        expect(release).toBeCalledTimes(1);
        expect(environment.retain).toBeCalledTimes(1);
      });

      it('correctly retains query after temporarily retaining multiple times during render phase and auto-release timers have expired', () => {
        QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is temporarily retained
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

        // Assert that retain count is 1
        const cacheEntry = QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        );
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        const result = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is still temporarily retained
        expect(release).toHaveBeenCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert network is only called once
        expect(environment.execute).toBeCalledTimes(1);

        // Permanently retain the second result, which is what would happen
        // if the second render got committed
        const disposable = QueryResource.retain(result);

        // Assert permanent retain is established and nothing is released
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Running timers won't release the query since it has been
        // permanently retained
        jest.runAllTimers();
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert that disposing correctly releases the query
        disposable.dispose();
        expect(release).toBeCalledTimes(1);
        expect(environment.retain).toBeCalledTimes(1);
      });

      it('does not temporarily retain query anymore if it has been permanently retained', () => {
        const result = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is temporarily retained
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

        // Assert that retain count is 1
        const cacheEntry = QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        );
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert network is called once
        expect(environment.execute).toBeCalledTimes(1);

        // Permanently retain the second result, which is what would happen
        // if the second render got committed
        const disposable = QueryResource.retain(result);

        // Assert permanent retain is established and nothing is released
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count remains at 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Running timers won't release the query since it has been
        // permanently retained
        jest.runAllTimers();
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count remains at 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );

        // Assert that the retain count remains at 1, even after
        // temporarily retaining again
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert query is still retained
        expect(release).toHaveBeenCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

        // Assert that disposing the first disposable doesn't release the query
        disposable.dispose();
        expect(release).toBeCalledTimes(1);
        expect(environment.retain).toBeCalledTimes(1);
      });

      it("when same query commits twice, should not release the query before all callers have released it and auto-release timers haven't expired", () => {
        // NOTE: This simulates 2 separate query components mounting
        // simultaneously

        let subscription1: Subscription = {
          unsubscribe: () => {},
          closed: false,
        };
        const result1 = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
          {
            start: sub => {
              subscription1 = sub;
              jest.spyOn(subscription1, 'unsubscribe');
            },
          },
        );
        // Assert query is temporarily retained
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

        // Assert that retain count is 1
        const cacheEntry = QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        );
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        const result2 = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is still temporarily retained
        expect(release).toHaveBeenCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert network is only called once
        expect(environment.execute).toBeCalledTimes(1);

        const disposable1 = QueryResource.retain(result1);

        // Assert permanent retain is established and nothing is released
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        const disposable2 = QueryResource.retain(result2);

        // Assert permanent retain is still established
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is now 2
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(2);

        // Assert that disposing the first disposable doesn't release the query
        disposable1.dispose();
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(
          QueryResource.getCacheEntry(
            queryMissingData,
            fetchPolicy,
            renderPolicy,
          ),
        ).toBeDefined();
        // Assert request is still in flight
        expect(subscription1.unsubscribe).toBeCalledTimes(0);
        expect(
          environment.mock.isLoading(
            queryMissingData.request.node,
            queryMissingData.request.variables,
            {force: true},
          ),
        ).toEqual(true);

        // Assert that disposing the last disposable fully releases the query
        disposable2.dispose();
        expect(release).toBeCalledTimes(1);
        expect(environment.retain).toBeCalledTimes(1);
        expect(
          QueryResource.getCacheEntry(
            queryMissingData,
            fetchPolicy,
            renderPolicy,
          ),
        ).toBeUndefined();
        // Assert request is canceled
        expect(
          environment.mock.isLoading(
            queryMissingData.request.node,
            queryMissingData.request.variables,
            {force: true},
          ),
        ).toEqual(false);
        expect(subscription1.unsubscribe).toBeCalledTimes(1);
      });

      it('when same query commits twice, should not release the query before all callers have released it and auto-release timers have expired', () => {
        // NOTE: This simulates 2 separate query components mounting
        // simultaneously

        let subscription1: Subscription = {
          unsubscribe: () => {},
          closed: false,
        };
        const result1 = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
          {
            start: sub => {
              subscription1 = sub;
              jest.spyOn(subscription1, 'unsubscribe');
            },
          },
        );
        // Assert query is temporarily retained
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);

        // Assert that retain count is 1
        const cacheEntry = QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        );
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        const result2 = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is still temporarily retained
        expect(release).toHaveBeenCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert network is only called once
        expect(environment.execute).toBeCalledTimes(1);

        const disposable1 = QueryResource.retain(result1);

        // Assert permanent retain is established and nothing is released
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        const disposable2 = QueryResource.retain(result2);

        // Assert permanent retain is still established
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is now 2
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(2);

        // Running timers won't release the query since it has been
        // permanently retained
        jest.runAllTimers();
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is now 2
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(2);

        // Assert that disposing the first disposable doesn't release the query
        disposable1.dispose();
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(
          QueryResource.getCacheEntry(
            queryMissingData,
            fetchPolicy,
            renderPolicy,
          ),
        ).toBeDefined();
        // Assert request is still in flight
        expect(subscription1.unsubscribe).toBeCalledTimes(0);
        expect(
          environment.mock.isLoading(
            queryMissingData.request.node,
            queryMissingData.request.variables,
            {force: true},
          ),
        ).toEqual(true);

        // Assert that disposing the last disposable fully releases the query
        disposable2.dispose();
        expect(release).toBeCalledTimes(1);
        expect(environment.retain).toBeCalledTimes(1);
        expect(
          QueryResource.getCacheEntry(
            queryMissingData,
            fetchPolicy,
            renderPolicy,
          ),
        ).toBeUndefined();
        // Assert request is canceled
        expect(
          environment.mock.isLoading(
            queryMissingData.request.node,
            queryMissingData.request.variables,
            {force: true},
          ),
        ).toEqual(false);
        expect(subscription1.unsubscribe).toBeCalledTimes(1);
      });

      it('correctly retains query when releasing and re-retaining', () => {
        // NOTE: This simulates a query component unmounting and re-mounting

        const result1 = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is temporarily retained
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);
        // Assert that retain count is 1
        let cacheEntry = QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        );
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert network is called
        expect(environment.execute).toBeCalledTimes(1);

        // Assert permanent retain is established
        const disposable1 = QueryResource.retain(result1);
        expect(release).toBeCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Prepare the query again after it has been permanently retained.
        // This will happen if the query component is unmounting and re-mounting
        const result2 = QueryResource.prepare(
          queryMissingData,
          fetchObservableMissingData,
          fetchPolicy,
          renderPolicy,
        );
        // Assert query is still retained
        expect(release).toHaveBeenCalledTimes(0);
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(queryMissingData);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // First disposable will be called when query component finally unmounts
        disposable1.dispose();

        // Assert that query is temporarily fully released on unmount
        expect(release).toHaveBeenCalledTimes(1);
        expect(environment.retain).toBeCalledTimes(1);
        // Assert that retain count is now 0
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(0);

        // Permanently retain the query after the initial retain has been
        // disposed of. This will occur when the query component remounts.
        const disposable2 = QueryResource.retain(result2);

        // Assert latest temporary retain is released
        expect(release).toBeCalledTimes(1);
        expect(environment.retain).toBeCalledTimes(2);
        // Assert that retain count is now 1
        cacheEntry = QueryResource.getCacheEntry(
          queryMissingData,
          fetchPolicy,
          renderPolicy,
        );
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Running timers won't release the query since it has been
        // permanently retained
        jest.runAllTimers();
        expect(release).toBeCalledTimes(1);
        expect(environment.retain).toBeCalledTimes(2);
        // Assert that retain count is still 1
        expect(cacheEntry && cacheEntry.getRetainCount()).toEqual(1);

        // Assert that disposing the last disposable fully releases the query
        disposable2.dispose();
        expect(release).toBeCalledTimes(2);
        expect(environment.retain).toBeCalledTimes(2);
      });
    });
  });
});
