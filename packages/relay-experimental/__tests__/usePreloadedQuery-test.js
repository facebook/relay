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
const TestRenderer = require('react-test-renderer');

const {loadQuery} = require('../loadQuery');
const usePreloadedQuery = require('../usePreloadedQuery');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} = require('relay-runtime');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

const query = generateAndCompile(`
  query TestQuery($id: ID! = 4) {
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

let dataSource;
let environment;
let fetch;

class ErrorBoundary extends React.Component<$FlowFixMe, $FlowFixMe> {
  state: {|error: mixed|} = {error: null};

  componentDidCatch(error) {
    this.setState({error});
  }

  render() {
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
});

it('suspends while the query is pending', () => {
  const prefetched = loadQuery(environment, params, {id: '4'});
  let data;
  function Component(props) {
    data = usePreloadedQuery(query, props.prefetched);
    return data.node.name;
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
  const prefetched = loadQuery(environment, params, {});
  let data;
  function Component(props) {
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

  const prefetched = loadQuery(environment, params, {id: '4'});
  dataSource.next(response);
  dataSource.complete();

  let data;
  function Component(props) {
    data = usePreloadedQuery(query, props.prefetched);
    return data.node.name;
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
  const prefetched = loadQuery(environment, params, {id: '4'});
  const error = new Error('wtf');
  dataSource.error(error);

  let data;
  function Component(props) {
    data = usePreloadedQuery(query, props.prefetched);
    return data.node.name;
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
  const prefetched = loadQuery(environment, params, {id: '4'});

  let data;
  function Component(props) {
    data = usePreloadedQuery(query, props.prefetched);
    return data.node.name;
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

  dataSource.next(response);
  dataSource.complete();
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
  const prefetched = loadQuery(
    environment,
    params,
    {id: '4'},
    {fetchKey: 'Break Cache 0', fetchPolicy: 'network-only'},
  );
  const dataSourceBreakCache0 = dataSource;
  const prefetchedWithFetchKey = loadQuery(
    environment,
    params,
    {id: '4'},
    {fetchKey: 'Break Cache 1', fetchPolicy: 'network-only'},
  );
  const dataSourceBreakCache1 = dataSource;
  expect(fetch).toBeCalledTimes(2);

  let data;
  function Component(props) {
    data = usePreloadedQuery(query, props.prefetched);
    return data.node.name;
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

  dataSourceBreakCache0.next(response);
  dataSourceBreakCache0.complete();
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
  dataSourceBreakCache1.next(responseRefetch);
  dataSourceBreakCache1.complete();
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
  const prefetched = loadQuery(
    environment,
    params,
    {id: '4'},
    {fetchPolicy: 'store-or-network'},
  );
  expect(fetch).toBeCalledTimes(1);

  let data;
  function Component(props) {
    data = usePreloadedQuery(query, props.prefetched);
    return data.node.name;
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
  const prefetched = loadQuery(
    environment,
    params,
    {id: '4'},
    {fetchKey: 'Break Cache 0', fetchPolicy: 'network-only'},
  );
  const dataSourceBreakCache0 = dataSource;
  const prefetchedWithFetchKey = loadQuery(
    environment,
    params,
    {id: '4'},
    {fetchKey: 'Break Cache 0', fetchPolicy: 'network-only'},
  );
  const dataSourceBreakCache1 = dataSource;
  expect(fetch).toBeCalledTimes(1);

  let data;
  function Component(props) {
    data = usePreloadedQuery(query, props.prefetched);
    return data.node.name;
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

  dataSourceBreakCache0.next(response);
  dataSourceBreakCache0.complete();
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
  dataSourceBreakCache1.next(responseRefetch);
  dataSourceBreakCache1.complete();
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
  const prefetched = loadQuery(environment, params, {id: '4'});

  let data;
  function Component(props) {
    data = usePreloadedQuery(query, props.prefetched);
    return data.node.name;
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
  dataSource.error(error);
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('Error Boundary');
});
