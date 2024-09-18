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
  GraphQLResponse,
  LogRequestInfoFunction,
  UploadableMap,
} from '../../../relay-runtime/network/RelayNetworkTypes';
import type {ObservableFromValue} from '../../../relay-runtime/network/RelayObservable';
import type {RequestParameters} from '../../../relay-runtime/util/RelayConcreteNode';
import type {
  CacheConfig,
  Variables,
} from '../../../relay-runtime/util/RelayRuntimeTypes';

const LazyLoadEntryPointContainer_DEPRECATED = require('../LazyLoadEntryPointContainer_DEPRECATED.react');
const preloadQuery_DEPRECATED = require('../preloadQuery_DEPRECATED');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const usePreloadedQuery = require('../usePreloadedQuery');
const invariant = require('invariant');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  Observable,
  PreloadableQueryRegistry,
  RecordSource,
  Store,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

const query = graphql`
  query LazyLoadEntryPointContainerDEEPRECATEDTestQuery($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
      }
    }
  }
`;

// Only queries with an ID are preloadable
// $FlowFixMe[cannot-write]
query.params.id = '12345';

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

let dataSource;
let environment;
let fetch;
let entryPoint: React.ElementProps<
  typeof LazyLoadEntryPointContainer_DEPRECATED,
>['entryPoint'];
let params;

class FakeJSResource<T> {
  _resolve: (T => mixed) | null;
  _resource: T | null;
  getModuleId: () => string;
  getModuleIfRequired: () => T | null;
  load: () => Promise<T>;
  resolve: T => void;

  constructor(resource: T | null) {
    this._resolve = null;
    this._resource = resource;

    this.getModuleId = jest.fn(() => 'TheModuleID');
    this.getModuleIfRequired = jest.fn(() => this._resource);
    // $FlowFixMe[incompatible-type-arg]
    this.load = jest.fn(() => {
      return new Promise(resolve => {
        this._resolve = resolve;
      });
    });
    this.resolve = nextResource => {
      this._resource = nextResource;
      const resolve = this._resolve;
      if (resolve) {
        this._resolve = null;
        resolve(nextResource);
      }
    };
  }
}

beforeEach(() => {
  PreloadableQueryRegistry.clear();

  // $FlowFixMe[missing-local-annot] error found when enabling Flow LTI mode
  fetch = jest.fn((_query, _variables, _cacheConfig) =>
    // $FlowFixMe[missing-local-annot] error found when enabling Flow LTI mode
    Observable.create(sink => {
      dataSource = sink;
    }),
  );
  environment = new Environment({
    // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
    network: Network.create(fetch),
    store: new Store(new RecordSource()),
  });

  params = {
    kind: 'PreloadableConcreteRequest',
    params: query.params,
  };
  entryPoint = {
    // $FlowFixMe[missing-local-annot] error found when enabling Flow LTI mode
    getPreloadProps: jest.fn(entryPointParams => {
      return {
        queries: {
          prefetched: {
            parameters: params,
            /* $FlowFixMe[prop-missing] Error revealed after improved builtin
             * React utility types */
            variables: {id: entryPointParams.id},
          },
        },
      };
    }),
    root: (new FakeJSResource(): $FlowFixMe),
  };
});

it('suspends while the query and component are pending', () => {
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={{version: 0}}
            entryPointParams={{id: '4'}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer?.toJSON()).toEqual('Fallback');
  expect(fetch).toBeCalledTimes(1);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(1);
});

it('suspends while the component is loading', () => {
  preloadQuery_DEPRECATED<any, empty>(environment, params, {id: '4'});
  expect(fetch).toBeCalledTimes(1);
  dataSource.next(response);
  dataSource.complete();
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={{version: 0}}
            entryPointParams={{id: '4'}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer?.toJSON()).toEqual('Fallback');
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(1);
});

it('suspends while the query is loading', () => {
  function Component(props: any) {
    const data = usePreloadedQuery(query, props.queries.prefetched);
    return data.node?.name;
  }
  // $FlowFixMe[prop-missing]
  entryPoint.root.resolve(Component);
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={{version: 0}}
            entryPointParams={{id: '4'}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer?.toJSON()).toEqual('Fallback');
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(0);
  expect(fetch).toBeCalledTimes(1);
});

it('suspends then updates when the query and component load', () => {
  const otherProps = {version: 0};
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={otherProps}
            entryPointParams={{id: '4'}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer?.toJSON()).toEqual('Fallback');
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(2);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(1);

  let receivedProps = null;
  function Component(props: any) {
    receivedProps = props;
    const data = usePreloadedQuery(query, props.queries.prefetched);
    return data.node?.name;
  }
  // $FlowFixMe[prop-missing]
  entryPoint.root.resolve(Component);
  dataSource.next(response);
  dataSource.complete();
  TestRenderer.act(() => jest.runAllImmediates());
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(4);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(1);
  expect(receivedProps).not.toBe(null);
  expect(receivedProps?.props).toBe(otherProps);
  expect(renderer.toJSON()).toEqual('Zuck');
});

it('renders synchronously when the query and component are already loaded', () => {
  const otherProps = {
    version: 0,
  };
  let receivedProps = null;
  function Component(props: any) {
    receivedProps = props;
    const data = usePreloadedQuery(query, props.queries.prefetched);
    return data.node?.name;
  }
  // $FlowFixMe[prop-missing]
  entryPoint.root.resolve(Component);
  preloadQuery_DEPRECATED<any, empty>(environment, params, {id: '4'});
  expect(fetch).toBeCalledTimes(1);
  dataSource.next(response);
  dataSource.complete();

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={otherProps}
            entryPointParams={{id: '4'}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Zuck');
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(2);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(0);
  expect(receivedProps).not.toBe(null);
  expect(receivedProps?.props).toBe(otherProps);
});

it('re-renders without reloading when non-prefetch props change', () => {
  // $FlowFixMe[missing-local-annot] error found when enabling Flow LTI mode
  const Component = jest.fn(props => {
    // $FlowFixMe[react-rule-hook]
    const data = usePreloadedQuery(query, props.queries.prefetched);
    return data.node?.name;
  });
  // $FlowFixMe[prop-missing]
  entryPoint.root.resolve(Component);
  preloadQuery_DEPRECATED<any, empty>(environment, params, {id: '4'});
  expect(fetch).toBeCalledTimes(1);
  dataSource.next(response);
  dataSource.complete();

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={{version: 0}}
            entryPointParams={{id: '4'}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Zuck');
  expect(Component).toBeCalledTimes(1);
  TestRenderer.act(() => {
    renderer.update(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={{version: 1 /* different value */}}
            entryPointParams={{id: '4'}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  expect(renderer.toJSON()).toEqual('Zuck');
  expect(Component).toBeCalledTimes(2);
  expect(entryPoint.getPreloadProps).toBeCalledTimes(1);
});

it('re-renders and reloads when prefetch params change', () => {
  // $FlowFixMe[missing-local-annot] error found when enabling Flow LTI mode
  const Component = jest.fn(props => {
    // $FlowFixMe[react-rule-hook]
    const data = usePreloadedQuery(query, props.queries.prefetched);
    return data.node?.name;
  });
  // $FlowFixMe[prop-missing]
  entryPoint.root.resolve(Component);
  preloadQuery_DEPRECATED<any, empty>(environment, params, {id: '4'});
  expect(fetch).toBeCalledTimes(1);
  dataSource.next(response);
  dataSource.complete();

  const otherProps = {version: 0};
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={otherProps}
            entryPointParams={{id: '4'}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Zuck');
  expect(Component).toBeCalledTimes(1);
  TestRenderer.act(() => {
    renderer.update(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={otherProps}
            entryPointParams={{id: '_4'} /* different id */}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  expect(renderer.toJSON()).toEqual('Fallback');
  expect(Component).toBeCalledTimes(2);
  expect(entryPoint.getPreloadProps).toBeCalledTimes(2);
  expect(fetch).toBeCalledTimes(2);
  dataSource.next({
    data: {
      node: {
        __typename: 'User',
        id: '_4',
        name: 'Mark',
      },
    },
    extensions: {
      is_final: true,
    },
  });
  dataSource.complete();
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('Mark');
});

it('fetches and renders synchronously when the query data is cached, then updates when the fetch completes', () => {
  // pre-populate the query result
  const variables = {id: '4'};
  const operation = createOperationDescriptor(query, variables);
  environment.commitPayload(operation, {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Zuck',
    },
  });
  const otherProps = {version: 0};
  let receivedProps = null;
  function Component(props: any) {
    receivedProps = props;
    const data = usePreloadedQuery(query, props.queries.prefetched);
    return data.node?.name;
  }
  // $FlowFixMe[prop-missing]
  entryPoint.root.resolve(Component);

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={otherProps}
            entryPointParams={variables}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  invariant(renderer != null, 'should have been rendered');
  expect(renderer.toJSON()).toEqual('Zuck');
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(2);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(0);
  expect(receivedProps).not.toBe(null);
  expect(receivedProps?.props).toBe(otherProps);
  // fetch() is still called, preloadQuery_DEPRECATED() doesn't have the AST to check
  // if the query can be fulfilled locally
  expect(fetch).toBeCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe(query.params);

  TestRenderer.act(() => {
    dataSource.next({
      data: {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark', // Zuck =>  Mark
        },
      },
    });
    dataSource.complete();
    jest.runAllImmediates();
  });
  // Ignore the results of the preloader if data can be fulfilled from cache
  expect(renderer.toJSON()).toEqual('Zuck');
});

it('renders synchronously when the query data and ast are cached, without fetching', () => {
  // pre-populate the query result
  const variables = {id: '4'};
  const operation = createOperationDescriptor(query, variables);
  environment.commitPayload(operation, {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Zuck',
    },
  });
  // "load" the query ast
  PreloadableQueryRegistry.set(
    query.params.id === null ? query.params.cacheID : query.params.id,
    query,
  );
  const otherProps = {version: 0};
  let receivedProps = null;
  function Component(props: any) {
    receivedProps = props;
    const data = usePreloadedQuery(query, props.queries.prefetched);
    return data.node?.name;
  }
  // $FlowFixMe[prop-missing]
  entryPoint.root.resolve(Component);

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={otherProps}
            entryPointParams={variables}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  invariant(renderer != null, 'should have been rendered');
  expect(renderer.toJSON()).toEqual('Zuck');
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(2);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(0);
  expect(receivedProps).not.toBe(null);
  expect(receivedProps?.props).toBe(otherProps);
  expect(fetch).toBeCalledTimes(0);

  expect(renderer.toJSON()).toEqual('Zuck');
});

it('should use environment from `getEnvironment` prop to fetch a query', () => {
  entryPoint = {
    // $FlowFixMe[missing-local-annot] error found when enabling Flow LTI mode
    getPreloadProps: jest.fn(entryPointParams => {
      return {
        queries: {
          prefetched: {
            environmentProviderOptions: {
              actorID: '5',
            },
            parameters: params,
            /* $FlowFixMe[prop-missing] Error revealed after improved builtin
             * React utility types */
            variables: {id: entryPointParams.id},
          },
        },
      };
    }),
    root: (new FakeJSResource(): $FlowFixMe),
  };
  const fetchFn = jest.fn<
    [
      RequestParameters,
      Variables,
      CacheConfig,
      ?UploadableMap,
      ?LogRequestInfoFunction,
    ],
    ObservableFromValue<GraphQLResponse>,
  >();
  const defaultFetchFn = jest.fn<
    [
      RequestParameters,
      Variables,
      CacheConfig,
      ?UploadableMap,
      ?LogRequestInfoFunction,
    ],
    ObservableFromValue<GraphQLResponse>,
  >();
  const defaultEnvironment = new Environment({
    network: Network.create(defaultFetchFn),
    store: new Store(new RecordSource()),
  });
  const environmentForActor = new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
  });

  const getEnvironment = jest.fn(() => {
    return environmentForActor;
  });
  TestRenderer.act(() => {
    TestRenderer.create(
      <RelayEnvironmentProvider environment={defaultEnvironment}>
        <React.Suspense fallback="Fallback">
          <LazyLoadEntryPointContainer_DEPRECATED
            entryPoint={entryPoint}
            props={{version: 0}}
            entryPointParams={{id: '4'}}
            // $FlowFixMe[invalid-tuple-arity]
            environmentProvider={{
              getEnvironment,
            }}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(getEnvironment).toBeCalledWith({
    actorID: '5',
  });
  expect(defaultFetchFn).not.toBeCalled();
  expect(fetchFn).toBeCalled();
});
