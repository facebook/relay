/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';
import type {
  LogRequestInfoFunction,
  UploadableMap,
} from '../../../../relay-runtime/network/RelayNetworkTypes';
import type {Sink} from '../../../../relay-runtime/network/RelayObservable';
import type {RequestParameters} from '../../../../relay-runtime/util/RelayConcreteNode';
import type {
  CacheConfig,
  Variables,
} from '../../../../relay-runtime/util/RelayRuntimeTypes';
import type {FetchPolicy, GraphQLResponse, RenderPolicy} from 'relay-runtime';
import type {LogEvent} from 'relay-runtime/store/RelayStoreTypes';

const React = require('react');
const useLazyLoadQuery_REACT_CACHE = require('react-relay/relay-hooks/react-cache/useLazyLoadQuery_REACT_CACHE');
const RelayEnvironmentProvider = require('react-relay/relay-hooks/RelayEnvironmentProvider');
const useLazyLoadQuery_LEGACY = require('react-relay/relay-hooks/useLazyLoadQuery');
const ReactTestRenderer = require('react-test-renderer');
const {
  __internal: {getPromiseForActiveRequest},
  Environment,
  RecordSource,
  RelayFeatureFlags,
  ROOT_ID,
  Store,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const RelayObservable = require('relay-runtime/network/RelayObservable');
const {ROOT_TYPE} = require('relay-runtime/store/RelayStoreUtils');
const RelayReplaySubject = require('relay-runtime/util/RelayReplaySubject');
const {
  disallowConsoleErrors,
  disallowConsoleWarnings,
  disallowWarnings,
  expectConsoleErrorWillFire,
  trackRetentionForEnvironment,
} = require('relay-test-utils-internal');

// $FlowExpectedError[prop-missing] Cache not yet part of Flow types
const {unstable_Cache, useState} = React;
const Cache = unstable_Cache ?? React.Fragment; // Tempporary: for OSS builds still on 17

function isPromise(p: any) {
  return typeof p.then === 'function';
}

/*
Inputs in the QueryResource test suite:
Network policy
Render policy
Query can be fulfilled from store
Query is stale in store
Read multiple times
Does the fetch return synchronously
Does the network request error
Does the component commit
Is it using a fragment
Is it incremental
Are we unsubscribing and then re-subscribing an in-flight query <— not sure what I meant by this???
Is it a live query
Is it retained multiple times (multiple components committed)
Is it SSR

Output:
Does it suspend (and until what incremental stage?)
Does it throw an error
Does it send a network request (how many?)
Does it retain and release (not until all components finished)
Does it re-use the same promise
Does it cancel the network request in flight upon release


Possibly special tests:
correctly retains query when releasing and re-retaining
 */

describe('useLazyLoadQuery_REACT_CACHE', () => {
  beforeAll(() => {
    disallowConsoleErrors();
    disallowConsoleWarnings();
    disallowWarnings();
  });

  graphql`
    fragment useLazyLoadQueryREACTCACHETest1Fragment on User {
      name
    }
  `;
  const query = graphql`
    query useLazyLoadQueryREACTCACHETest1Query($id: ID!) {
      node(id: $id) {
        __typename
        ... on User {
          username
        }
        ...useLazyLoadQueryREACTCACHETest1Fragment
      }
    }
  `;
  const variables = {id: '1'};
  const responsePayload = {
    node: {
      __typename: 'User',
      id: variables.id,
      name: 'Alice',
      username: 'abc',
    },
  };
  const operation = createOperationDescriptor(query, variables, {
    force: true,
  });

  type TestInputs = {
    fetchPolicy: FetchPolicy,
    renderPolicy: RenderPolicy,
    availability:
      | 'available'
      | 'stale'
      | 'missing'
      | 'available-root-fragment-only',
  };
  type TestOutputs = {
    shouldAwaitFetchResult: boolean,
    shouldFetch: boolean,
    shouldBeMissingData?: boolean,
  };
  type Test = [TestInputs, TestOutputs];

  describe.each([
    ['React Cache', useLazyLoadQuery_REACT_CACHE, false],
    ['React Cache with Legacy Timeouts', useLazyLoadQuery_REACT_CACHE, true],
    ['Legacy', useLazyLoadQuery_LEGACY, false],
  ])(
    'Hook implementation: %s',
    (_hookName, useLazyLoadQuery, shouldEnableLegacyTimeouts) => {
      const usingReactCache = useLazyLoadQuery === useLazyLoadQuery_REACT_CACHE;
      // Our open-source build is still on React 17, so we need to skip these tests there:
      if (usingReactCache) {
        // $FlowExpectedError[prop-missing] Cache not yet part of Flow types
        if (React.unstable_getCacheForType === undefined) {
          return;
        }
      }
      let originalReactCacheFeatureFlag;
      beforeEach(() => {
        originalReactCacheFeatureFlag = RelayFeatureFlags.USE_REACT_CACHE;
        RelayFeatureFlags.USE_REACT_CACHE = usingReactCache;
      });
      afterEach(() => {
        RelayFeatureFlags.USE_REACT_CACHE = originalReactCacheFeatureFlag;
      });

      let originalReactCacheTimeoutFeatureFlag;
      beforeEach(() => {
        originalReactCacheTimeoutFeatureFlag =
          RelayFeatureFlags.USE_REACT_CACHE_LEGACY_TIMEOUTS;
        RelayFeatureFlags.USE_REACT_CACHE_LEGACY_TIMEOUTS =
          shouldEnableLegacyTimeouts;
      });
      afterEach(() => {
        RelayFeatureFlags.USE_REACT_CACHE_LEGACY_TIMEOUTS =
          originalReactCacheTimeoutFeatureFlag;
      });

      let environment;
      let fetch;
      let subject: RelayReplaySubject<GraphQLResponse>;
      let logs;
      let release;
      let isOperationRetained;

      let errorBoundaryDidCatchFn;
      class ErrorBoundary extends React.Component<any, any> {
        state: {error: ?Error} = {error: null};
        componentDidCatch(error: Error) {
          errorBoundaryDidCatchFn(error);
          this.setState({error});
        }
        render(): React.Node {
          const {children, fallback} = this.props;
          const {error} = this.state;
          if (error) {
            return React.createElement(fallback, {error});
          }
          return children;
        }
      }

      function Wrappers({
        env,
        children,
      }: {
        children: React.Node,
        env: Environment,
      }) {
        return (
          <RelayEnvironmentProvider environment={env}>
            <ErrorBoundary
              fallback={({error}) =>
                `Error: ${error.message + ': ' + error.stack}`
              }>
              <React.Suspense fallback="Fallback">{children}</React.Suspense>
            </ErrorBoundary>
          </RelayEnvironmentProvider>
        );
      }

      beforeEach(() => {
        jest.clearAllTimers();
        errorBoundaryDidCatchFn = jest.fn<[Error], mixed>();
        logs = ([]: Array<LogEvent>);
        subject = new RelayReplaySubject();
        fetch = jest.fn(
          (
            _query: ?(
              | LogRequestInfoFunction
              | UploadableMap
              | RequestParameters
              | Variables
              | CacheConfig
            ),
            _vars: ?(
              | LogRequestInfoFunction
              | UploadableMap
              | RequestParameters
              | Variables
              | CacheConfig
            ),
            config: ?(
              | LogRequestInfoFunction
              | UploadableMap
              | RequestParameters
              | Variables
              | CacheConfig
            ),
          ) => {
            return RelayObservable.create((sink: Sink<GraphQLResponse>) => {
              subject.subscribe(sink);
            });
          },
        );
        environment = new Environment({
          // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
          network: RelayNetwork.create(fetch),
          store: new Store(new RecordSource(), {
            gcReleaseBufferSize: 0,
            gcScheduler: f => f(),
          }),
          log: event => {
            logs.push(event);
          },
        });
        // $FlowExpectedError[method-unbinding]
        // $FlowExpectedError[cannot-write]
        environment.execute = jest.fn(environment.execute.bind(environment));
        ({release_DEPRECATED: release, isOperationRetained} =
          trackRetentionForEnvironment(environment));
      });

      // NB we can remove a level of nesting here (the inner arrays) if we can
      // figure out how to Flow-type the interface of describe.each. It accepts
      // an array of either arrays of arguments or single arguments (which is what
      // would allow us to remove second array level).
      describe.each(
        ([
          /******** store-or-network ********/
          [
            {
              fetchPolicy: 'store-or-network',
              renderPolicy: 'full',
              availability: 'missing',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-or-network',
              renderPolicy: 'full',
              availability: 'available',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
            },
          ],
          [
            {
              fetchPolicy: 'store-or-network',
              renderPolicy: 'full',
              availability: 'stale',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-or-network',
              renderPolicy: 'full',
              availability: 'available-root-fragment-only',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],

          [
            {
              fetchPolicy: 'store-or-network',
              renderPolicy: 'partial',
              availability: 'missing',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-or-network',
              renderPolicy: 'partial',
              availability: 'available',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
            },
          ],
          [
            {
              fetchPolicy: 'store-or-network',
              renderPolicy: 'partial',
              availability: 'stale',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-or-network',
              renderPolicy: 'partial',
              availability: 'available-root-fragment-only',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: true,
            },
          ],

          /******** network-only ********/
          [
            {
              fetchPolicy: 'network-only',
              renderPolicy: 'full',
              availability: 'missing',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'network-only',
              renderPolicy: 'full',
              availability: 'available',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'network-only',
              renderPolicy: 'full',
              availability: 'stale',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'network-only',
              renderPolicy: 'full',
              availability: 'available-root-fragment-only',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],

          [
            {
              fetchPolicy: 'network-only',
              renderPolicy: 'partial',
              availability: 'missing',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'network-only',
              renderPolicy: 'partial',
              availability: 'available',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'network-only',
              renderPolicy: 'partial',
              availability: 'stale',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'network-only',
              renderPolicy: 'partial',
              availability: 'available-root-fragment-only',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],

          /******** store-and-network ********/
          [
            {
              fetchPolicy: 'store-and-network',
              renderPolicy: 'full',
              availability: 'missing',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-and-network',
              renderPolicy: 'full',
              availability: 'available',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-and-network',
              renderPolicy: 'full',
              availability: 'stale',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-and-network',
              renderPolicy: 'full',
              availability: 'available-root-fragment-only',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],

          [
            {
              fetchPolicy: 'store-and-network',
              renderPolicy: 'partial',
              availability: 'missing',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-and-network',
              renderPolicy: 'partial',
              availability: 'available',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-and-network',
              renderPolicy: 'partial',
              availability: 'stale',
            },
            {
              shouldAwaitFetchResult: true,
              shouldFetch: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-and-network',
              renderPolicy: 'partial',
              availability: 'available-root-fragment-only',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: true,
            },
          ],

          /******** store-only ********/
          [
            {
              fetchPolicy: 'store-only',
              renderPolicy: 'full',
              availability: 'missing',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
              shouldBeMissingData: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-only',
              renderPolicy: 'full',
              availability: 'available',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
            },
          ],
          [
            {
              fetchPolicy: 'store-only',
              renderPolicy: 'full',
              availability: 'stale',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
            },
          ],
          [
            {
              fetchPolicy: 'store-only',
              renderPolicy: 'full',
              availability: 'available-root-fragment-only',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
            },
          ],

          [
            {
              fetchPolicy: 'store-only',
              renderPolicy: 'partial',
              availability: 'missing',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
              shouldBeMissingData: true,
            },
          ],
          [
            {
              fetchPolicy: 'store-only',
              renderPolicy: 'partial',
              availability: 'available',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
            },
          ],
          [
            {
              fetchPolicy: 'store-only',
              renderPolicy: 'partial',
              availability: 'stale',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
            },
          ],
          [
            {
              fetchPolicy: 'store-only',
              renderPolicy: 'partial',
              availability: 'available-root-fragment-only',
            },
            {
              shouldAwaitFetchResult: false,
              shouldFetch: false,
            },
          ],
        ]: Array<Test>),
      )(
        'Suspending and fetching behavior: %o',
        (
          {fetchPolicy, renderPolicy, availability},
          {shouldAwaitFetchResult, shouldFetch, shouldBeMissingData},
        ) => {
          // If we're supposed to be performing a fetch, perform tests for whether
          // the fetch returns data synchronously and whether it results in an error.
          // If there's no fetch being performed, this is irrelevant so just do one test.
          let innerTable;
          if (shouldFetch) {
            innerTable = [
              [{responseIsSynchronous: false, responseIsRejected: false}],
              [{responseIsSynchronous: false, responseIsRejected: true}],
              [{responseIsSynchronous: true, responseIsRejected: false}],
              [{responseIsSynchronous: true, responseIsRejected: true}],
            ];
          } else {
            innerTable = [[{}]];
          }
          it.each(innerTable)(
            'With the response (or {} if not applicable) being: %o',
            ({responseIsSynchronous, responseIsRejected}) => {
              // Assertions about the test table itself, because these are things that
              // should always be true:
              if (fetchPolicy === 'network-only') {
                expect(shouldAwaitFetchResult).toBe(true);
                expect(shouldFetch).toBe(true);
              }

              if (fetchPolicy === 'store-only') {
                expect(shouldAwaitFetchResult).toBe(false);
                expect(shouldFetch).toBe(false);
              } else {
                if (renderPolicy === 'full' && availability !== 'available') {
                  expect(shouldAwaitFetchResult).toBe(true);
                  expect(shouldFetch).toBe(true);
                }
                if (availability === 'stale') {
                  expect(shouldAwaitFetchResult).toBe(true);
                  expect(shouldFetch).toBe(true);
                }
              }

              const shouldSuspend =
                shouldAwaitFetchResult && !responseIsSynchronous;
              const shouldThrowError =
                responseIsRejected &&
                (shouldAwaitFetchResult || responseIsSynchronous);

              const thrownPromises = new Set<any>();
              let numberOfRendersObserved = 0;
              function TestComponent({output}: {output: boolean}) {
                numberOfRendersObserved++;
                try {
                  const data = useLazyLoadQuery(query, variables, {
                    fetchPolicy,
                    UNSTABLE_renderPolicy: renderPolicy,
                  });
                  if (output) {
                    return data.node?.username ?? 'Data is missing';
                  } else {
                    return null;
                  }
                } catch (p) {
                  if (isPromise(p)) {
                    thrownPromises.add(p);
                  }
                  throw p;
                }
              }

              if (availability === 'available' || availability === 'stale') {
                // The data needed to fulfill the query, including sub-fragments:
                environment.commitPayload(operation, responsePayload);
                expect(environment.check(operation)).toEqual({
                  status: 'available',
                  fetchTime: null,
                });
              } else if (availability === 'available-root-fragment-only') {
                // Not the data needed to fulfill the entire query, just the data needed
                // for the top-level root fragment, to demonstrate partial rendering:
                environment.commitUpdate(store => {
                  let root = store.get(ROOT_ID);
                  if (!root) {
                    root = store.create(ROOT_ID, ROOT_TYPE);
                  }
                  const record = store.create(variables.id, 'User');
                  record.setValue('abc', 'username');
                  record.setValue(variables.id, 'id');
                  root.setLinkedRecord(record, 'node', {id: variables.id});
                });
              }

              if (availability === 'stale') {
                environment.commitUpdate(storeProxy => {
                  storeProxy.invalidateStore();
                });
                expect(environment.check(operation)).toEqual({status: 'stale'});
              }

              function deliverNetworkResponse() {
                if (responseIsRejected) {
                  subject.error(new Error('Error message'));
                } else {
                  subject.next({data: responsePayload});
                  subject.complete();
                }
              }

              if (responseIsSynchronous) {
                deliverNetworkResponse();
              }

              // Create the React tree and then cause it to be re-rendered some
              // number of times, to test idempotence. We perform an initial render first
              // without the Cache boundary (or its contents) so that we can later unmount
              // that Cache boundary -- if it was all rendered together it would share
              // a cache with the root, and currently TestRenderer has no way to destroy
              // the root to test unmounting. Also, we have to render the cache boundary before
              // the test component so that the boundary is created even if we suspend.
              const container = ReactTestRenderer.create(<div />);
              container.update(<Cache />);

              const numberOfRenders = 2;
              const numberOfComponents = 2;

              if (shouldThrowError && responseIsSynchronous) {
                expectConsoleErrorWillFire(
                  'The above error occurred in the <TestComponent> component',
                  {count: numberOfComponents},
                );
              }
              for (let i = 0; i < numberOfRenders; i++) {
                container.update(
                  <Cache>
                    <Wrappers env={environment}>
                      {new Array<void>(numberOfComponents)
                        .fill()
                        .map((a, k) => (
                          <TestComponent key={k} output={k === 0} />
                        ))}
                    </Wrappers>
                  </Cache>,
                );
              }
              expect(numberOfRendersObserved).toBe(
                responseIsSynchronous && responseIsRejected
                  ? numberOfComponents
                  : numberOfRenders * numberOfComponents,
              );
              expect(thrownPromises.size).toBe(shouldSuspend ? 1 : 0); // Ensure same promise is re-thrown each time
              // $FlowExpectedError[method-unbinding]
              expect(environment.execute).toBeCalledTimes(shouldFetch ? 1 : 0);
              // $FlowExpectedError[method-unbinding]
              expect(environment.retain).toBeCalledTimes(1);
              expect(release).toBeCalledTimes(0);

              const promise = getPromiseForActiveRequest(
                environment,
                operation.request,
              );
              expect(promise != null).toEqual(
                shouldFetch && !responseIsSynchronous, // if synchronous, request will no longer be active
              );
              if (promise != null) {
                promise.catch(() => {}); // Avoid "Possible Unhandled Promise Rejection" guardrail.
              }

              if (shouldSuspend) {
                expect(container.toJSON()).toBe('Fallback');
                expect(fetch).toBeCalledTimes(1); // No duplicate requests
                if (shouldThrowError) {
                  expectConsoleErrorWillFire(
                    'The above error occurred in the <TestComponent> component',
                    {count: numberOfComponents},
                  );
                }
                ReactTestRenderer.act(() => {
                  deliverNetworkResponse();
                  jest.runAllImmediates();
                });
              } else {
                ReactTestRenderer.act(() => {
                  jest.runAllImmediates();
                });
              }

              const output = container.toJSON();
              if (shouldThrowError) {
                expect(output).toEqual(expect.stringContaining('Error'));
              } else if (shouldBeMissingData) {
                expect(output).toBe('Data is missing');
              } else {
                expect(output).toBe('abc');
              }

              // $FlowExpectedError[method-unbinding]
              expect(environment.retain).toBeCalledTimes(1);
              expect(release).toBeCalledTimes(0);
              container.unmount();
              ReactTestRenderer.act(() => {
                jest.runAllImmediates();
              });

              // $FlowExpectedError[method-unbinding]
              expect(environment.retain).toBeCalledTimes(1);

              // With the new implementation we support two behaviors:
              // The new behavior, in which unmounting the Cache component
              // above our component causes us to release;
              // And the legacy behavior, where in some cases it isn't released
              // until a timeout.
              if (usingReactCache && !shouldEnableLegacyTimeouts) {
                expect(release).toBeCalledTimes(1);
              } else {
                // We rely on the timeout only in case we throw an error, otherwise we'll have
                // switched to a permanent retain and then released when the tree unmounted.
                if (!shouldThrowError) {
                  expect(release).toBeCalledTimes(1);
                } else {
                  expect(release).toBeCalledTimes(0);
                  ReactTestRenderer.act(() => {
                    jest.runAllTimers();
                  });
                  expect(release).toBeCalledTimes(1);
                }
              }
            },
          );
        },
      );

      it('Distinguishes environments', () => {
        // Ensures that the pending/error/resolved state of a query (as opposed
        // to just the resulting value) is distinguished from one environment
        // to another. A regression test.
        // Create two enviroments where one has the data available and the other not:
        const env1 = new Environment({
          // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
          network: RelayNetwork.create(fetch),
          store: new Store(new RecordSource()),
        });
        const env2 = new Environment({
          // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
          network: RelayNetwork.create(fetch),
          store: new Store(new RecordSource()),
        });
        env1.commitPayload(operation, responsePayload);

        // Render the same component within each of the enviroments but
        // sharing a React Cache component:
        function UsesQuery(_props: {}) {
          const data = useLazyLoadQuery(query, variables);
          return data.node?.username ?? 'Data is missing';
        }
        function TestComponent(_props: {}) {
          return (
            <RelayEnvironmentProvider environment={env1}>
              <UsesQuery />
              <RelayEnvironmentProvider environment={env2}>
                <React.Suspense fallback="Fallback">
                  <UsesQuery />
                </React.Suspense>
              </RelayEnvironmentProvider>
            </RelayEnvironmentProvider>
          );
        }

        const container = ReactTestRenderer.create(
          <Cache>
            <Wrappers env={environment}>
              <TestComponent />
            </Wrappers>
          </Cache>,
        );

        // If this behavior were not met, it would be 'Data missing' instead of
        // 'Fallback' because the read in the second environment would have seen
        // the 'resolved' state of the query from the first environment since they
        // share a Cache.
        expect(container.toJSON()).toEqual(['abc', 'Fallback']);

        container.unmount();
        ReactTestRenderer.act(() => {
          jest.runAllImmediates();
        });
      });

      it('Honors fetchKey', () => {
        let setFetchKey;
        function TestComponent(_props: {}) {
          let fetchKey;
          [fetchKey, setFetchKey] = useState(0);
          return useLazyLoadQuery(query, variables, {
            fetchKey,
            fetchPolicy: 'network-only',
          })?.node?.username;
        }
        const container = ReactTestRenderer.create(
          <Cache>
            <Wrappers env={environment}>
              <TestComponent />
            </Wrappers>
          </Cache>,
        );
        expect(container.toJSON()).toBe('Fallback');

        ReactTestRenderer.act(() => {
          subject.next({data: responsePayload});
          subject.complete();
          jest.runAllImmediates();
        });
        expect(container.toJSON()).toBe('abc');

        // When we set the fetchKey, the component should suspend again as it initiates a
        // new network request and awaits its response:
        ReactTestRenderer.act(() => {
          subject = new RelayReplaySubject(); // prepare new network response instead of replaying last one
          setFetchKey(1);
        });
        expect(container.toJSON()).toBe('Fallback');

        ReactTestRenderer.act(() => {
          subject.next({data: responsePayload});
          subject.complete();
          jest.runAllImmediates();
        });
        expect(container.toJSON()).toBe('abc');

        ReactTestRenderer.act(() => {
          container.unmount();
        });
      });

      it('Retains the query when two components use the same query and one of them unmounts while the other is suspended', () => {
        function UsesQuery(_props: {}) {
          useLazyLoadQuery(query, variables);
          return null;
        }
        let unsuspend;
        let promise: void | null | Promise<mixed>;
        function UsesQueryButAlsoSeparatelySuspends(_props: {}) {
          const data = useLazyLoadQuery(query, variables);
          if (promise === undefined) {
            promise = new Promise(r => {
              unsuspend = () => {
                promise = null;
                r();
              };
            });
          }
          if (promise != null) {
            throw promise;
          }
          return data.node?.username ?? 'Data is missing';
        }

        let unmountChild;
        function TestComponent(_props: {}) {
          const [hasChild, setHasChild] = useState(true);
          unmountChild = () => setHasChild(false);
          return (
            <>
              {hasChild && <UsesQuery />}
              <React.Suspense fallback="Inner Fallback">
                <UsesQueryButAlsoSeparatelySuspends />
              </React.Suspense>
            </>
          );
        }

        environment.commitPayload(operation, responsePayload);
        expect(environment.check(operation)).toEqual({
          status: 'available',
          fetchTime: null,
        });

        const container = ReactTestRenderer.create(<div />);
        container.update(<Cache />);
        container.update(
          <Cache>
            <Wrappers env={environment}>
              <TestComponent />
            </Wrappers>
          </Cache>,
        );
        expect(container.toJSON()).toBe('Inner Fallback');

        ReactTestRenderer.act(() => unmountChild());
        expect(container.toJSON()).toBe('Inner Fallback');
        // This is what would happen if we were to solve this edge case
        // completely, but it seems like we cannot currently do so, so the
        // solution is to just re-fetch the query if needed when the second
        // component comes out of suspense.
        // NB: The QueryResource/SuspensResource implementation does handle
        // this -- it looks like it's creating two separate cache entries with
        // the same key!
        // expect(isOperationRetained(operation)).toBe(true);
        ReactTestRenderer.act(() => {
          unsuspend();
          jest.runAllImmediates();
        });
        expect(container.toJSON()).toBe('abc');
        expect(isOperationRetained(operation)).toBe(true);
      });

      it('Handles this other weird situation that it initially did not handle', () => {
        // This is a regression test for a situation that hit a bug initially where the retain
        // count was being updated on an out-of-date cache entry instead of the correct one.
        function UsesQuery(_props: {}) {
          useLazyLoadQuery(query, variables);
          return null;
        }
        let unsuspend;
        let promise: void | null | Promise<mixed>;
        function UsesQueryButAlsoSeparatelySuspends(_props: {}) {
          const data = useLazyLoadQuery(query, variables);
          if (promise === undefined) {
            promise = new Promise(r => {
              unsuspend = () => {
                promise = null;
                r();
              };
            });
            throw promise;
          }
          return data.node?.username ?? 'Data is missing';
        }

        let unmountChild;
        function TestComponent(_props: {}) {
          const [hasChild, setHasChild] = useState(true);
          unmountChild = () => setHasChild(false);
          return (
            <>
              {hasChild && <UsesQuery />}
              <React.Suspense fallback="Inner Fallback">
                <UsesQueryButAlsoSeparatelySuspends />
              </React.Suspense>
            </>
          );
        }

        environment.commitPayload(operation, responsePayload);
        expect(environment.check(operation)).toEqual({
          status: 'available',
          fetchTime: null,
        });

        const container = ReactTestRenderer.create(<div />);
        container.update(<Cache />);
        container.update(
          <Cache>
            <Wrappers env={environment}>
              <TestComponent />
            </Wrappers>
          </Cache>,
        );
        expect(container.toJSON()).toBe('Inner Fallback');

        ReactTestRenderer.act(() => unmountChild());
        ReactTestRenderer.act(() => {
          unsuspend();
          jest.runAllImmediates();
        });
        expect(container.toJSON()).toBe('abc');
        expect(isOperationRetained(operation)).toBe(true);
      });

      it('Handles a second component needing a timeout', () => {
        // In legacy timeouts mode, make sure that we handle this sequnece of events:
        // 1 component accesses an uninitialized entry, initializes it and starts the timer
        // 2 component mounts
        // 3 a new component accesses this entry on render
        // 4 before the new component (3) mounts, the earlier component (1) unmounts and removes the entry.
        function Component1(_props: {}) {
          useLazyLoadQuery(query, variables);
          return null;
        }

        let unsuspendComponent2;
        let promise: void | null | Promise<mixed>;
        function Component2(_props: {}) {
          const data = useLazyLoadQuery(query, variables);
          if (promise === undefined) {
            promise = new Promise(r => {
              unsuspendComponent2 = () => {
                promise = null;
                r();
              };
            });
          }
          if (promise != null) {
            throw promise;
          }
          return data.node?.username ?? 'Data is missing';
        }

        environment.commitPayload(operation, responsePayload);
        expect(environment.check(operation)).toEqual({
          status: 'available',
          fetchTime: null,
        });

        let hideComponent1;
        let showComponent2;
        function TestComponent(_props: {}) {
          const [component1Visible, setComponent1Visible] = useState(true);
          const [component2Visible, setComponent2Visible] = useState(false);
          hideComponent1 = () => setComponent1Visible(false);
          showComponent2 = () => setComponent2Visible(true);

          return (
            <>
              {component1Visible && <Component1 />}
              <React.Suspense fallback="Inner Fallback">
                {component2Visible && <Component2 />}
              </React.Suspense>
            </>
          );
        }

        const container = ReactTestRenderer.create(<div />);
        container.update(<Cache />);
        container.update(
          <Cache>
            <Wrappers env={environment}>
              <TestComponent />
            </Wrappers>
          </Cache>,
        );

        // Bring Component2 into the tree; it will suspend.
        // While it's suspended, remove component 1.
        ReactTestRenderer.act(() => {
          showComponent2();
          jest.runAllImmediates();
        });
        ReactTestRenderer.act(() => {
          hideComponent1();
          jest.runAllImmediates();
          jest.runAllTimers();
        });

        //  Now Component2 should have still retained the query and be able to read it:
        expect(isOperationRetained(operation)).toBe(true);
        ReactTestRenderer.act(() => {
          unsuspendComponent2();
          jest.runAllImmediates();
        });
        expect(container.toJSON()).toBe('abc');
        expect(isOperationRetained(operation)).toBe(true);
      });
    },
  );
});
