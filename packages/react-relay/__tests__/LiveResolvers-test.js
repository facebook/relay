/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

import type {IEnvironment} from 'relay-runtime';
import type {MutableRecordSource} from 'relay-runtime/store/RelayStoreTypes';

const React = require('react');
const {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment,
  useLazyLoadQuery,
} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {RelayFeatureFlags, getRequest} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  GLOBAL_STORE,
  resetStore,
} = require('relay-runtime/store/__tests__/resolvers/ExampleExternalStateStore');
const counterNoFragmentResolver = require('relay-runtime/store/__tests__/resolvers/LiveCounterNoFragment');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore.js');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = true;
  resetStore();
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = false;
});

test('Can read an external state resolver directly', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest1Query {
      counter
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const data = environment.lookup(operation.fragment).data;
  expect(data).toEqual({
    counter: 0,
  });
});

test('Environment subscribers see updates pushed from external data source', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest2Query {
      counter
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  let observedCounter = null;

  const snapshot = environment.lookup(operation.fragment);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  observedCounter = (snapshot.data: any).counter;

  const environmentUpdateHandler = jest.fn(() => {
    const s = environment.lookup(operation.fragment);
    // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
    observedCounter = (s.data: any).counter;
  });
  const disposable = environment.subscribe(snapshot, environmentUpdateHandler);

  // SETUP COMPLETE

  // Read the initial value
  expect(observedCounter).toBe(0);
  expect(environmentUpdateHandler).not.toHaveBeenCalled();

  // Increment and assert we get notified of the new value
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  expect(environmentUpdateHandler).toHaveBeenCalledTimes(1);
  expect(observedCounter).toBe(1);

  // Unsubscribe then increment and assert don't get notified.
  disposable.dispose();
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  expect(environmentUpdateHandler).toHaveBeenCalledTimes(1);
  expect(observedCounter).toBe(1);

  // Explicitly read and assert we see the incremented value
  // missed before due to unsubscribing.
  const nextSnapshot = environment.lookup(operation.fragment);

  expect(nextSnapshot.data).toEqual({
    counter: 2,
  });
});

test('Relay Resolvers that read Live Resolvers see updates pushed from external data source', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest3Query {
      counter_plus_one
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  let observedCounterPlusOne = null;

  const snapshot = environment.lookup(operation.fragment);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  observedCounterPlusOne = (snapshot.data: any).counter_plus_one;

  const environmentUpdateHandler = jest.fn(() => {
    const s = environment.lookup(operation.fragment);
    // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
    observedCounterPlusOne = (s.data: any).counter_plus_one;
  });
  const disposable = environment.subscribe(snapshot, environmentUpdateHandler);

  // SETUP COMPLETE

  // Read the initial value
  expect(observedCounterPlusOne).toBe(1);
  expect(environmentUpdateHandler).not.toHaveBeenCalled();

  // Increment and assert we get notified of the new value
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  expect(environmentUpdateHandler).toHaveBeenCalledTimes(1);
  expect(observedCounterPlusOne).toBe(2);

  // Unsubscribe then increment and assert don't get notified.
  disposable.dispose();
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  expect(environmentUpdateHandler).toHaveBeenCalledTimes(1);
  expect(observedCounterPlusOne).toBe(2);

  // Explicitly read and assert we see the incremented value
  // missed before due to unsubscribing.
  const nextSnapshot = environment.lookup(operation.fragment);
  expect(nextSnapshot.data).toEqual({
    counter_plus_one: 3,
  });
});

// This triggers a potential edge case where the subscription is created before
// we create the record where we store the value.
test('Can handle a Live Resolver that triggers an update immediately on subscribe', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest4Query {
      ping
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const data = environment.lookup(operation.fragment).data;
  expect(data).toEqual({
    ping: 'pong',
  });
});

test("Resolvers without fragments aren't reevaluated when their parent record updates.", async () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });

  const FooQuery = graphql`
    query LiveResolversTest14Query {
      counter_no_fragment

      # An additional field on Query which can be updated, invalidating the root record.
      me {
        __typename
      }
    }
  `;

  const store = new LiveResolverStore(source, {gcReleaseBufferSize: 0});

  const mockPayload = Promise.resolve({
    data: {
      me: {
        id: '1',
        __typename: 'User',
      },
    },
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(() => mockPayload),
    store,
  });

  function Environment({children}: {children: React.Node}) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">{children}</React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function TestComponent() {
    const queryData = useLazyLoadQuery(FooQuery, {});
    return queryData.counter_no_fragment;
  }

  const initialCallCount = counterNoFragmentResolver.callCount;

  const renderer = TestRenderer.create(
    <Environment>
      <TestComponent />
    </Environment>,
  );

  expect(counterNoFragmentResolver.callCount).toBe(initialCallCount + 1);
  // Initial render evaluates (and caches) the `counter_no_fragment` resolver.
  expect(renderer.toJSON()).toEqual('Loading...');

  // When the network response returns, it updates the query root, which would
  // invalidate a resolver with a fragment on Query. However,
  // `counter_no_fragment` has no fragment, so it should not be revaluated.
  TestRenderer.act(() => jest.runAllImmediates());

  expect(counterNoFragmentResolver.callCount).toBe(initialCallCount + 1);
  expect(renderer.toJSON()).toEqual('0');
});

test('Can suspend', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });

  const Fragment = graphql`
    fragment LiveResolversTest5Fragment on Query {
      counter_suspends_when_odd
    }
  `;
  const FooQuery = graphql`
    query LiveResolversTest5Query {
      ...LiveResolversTest5Fragment
    }
  `;

  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });
  environment.commitPayload(
    createOperationDescriptor(getRequest(FooQuery), {}),
    {
      me: {id: '1'},
    },
  );

  function Environment({children}: {children: React.Node}) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">{children}</React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function TestComponent() {
    const queryData = useLazyLoadQuery(FooQuery, {});
    const fragmentData = useFragment(Fragment, queryData);
    return fragmentData.counter_suspends_when_odd;
  }

  const renderer = TestRenderer.create(
    <Environment>
      <TestComponent />
    </Environment>,
  );
  expect(renderer.toJSON()).toEqual('0');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  // If do not trigger `act` here, the renderer is still `0`. Probably, a React thing...
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('Loading...');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  expect(renderer.toJSON()).toEqual('2');
});

test('Can suspend with resolver that uses live resolver', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
  });

  const FooQuery = graphql`
    query LiveResolversTest6Query {
      ...LiveResolversTest6Fragment
    }
  `;

  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  function Environment({children}: {children: React.Node}) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">{children}</React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function TestComponent() {
    const queryData = useLazyLoadQuery(FooQuery, {});
    const fragmentData = useFragment(
      graphql`
        fragment LiveResolversTest6Fragment on Query {
          user_name_and_counter_suspends_when_odd
        }
      `,
      queryData,
    );
    return fragmentData.user_name_and_counter_suspends_when_odd;
  }

  const renderer = TestRenderer.create(
    <Environment>
      <TestComponent />
    </Environment>,
  );
  expect(renderer.toJSON()).toEqual('Alice 0');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  // If do not trigger `act` here, the renderer is still `0`. Probably, a React thing...
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('Loading...');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  expect(renderer.toJSON()).toEqual('Alice 2');
  TestRenderer.act(() => {
    const operationDescriptor = createOperationDescriptor(
      getRequest(FooQuery),
      {},
    );
    environment.commitPayload(operationDescriptor, {
      me: {id: '1', name: 'Bob', __typename: 'User'},
    });
  });
  expect(renderer.toJSON()).toEqual('Bob 2');
});

describe('Live Resolver with Suspense and Missing Data', () => {
  let renderer;

  function InnerTestComponent({scale}: {scale: number}) {
    const data = useLazyLoadQuery(
      graphql`
        query LiveResolversTest7Query($id: ID!, $scale: Float!) {
          node(id: $id) {
            ... on User {
              name
              user_profile_picture_uri_suspends_when_the_counter_is_odd(
                scale: $scale
              )
            }
          }
        }
      `,
      {id: '1', scale},
      {fetchPolicy: 'store-only'},
    );
    return `${String(data.node?.name)}: ${String(
      data.node?.user_profile_picture_uri_suspends_when_the_counter_is_odd,
    )}`;
  }

  function TestComponent({
    environment,
    ...rest
  }: {
    environment: RelayModernEnvironment,
    scale: number,
  }) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">
          <InnerTestComponent {...rest} />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function createEnvironment(source: MutableRecordSource) {
    return new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store: new LiveResolverStore(source),
    });
  }

  it('should renderer the data from the store, after global state resolves the value', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        __typename: 'User',
        name: 'Alice',
        id: '1',
        'profile_picture(scale:1.5)': {
          __ref: 'client:1:profile_picture(scale:1.5)',
        },
      },
      'client:1:profile_picture(scale:1.5)': {
        __id: 'client:1:profile_picture(scale:1.5)',
        uri: 'scale 1.5',
      },
    });
    const environment = createEnvironment(source);

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <TestComponent environment={environment} scale={1.5} />,
      );
    });
    expect(renderer.toJSON()).toEqual('Loading...');
    TestRenderer.act(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    });
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderer.toJSON()).toEqual(
      'Alice: Hello, Alice! Picture Url: scale 1.5',
    );
  });

  it('should render undefined value for missing data in live resolver field', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        __typename: 'User',
        name: 'Alice',
        id: '1',
        'profile_picture(scale:1.5)': {
          __ref: 'client:1:profile_picture(scale:1.5)',
        },
        'profile_picture(scale:2)': {
          __ref: 'client:1:profile_picture(scale:2)',
        },
      },
      'client:1:profile_picture(scale:1.5)': {
        __id: 'client:1:profile_picture(scale:1.5)',
        uri: 'scale 1.5',
      },
      'client:1:profile_picture(scale:2)': {
        __id: 'client:1:profile_picture(scale:2)',
        // missing data for uri
      },
    });
    const environment = createEnvironment(source);
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <TestComponent environment={environment} scale={1.5} />,
      );
    });
    TestRenderer.act(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    });
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderer.toJSON()).toEqual(
      'Alice: Hello, Alice! Picture Url: scale 1.5',
    );
    TestRenderer.act(() => {
      renderer.update(<TestComponent environment={environment} scale={2} />);
    });
    // the data for scale 2 is missing in the store
    expect(renderer.toJSON()).toEqual('Alice: undefined');
  });

  it('should render undefined value for missing data in live resolver field and trigger different states of suspense ', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        __typename: 'User',
        name: 'Alice',
        id: '1',
        'profile_picture(scale:1.5)': {
          __ref: 'client:1:profile_picture(scale:1.5)',
        },
        'profile_picture(scale:2)': {
          __ref: 'client:1:profile_picture(scale:2)',
        },
        'profile_picture(scale:3)': {
          __ref: 'client:1:profile_picture(scale:3)',
        },
      },
      'client:1:profile_picture(scale:1.5)': {
        __id: 'client:1:profile_picture(scale:1.5)',
        uri: 'scale 1.5',
      },
      'client:1:profile_picture(scale:2)': {
        __id: 'client:1:profile_picture(scale:2)',
        // missing data for uri
      },
      'client:1:profile_picture(scale:3)': {
        __id: 'client:1:profile_picture(scale:3)',
        uri: 'scale 3',
      },
    });
    const environment = createEnvironment(source);

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <TestComponent environment={environment} scale={1.5} />,
      );
    });

    expect(renderer.toJSON()).toEqual('Loading...');
    // This should trigger the re-render with the missing data in the fragment
    TestRenderer.act(() => {
      renderer.update(<TestComponent environment={environment} scale={2} />);
    });
    // Now, the whole live field became undefined, as some of
    // the data in the live field resolver fragment is missing
    expect(renderer.toJSON()).toEqual('Alice: undefined');
    TestRenderer.act(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    });
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderer.toJSON()).toEqual('Alice: undefined');

    // Next, we're re-rendering with new `scale`, and for this value (3) we have the data in
    // the store (no missing data)
    TestRenderer.act(() => {
      renderer.update(<TestComponent environment={environment} scale={3} />);
    });
    // And we are rendering the data with the new scale
    expect(renderer.toJSON()).toEqual(
      'Alice: Hello, Alice! Picture Url: scale 3',
    );

    // Re-render fragment with missing data, to make sure we correctly use cached value
    TestRenderer.act(() => {
      renderer.update(<TestComponent environment={environment} scale={2} />);
    });
    expect(renderer.toJSON()).toEqual('Alice: undefined');

    TestRenderer.act(() => {
      renderer.update(<TestComponent environment={environment} scale={3} />);
    });
    // And we are rendering the data with the new scale
    expect(renderer.toJSON()).toEqual(
      'Alice: Hello, Alice! Picture Url: scale 3',
    );

    // Now, the global store should have the data
    TestRenderer.act(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    });
    TestRenderer.act(() => jest.runAllImmediates());

    // Now, again we are suspending, because the global state is still not ready
    expect(renderer.toJSON()).toEqual('Loading...');
  });
});

test('Live Resolver with Missing Data and @required', () => {
  function InnerTestComponent({id}: {id: string}) {
    const data = useLazyLoadQuery(
      graphql`
        query LiveResolversTest8Query($id: ID!) {
          node(id: $id) {
            ... on User {
              name
              resolver_that_throws
            }
          }
        }
      `,
      {id},
      {fetchPolicy: 'store-only'},
    );
    return `${data.node?.name ?? 'Unknown name'}: ${
      data.node?.resolver_that_throws ?? 'Unknown resolver_that_throws value'
    }`;
  }

  function TestComponent({
    environment,
    ...rest
  }: {
    environment: RelayModernEnvironment,
    id: string,
  }) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">
          <InnerTestComponent {...rest} />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }
  const requiredFieldLogger = jest.fn();
  function createEnvironment(source: MutableRecordSource) {
    return new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store: new LiveResolverStore(source),
      requiredFieldLogger,
    });
  }

  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      'node(id:"1")': {__ref: '1'},
      'node(id:"2")': {__ref: '2'},
    },
    '1': {
      __id: '1',
      __typename: 'User',
      name: 'Alice',
      // username is missing
      id: '1',
    },
    '2': {
      __id: '2',
      __typename: 'User',
      name: 'Bob',
      username: 'bob',
      id: '2',
    },
  });
  const environment = createEnvironment(source);

  // First, render with missing data
  expect(() => {
    TestRenderer.create(<TestComponent environment={environment} id="1" />);
  }).toThrow(
    "Relay: Missing @required value at path 'username' in 'ResolverThatThrows'.",
  );
  expect(requiredFieldLogger.mock.calls).toEqual([
    [
      {
        kind: 'missing_field.throw',
        owner: 'ResolverThatThrows',
        fieldPath: 'username',
      },
    ],
  ]);
  requiredFieldLogger.mockReset();

  // Render with complete data
  expect(() => {
    TestRenderer.create(<TestComponent environment={environment} id="2" />);
  }).toThrow('The resolver should throw earlier. It should have missing data.');
  expect(requiredFieldLogger.mock.calls).toEqual([]);
});

test('apply optimistic updates to live resolver field', () => {
  let renderer;

  function InnerTestComponent({scale}: {scale: number}) {
    const data = useLazyLoadQuery(
      graphql`
        query LiveResolversTest9Query($id: ID!, $scale: Float!) {
          node(id: $id) {
            ... on User {
              profile_picture_uri: user_profile_picture_uri_suspends_when_the_counter_is_odd(
                scale: $scale
              )
            }
          }
        }
      `,
      {id: '1', scale},
      {fetchPolicy: 'store-only'},
    );
    return data.node?.profile_picture_uri;
  }

  function TestComponent({
    environment,
    ...rest
  }: {
    environment: RelayModernEnvironment,
    scale: number,
  }) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">
          <InnerTestComponent {...rest} />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function createEnvironment(source: MutableRecordSource) {
    return new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store: new LiveResolverStore(source),
    });
  }

  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      'node(id:"1")': {__ref: '1'},
    },
    '1': {
      __id: '1',
      __typename: 'User',
      name: 'Alice',
      id: '1',
      'profile_picture(scale:1.5)': {
        __ref: 'client:1:profile_picture(scale:1.5)',
      },
    },
    'client:1:profile_picture(scale:1.5)': {
      __id: 'client:1:profile_picture(scale:1.5)',
      uri: 'scale 1.5',
    },
  });
  const environment = createEnvironment(source);

  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <TestComponent environment={environment} scale={1.5} />,
    );
  });

  if (renderer == null) {
    throw new Error('Renderer is expected to be defined.');
  }

  expect(renderer.toJSON()).toEqual('Loading...');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('Hello, Alice! Picture Url: scale 1.5');

  let update;
  TestRenderer.act(() => {
    update = environment.applyUpdate({
      storeUpdater: store => {
        const alice = store.get('1');
        if (alice == null) {
          throw new Error('Expected to have record "1"');
        }
        alice.setValue('Alicia', 'name');
      },
    });
  });
  expect(renderer.toJSON()).toEqual('Hello, Alicia! Picture Url: scale 1.5');

  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('Loading...');

  // Revering optimistic update
  TestRenderer.act(() => update.dispose());
  // Reverting optimistic update should
  // not change suspense state of the live-resolver
  // this should still be `Loading...`
  expect(renderer.toJSON()).toEqual('Loading...');

  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  expect(renderer.toJSON()).toEqual('Hello, Alice! Picture Url: scale 1.5');
});

// Regression test for a case where we were resetting the parent snapshot's
// `isMissingData` to false when reading a live resolver field.
test('Missing data is not clobbered by non-null empty missingLiveResolverFields on snapshot', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest10Query {
      me {
        # Should be tracked as missing data
        name
      }
      counter
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const snapshot = environment.lookup(operation.fragment);
  expect(snapshot.missingLiveResolverFields).toEqual([]);
  expect(snapshot.isMissingData).toBe(true);
});

test('with client-only field', () => {
  let renderer;

  function InnerTestComponent() {
    const data = useClientQuery(
      graphql`
        query LiveResolversTest11Query {
          counter_no_fragment
        }
      `,
      {},
    );
    return data.counter_no_fragment;
  }

  function TestComponent({environment}: {environment: IEnvironment}) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">
          <InnerTestComponent />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function createEnvironment(source: MutableRecordSource) {
    return new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store: new LiveResolverStore(source),
    });
  }

  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const environment = createEnvironment(source);

  TestRenderer.act(() => {
    renderer = TestRenderer.create(<TestComponent environment={environment} />);
  });

  if (renderer == null) {
    throw new Error('Renderer is expected to be defined.');
  }

  expect(renderer.toJSON()).toEqual('0');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  expect(renderer.toJSON()).toEqual('1');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  expect(renderer.toJSON()).toEqual('2');
});

test('with client-only field and args', () => {
  let renderer;

  function InnerTestComponent({prefix}: {prefix: string}) {
    const data = useClientQuery(
      graphql`
        query LiveResolversTest12Query($prefix: String!) {
          counter_no_fragment_with_arg(prefix: $prefix)
        }
      `,
      {prefix},
    );
    return data.counter_no_fragment_with_arg;
  }

  function TestComponent({
    environment,
    ...rest
  }: {
    environment: IEnvironment,
    prefix: string,
  }) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">
          <InnerTestComponent {...rest} />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function createEnvironment(source: MutableRecordSource) {
    return new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store: new LiveResolverStore(source),
    });
  }

  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const environment = createEnvironment(source);

  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <TestComponent prefix="Counter is" environment={environment} />,
    );
  });

  if (renderer == null) {
    throw new Error('Renderer is expected to be defined.');
  }

  expect(renderer.toJSON()).toEqual('Counter is 0');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  expect(renderer.toJSON()).toEqual('Counter is 1');
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  expect(renderer.toJSON()).toEqual('Counter is 2');
});

test('Can read a live client edge without a fragment', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
    '1338': {
      __id: '1338',
      id: '1338',
      __typename: 'User',
      name: 'Elizabeth',
    },
  });

  const FooQuery = graphql`
    query LiveResolversTest13Query {
      live_constant_client_edge @waterfall {
        name
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const data = environment.lookup(operation.fragment).data;
  expect(data).toEqual({
    live_constant_client_edge: {
      name: 'Elizabeth',
    },
  });
});
