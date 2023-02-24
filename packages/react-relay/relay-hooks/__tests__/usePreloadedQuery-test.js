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

import type {Sink} from '../../../relay-runtime/network/RelayObservable';
import type {GraphQLResponse} from 'relay-runtime/network/RelayNetworkTypes';

const {loadQuery} = require('../loadQuery');
const preloadQuery_DEPRECATED = require('../preloadQuery_DEPRECATED');
const usePreloadedQuery_REACT_CACHE = require('../react-cache/usePreloadedQuery_REACT_CACHE');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const usePreloadedQuery_LEGACY = require('../usePreloadedQuery');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  Observable,
  PreloadableQueryRegistry,
  RecordSource,
  RelayFeatureFlags,
  Store,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');
const warning = require('warning');

jest.mock('warning');

const query = graphql`
  query usePreloadedQueryTestQuery($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
      }
    }
  }
`;

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
      name: 'Zuck',
    },
  },
  extensions: {
    is_final: true,
  },
};

const responseRefetch = {
  data: {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Changed Name',
    },
  },
  extensions: {
    is_final: true,
  },
};

let dataSource: ?Sink<GraphQLResponse>;
let environment;
let fetch;

class ErrorBoundary extends React.Component<$FlowFixMe, $FlowFixMe> {
  state: {error: mixed} = {error: null};

  componentDidCatch(error: Error) {
    this.setState({error});
  }

  render(): any {
    const {children, fallback} = this.props;
    const {error} = this.state;
    if (error != null) {
      return fallback;
    } else {
      return children;
    }
  }
}

beforeEach(() => {
  // $FlowFixMe[prop-missing]
  warning.mockClear();
});

afterAll(() => {
  jest.clearAllMocks();
});

describe.each([
  ['React Cache', usePreloadedQuery_REACT_CACHE],
  ['Legacy', usePreloadedQuery_LEGACY],
])('usePreloadedQuery (%s)', (_hookName, usePreloadedQuery) => {
  const usingReactCache = usePreloadedQuery === usePreloadedQuery_REACT_CACHE;
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
    RelayFeatureFlags.USE_REACT_CACHE =
      usePreloadedQuery === usePreloadedQuery_REACT_CACHE;
  });
  afterEach(() => {
    RelayFeatureFlags.USE_REACT_CACHE = originalReactCacheFeatureFlag;
  });

  beforeEach(() => {
    dataSource = undefined;
    fetch = jest.fn((_query, _variables, _cacheConfig) =>
      Observable.create(sink => {
        dataSource = sink;
      }),
    );
    environment = new Environment({
      // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
      network: Network.create(fetch),
      store: new Store(new RecordSource()),
    });
  });

  describe('using preloadQuery_DEPRECATED', () => {
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('suspends while the query is pending', () => {
      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {
          id: '4',
        },
      );
      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data?.node?.name;
      }
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(data).toBe(undefined);
    });

    it('suspends while the query is pending (with default variables)', () => {
      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {},
      );
      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data?.node?.name ?? 'Error: should have suspended';
      }
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(data).toBe(undefined);
    });

    it('renders synchronously if the query has already completed', () => {
      // TODO(T40983823): Fix usage of timers in tests
      environment.getStore().holdGC();

      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {
          id: '4',
        },
      );
      expect(dataSource).toBeDefined();
      if (dataSource) {
        dataSource.next(response);
        // $FlowFixMe[incompatible-use]
        dataSource.complete();
      }

      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data?.node?.name ?? 'MISSING NAME';
      }
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Zuck');
      expect(data).toEqual({
        node: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('renders synchronously if the query has already errored', () => {
      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {
          id: '4',
        },
      );
      const error = new Error('wtf');
      expect(dataSource).toBeDefined();
      if (dataSource) {
        dataSource.error(error);
      }

      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data.node?.name;
      }
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <ErrorBoundary fallback="Error Boundary">
            <React.Suspense fallback="Fallback">
              <Component prefetched={prefetched} />
            </React.Suspense>
          </ErrorBoundary>
        </RelayEnvironmentProvider>,
      );
      // Ensure that useEffect runs
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Error Boundary');
    });

    it('updates asynchronously when the query completes', () => {
      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {
          id: '4',
        },
      );

      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data.node?.name;
      }
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      // Ensure that useEffect runs
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(data).toBe(undefined);

      expect(dataSource).toBeDefined();
      if (dataSource) {
        dataSource.next(response);
        // $FlowFixMe[incompatible-use]
        dataSource.complete();
      }
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Zuck');
      expect(data).toEqual({
        node: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('refetches when a different fetchKey is passed', () => {
      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {id: '4'},
        {fetchKey: 'Break Cache 0', fetchPolicy: 'network-only'},
      );
      const dataSourceBreakCache0 = dataSource;
      const prefetchedWithFetchKey = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {id: '4'},
        {fetchKey: 'Break Cache 1', fetchPolicy: 'network-only'},
      );
      const dataSourceBreakCache1 = dataSource;
      expect(fetch).toBeCalledTimes(2);

      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data.node?.name;
      }
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      // Ensure that useEffect runs
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(data).toBe(undefined);

      expect(dataSourceBreakCache0).toBeDefined();
      if (dataSourceBreakCache0) {
        dataSourceBreakCache0.next(response);
        dataSourceBreakCache0.complete();
      }
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Zuck');
      expect(data).toEqual({
        node: {
          id: '4',
          name: 'Zuck',
        },
      });

      renderer.update(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetchedWithFetchKey} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      expect(dataSourceBreakCache1).toBeDefined();
      if (dataSourceBreakCache1) {
        dataSourceBreakCache1.next(responseRefetch);
        dataSourceBreakCache1.complete();
      }
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Changed Name');
      expect(data).toEqual({
        node: {
          id: '4',
          name: 'Changed Name',
        },
      });
    });

    it('refetches when consumed with a different environment', () => {
      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {id: '4'},
        {fetchPolicy: 'store-or-network'},
      );
      expect(fetch).toBeCalledTimes(1);

      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data.node?.name;
      }

      const newEnvironment = createMockEnvironment();
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={newEnvironment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      // Ensure that useEffect runs
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(data).toBe(undefined);

      // There should be only one query in the newEnv
      expect(newEnvironment.mock.getAllOperations().length).toBe(1);
      // fetch from the initial env should still have 1 call
      expect(fetch).toBeCalledTimes(1);
      newEnvironment.mock.resolve(query, response);

      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Zuck');
      expect(data).toEqual({
        node: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('no refetch when the same fetchKey is passed', () => {
      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {id: '4'},
        {fetchKey: 'Break Cache 0', fetchPolicy: 'network-only'},
      );
      const dataSourceBreakCache0 = dataSource;
      const prefetchedWithFetchKey = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {id: '4'},
        {fetchKey: 'Break Cache 0', fetchPolicy: 'network-only'},
      );
      const dataSourceBreakCache1 = dataSource;
      expect(fetch).toBeCalledTimes(1);

      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data.node?.name;
      }
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetched} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      // Ensure that useEffect runs
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(data).toBe(undefined);

      expect(dataSourceBreakCache0).toBeDefined();
      if (dataSourceBreakCache0) {
        dataSourceBreakCache0.next(response);
        dataSourceBreakCache0.complete();
      }
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Zuck');
      expect(data).toEqual({
        node: {
          id: '4',
          name: 'Zuck',
        },
      });

      renderer.update(
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Fallback">
            <Component prefetched={prefetchedWithFetchKey} />
          </React.Suspense>
        </RelayEnvironmentProvider>,
      );
      expect(dataSourceBreakCache1).toBeDefined();
      if (dataSourceBreakCache1) {
        dataSourceBreakCache1.next(responseRefetch);
        dataSourceBreakCache1.complete();
      }
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Zuck');
      expect(data).toEqual({
        node: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('updates asynchronously when the query errors', () => {
      const prefetched = preloadQuery_DEPRECATED<any, empty>(
        environment,
        preloadableConcreteRequest,
        {
          id: '4',
        },
      );

      let data;
      function Component(props: any) {
        data = usePreloadedQuery(query, props.prefetched);
        return data.node?.name;
      }
      const renderer = TestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
          <ErrorBoundary fallback="Error Boundary">
            <React.Suspense fallback="Fallback">
              <Component prefetched={prefetched} />
            </React.Suspense>
          </ErrorBoundary>
        </RelayEnvironmentProvider>,
      );
      // Ensure that useEffect runs
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(data).toBe(undefined);

      const error = new Error('wtf');
      expect(dataSource).toBeDefined();
      if (dataSource) {
        dataSource.error(error);
      }
      TestRenderer.act(() => jest.runAllImmediates());
      expect(renderer.toJSON()).toEqual('Error Boundary');
    });
  });

  describe('using loadQuery', () => {
    let resolvedModule;
    let preloadableQueryRegistrySpy;
    beforeAll(() => {
      preloadableQueryRegistrySpy = jest
        .spyOn(PreloadableQueryRegistry, 'get')
        .mockImplementation((key: string) => {
          expect(key).toEqual(ID);
          return resolvedModule;
        });
    });
    afterAll(() => {
      preloadableQueryRegistrySpy.mockRestore();
    });

    describe('if loadQuery is passed a preloadableConcreteRequest which is not available synchronously', () => {
      it('does not suspend while the query is pending until the query AST and network response are available', () => {
        const prefetched = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '4',
          },
        );
        let data;
        function Component(props: any) {
          data = usePreloadedQuery(query, props.prefetched);
          return data?.node?.name ?? 'MISSING NAME';
        }
        const renderer = TestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <Component prefetched={prefetched} />
            </React.Suspense>
          </RelayEnvironmentProvider>,
        );
        // When the query AST is not available, we are unable to detect the promise
        // for that query in flight.
        // This isn't really a problem in practice because by the time the component
        // renders the ast /must/ have already been downloaded
        // TODO(T85673186): Detect raw network requests in flight to suspend on.
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('MISSING NAME');
        expect(data).toEqual({node: undefined});

        PreloadableQueryRegistry.set(ID, query);
        expect(renderer.toJSON()).toEqual('MISSING NAME');
        expect(data).toEqual({node: undefined});

        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.next(response);
        }
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Zuck');
        expect(data).toEqual({
          node: {
            id: '4',
            name: 'Zuck',
          },
        });
      });

      it('does not suspend while the query is pending until the network response and the query AST are available', () => {
        const prefetched = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '4',
          },
        );
        let data;
        function Component(props: any) {
          data = usePreloadedQuery(query, props.prefetched);
          return data?.node?.name ?? 'MISSING NAME';
        }
        const renderer = TestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <Component prefetched={prefetched} />
            </React.Suspense>
          </RelayEnvironmentProvider>,
        );
        // When the query AST is not available, we are unable to detect the promise
        // for that query in flight.
        // This isn't really a problem in practice because by the time the component
        // renders the ast /must/ have already been downloaded
        // TODO(T85673186): Detect raw network requests in flight to suspend on.
        PreloadableQueryRegistry.set(ID, query);
        expect(renderer.toJSON()).toEqual('MISSING NAME');
        expect(data).toEqual({node: undefined});

        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('MISSING NAME');
        expect(data).toEqual({node: undefined});

        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.next(response);
        }
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Zuck');
        expect(data).toEqual({
          node: {
            id: '4',
            name: 'Zuck',
          },
        });
      });

      it('renders synchronously if the query has already completed', () => {
        const prefetched = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '4',
          },
        );
        let data;
        PreloadableQueryRegistry.set(ID, query);
        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.next(response);
        }
        TestRenderer.act(() => jest.runAllImmediates());

        function Component(props: any) {
          data = usePreloadedQuery(query, props.prefetched);
          return data.node?.name;
        }
        const renderer = TestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <Component prefetched={prefetched} />
            </React.Suspense>
          </RelayEnvironmentProvider>,
        );

        expect(renderer.toJSON()).toEqual('Zuck');
        expect(data).toEqual({
          node: {
            id: '4',
            name: 'Zuck',
          },
        });
      });

      it('renders an error synchronously if the query has already errored', () => {
        const prefetched = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '4',
          },
        );
        let data;
        PreloadableQueryRegistry.set(ID, query);
        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.error(new Error('No data for you'));
        }
        TestRenderer.act(() => jest.runAllImmediates());

        function Component(props: any) {
          data = usePreloadedQuery(query, props.prefetched);
          return data.node?.name;
        }
        const renderer = TestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <ErrorBoundary fallback="Error Boundary">
              <React.Suspense fallback="Fallback">
                <Component prefetched={prefetched} />
              </React.Suspense>
            </ErrorBoundary>
          </RelayEnvironmentProvider>,
        );

        expect(renderer.toJSON()).toEqual('Error Boundary');
      });
    });

    describe('when loadQuery is passed a query AST', () => {
      describe('when the network response is available before usePreloadedQuery is rendered', () => {
        it('should synchronously render successfully', () => {
          const prefetched = loadQuery<any, _>(environment, query, {
            id: '4',
          });
          let data;
          expect(dataSource).toBeDefined();
          if (dataSource) {
            dataSource.next(response);
          }
          TestRenderer.act(() => jest.runAllImmediates());

          function Component(props: any) {
            data = usePreloadedQuery(query, props.prefetched);
            return data.node?.name;
          }
          const renderer = TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <React.Suspense fallback="Fallback">
                <Component prefetched={prefetched} />
              </React.Suspense>
            </RelayEnvironmentProvider>,
          );

          expect(renderer.toJSON()).toEqual('Zuck');
          expect(data).toEqual({
            node: {
              id: '4',
              name: 'Zuck',
            },
          });
        });
        it('should synchronously render errors', () => {
          const prefetched = loadQuery<any, _>(environment, query, {
            id: '4',
          });
          let data;
          expect(dataSource).toBeDefined();
          if (dataSource) {
            dataSource.error(new Error('No data for you'));
          }
          TestRenderer.act(() => jest.runAllImmediates());

          function Component(props: any) {
            data = usePreloadedQuery(query, props.prefetched);
            return data.node?.name;
          }
          const renderer = TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <ErrorBoundary fallback="Error Boundary">
                <React.Suspense fallback="Fallback">
                  <Component prefetched={prefetched} />
                </React.Suspense>
              </ErrorBoundary>
            </RelayEnvironmentProvider>,
          );

          expect(renderer.toJSON()).toEqual('Error Boundary');
        });
      });

      describe('when the network response occurs after usePreloadedQuery is rendered', () => {
        it('should suspend, and then render', () => {
          const prefetched = loadQuery<any, _>(environment, query, {
            id: '4',
          });
          let data;
          expect(dataSource).toBeDefined();

          function Component(props: any) {
            data = usePreloadedQuery(query, props.prefetched);
            return data.node?.name;
          }
          const renderer = TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <React.Suspense fallback="Fallback">
                <Component prefetched={prefetched} />
              </React.Suspense>
            </RelayEnvironmentProvider>,
          );
          expect(renderer.toJSON()).toEqual('Fallback');
          expect(data).toBe(undefined);

          if (dataSource) {
            dataSource.next(response);
          }
          TestRenderer.act(() => jest.runAllImmediates());

          expect(renderer.toJSON()).toEqual('Zuck');
          expect(data).toEqual({
            node: {
              id: '4',
              name: 'Zuck',
            },
          });
        });
        it('should suspend, then render and error', () => {
          const prefetched = loadQuery<any, _>(environment, query, {
            id: '4',
          });
          let data;
          expect(dataSource).toBeDefined();

          function Component(props: any) {
            data = usePreloadedQuery(query, props.prefetched);
            return data.node?.name;
          }
          const renderer = TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <ErrorBoundary fallback="Error Boundary">
                <React.Suspense fallback="Fallback">
                  <Component prefetched={prefetched} />
                </React.Suspense>
              </ErrorBoundary>
            </RelayEnvironmentProvider>,
          );
          expect(renderer.toJSON()).toEqual('Fallback');
          expect(data).toBe(undefined);

          if (dataSource) {
            dataSource.error(new Error('No data for you'));
          }
          TestRenderer.act(() => jest.runAllImmediates());

          expect(renderer.toJSON()).toEqual('Error Boundary');
        });
      });
    });

    describe('when loadQuery is passed a preloadable concrete request and the query AST is available synchronously', () => {
      let originalResolvedModule;
      beforeEach(() => {
        originalResolvedModule = resolvedModule;
        resolvedModule = query;
      });
      afterEach(() => {
        resolvedModule = originalResolvedModule;
      });
      describe('when the network response is available before usePreloadedQuery is rendered', () => {
        it('should synchronously render successfully', () => {
          const prefetched = loadQuery<any, _>(
            environment,
            preloadableConcreteRequest,
            {
              id: '4',
            },
          );
          let data;
          expect(dataSource).toBeDefined();
          if (dataSource) {
            dataSource.next(response);
          }
          TestRenderer.act(() => jest.runAllImmediates());

          function Component(props: any) {
            data = usePreloadedQuery(query, props.prefetched);
            return data.node?.name;
          }
          const renderer = TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <React.Suspense fallback="Fallback">
                <Component prefetched={prefetched} />
              </React.Suspense>
            </RelayEnvironmentProvider>,
          );

          expect(renderer.toJSON()).toEqual('Zuck');
          expect(data).toEqual({
            node: {
              id: '4',
              name: 'Zuck',
            },
          });
        });
        it('should synchronously render errors', () => {
          const prefetched = loadQuery<any, _>(
            environment,
            preloadableConcreteRequest,
            {
              id: '4',
            },
          );
          let data;
          expect(dataSource).toBeDefined();
          if (dataSource) {
            dataSource.error(new Error('No data for you'));
          }
          TestRenderer.act(() => jest.runAllImmediates());

          function Component(props: any) {
            data = usePreloadedQuery(query, props.prefetched);
            return data.node?.name;
          }
          const renderer = TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <ErrorBoundary fallback="Error Boundary">
                <React.Suspense fallback="Fallback">
                  <Component prefetched={prefetched} />
                </React.Suspense>
              </ErrorBoundary>
            </RelayEnvironmentProvider>,
          );

          expect(renderer.toJSON()).toEqual('Error Boundary');
        });
      });

      describe('when the network response occurs after usePreloadedQuery is rendered', () => {
        it('should suspend, and then render', () => {
          const prefetched = loadQuery<any, _>(
            environment,
            preloadableConcreteRequest,
            {
              id: '4',
            },
          );
          let data;
          expect(dataSource).toBeDefined();

          function Component(props: any) {
            data = usePreloadedQuery(query, props.prefetched);
            return data.node?.name;
          }
          const renderer = TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <React.Suspense fallback="Fallback">
                <Component prefetched={prefetched} />
              </React.Suspense>
            </RelayEnvironmentProvider>,
          );
          expect(renderer.toJSON()).toEqual('Fallback');
          expect(data).toBe(undefined);

          if (dataSource) {
            dataSource.next(response);
          }
          TestRenderer.act(() => jest.runAllImmediates());

          expect(renderer.toJSON()).toEqual('Zuck');
          expect(data).toEqual({
            node: {
              id: '4',
              name: 'Zuck',
            },
          });
        });
        it('should suspend, then render and error', () => {
          const prefetched = loadQuery<any, _>(
            environment,
            preloadableConcreteRequest,
            {
              id: '4',
            },
          );
          let data;
          expect(dataSource).toBeDefined();

          function Component(props: any) {
            data = usePreloadedQuery(query, props.prefetched);
            return data.node?.name;
          }
          const renderer = TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <ErrorBoundary fallback="Error Boundary">
                <React.Suspense fallback="Fallback">
                  <Component prefetched={prefetched} />
                </React.Suspense>
              </ErrorBoundary>
            </RelayEnvironmentProvider>,
          );
          expect(renderer.toJSON()).toEqual('Fallback');
          expect(data).toBe(undefined);

          if (dataSource) {
            dataSource.error(new Error('No data for you'));
          }
          TestRenderer.act(() => jest.runAllImmediates());

          expect(renderer.toJSON()).toEqual('Error Boundary');
        });
      });
    });

    describe('when environments do not match', () => {
      it('should fetch the data at render time, even if the query has already resolved', () => {
        let altDataSource;
        const altFetch = jest.fn((_query, _variables, _cacheConfig) =>
          Observable.create(sink => {
            altDataSource = sink;
          }),
        );
        const altEnvironment = new Environment({
          // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
          network: Network.create(altFetch),
          store: new Store(new RecordSource()),
        });
        const prefetched = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '4',
          },
        );
        let data;
        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.next(response);
        }
        TestRenderer.act(() => jest.runAllImmediates());

        expect(altFetch).not.toHaveBeenCalled();
        function Component(props: any) {
          data = usePreloadedQuery(query, props.prefetched);
          return data.node?.name;
        }
        const renderer = TestRenderer.create(
          <RelayEnvironmentProvider environment={altEnvironment}>
            <React.Suspense fallback="Fallback">
              <Component prefetched={prefetched} />
            </React.Suspense>
          </RelayEnvironmentProvider>,
        );

        expect(renderer.toJSON()).toEqual('Fallback');
        expect(altFetch).toHaveBeenCalledTimes(1);
        expect(altDataSource).toBeDefined();
        if (altDataSource) {
          altDataSource.next(response);
        }

        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Zuck');
      });
    });

    describe('when loadQuery is passed a preloadedQuery that was disposed', () => {
      it('warns that the preloadedQuery has already been disposed', () => {
        const expectWarningMessage = expect.stringMatching(
          /^usePreloadedQuery\(\): Expected preloadedQuery to not be disposed/,
        );
        const prefetched = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {},
        );

        function Component(props: any) {
          const data = usePreloadedQuery(query, props.prefetched);
          return data?.node?.name ?? 'MISSING NAME';
        }

        const render = () => {
          TestRenderer.create(
            <RelayEnvironmentProvider environment={environment}>
              <React.Suspense fallback="Fallback">
                <Component prefetched={prefetched} />
              </React.Suspense>
            </RelayEnvironmentProvider>,
          );
          TestRenderer.act(() => jest.runAllImmediates());
        };

        render();
        expect(warning).toBeCalledTimes(2);
        expect(warning).toHaveBeenLastCalledWith(
          true, // invariant holds
          expectWarningMessage,
        );

        prefetched.dispose();
        render();
        expect(warning).toBeCalledTimes(3);
        expect(warning).toHaveBeenLastCalledWith(
          false, // invariant broken
          expectWarningMessage,
        );
      });
    });

    describe('refetching', () => {
      it('renders updated data correctly when refetching same query and variables', () => {
        const loadedFirst = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '4',
          },
          {
            fetchPolicy: 'network-only',
          },
        );
        let data;
        function Component(props: any) {
          data = usePreloadedQuery(query, props.prefetched);
          return data.node?.name;
        }
        const renderer = TestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <Component prefetched={loadedFirst} />
            </React.Suspense>
          </RelayEnvironmentProvider>,
        );
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Fallback');
        expect(data).toBe(undefined);

        PreloadableQueryRegistry.set(ID, query);
        expect(renderer.toJSON()).toEqual('Fallback');
        expect(data).toBe(undefined);

        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.next(response);
          // $FlowFixMe[incompatible-use]
          dataSource.complete();
        }
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Zuck');
        expect(data).toEqual({
          node: {
            id: '4',
            name: 'Zuck',
          },
        });

        // Refetch
        data = undefined;
        dataSource = undefined;
        const loadedSecond = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '4',
          },
          {
            fetchPolicy: 'network-only',
          },
        );
        renderer.update(
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <Component prefetched={loadedSecond} />
            </React.Suspense>
          </RelayEnvironmentProvider>,
        );
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Fallback');
        expect(data).toBe(undefined);

        PreloadableQueryRegistry.set(ID, query);
        expect(renderer.toJSON()).toEqual('Fallback');
        expect(data).toBe(undefined);

        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.next({
            data: {
              node: {
                __typename: 'User',
                id: '4',
                name: 'Zuck Refetched',
              },
            },
            extensions: {
              is_final: true,
            },
          });
          // $FlowFixMe[incompatible-use]
          dataSource.complete();
        }
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Zuck Refetched');
        expect(data).toEqual({
          node: {
            id: '4',
            name: 'Zuck Refetched',
          },
        });
      });

      it('renders updated data correctly when refetching different variables', () => {
        const loadedFirst = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '4',
          },
          {
            fetchPolicy: 'network-only',
          },
        );
        let data;
        function Component(props: any) {
          data = usePreloadedQuery(query, props.prefetched);
          return data.node?.name;
        }
        const renderer = TestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <Component prefetched={loadedFirst} />
            </React.Suspense>
          </RelayEnvironmentProvider>,
        );
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Fallback');
        expect(data).toBe(undefined);

        PreloadableQueryRegistry.set(ID, query);
        expect(renderer.toJSON()).toEqual('Fallback');
        expect(data).toBe(undefined);

        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.next(response);
          // $FlowFixMe[incompatible-use]
          dataSource.complete();
        }
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Zuck');
        expect(data).toEqual({
          node: {
            id: '4',
            name: 'Zuck',
          },
        });

        // Refetch
        data = undefined;
        dataSource = undefined;
        const loadedSecond = loadQuery<any, _>(
          environment,
          preloadableConcreteRequest,
          {
            id: '5',
          },
          {
            fetchPolicy: 'network-only',
          },
        );
        renderer.update(
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <Component prefetched={loadedSecond} />
            </React.Suspense>
          </RelayEnvironmentProvider>,
        );
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('Fallback');
        expect(data).toBe(undefined);

        PreloadableQueryRegistry.set(ID, query);
        expect(renderer.toJSON()).toEqual('Fallback');
        expect(data).toBe(undefined);

        expect(dataSource).toBeDefined();
        if (dataSource) {
          dataSource.next({
            data: {
              node: {
                __typename: 'User',
                id: '5',
                name: 'User 5',
              },
            },
            extensions: {
              is_final: true,
            },
          });
          // $FlowFixMe[incompatible-use]
          dataSource.complete();
        }
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderer.toJSON()).toEqual('User 5');
        expect(data).toEqual({
          node: {
            id: '5',
            name: 'User 5',
          },
        });
      });
    });
  });
});
