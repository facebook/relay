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

const EntryPointContainer = require('../EntryPointContainer.react');
const React = require('react');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const TestRenderer = require('react-test-renderer');

const {loadQuery} = require('../loadQuery');
const prepareEntryPoint = require('../prepareEntryPoint');
const usePreloadedQuery = require('../usePreloadedQuery');

const {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} = require('relay-runtime');
const {generateAndCompile} = require('relay-test-utils-internal');

const query = generateAndCompile(`
  query TestQuery($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
      }
    }
  }
`).TestQuery;
const params = {
  kind: 'PreloadableConcreteRequest',
  params: query.params,
};

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
  getModuleIfRequired: () => T | null;
  load: () => Promise<T>;
  resolve: T => void;

  constructor(resource: T | null) {
    this._resolve = null;
    this._resource = resource;

    this.getModuleIfRequired = jest.fn(() => this._resource);
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
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  fetch = jest.fn((_query, _variables, _cacheConfig) =>
    Observable.create(sink => {
      dataSource = sink;
    }),
  );
  environment = new Environment({
    network: Network.create(fetch),
    store: new Store(new RecordSource()),
  });
  nestedEntryPointResource = new FakeJSResource();

  entrypoint = {
    getPreloadProps(entryPointParams) {
      return {
        entryPoints: {
          nestedEntryPoint: {
            entryPoint: {
              getPreloadProps(nestedEntryPointParams) {
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

it('suspends while the query and component are pending', () => {
  entryPointReference = prepareEntryPoint(
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
  entryPointReference = prepareEntryPoint(
    {
      getEnvironment: () => environment,
    },
    entrypoint,
    {
      id: 'my-id',
    },
  ).entryPoints.nestedEntryPoint;

  expect(fetch).toBeCalledTimes(1);
  expect(nestedEntryPointResource.getModuleIfRequired).toBeCalledTimes(1);
  expect(nestedEntryPointResource.load).toBeCalledTimes(1);
  const renderer = TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Fallback">
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
  function Component(props) {
    expect(props.queries.preloadedQuery.variables.id).toBe('my-id');
    preloadedQuery = props.queries.preloadedQuery;
    const data = usePreloadedQuery(query, props.queries.preloadedQuery);
    return data.node.name;
  }
  nestedEntryPointResource.resolve(Component);
  dataSource.next(response);
  dataSource.complete();
  TestRenderer.act(() => jest.runAllImmediates());
  // One for preloading, 2 more for render
  expect(nestedEntryPointResource.getModuleIfRequired).toBeCalledTimes(3);
  expect(nestedEntryPointResource.load).toBeCalledTimes(1);
  expect(preloadedQuery).not.toBe(null);
  expect(renderer.toJSON()).toEqual('Alice');
});

it('renders synchronously when the query and component are already loaded', () => {
  let preloadedQuery = null;
  function Component(props) {
    expect(props.queries.preloadedQuery.variables.id).toBe('my-id');
    preloadedQuery = props.queries.preloadedQuery;
    const data = usePreloadedQuery(query, props.queries.preloadedQuery);
    return data.node.name;
  }
  nestedEntryPointResource.resolve(Component);
  loadQuery(environment, params, {id: 'my-id'});
  expect(fetch).toBeCalledTimes(1);
  dataSource.next(response);
  dataSource.complete();

  entryPointReference = prepareEntryPoint(
    {
      getEnvironment: () => environment,
    },
    entrypoint,
    {
      id: 'my-id',
    },
  ).entryPoints.nestedEntryPoint;

  const renderer = TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Fallback">
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
