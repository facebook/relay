/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {IEnvironment} from 'relay-runtime';
import type {RelayFieldLoggerEvent} from 'relay-runtime/store/RelayStoreTypes';
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
const {
  counter_no_fragment: counterNoFragmentResolver,
} = require('relay-runtime/store/__tests__/resolvers/LiveCounterNoFragment');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
  skipIf,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
  resetStore();
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
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
  const disposable = environment.subscribe(
    snapshot,
    // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
    environmentUpdateHandler,
  );

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
  const disposable = environment.subscribe(
    snapshot,
    // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
    environmentUpdateHandler,
  );

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

test('Subscriptions created while in an optimistic state is in place get cleaned up correctly', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
  });
  const store = new LiveResolverStore(source, {gcReleaseBufferSize: 0});

  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const update = environment.applyUpdate({
    storeUpdater: store => {
      const alice = store.get('1');
      if (alice == null) {
        throw new Error('Expected to have record "1"');
      }
      const storeRoot = store.getRoot();
      storeRoot.setLinkedRecord(alice, 'me');
    },
  });

  const FooQuery = graphql`
    query LiveResolversTestOptimisticUpdateQuery {
      counter
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});

  // Read a live resolver field (Creating a subscription to the live state)
  const snapshot = environment.lookup(operation.fragment);
  const disposable = environment.subscribe(snapshot, () => {
    // Noop. We just need to be subscribed.
  });

  // Revert the optimisitic update.
  // This should unsubscribe the subscription created during the optimistic
  // update, and then reread `counter`. Since `counter` is missing its `me`
  // dependency, it should leave `counter` in a state with no liveValue and
  // _no subscription_.
  update.dispose();

  // Fire the subscription, which should be ignored by Relay.
  expect(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  }).not.toThrow();

  // Clean up (just good hygiene)
  disposable.dispose();
});

test('Outer resolvers do not overwrite subscriptions made by inner resolvers (regression)', () => {
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
    query LiveResolversTestNestedQuery {
      # Outer consumes inner
      outer
      # We include inner again as a subsequent sibling of outer. This ensures
      # that even if outer overwrites the cached version of inner, we end with
      # inner in a valid state. This is nessesary to trigger the error.
      inner
    }
  `;

  const store = new LiveResolverStore(source, {gcReleaseBufferSize: 0});

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
    return queryData.outer ?? null;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <Environment>
        <TestComponent />
      </Environment>,
    );
  });

  expect(renderer?.toJSON()).toEqual('0');

  let update;
  // Delete data putting `inner`'s fragment into a state where it's missing
  // data. This _should_ unsubscribe us from `inner`'s external state.
  TestRenderer.act(() => {
    update = environment.applyUpdate({
      storeUpdater: store => {
        const alice = store.get('1');
        if (alice == null) {
          throw new Error('Expected to have record "1"');
        }
        alice.setValue(undefined, 'name');
      },
    });
  });

  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual(null);

  // Calling increment here should be ignored by Relay. However, if there are
  // dangling subscriptions, this will put inner into a dirty state.
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual(null);

  // Revering optimistic update puts inner back into a state where its
  // fragment is valid. HOWEVER, if a dangling subscription has marked inner
  // as dirty, we will try to read from a LiveValue that does not exist.
  TestRenderer.act(() => update.dispose());
  expect(renderer.toJSON()).toEqual('1');

  // Not part of the repro, but just to confirm: We should now be resubscribed...
  TestRenderer.act(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('2');
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

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <Environment>
        <TestComponent />
      </Environment>,
    );
  });

  expect(counterNoFragmentResolver.callCount).toBe(initialCallCount + 1);
  // Initial render evaluates (and caches) the `counter_no_fragment` resolver.
  expect(renderer?.toJSON()).toEqual('Loading...');

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

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <Environment>
        <TestComponent />
      </Environment>,
    );
  });
  expect(renderer?.toJSON()).toEqual('0');
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

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <Environment>
        <TestComponent />
      </Environment>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Alice 0');
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

skipIf(
  process.env.OSS,
  'Live Resolver with Missing Data and @required',
  async () => {
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
    const relayFieldLogger = jest.fn<
      $FlowFixMe | [RelayFieldLoggerEvent],
      void,
    >();
    function createEnvironment(source: MutableRecordSource) {
      return new RelayModernEnvironment({
        network: RelayNetwork.create(jest.fn()),
        store: new LiveResolverStore(source),
        relayFieldLogger,
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
    await expect(async () => {
      await TestRenderer.act(() => {
        TestRenderer.create(<TestComponent environment={environment} id="1" />);
      });
    }).rejects.toThrow(
      "Relay: Missing @required value at path 'username' in 'ResolverThatThrows'.",
    );
    expect(relayFieldLogger.mock.calls).toEqual([
      [
        {
          kind: 'missing_field.throw',
          owner: 'ResolverThatThrows',
          fieldPath: 'username',
        },
      ],
    ]);
    relayFieldLogger.mockReset();

    // Render with complete data
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <TestComponent environment={environment} id="2" />,
      );
    });

    if (renderer == null) {
      throw new Error('Renderer is expected to be defined.');
    }

    expect(relayFieldLogger.mock.calls).toEqual([
      [
        {
          error: new Error(
            'The resolver should throw earlier. It should have missing data.',
          ),
          fieldPath: 'node.resolver_that_throws',
          kind: 'relay_resolver.error',
          owner: 'LiveResolversTest8Query',
        },
      ],
    ]);

    expect(renderer.toJSON()).toEqual(
      'Bob: Unknown resolver_that_throws value',
    );
  },
);

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

test('live resolver with the edge that always suspend', () => {
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store: new LiveResolverStore(
      RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
        },
      }),
    ),
  });

  function Environment({children}: {children: React.Node}) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">{children}</React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function TestComponent() {
    const data = useClientQuery(
      graphql`
        query LiveResolversTest15Query {
          live_user_resolver_always_suspend @waterfall {
            name
          }
        }
      `,
      {},
    );
    return data.live_user_resolver_always_suspend?.name;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <Environment>
        <TestComponent />
      </Environment>,
    );
  });

  expect(renderer?.toJSON()).toBe('Loading...');
});

describe('client-only fragments', () => {
  const LiveResolversTestCounterUserFragment = graphql`
    fragment LiveResolversTestCounterUserFragment on User {
      counter_suspends_when_odd
    }
  `;

  const LiveResolversTestLiveResolverSuspenseQuery = graphql`
    query LiveResolversTestLiveResolverSuspenseQuery($id: ID!) {
      node(id: $id) {
        ...LiveResolversTestCounterUserFragment
      }
    }
  `;

  function Environment({
    children,
    environment,
  }: {
    children: React.Node,
    environment: RelayModernEnvironment,
  }) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading...">{children}</React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function TestComponent(props: {id: string}) {
    const queryData = useLazyLoadQuery(
      LiveResolversTestLiveResolverSuspenseQuery,
      {id: props.id},
    );
    const fragmentData = useFragment(
      LiveResolversTestCounterUserFragment,
      queryData.node,
    );
    return fragmentData?.counter_suspends_when_odd;
  }

  test('correctly suspend on fragments with client-only data', () => {
    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store: new LiveResolverStore(RelayRecordSource.create()),
    });
    environment.commitPayload(
      createOperationDescriptor(LiveResolversTestLiveResolverSuspenseQuery, {
        id: '1',
      }),
      {
        node: {id: '1', __typename: 'User'},
      },
    );
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <Environment environment={environment}>
          <TestComponent id="1" />
        </Environment>,
      );
    });
    expect(renderer?.toJSON()).toEqual('0');
    TestRenderer.act(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    });
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderer.toJSON()).toEqual('Loading...');
    TestRenderer.act(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    });
    expect(renderer.toJSON()).toEqual('2');
  });

  test('invariant for invalid liveState value in the Relay store.', () => {
    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store: new LiveResolverStore(RelayRecordSource.create()),
    });
    environment.commitPayload(
      createOperationDescriptor(LiveResolversTestLiveResolverSuspenseQuery, {
        id: '1',
      }),
      {
        node: {id: '1', __typename: 'User'},
      },
    );
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <Environment environment={environment}>
          <TestComponent id="1" />
        </Environment>,
      );
    });
    expect(renderer?.toJSON()).toEqual('0');
    TestRenderer.act(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    });
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderer.toJSON()).toEqual('Loading...');
    environment.applyUpdate({
      storeUpdater: store => {
        const record = store.get('client:1:counter_suspends_when_odd');
        // this will force the invalid `liveState` value` in the resolver record
        record?.setValue(undefined, '__resolverLiveStateValue');
      },
    });
    expect(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
    }).toThrowError(
      'Unexpected LiveState value returned from Relay Resolver internal field `RELAY_RESOLVER_LIVE_STATE_VALUE`. It is likely a bug in Relay, or a corrupt state of the relay store state Field Path `counter_suspends_when_odd`. Record `{"__id":"client:1:counter_suspends_when_odd","__typename":"__RELAY_RESOLVER__","__resolverError":null,"__resolverValue":{"__LIVE_RESOLVER_SUSPENSE_SENTINEL":true},"__resolverLiveStateDirty":true}`.',
    );
    expect(renderer.toJSON()).toEqual('Loading...');
  });
});

test('Subscriptions cleaned up correctly after GC', () => {
  const store = new LiveResolverStore(RelayRecordSource.create(), {
    gcReleaseBufferSize: 0,
  });
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  // We're adding some data for `me { id } ` query so the initial read for
  // `live_counter_with_possible_missing_fragment_data` won't have any missing data
  //  and we will be able to create a valid live resolver record for it.
  function publishMeData() {
    environment.commitPayload(
      createOperationDescriptor(
        graphql`
          query LiveResolversTestWithGCUserQuery {
            me {
              id
            }
          }
        `,
        {},
      ),
      {
        me: {
          id: '1',
        },
      },
    );
  }
  publishMeData();

  const operation = createOperationDescriptor(
    graphql`
      query LiveResolversTestWithGCQuery {
        live_counter_with_possible_missing_fragment_data
      }
    `,
    {},
  );

  // The first time we read `live_counter_with_possible_missing_fragment_data` we will
  // create live resolver record and subscribe to the external store for updates
  let snapshot = environment.lookup(operation.fragment);
  expect(snapshot.data).toEqual({
    live_counter_with_possible_missing_fragment_data: 0,
  });
  expect(snapshot.isMissingData).toBe(false);

  // Note: this is another issue with GC here.
  // Our GC will remove **all** records from the store(including __ROOT__) if they are not retained.
  //
  // So in this test we need to retain some unrelevant records in the store to keep the __ROOT__
  // record arount after GC run.
  environment.retain(
    createOperationDescriptor(
      graphql`
        query LiveResolversTestWithGCCounterQuery {
          counter_no_fragment
        }
      `,
      {},
    ),
  );

  const subscriptionsCountBeforeGCRun = GLOBAL_STORE.getSubscriptionsCount();

  // Go-go-go! Clean the store!
  store.scheduleGC();
  jest.runAllImmediates();
  // This will clean the store, and unsubscribe from the external states

  const subscriptionsCountAfterGCRun = GLOBAL_STORE.getSubscriptionsCount();

  // this will verify that we unsubscribed from the external store
  expect(subscriptionsCountAfterGCRun).toEqual(
    subscriptionsCountBeforeGCRun - 1,
  );

  // Re-reading resolvers will create new records for them (but) the
  // `live_counter_with_possible_missing_fragment_data` will have missing required data at this
  // point so we won't be able to create a fully-valid live-resolver record for it (and subscribe/read)
  // from the external state.
  environment.lookup(operation.fragment);

  // this will dispatch an action from the external store and the callback that was created before GC
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});

  // The data for the live resolver is missing (it has missing dependecies)
  snapshot = environment.lookup(operation.fragment);
  expect(snapshot.data).toEqual({
    live_counter_with_possible_missing_fragment_data: undefined,
  });
  expect(snapshot.isMissingData).toBe(true);

  // We should be able to re-read the data once the missing data in avaialbe again
  publishMeData();

  snapshot = environment.lookup(operation.fragment);
  expect(snapshot.data).toEqual({
    live_counter_with_possible_missing_fragment_data: 1,
  });
  expect(snapshot.isMissingData).toBe(false);
});

test('Errors when reading a @live resolver that does not return a LiveState object', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest16Query {
      live_resolver_with_bad_return_value
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

  expect(() => {
    environment.lookup(operation.fragment);
  }).toThrow(
    'Expected the @live Relay Resolver backing the field "live_resolver_with_bad_return_value" to return a value that implements LiveState. Did you mean to remove the @live annotation on this resolver?',
  );
});

test('Errors when reading a non-@live resolver that returns a LiveState object', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest17Query {
      non_live_resolver_with_live_return_value
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

  expect(() => {
    environment.lookup(operation.fragment);
  }).toThrow(
    'Unexpected LiveState value returned from the non-@live Relay Resolver backing the field "non_live_resolver_with_live_return_value". Did you intend to add @live to this resolver?',
  );
});

test('Errors when reading a @live resolver that does not return a LiveState object and throws instead.', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest18Query {
      live_resolver_throws
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store: new LiveResolverStore(source, {
      gcReleaseBufferSize: 0,
    }),
  });

  const data = environment.lookup(operation.fragment);
  expect(data.relayResolverErrors).toEqual([
    {
      field: {
        owner: 'LiveResolversTest18Query',
        path: 'live_resolver_throws',
      },
      error: new Error('What?'),
    },
  ]);
});

test('Errors when reading a @live resolver that does not return a LiveState object and returns `undefined`.', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const FooQuery = graphql`
    query LiveResolversTest19Query {
      live_resolver_return_undefined
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store: new LiveResolverStore(source, {
      gcReleaseBufferSize: 0,
    }),
  });

  expect(() => {
    environment.lookup(operation.fragment);
  }).toThrow(
    'Expected the @live Relay Resolver backing the field "live_resolver_return_undefined" to return a value that implements LiveState interface. The result for this field is `undefined`, we also did not detect any errors, or missing data during resolver execution. Did you mean to remove the @live annotation on this resolver, or was there unexpected early return in the function?',
  );
});

test('provided variables and resolvers', () => {
  const FooQuery = graphql`
    query LiveResolversTestWithProvidedVariablesQuery {
      hello_world_with_provided_variable
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store: new LiveResolverStore(RelayRecordSource.create(), {
      gcReleaseBufferSize: 0,
    }),
  });

  const snapshot = environment.lookup(operation.fragment);
  expect(snapshot.relayResolverErrors).toEqual([]);
  expect(snapshot.data).toEqual({
    hello_world_with_provided_variable: 'Hello, Hello, World!!',
  });
});
