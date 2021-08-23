/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');

const usePreloadedQuery = require('../usePreloadedQuery');
const useQueryLoader = require('../useQueryLoader');

const {loadQuery} = require('../loadQuery');
const {useEffect} = require('react');
const {
  Observable,
  createOperationDescriptor,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

function expectToHaveFetched(environment, query, cacheConfig) {
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.executeWithSource).toBeCalledTimes(1);
  expect(
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.executeWithSource.mock.calls[0][0].operation,
  ).toMatchObject({
    fragment: expect.anything(),
    request: {
      node: query.request.node,
      variables: query.request.variables,
    },
    root: expect.anything(),
  });
  expect(
    environment.mock.isLoading(
      query.request.node,
      query.request.variables,
      cacheConfig,
    ),
  ).toEqual(true);
}

// TODO(T83890478): enable once double invoked effects lands in xplat
describe.skip('useQueryLoader-react-double-effects', () => {
  let environment;
  let gqlQuery;
  let query;
  let variables;
  let release;
  let cancelNetworkRequest;
  let render;
  let QueryComponent;
  let LoaderComponent;
  let queryRenderLogs;
  let loaderRenderLogs;

  beforeEach(() => {
    jest.mock('scheduler', () => require('scheduler/unstable_mock'));

    environment = createMockEnvironment();

    release = jest.fn();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const originalRetain = environment.retain;
    (environment: $FlowFixMe).retain = jest.fn(operation => {
      const originalDisposable = originalRetain(operation);
      return {
        dispose() {
          release();
          return originalDisposable.dispose();
        },
      };
    });

    cancelNetworkRequest = jest.fn();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const originalExecuteWithSource = environment.executeWithSource;
    (environment: $FlowFixMe).executeWithSource = jest.fn((...args) => {
      const originalObservable = originalExecuteWithSource(...args);

      return Observable.create(sink => {
        const sub = originalObservable.subscribe(sink);
        return () => {
          cancelNetworkRequest();
          sub.unsubscribe();
        };
      });
    });

    graphql`
      fragment useQueryLoaderReactDoubleEffectsTestUserFragment on User {
        name
      }
    `;
    gqlQuery = getRequest(graphql`
      query useQueryLoaderReactDoubleEffectsTestQuery($id: ID) {
        node(id: $id) {
          id
          name
          ...useQueryLoaderReactDoubleEffectsTestUserFragment
        }
      }
    `);
    // $FlowFixMe
    gqlQuery.params.cacheID = 'TestQuery';
    variables = {id: '1'};
    query = createOperationDescriptor(gqlQuery, variables);

    queryRenderLogs = [];
    QueryComponent = function(props) {
      const result = usePreloadedQuery(gqlQuery, (props.queryRef: $FlowFixMe));

      const name = result?.node?.name ?? 'Empty';
      useEffect(() => {
        queryRenderLogs.push(`commit: ${name}`);
        return () => {
          queryRenderLogs.push(`cleanup: ${name}`);
        };
      }, [name]);

      queryRenderLogs.push(`render: ${name}`);
      return name;
    };

    loaderRenderLogs = [];
    LoaderComponent = function(props) {
      const [queryRef, _loadQuery] = useQueryLoader(
        gqlQuery,
        props.initialQueryRef,
      );

      const queryRefId = queryRef == null ? 'null' : queryRef.id ?? 'Unknown';
      useEffect(() => {
        loaderRenderLogs.push(`commit: ${queryRefId}`);
        return () => {
          loaderRenderLogs.push(`cleanup: ${queryRefId}`);
        };
      }, [queryRefId]);

      loaderRenderLogs.push(`render: ${queryRefId}`);

      if (queryRef == null) {
        return 'No query loaded';
      }
      if (props.suspendWholeTree === true) {
        return <QueryComponent queryRef={queryRef} />;
      }
      return (
        <React.Suspense fallback="Loading preloaded query...">
          <QueryComponent queryRef={queryRef} />
        </React.Suspense>
      );
    };

    render = function(initialQueryRef, {suspendWholeTree} = {}): $FlowFixMe {
      let instance;
      ReactTestRenderer.act(() => {
        instance = ReactTestRenderer.create(
          // Using StrictMode will trigger double invoke effect behavior
          <React.StrictMode>
            <RelayEnvironmentProvider environment={environment}>
              <React.Suspense fallback="Outer Fallback">
                <LoaderComponent
                  initialQueryRef={initialQueryRef}
                  suspendWholeTree={suspendWholeTree}
                />
              </React.Suspense>
            </RelayEnvironmentProvider>
          </React.StrictMode>,
          // $FlowFixMe
          {unstable_isConcurrent: true},
        );
      });
      return instance;
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('when there is no committed query reference', () => {
    it('does nothing when effects are double invoked (i.e. component is hidden/re-shown)', () => {
      // When the component mounts, React double invoke effects
      // will be triggered, simulating what would happen if the
      // component was hidden and then re-shown, in this case
      // without an actively committed query reference.
      const instance = render();
      expect(instance.toJSON()).toEqual('No query loaded');

      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.execute).toHaveBeenCalledTimes(0);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(0);
      expect(release).toHaveBeenCalledTimes(0);
      expect(cancelNetworkRequest).toHaveBeenCalledTimes(0);
      // Assert that double effects are triggered without causing any changes
      expect(loaderRenderLogs).toEqual([
        'render: null',
        'commit: null',
        'cleanup: null',
        'commit: null',
      ]);
    });
  });

  // To simulate the case where the component is hidden and then re-shown
  // with an active query reference, i.e. after loadQuery has been called,
  // we need to pass in an initial query reference, because we have no way to
  // actually trigger "hiding" and "showing" the component after it has
  // committed (since the Offscreen API hasn't been released yet).
  // Instead, we assert that the query ref passed as input is correctly handled
  // when double invoke effects are triggered on mount.
  describe('when there is a committed query reference when effects are double invoked (i.e. component is hidden/re-shown)', () => {
    describe('when network request is in flight when effects are double invoked (i.e. component is hidden/re-shown)', () => {
      it('forces a re-render and refetches when policy is network-only', () => {
        const initialQueryRef = loadQuery(environment, gqlQuery, variables, {
          fetchPolicy: 'network-only',
        });
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.executeWithSource.mockClear();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.retain.mockClear();

        // When the component mounts, React double invoke effects
        // will be triggered, simulating what would happen if the
        // component was hidden and then re-shown, in this case
        // with an actively committed query reference.
        const instance = render(initialQueryRef);

        // The effect cleanup will execute, so we assert
        // that the current query ref is released, meaning that
        // the request is canceled and the query is released when
        // the query reference is disposed.
        expect(cancelNetworkRequest).toHaveBeenCalledTimes(0);
        expect(release).toHaveBeenCalledTimes(1);

        // The effect setup will re-execute, so we assert that
        // a re-render is triggered to refetch, re-retain the query ref:

        // Assert query wasn't refetched, since the request wasn't cancelled
        // a new network request is not necessary
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toBeCalledTimes(0);

        // Assert that the component consuming the query is suspended
        expect(instance.toJSON()).toEqual('Loading preloaded query...');

        // Assert that the query is re-retained.
        // Retain is called 3 times here because the component consuming
        // the query is also temporarily retains the query while suspended:
        // - suspended component temporary retains
        // - loadQuery re-retains
        // - suspended component temporary retains
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(3);

        // Assert the rendered state of the loader and query components
        expect(queryRenderLogs).toEqual([
          // These logs should be empty since this component
          // is suspended and shouldn't have committed yet
        ]);
        expect(loaderRenderLogs).toEqual([
          // Assert component rendered and committed when network resolved:
          'render: TestQuery',
          'commit: TestQuery',

          // Assert double invoked effects simulates an unmount and remount.
          // Note that render doesn't happen in between:
          'cleanup: TestQuery',
          'commit: TestQuery',

          // Assert final re-render triggered by new call to loadQuery.
          // It does not trigger a commit since the queryRef ID hasn't changed
          'render: TestQuery',
        ]);

        // Resolve network response
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.executeWithSource.mockClear();
        ReactTestRenderer.act(() => {
          environment.mock.resolve(gqlQuery, {
            data: {
              node: {
                __typename: 'User',
                id: variables.id,
                name: 'Alice',
              },
            },
          });
          jest.runAllImmediates();
        });

        // Assert that the component consuming the query is no longer
        // suspended
        expect(instance.toJSON()).toEqual('Alice');

        // Assert that the Suspense cache temporary retain is released
        // and re-established permanently.
        // Note that the initial render during suspense will never commit
        // which means that it's temporary retain will be released after
        // the timeout fires.
        expect(release).toHaveBeenCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(4);

        // Assert the render state after double invoked effects have
        // triggered
        expect(queryRenderLogs).toEqual([
          'render: Alice',
          'commit: Alice',
          'cleanup: Alice',
          'commit: Alice',
          'render: Alice',
        ]);

        // Assert that the temporary retain that never commits
        // gets released
        ReactTestRenderer.act(() => {
          jest.runAllTimers();
        });
        expect(release).toHaveBeenCalledTimes(3);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(4);
      });

      it('forces a re-render and refetches when policy is store-or-network', () => {
        const initialQueryRef = loadQuery(environment, gqlQuery, variables, {
          fetchPolicy: 'store-or-network',
        });
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.executeWithSource.mockClear();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.retain.mockClear();

        // When the component mounts, React double invoke effects
        // will be triggered, simulating what would happen if the
        // component was hidden and then re-shown, in this case
        // with an actively committed query reference.
        const instance = render(initialQueryRef);

        // The effect cleanup will execute, so we assert
        // that the current query ref is released, meaning that
        // the request is canceled and the query is released when
        // the query reference is disposed.
        expect(cancelNetworkRequest).toHaveBeenCalledTimes(0);
        expect(release).toHaveBeenCalledTimes(1);

        // The effect setup will re-execute, so we assert that
        // a re-render is triggered to refetch, re-retain the query ref:

        // Assert query wasn't refetched, since the request wasn't cancelled
        // a new network request is not necessary
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toBeCalledTimes(0);

        // Assert that the component consuming the query is suspended
        expect(instance.toJSON()).toEqual('Loading preloaded query...');

        // Assert that the query is re-retained.
        // Retain is called 3 times here because the component consuming
        // the query is also temporarily retains the query while suspended:
        // - suspended component temporary retains
        // - loadQuery re-retains
        // - suspended component temporary retains
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(3);

        // Assert the rendered state of the loader and query components
        expect(queryRenderLogs).toEqual([
          // These logs should be empty since this component
          // is suspended and shouldn't have committed yet
        ]);
        expect(loaderRenderLogs).toEqual([
          // Assert component rendered and committed when network resolved:
          'render: TestQuery',
          'commit: TestQuery',

          // Assert double invoked effects simulates an unmount and remount.
          // Note that render doesn't happen in between:
          'cleanup: TestQuery',
          'commit: TestQuery',

          // Assert final re-render triggered by new call to loadQuery.
          // It does not trigger a commit since the queryRef ID hasn't changed
          'render: TestQuery',
        ]);

        // Resolve network response
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.executeWithSource.mockClear();
        ReactTestRenderer.act(() => {
          environment.mock.resolve(gqlQuery, {
            data: {
              node: {
                __typename: 'User',
                id: variables.id,
                name: 'Alice',
              },
            },
          });
          jest.runAllImmediates();
        });

        // Assert that the component consuming the query is no longer
        // suspended
        expect(instance.toJSON()).toEqual('Alice');

        // Assert that the Suspense cache temporary retain is released
        // and re-established permanently.
        // Note that the initial render during suspense will never commit
        // which means that it's temporary retain will be released after
        // the timeout fires.
        expect(release).toHaveBeenCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(4);

        // Assert the render state after double invoked effects have
        // triggered
        expect(queryRenderLogs).toEqual([
          'render: Alice',
          'commit: Alice',
          'cleanup: Alice',
          'commit: Alice',
          'render: Alice',
        ]);

        // Assert that the temporary retain that never commits
        // gets released
        ReactTestRenderer.act(() => {
          jest.runAllTimers();
        });
        expect(release).toHaveBeenCalledTimes(3);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(4);
      });
    });

    describe('when network request is NOT in flight when effects are double invoked (i.e. component is hidden/re-shown)', () => {
      it('forces a re-render and refetches when policy is network-only', () => {
        // Initialize and complete the query ref
        const initialQueryRef = loadQuery(environment, gqlQuery, variables, {
          fetchPolicy: 'network-only',
        });
        ReactTestRenderer.act(() => {
          environment.mock.resolve(gqlQuery, {
            data: {
              node: {
                __typename: 'User',
                id: variables.id,
                name: 'Alice',
              },
            },
          });
          jest.runAllImmediates();
        });
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.executeWithSource.mockClear();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.retain.mockClear();
        cancelNetworkRequest.mockClear();
        release.mockClear();

        // When the component mounts, React double invoke effects
        // will be triggered, simulating what would happen if the
        // component was hidden and then re-shown, in this case
        // with an actively committed query reference.
        const instance = render(initialQueryRef);

        // The effect cleanup will execute, so we assert
        // that the current query ref is released. In this case
        // no request is cancelled since it wasn't in flight, and,
        // the query is released by both the query ref /and/ the
        // component that was consuming the query.
        expect(cancelNetworkRequest).toHaveBeenCalledTimes(0);
        expect(release).toHaveBeenCalledTimes(2);

        // The effect setup will re-execute, so we assert that
        // a re-render is triggered to refetch and re-retain the query ref:

        // Assert that query was refetched
        expectToHaveFetched(environment, query, {force: true});

        // Assert that the component consuming the query is suspended
        expect(instance.toJSON()).toEqual('Loading preloaded query...');

        // Assert that the query is re-retained.
        // Retain is called 3 times here because the component consuming
        // the query is also temporarily retains the query while suspended:
        // - loadQuery re-retains
        // - suspended component temporary retains
        // - suspended component temporary retains
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(3);

        // Assert the rendered state of the loader and query components
        expect(queryRenderLogs).toEqual([
          'render: Alice',
          'commit: Alice',
          'cleanup: Alice',
          'commit: Alice',
        ]);
        expect(loaderRenderLogs).toEqual([
          // Assert component rendered and committed when network resolved:
          'render: TestQuery',
          'commit: TestQuery',

          // Assert double invoked effects simulates an unmount and remount.
          // Note that render doesn't happen in between:
          'cleanup: TestQuery',
          'commit: TestQuery',

          // Assert final re-render triggered by new call to loadQuery.
          // It does not trigger a commit since the queryRef ID hasn't changed
          'render: TestQuery',
        ]);

        // Resolve network response
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.executeWithSource.mockClear();
        ReactTestRenderer.act(() => {
          environment.mock.resolve(gqlQuery, {
            data: {
              node: {
                __typename: 'User',
                id: variables.id,
                name: 'Alice',
              },
            },
          });
          jest.runAllImmediates();
        });

        // Assert that the component consuming the query is no longer
        // suspended
        expect(instance.toJSON()).toEqual('Alice');

        // Assert that the Suspense cache temporary retain is released
        // and re-established permanently.
        expect(release).toHaveBeenCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(3);

        // Assert the render state after double invoked effects have
        // triggered
        expect(queryRenderLogs).toEqual([
          'render: Alice',
          'commit: Alice',
          'cleanup: Alice',
          'commit: Alice',
          'render: Alice',
        ]);

        // Assert that the query was correctly permanently retained,
        // and not released after the timeout resolves.
        ReactTestRenderer.act(() => {
          jest.runAllTimers();
        });
        expect(release).toHaveBeenCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(3);
      });

      it('forces a re-render and does not refetch when policy is store-or-network', () => {
        // Initialize and complete the query ref
        const initialQueryRef = loadQuery(environment, gqlQuery, variables, {
          fetchPolicy: 'store-or-network',
        });
        ReactTestRenderer.act(() => {
          environment.mock.resolve(gqlQuery, {
            data: {
              node: {
                __typename: 'User',
                id: variables.id,
                name: 'Alice',
              },
            },
          });
          jest.runAllImmediates();
        });
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.executeWithSource.mockClear();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.retain.mockClear();
        cancelNetworkRequest.mockClear();
        release.mockClear();

        // When the component mounts, React double invoke effects
        // will be triggered, simulating what would happen if the
        // component was hidden and then re-shown, in this case
        // with an actively committed query reference.
        const instance = render(initialQueryRef);

        // The effect cleanup will execute, so we assert
        // that the current query ref is released. In this case
        // no request is cancelled since it wasn't in flight, and,
        // the query is released by both the query ref /and/ the
        // component that was consuming the query.
        expect(cancelNetworkRequest).toHaveBeenCalledTimes(0);
        expect(release).toHaveBeenCalledTimes(2);

        // The effect setup will re-execute, so we assert that
        // a re-render is triggered to re-retain the query ref:

        // Assert that query was not refetched
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toHaveBeenCalledTimes(0);

        // Assert that the component consuming the query is suspended
        expect(instance.toJSON()).toEqual('Alice');

        // Assert that the query is re-retained.
        // Retain is called 2 times here because the component consuming
        // the query will also retain it:
        // - query component temporary retains
        // - loadQuery re-retains
        // - query component temporary retains
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(3);

        // Assert the rendered state of the loader and query components
        expect(queryRenderLogs).toEqual([
          'render: Alice',
          'commit: Alice',
          'cleanup: Alice',
          'commit: Alice',
          'render: Alice',
        ]);
        expect(loaderRenderLogs).toEqual([
          // Assert component rendered and committed when network resolved:
          'render: TestQuery',
          'commit: TestQuery',

          // Assert double invoked effects simulates an unmount and remount.
          // Note that render doesn't happen in between:
          'cleanup: TestQuery',
          'commit: TestQuery',

          // Assert final re-render triggered by new call to loadQuery.
          // It does not trigger a commit since the queryRef ID hasn't changed
          'render: TestQuery',
        ]);

        // Assert that the query was correctly permanently retained,
        // and not released after the timeout resolves.
        ReactTestRenderer.act(() => {
          jest.runAllTimers();
        });
        expect(release).toHaveBeenCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('when whole tree suspends on query reference', () => {
    it('forces a re-render and refetches when policy is network-only', () => {
      const initialQueryRef = loadQuery(environment, gqlQuery, variables, {
        fetchPolicy: 'network-only',
      });
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(1);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.executeWithSource.mockClear();

      const instance = render(initialQueryRef, {suspendWholeTree: true});

      // Assert that whole tree is suspended:
      expect(loaderRenderLogs).toEqual(['render: TestQuery']);
      expect(queryRenderLogs).toEqual([]);
      expect(instance.toJSON()).toEqual('Outer Fallback');
      // Query is retained a second time by component using query (with a temporary retain)
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);

      // Resolve network response
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.executeWithSource.mockClear();
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.retain.mockClear();
      ReactTestRenderer.act(() => {
        environment.mock.resolve(gqlQuery, {
          data: {
            node: {
              __typename: 'User',
              id: variables.id,
              name: 'Alice 1',
            },
          },
        });
        jest.runAllImmediates();
      });

      // After the query resolves, the component will mount, and
      // React double invoke effects will be triggered, simulating what would
      // happen if the component was hidden and re-shown:

      // The effect cleanup will execute, so we assert
      // that the query is released by both the query ref and
      // the component consuming the query
      expect(release).toHaveBeenCalledTimes(2);
      release.mockClear();

      // The effect setup will re-execute, so we assert that
      // a re-render is triggered to refetch and re-retain the query ref:

      // Assert that query was refetched once by useQueryLoader
      // and the tree re-suspends
      expectToHaveFetched(environment, query, {force: true});
      expect(instance.toJSON()).toEqual('Outer Fallback');

      // Assert that the query is re-retained by the query reference
      // and the temporary component retain
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);

      // Assert the rendered state of the loader and query components
      expect(queryRenderLogs).toEqual([
        // Assert component rendered and committed when network resolved:
        'render: Alice 1',
        'commit: Alice 1',

        // Assert double invoked effects simulates an unmount and remount.
        // Note that render doesn't happen in between:
        'cleanup: Alice 1',
        'commit: Alice 1',
      ]);
      expect(loaderRenderLogs).toEqual([
        // Assert component rendered and committed when network resolved:
        'render: TestQuery',
        'render: TestQuery',
        'commit: TestQuery',

        // Assert double invoked effects simulates an unmount and remount.
        // Note that render doesn't happen in between:
        'cleanup: TestQuery',
        'commit: TestQuery',

        // Assert final re-render triggered by new call to loadQuery.
        // It does not trigger a commit since the queryRef ID hasn't changed
        'render: TestQuery',
      ]);

      // Resolve second network response
      queryRenderLogs = [];
      loaderRenderLogs = [];
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.executeWithSource.mockClear();
      ReactTestRenderer.act(() => {
        environment.mock.resolve(gqlQuery, {
          data: {
            node: {
              __typename: 'User',
              id: variables.id,
              name: 'Alice 2',
            },
          },
        });
        jest.runAllImmediates();
      });

      // Assert that after refetch double invoke effects don't trigger
      // again; we shouldn't trigger a second refetch, and the query
      // should still be properly retained
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.executeWithSource).toHaveBeenCalledTimes(0);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
      expect(release).toHaveBeenCalledTimes(0);

      // Assert that the component consuming the query is no longer
      // suspended
      expect(instance.toJSON()).toEqual('Alice 2');
      expect(queryRenderLogs).toEqual([
        'render: Alice 2',
        'cleanup: Alice 1',
        'commit: Alice 2',
      ]);

      // Assert that the query is still permanently retained after
      // any timeouts
      ReactTestRenderer.act(() => {
        jest.runAllTimers();
      });
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
      expect(release).toHaveBeenCalledTimes(0);
    });

    it('forces a re-render and does not refetch when policy is store-or-network', () => {
      const initialQueryRef = loadQuery(environment, gqlQuery, variables, {
        fetchPolicy: 'store-or-network',
      });
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.executeWithSource).toHaveBeenCalledTimes(1);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(1);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.executeWithSource.mockClear();

      const instance = render(initialQueryRef, {suspendWholeTree: true});

      // Assert that whole tree is suspended:
      expect(loaderRenderLogs).toEqual(['render: TestQuery']);
      expect(queryRenderLogs).toEqual([]);
      expect(instance.toJSON()).toEqual('Outer Fallback');
      // Query is retained a second time by component using query (with a temporary retain)
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);

      // Resolve network response
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.executeWithSource.mockClear();
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.retain.mockClear();
      ReactTestRenderer.act(() => {
        environment.mock.resolve(gqlQuery, {
          data: {
            node: {
              __typename: 'User',
              id: variables.id,
              name: 'Alice 1',
            },
          },
        });
        jest.runAllImmediates();
      });

      // After the query resolves, the component will mount, and
      // React double invoke effects will be triggered, simulating what would
      // happen if the component was hidden and re-shown:

      // The effect cleanup will execute, so we assert
      // that the query is released by both the query ref and
      // the component consuming the query
      expect(release).toHaveBeenCalledTimes(2);
      release.mockClear();

      // The effect setup will re-execute, so we assert that
      // a re-render is triggered to re-retain the query ref:

      // Assert that the query is not refetched again
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.executeWithSource).toHaveBeenCalledTimes(0);
      expect(instance.toJSON()).toEqual('Alice 1');

      // Assert that the query is re-retained by the query reference
      // and the temporary component retain
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);

      // Assert the rendered state of the loader and query components
      expect(queryRenderLogs).toEqual([
        // Assert component rendered and committed when network resolved:
        'render: Alice 1',
        'commit: Alice 1',

        // Assert double invoked effects simulates an unmount and remount.
        // Note that render doesn't happen in between:
        'cleanup: Alice 1',
        'commit: Alice 1',

        // Assert final re-render triggered by re-rendering query component.
        // It does not trigger a commit since the queryRef ID hasn't changed
        'render: Alice 1',
      ]);
      expect(loaderRenderLogs).toEqual([
        // Assert component rendered and committed when network resolved:
        'render: TestQuery',
        'render: TestQuery',
        'commit: TestQuery',

        // Assert double invoked effects simulates an unmount and remount.
        // Note that render doesn't happen in between:
        'cleanup: TestQuery',
        'commit: TestQuery',

        // Assert final re-render triggered by new call to loadQuery.
        // It does not trigger a commit since the queryRef ID hasn't changed
        'render: TestQuery',
      ]);

      // Assert that the query is still permanently retained after
      // any timeouts
      ReactTestRenderer.act(() => {
        jest.runAllTimers();
      });
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
      expect(release).toHaveBeenCalledTimes(0);
    });
  });
});
