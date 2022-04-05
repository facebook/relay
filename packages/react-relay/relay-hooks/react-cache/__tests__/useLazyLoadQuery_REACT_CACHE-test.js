/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {FetchPolicy, RenderPolicy} from 'relay-runtime';

const React = require('react');
const useLazyLoadQuery_REACT_CACHE = require('react-relay/relay-hooks/react-cache/useLazyLoadQuery_REACT_CACHE');
const RelayEnvironmentProvider = require('react-relay/relay-hooks/RelayEnvironmentProvider');
const useLazyLoadQuery_LEGACY = require('react-relay/relay-hooks/useLazyLoadQuery');
const ReactTestRenderer = require('react-test-renderer');
const {
  Environment,
  RecordSource,
  RelayFeatureFlags,
  ROOT_ID,
  Store,
  __internal: {getPromiseForActiveRequest},
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const RelayObservable = require('relay-runtime/network/RelayObservable');
const {ROOT_TYPE} = require('relay-runtime/store/RelayStoreUtils');
const RelayReplaySubject = require('relay-runtime/util/RelayReplaySubject');
const {
  disallowConsoleErrors,
  disallowWarnings,
  expectConsoleErrorWillFire,
} = require('relay-test-utils-internal');

// $FlowExpectedError[prop-missing] Cache not yet part of Flow types
const {unstable_Cache} = React;
const Cache = unstable_Cache ?? React.Fragment; // Tempporary: for OSS builds still on 17

function isPromise(p) {
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
    disallowWarnings();
  });

  type TestInputs = {|
    fetchPolicy: FetchPolicy,
    renderPolicy: RenderPolicy,
    availability:
      | 'available'
      | 'stale'
      | 'missing'
      | 'available-root-fragment-only',
  |};
  type TestOutputs = {|
    shouldAwaitFetchResult: boolean,
    shouldFetch: boolean,
    shouldBeMissingData?: boolean,
  |};
  type Test = [TestInputs, TestOutputs];

  describe.each([
    ['React Cache', useLazyLoadQuery_REACT_CACHE],
    ['Legacy', useLazyLoadQuery_LEGACY],
  ])('Hook implementation: %s', (_hookName, useLazyLoadQuery) => {
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

    let environment;
    let fetch;
    let subject;
    let logs;
    let release;

    let errorBoundaryDidCatchFn;
    class ErrorBoundary extends React.Component<any, any> {
      state = {error: null};
      componentDidCatch(error) {
        errorBoundaryDidCatchFn(error);
        this.setState({error});
      }
      render() {
        const {children, fallback} = this.props;
        const {error} = this.state;
        if (error) {
          return React.createElement(fallback, {error});
        }
        return children;
      }
    }

    function Wrappers({env, children}) {
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
      errorBoundaryDidCatchFn = jest.fn();
      logs = [];
      subject = new RelayReplaySubject();
      fetch = jest.fn((query, vars, config) => {
        return RelayObservable.create(sink => {
          subject.subscribe(sink);
        });
      });
      environment = new Environment({
        network: RelayNetwork.create(fetch),
        store: new Store(new RecordSource(), {
          gcReleaseBufferSize: 0,
          gcScheduler: f => f(),
        }),
        log: event => {
          logs.push(event);
        },
      });

      release = jest.fn();
      // $FlowExpectedError[method-unbinding]
      // $FlowExpectedError[cannot-write]
      environment.execute = jest.fn(environment.execute.bind(environment));
      // $FlowExpectedError[cannot-write]
      environment.retain = jest.fn((...args) => {
        return {
          dispose: release,
        };
      });
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

            const thrownPromises = new Set();
            let numberOfRendersObserved = 0;
            function TestComponent({output}) {
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

            const operation = createOperationDescriptor(query, variables, {
              force: true,
            });

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
                    {new Array(numberOfComponents).fill().map((a, k) => (
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

            // The calling of release is currently divergent between the old and
            // new implementations, because new does it by the cache boundary
            // being unmounted, while old does it by a timeout. However, we will
            // soon implement a transitional timeout behavior to make them equal.
            if (useLazyLoadQuery === useLazyLoadQuery_REACT_CACHE) {
              expect(release).toBeCalledTimes(1);
            }
          },
        );
      },
    );
  });
});
