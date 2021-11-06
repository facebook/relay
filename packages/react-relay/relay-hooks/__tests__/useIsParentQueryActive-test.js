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

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useIsParentQueryActive = require('../useIsParentQueryActive');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  __internal: {fetchQuery},
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');

let dataSource;
let environment;
let fetch;
let fragment;
let fragmentRef;
let operation;
let query;

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  const source = new RecordSource();
  const store = new Store(source);
  fetch = jest.fn((_query, _variables, _cacheConfig) =>
    Observable.create(sink => {
      dataSource = sink;
    }),
  );
  environment = new Environment({
    network: Network.create((fetch: $FlowFixMe)),
    store,
  });

  query = getRequest(graphql`
    query useIsParentQueryActiveTestUserQuery($id: ID!) {
      node(id: $id) {
        ...useIsParentQueryActiveTestUserFragment
      }
    }
  `);
  fragment = getFragment(graphql`
    fragment useIsParentQueryActiveTestUserFragment on User {
      id
      name
    }
  `);
  operation = createOperationDescriptor(query, {id: '4'});

  environment.commitPayload(operation, {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Zuck',
    },
  });

  const snapshot = environment.lookup(operation.fragment);
  fragmentRef = (snapshot.data?.node: $FlowFixMe);
});

it('returns false when owner is not pending', () => {
  let pending = null;
  function Component() {
    pending = useIsParentQueryActive(fragment, fragmentRef);
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  expect(fetch).toBeCalledTimes(0);
  expect(pending).toBe(false);
});

it('returns false when an unrelated owner is pending', () => {
  // fetch a different id
  fetchQuery(
    environment,
    createOperationDescriptor(query, {id: '842472'}),
  ).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  let pending = null;
  function Component() {
    pending = useIsParentQueryActive(fragment, fragmentRef);
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  expect(pending).toBe(false);
});

it('returns true when owner is started but has not returned payloads', () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  let pending = null;
  function Component() {
    pending = useIsParentQueryActive(fragment, fragmentRef);
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  expect(pending).toBe(true);
});

it('returns true when owner fetch has returned payloads but not completed', () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  TestRenderer.act(() => {
    dataSource.next({
      data: {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark',
        },
      },
    });
  });
  let pending = null;
  function Component() {
    pending = useIsParentQueryActive(fragment, fragmentRef);
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  expect(pending).toBe(true);
});

it('returns false when owner fetch completed', () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  TestRenderer.act(() => {
    dataSource.next({
      data: {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark',
        },
      },
    });
    dataSource.complete();
  });
  let pending = null;
  function Component() {
    pending = useIsParentQueryActive(fragment, fragmentRef);
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  expect(pending).toBe(false);
});

it('returns false when owner fetch errored', () => {
  const onError = jest.fn();
  fetchQuery(environment, operation).subscribe({
    error: onError,
  });
  expect(fetch).toBeCalledTimes(1);
  dataSource.next({
    data: {
      node: {
        __typename: 'User',
        id: '4',
        name: 'Mark',
      },
    },
  });
  dataSource.error(new Error('wtf'));
  let pending = null;
  function Component() {
    pending = useIsParentQueryActive(fragment, fragmentRef);
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  expect(onError).toBeCalledTimes(1);
  expect(pending).toBe(false);
});

it('does not update the component when the owner is fetched', () => {
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  // Ensure that useEffect runs
  TestRenderer.act(() => jest.runAllImmediates());

  expect(fetch).toBeCalledTimes(0);
  expect(states).toEqual([false]);
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  expect(states).toEqual([false]);
});

it('does not update the component when a pending owner fetch returns a payload', () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  // Ensure that useEffect runs
  TestRenderer.act(() => jest.runAllImmediates());

  expect(states).toEqual([true]);
  TestRenderer.act(() => {
    dataSource.next({
      data: {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark',
        },
      },
    });
    jest.runAllImmediates();
  });
  expect(states).toEqual([true]);
});

it('updates the component when a pending owner fetch completes', () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  // Ensure that useEffect runs
  TestRenderer.act(() => jest.runAllImmediates());

  expect(states).toEqual([true]);
  TestRenderer.act(() => {
    dataSource.complete();
    jest.runAllImmediates();
  });
  expect(states).toEqual([true, false]);
});

it('updates the component when a pending owner fetch errors', () => {
  const onError = jest.fn();
  fetchQuery(environment, operation).subscribe({
    error: onError,
  });
  expect(fetch).toBeCalledTimes(1);
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  // Ensure that useEffect runs
  TestRenderer.act(() => jest.runAllImmediates());

  expect(states).toEqual([true]);
  TestRenderer.act(() => {
    dataSource.error(new Error('wtf'));
    jest.runAllImmediates();
  });
  expect(onError).toBeCalledTimes(1);
  expect(states).toEqual([true, false]);
});

it('updates the component when a pending owner fetch with multiple payloads completes ', () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }

  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  // Ensure that useEffect runs
  TestRenderer.act(() => jest.runAllImmediates());
  expect(states).toEqual([true]);

  TestRenderer.act(() => {
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
        },
      },
    });
    jest.runAllImmediates();
  });
  TestRenderer.act(() => {
    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'Mark',
      },
      label: 'UserQuery$defer$UserFragment',
      path: ['node'],
    });
    dataSource.complete();
    jest.runAllImmediates();
  });
  expect(states).toEqual([true, false]);
});

it('should only update if the latest owner completes the query', () => {
  fetchQuery(environment, operation).subscribe({});
  const oldDataSource = dataSource;
  expect(fetch).toBeCalledTimes(1);
  let setRef = ref => {};
  const mockFn = jest.fn(() => {});
  const Renderer = props => {
    mockFn(props.pending);
    return props.pending;
  };
  function Component() {
    const [ref, setRefFn] = React.useState(fragmentRef);
    setRef = setRefFn;
    const pending = useIsParentQueryActive(fragment, ref);
    return <Renderer pending={pending} />;
  }
  TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component />
    </RelayEnvironmentProvider>,
  );
  TestRenderer.act(() => jest.runAllImmediates());
  expect(mockFn.mock.calls[0]).toEqual([true]);

  const newOperation = createOperationDescriptor(query, {id: '5'});
  environment.commitPayload(newOperation, {
    node: {
      __typename: 'User',
      id: '5',
      name: 'Mark',
    },
  });
  const snapshot = environment.lookup(newOperation.fragment);
  const newFragmentRef = (snapshot.data?.node: $FlowFixMe);
  expect(mockFn.mock.calls[0]).toEqual([true]);

  TestRenderer.act(() => {
    fetchQuery(environment, newOperation).subscribe({});
    setRef(newFragmentRef);
  });
  expect(mockFn.mock.calls).toEqual([[true], [true]]);
  TestRenderer.act(() => oldDataSource.complete());
  expect(mockFn.mock.calls).toEqual([[true], [true]]);

  TestRenderer.act(() => dataSource.complete());
  expect(mockFn.mock.calls).toEqual([[true], [true], [false]]);
  TestRenderer.act(() => {
    setRef(fragmentRef);
  });
  expect(mockFn.mock.calls).toEqual([[true], [true], [false], [false]]);
});
