/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 * @jest-environment jsdom
 */

'use strict';
import type {Sink} from '../../../relay-runtime/network/RelayObservable';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useIsParentQueryActive = require('../useIsParentQueryActive');
const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {act} = require('react');
const {
  __internal: {fetchQuery},
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowConsoleErrors();
disallowWarnings();

let dataSource;
let environment;
let fetch;
let fragment;
let fragmentRef;
let operation;
let query;

beforeEach(() => {
  const source = new RecordSource();
  const store = new Store(source);
  fetch = jest.fn(
    (_query: $FlowFixMe, _variables: $FlowFixMe, _cacheConfig: $FlowFixMe) =>
      Observable.create(
        (
          sink: Sink<
            | {
                data: {__typename: string, id: string, name: string},
                label: string,
                path: Array<string>,
              }
            | {data: {node: {__typename: string, id: string}}}
            | {data: {node: {__typename: string, id: string, name: string}}},
          >,
        ) => {
          dataSource = sink;
        },
      ),
  );
  environment = new Environment({
    network: Network.create(fetch as $FlowFixMe),
    store,
  });

  query = graphql`
    query useIsParentQueryActiveTestUserQuery($id: ID!) {
      node(id: $id) {
        ...useIsParentQueryActiveTestUserFragment @dangerously_unaliased_fixme
      }
    }
  `;
  fragment = graphql`
    fragment useIsParentQueryActiveTestUserFragment on User {
      id
      name
    }
  `;
  operation = createOperationDescriptor(query, {id: '4'});

  environment.commitPayload(operation, {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Zuck',
    },
  });

  const snapshot = environment.lookup(operation.fragment);
  fragmentRef = snapshot.data?.node as $FlowFixMe;
});

it('returns false when owner is not pending', async () => {
  let pending = null;
  function Component() {
    pending = useIsParentQueryActive(fragment, fragmentRef);
    return null;
  }
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  expect(fetch).toBeCalledTimes(0);
  expect(pending).toBe(false);
});

it('returns false when an unrelated owner is pending', async () => {
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
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  expect(pending).toBe(false);
});

it('returns true when owner is started but has not returned payloads', async () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  let pending = null;
  function Component() {
    pending = useIsParentQueryActive(fragment, fragmentRef);
    return null;
  }
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  expect(pending).toBe(true);
});

it('returns true when owner fetch has returned payloads but not completed', async () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  await act(() => {
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
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  expect(pending).toBe(true);
});

it('returns false when owner fetch completed', async () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  await act(() => {
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
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  expect(pending).toBe(false);
});

it('returns false when owner fetch errored', async () => {
  const onError = jest.fn<[Error], unknown>();
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
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  expect(onError).toBeCalledTimes(1);
  expect(pending).toBe(false);
});

it('does not update the component when the owner is fetched', async () => {
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  // Ensure that useEffect runs
  await act(() => jest.runAllImmediates());

  expect(fetch).toBeCalledTimes(0);
  expect(states).toEqual([false]);
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  expect(states).toEqual([false]);
});

it('does not update the component when a pending owner fetch returns a payload', async () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  // Ensure that useEffect runs
  await act(() => jest.runAllImmediates());

  expect(states).toEqual([true]);
  await act(() => {
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

it('updates the component when a pending owner fetch completes', async () => {
  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  // Ensure that useEffect runs
  await act(() => jest.runAllImmediates());

  expect(states).toEqual([true]);
  await act(() => {
    dataSource.complete();
    jest.runAllImmediates();
  });
  expect(states).toEqual([true, false]);
});

it('updates the component when a pending owner fetch errors', async () => {
  const onError = jest.fn<[Error], unknown>();
  fetchQuery(environment, operation).subscribe({
    error: onError,
  });
  expect(fetch).toBeCalledTimes(1);
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  // Ensure that useEffect runs
  await act(() => jest.runAllImmediates());

  expect(states).toEqual([true]);
  await act(() => {
    dataSource.error(new Error('wtf'));
    jest.runAllImmediates();
  });
  expect(onError).toBeCalledTimes(1);
  expect(states).toEqual([true, false]);
});

it('updates the component when a pending owner fetch with multiple payloads completes ', async () => {
  query = graphql`
    query useIsParentQueryActiveTestUserDeferQuery($id: ID!) {
      node(id: $id) {
        ...useIsParentQueryActiveTestUserFragment
          @dangerously_unaliased_fixme
          @defer
      }
    }
  `;
  operation = createOperationDescriptor(query, {id: '4'});
  const snapshot = environment.lookup(operation.fragment);
  fragmentRef = snapshot.data?.node as $FlowFixMe;

  fetchQuery(environment, operation).subscribe({});
  expect(fetch).toBeCalledTimes(1);
  const states = [];
  function Component() {
    states.push(useIsParentQueryActive(fragment, fragmentRef));
    return null;
  }
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  // Ensure that useEffect runs
  await act(() => jest.runAllImmediates());
  expect(states).toEqual([true]);

  await act(() => {
    dataSource.next({
      data: {
        node: {
          __typename: 'User',
          id: '1',
        },
      },
    });
    jest.runAllImmediates();
  });
  await act(() => {
    dataSource.next({
      data: {
        __typename: 'User',
        id: '1',
        name: 'Mark',
      },
      label:
        'useIsParentQueryActiveTestUserDeferQuery$defer$useIsParentQueryActiveTestUserFragment',
      path: ['node'],
    });
    dataSource.complete();
    jest.runAllImmediates();
  });
  expect(states).toEqual([true, false]);
});

it('should only update if the latest owner completes the query', async () => {
  fetchQuery(environment, operation).subscribe({});
  const oldDataSource = dataSource;
  expect(fetch).toBeCalledTimes(1);
  let setRef = (ref: $FlowFixMe) => {};
  const mockFn = jest.fn(() => {});
  const Renderer = (props: {pending: boolean}) => {
    // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
    mockFn(props.pending);
    return props.pending;
  };
  function Component() {
    const [ref, setRefFn] = React.useState(fragmentRef);
    setRef = setRefFn;
    const pending = useIsParentQueryActive(fragment, ref);
    return <Renderer pending={pending} />;
  }
  await act(() => {
    ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <Component />
      </RelayEnvironmentProvider>,
    );
  });
  await act(() => jest.runAllImmediates());
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
  const newFragmentRef: $FlowFixMe = snapshot.data?.node;
  expect(mockFn.mock.calls[0]).toEqual([true]);

  await act(() => {
    fetchQuery(environment, newOperation).subscribe({});
    setRef(newFragmentRef);
  });
  expect(mockFn.mock.calls).toEqual([[true], [true]]);
  await act(() => oldDataSource.complete());
  expect(mockFn.mock.calls).toEqual([[true], [true]]);

  await act(() => dataSource.complete());
  expect(mockFn.mock.calls).toEqual([[true], [true], [false]]);
  await act(() => {
    setRef(fragmentRef);
  });
  expect(mockFn.mock.calls).toEqual([[true], [true], [false], [false]]);
});
