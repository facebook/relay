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

import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';

const EntryPointContainer = require('../EntryPointContainer.react');
const loadEntryPoint = require('../loadEntryPoint');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const usePreloadedQuery = require('../usePreloadedQuery');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  Observable,
  PreloadableQueryRegistry,
  RecordSource,
  Store,
  graphql,
} = require('relay-runtime');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

const query = graphql`
  query EntryPointContainerTestQuery($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
      }
    }
  }
`;
const params = {
  kind: 'PreloadableConcreteRequest',
  params: query.params,
};

// Only queries with an ID are preloadable
const ID = 'my-id';
(query.params: any).id = ID;

const response = {
  data: {
    node: {
      __typename: 'User',
      id: 'my-id',
      name: 'Alice',
    },
  },
  extensions: {
    is_final: true,
  },
};

let dataSource;
let environment;
let fetch;
let entrypoint;
let entryPointReference;
let nestedEntryPointResource;

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
  nestedEntryPointResource = new FakeJSResource<
    void | ((props: any) => empty),
  >();

  entrypoint = {
    getPreloadProps(entryPointParams: any) {
      return {
        entryPoints: {
          nestedEntryPoint: {
            entryPoint: {
              getPreloadProps(nestedEntryPointParams: any) {
                return {
                  queries: {
                    preloadedQuery: {
                      parameters: params,
                      variables: {id: nestedEntryPointParams.id},
                    },
                  },
                };
              },
              root: (nestedEntryPointResource: $FlowFixMe),
            },
            entryPointParams: entryPointParams,
          },
        },
      };
    },
    root: (new FakeJSResource(): $FlowFixMe),
  };
});

afterAll(() => {
  jest.clearAllMocks();
});

it('suspends while the query and component are pending', () => {
  entryPointReference = loadEntryPoint<
    {id: string},
    {...},
    {...},
    {...},
    mixed,
    any,
    {
      getPreloadProps(entryPointParams: any): {
        entryPoints: {
          nestedEntryPoint: {
            entryPoint: {
              getPreloadProps(nestedEntryPointParams: any): {
                queries: {
                  preloadedQuery: {
                    parameters: {kind: string, params: RequestParameters},
                    variables: {id: any},
                  },
                },
              },
              root: any,
            },
            entryPointParams: any,
          },
        },
      },
      root: any,
    },
  >(
    {
      getEnvironment: () => environment,
    },
    entrypoint,
    {
      id: 'my-id',
    },
  ).entryPoints.nestedEntryPoint;

  expect(fetch).toBeCalledTimes(1);
  expect(nestedEntryPointResource.load).toBeCalledTimes(1);
  const renderer = TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Fallback">
        {/* $FlowFixMe[incompatible-type-arg] */}
        <EntryPointContainer
          entryPointReference={entryPointReference}
          props={{}}
        />
      </React.Suspense>
    </RelayEnvironmentProvider>,
  );
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('Fallback');
});

it('suspends then updates when the query and component load', () => {
  entryPointReference = loadEntryPoint<
    {id: string},
    {...},
    {...},
    {...},
    mixed,
    any,
    {
      getPreloadProps(entryPointParams: any): {
        entryPoints: {
          nestedEntryPoint: {
            entryPoint: {
              getPreloadProps(nestedEntryPointParams: any): {
                queries: {
                  preloadedQuery: {
                    parameters: {kind: string, params: RequestParameters},
                    variables: {id: any},
                  },
                },
              },
              root: any,
            },
            entryPointParams: any,
          },
        },
      },
      root: any,
    },
  >(
    {
      getEnvironment: () => environment,
    },
    entrypoint,
    {
      id: 'my-id',
    },
  ).entryPoints.nestedEntryPoint;

  expect(fetch).toBeCalledTimes(1);
  expect(nestedEntryPointResource.load).toBeCalledTimes(1);
  expect(nestedEntryPointResource.getModuleIfRequired).toBeCalledTimes(1);
  const renderer = TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Fallback">
        {/* $FlowFixMe[incompatible-type-arg] */}
        <EntryPointContainer
          entryPointReference={entryPointReference}
          props={{}}
        />
      </React.Suspense>
    </RelayEnvironmentProvider>,
  );
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('Fallback');
  let preloadedQuery = null;
  function Component(props: any) {
    expect(props.queries.preloadedQuery.variables.id).toBe('my-id');
    preloadedQuery = props.queries.preloadedQuery;
    const data = usePreloadedQuery(query, props.queries.preloadedQuery);
    return data.node?.name;
  }
  nestedEntryPointResource.resolve((Component: any));
  PreloadableQueryRegistry.set(ID, query);
  dataSource.next(response);
  dataSource.complete();
  TestRenderer.act(() => jest.runAllImmediates());
  // One for preloading, 2 more for render
  expect(nestedEntryPointResource.getModuleIfRequired).toBeCalledTimes(3);
  expect(nestedEntryPointResource.load).toBeCalledTimes(1);
  expect(preloadedQuery).not.toBe(null);
  expect(renderer.toJSON()).toEqual('Alice');
});

it('renders synchronously when the component has already loaded and the data arrives before render', () => {
  let preloadedQuery = null;
  function Component(props: any) {
    expect(props.queries.preloadedQuery.variables.id).toBe('my-id');
    preloadedQuery = props.queries.preloadedQuery;
    const data = usePreloadedQuery(query, props.queries.preloadedQuery);
    return data.node?.name;
  }
  PreloadableQueryRegistry.set(ID, query);
  nestedEntryPointResource.resolve((Component: any));
  entryPointReference = loadEntryPoint<
    {id: string},
    {...},
    {...},
    {...},
    mixed,
    any,
    {
      getPreloadProps(entryPointParams: any): {
        entryPoints: {
          nestedEntryPoint: {
            entryPoint: {
              getPreloadProps(nestedEntryPointParams: any): {
                queries: {
                  preloadedQuery: {
                    parameters: {kind: string, params: RequestParameters},
                    variables: {id: any},
                  },
                },
              },
              root: any,
            },
            entryPointParams: any,
          },
        },
      },
      root: any,
    },
  >(
    {
      getEnvironment: () => environment,
    },
    entrypoint,
    {
      id: 'my-id',
    },
  ).entryPoints.nestedEntryPoint;
  dataSource.next(response);
  dataSource.complete();

  const renderer = TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Fallback">
        {/* $FlowFixMe[incompatible-type-arg] */}
        <EntryPointContainer
          entryPointReference={entryPointReference}
          props={{}}
        />
      </React.Suspense>
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual('Alice');
  expect(nestedEntryPointResource.getModuleIfRequired).toBeCalledTimes(2);
  expect(nestedEntryPointResource.load).toBeCalledTimes(0);
  expect(preloadedQuery).not.toBe(null);
});

it('warns if the entryPointReference has already been disposed', () => {
  // $FlowFixMe[incompatible-call]
  entryPointReference = loadEntryPoint(
    {
      getEnvironment: () => environment,
    },
    entrypoint,
    {},
  );
  const render = () => {
    TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type-arg] */}
          <EntryPointContainer
            entryPointReference={entryPointReference}
            props={{}}
          />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
    TestRenderer.act(() => jest.runAllImmediates());
  };

  render();
  entryPointReference.dispose();

  expectWarningWillFire(
    '<EntryPointContainer>: Expected entryPointReference to not be disposed yet. This is because disposing the entrypoint marks it for future garbage collection, and as such may no longer be present in the Relay store. In the future, this will become a hard error.',
  );
  render();
});
