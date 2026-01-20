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

import type {Snapshot} from '../RelayStoreTypes';

const {
  constant_dependent: UserConstantDependentResolver,
} = require('./resolvers/UserConstantDependentResolver');
const {
  requiredThrowNameCalls,
} = require('./resolvers/UserRequiredThrowNameResolver');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  LiveResolverCache,
} = require('relay-runtime/store/live-resolvers/LiveResolverCache');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const RelayModernRecord = require('relay-runtime/store/RelayModernRecord');
const RelayStore = require('relay-runtime/store/RelayModernStore');
const {read} = require('relay-runtime/store/RelayReader');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  RELAY_READ_TIME_RESOLVER_KEY_PREFIX,
  RELAY_RESOLVER_INVALIDATION_KEY,
} = require('relay-runtime/store/RelayStoreUtils');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

afterEach(() => {
  // The call count of the resolver used in this test
  UserConstantDependentResolver._relayResolverTestCallCount = undefined;
});

it('returns the result of the resolver function', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const FooQuery = graphql`
    query RelayReaderResolverTest1Query {
      me {
        greeting
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});

  const {data, seenRecords} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = data;
  expect(me.greeting).toEqual('Hello, Alice!'); // Resolver result
  expect(me.name).toEqual(undefined); // Fields needed by resolver's fragment don't end up in the result

  expect(Array.from(seenRecords).sort()).toEqual([
    '1',
    `client:1:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}greeting`,
    'client:root',
  ]);
});

it('are passed field arguments', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const FooQuery = graphql`
    query RelayReaderResolverTestCustomGreetingDynamicQuery(
      $salutation: String!
    ) {
      me {
        dynamic_greeting: custom_greeting(salutation: $salutation)
        greetz: custom_greeting(salutation: "Greetz")
        willkommen: custom_greeting(salutation: "Willkommen")
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {
    salutation: 'Dynamic Greeting',
  });

  const {data} = read(source, operation.fragment, null, resolverCache);

  // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = data;
  expect(me.dynamic_greeting).toEqual('Dynamic Greeting, Alice!');
  expect(me.greetz).toEqual('Greetz, Alice!');
  expect(me.willkommen).toEqual('Willkommen, Alice!');

  // If variables change and we reread, we should observe the new value.
  const operationWithNewVariables = createOperationDescriptor(FooQuery, {
    salutation: 'New Dynamic Greeting',
  });
  const {data: dataWithNewVariables} = read(
    source,
    operationWithNewVariables.fragment,
    null,
    resolverCache,
  );

  // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me: meWithNewVariables}: any = dataWithNewVariables;
  expect(meWithNewVariables.dynamic_greeting).toEqual(
    'New Dynamic Greeting, Alice!',
  );
});

describe('Relay resolver - Field Error Handling', () => {
  it('propagates errors from the resolver up to the reader', () => {
    const source = RelayRecordSource.create({
      '1': {
        __errors: {
          lastName: [
            {
              message: 'There was an error!',
              path: ['me', 'lastName'],
            },
          ],
        },
        __id: '1',
        __typename: 'User',
        id: '1',
        lastName: null,
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });

    const FooQuery = graphql`
      query RelayReaderResolverTestFieldErrorQuery {
        me {
          lastName
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {});
    const store = new RelayStore(source, {gcReleaseBufferSize: 0});
    const {fieldErrors} = store.lookup(operation.fragment);
    expect(fieldErrors).toEqual([
      {
        error: {message: 'There was an error!', path: ['me', 'lastName']},
        fieldPath: 'me.lastName',
        handled: false,
        kind: 'relay_field_payload.error',
        owner: 'RelayReaderResolverTestFieldErrorQuery',
        shouldThrow: false,
      },
    ]);
  });
});

it('propagates @required errors from the resolver up to the reader', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: null, // The missing field
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const FooQuery = graphql`
    query RelayReaderResolverTestRequiredQuery {
      me {
        required_name
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const {fieldErrors} = store.lookup(operation.fragment);
  expect(fieldErrors).toEqual([
    {
      fieldPath: 'name',
      kind: 'missing_required_field.log',
      owner: 'UserRequiredNameResolver',
    },
    {
      error: expect.anything(),
      fieldPath: 'me.required_name',
      handled: false,
      kind: 'relay_resolver.error',
      owner: 'RelayReaderResolverTestRequiredQuery',
      shouldThrow: false,
    },
  ]);

  // Lookup a second time to ensure that we still report the missing fields when
  // reading from the cache.
  const {fieldErrors: missingRequiredFieldsTakeTwo} = store.lookup(
    operation.fragment,
  );

  expect(missingRequiredFieldsTakeTwo).toEqual([
    {
      fieldPath: 'name',
      kind: 'missing_required_field.log',
      owner: 'UserRequiredNameResolver',
    },
    {
      error: expect.anything(),
      fieldPath: 'me.required_name',
      handled: false,
      kind: 'relay_resolver.error',
      owner: 'RelayReaderResolverTestRequiredQuery',
      shouldThrow: false,
    },
  ]);
});

it('propagates missing data errors from the resolver up to the reader', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: undefined, // The missing data
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const FooQuery = graphql`
    query RelayReaderResolverTestMissingDataQuery {
      me {
        greeting # Transiviely reads name
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const {isMissingData} = store.lookup(operation.fragment);
  expect(isMissingData).toBe(true);

  // Lookup a second time to ensure that we still report the missing fields when
  // reading from the cache.
  const {isMissingData: isStillMissingData} = store.lookup(operation.fragment);
  expect(isStillMissingData).toBe(true);
});

it('merges @required logs from resolver field with parent', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      lastName: null, // Another missing field
      name: null, // The missing field
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const FooQuery = graphql`
    query RelayReaderResolverTestRequiredWithParentQuery {
      me {
        required_name
        lastName @required(action: LOG)
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const {fieldErrors} = store.lookup(operation.fragment);
  expect(fieldErrors).toEqual([
    {
      fieldPath: 'name',
      kind: 'missing_required_field.log',
      owner: 'UserRequiredNameResolver',
    },
    {
      error: expect.anything(),
      fieldPath: 'me.required_name',
      handled: false,
      kind: 'relay_resolver.error',
      owner: 'RelayReaderResolverTestRequiredWithParentQuery',
      shouldThrow: false,
    },
    {
      fieldPath: 'me.lastName',
      kind: 'missing_required_field.log',
      owner: 'RelayReaderResolverTestRequiredWithParentQuery',
    },
  ]);

  // Lookup a second time to ensure that we still report the missing fields when
  // reading from the cache.
  const {fieldErrors: missingRequiredFieldsTakeTwo} = store.lookup(
    operation.fragment,
  );

  expect(missingRequiredFieldsTakeTwo).toEqual([
    {
      fieldPath: 'name',
      kind: 'missing_required_field.log',
      owner: 'UserRequiredNameResolver',
    },
    {
      error: expect.anything(),
      fieldPath: 'me.required_name',
      handled: false,
      kind: 'relay_resolver.error',
      owner: 'RelayReaderResolverTestRequiredWithParentQuery',
      shouldThrow: false,
    },
    {
      fieldPath: 'me.lastName',
      kind: 'missing_required_field.log',
      owner: 'RelayReaderResolverTestRequiredWithParentQuery',
    },
  ]);
});

it('propagates @required(action: THROW) errors from the resolver up to the reader and avoid calling resolver code', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: null, // The missing field
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const FooQuery = graphql`
    query RelayReaderResolverTestRequiredThrowQuery {
      me {
        required_throw_name
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});
  const store = new RelayStore(source, {gcReleaseBufferSize: 0});

  const beforeCallCount = requiredThrowNameCalls.count;
  const {fieldErrors, data} = store.lookup(operation.fragment);
  expect(data).toEqual({me: {required_throw_name: null}});
  expect(requiredThrowNameCalls.count).toBe(beforeCallCount);
  expect(fieldErrors).toEqual([
    {
      fieldPath: 'name',
      handled: true,
      kind: 'missing_required_field.throw',
      owner: 'UserRequiredThrowNameResolver',
    },
  ]);

  // Lookup a second time to ensure that we still report the missing fields when
  // reading from the cache.
  const {fieldErrors: missingRequiredFieldsTakeTwo, data: dataTakeTwo} =
    store.lookup(operation.fragment);

  expect(dataTakeTwo).toEqual({me: {required_throw_name: null}});
  expect(missingRequiredFieldsTakeTwo).toEqual([
    {
      fieldPath: 'name',
      handled: true,
      kind: 'missing_required_field.throw',
      owner: 'UserRequiredThrowNameResolver',
    },
  ]);
});

it('works when the field is aliased', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const FooQuery = graphql`
    query RelayReaderResolverTest11Query {
      me {
        the_alias: greeting
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});

  const {data} = read(source, operation.fragment, null, resolverCache);

  // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = data;
  expect(me.the_alias).toEqual('Hello, Alice!'); // Resolver result
  expect(me.greeting).toEqual(undefined); // Unaliased name
});

it('re-computes when an upstream is updated', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest3Query {
      me {
        greeting
      }
    }
  `;

  const cb = jest.fn<[Snapshot], void>();
  const operation = createOperationDescriptor(FooQuery, {});
  const snapshot = store.lookup(operation.fragment);
  const subscription = store.subscribe(snapshot, cb);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = snapshot.data;
  expect(me.greeting).toEqual('Hello, Alice!');
  environment.commitUpdate(theStore => {
    const alice = nullthrows(theStore.get('1'));
    alice.setValue('Alicia', 'name');
  });
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        me: expect.objectContaining({
          greeting: 'Hello, Alicia!',
        }),
      }),
    }),
  );
  subscription.dispose();
});

it('does not recompute if the upstream has the same value as before', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest2Query {
      me {
        constant_dependent
      }
    }
  `;

  const resolverInternals: {_relayResolverTestCallCount: number} =
    // $FlowFixMe[unclear-type]
    UserConstantDependentResolver as any;

  expect(resolverInternals._relayResolverTestCallCount).toBe(undefined);
  const cb = jest.fn<[Snapshot], void>();
  const operation = createOperationDescriptor(FooQuery, {});
  const snapshot = store.lookup(operation.fragment);
  const subscription = store.subscribe(snapshot, cb);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = snapshot.data;
  expect(me.constant_dependent).toEqual(1);
  expect(resolverInternals._relayResolverTestCallCount).toBe(1);
  environment.commitUpdate(theStore => {
    const alice = nullthrows(theStore.get('1'));
    alice.setValue('Alicia', 'name');
  });
  expect(cb).toHaveBeenCalledTimes(0);
  subscription.dispose();
  const newSnapshot = store.lookup(operation.fragment);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me: newMe}: any = newSnapshot.data;
  expect(newMe.constant_dependent).toEqual(1);
  expect(resolverInternals._relayResolverTestCallCount).toBe(1);
});

it.each([true, false])(
  'marks the resolver cache as clean if the upstream has not changed with RelayFeatureFlags.MARK_RESOLVER_VALUES_AS_CLEAN_AFTER_FRAGMENT_REREAD=%s',
  markClean => {
    RelayFeatureFlags.MARK_RESOLVER_VALUES_AS_CLEAN_AFTER_FRAGMENT_REREAD =
      markClean;
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });

    const store = new RelayStore(source, {gcReleaseBufferSize: 0});
    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });

    const FooQuery = graphql`
      query RelayReaderResolverTestMarkCleanQuery {
        me {
          constant_dependent
        }
      }
    `;

    const cb = jest.fn<[Snapshot], void>();
    const operation = createOperationDescriptor(FooQuery, {});
    const snapshot = store.lookup(operation.fragment);
    const subscription = store.subscribe(snapshot, cb);
    // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = snapshot.data;
    expect(me.constant_dependent).toEqual(1);
    environment.commitUpdate(theStore => {
      const alice = nullthrows(theStore.get('1'));
      alice.setValue('Alicia', 'name');
    });
    subscription.dispose();

    // Rereading the resolver's fragment, only to find that no fields that we read have changed,
    // should clear the RELAY_RESOLVER_INVALIDATION_KEY.
    const resolverCacheRecord = environment
      .getStore()
      .getSource()
      .get(`client:1:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}constant_dependent`);
    invariant(resolverCacheRecord != null, 'Expected a resolver cache record');

    const isMaybeInvalid = RelayModernRecord.getValue(
      resolverCacheRecord,
      RELAY_RESOLVER_INVALIDATION_KEY,
    );

    if (markClean) {
      expect(isMaybeInvalid).toBe(false);
    } else {
      // Without the feature flag enabled, T185969900 still reproduces.
      expect(isMaybeInvalid).toBe(true);
    }
  },
);

it('handles optimistic updates (applied after subscribing)', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest9Query {
      me {
        greeting
      }
    }
  `;

  const cb = jest.fn<[Snapshot], void>();
  const operation = createOperationDescriptor(FooQuery, {});
  const snapshot = store.lookup(operation.fragment);
  const subscription = store.subscribe(snapshot, cb);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = snapshot.data;
  expect(me.greeting).toEqual('Hello, Alice!');

  const checkUpdate = (
    expectedCallbackCount: number,
    expectedGreeting: string,
  ) => {
    expect(cb).toHaveBeenCalledTimes(expectedCallbackCount);
    expect(cb).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          me: expect.objectContaining({
            greeting: expectedGreeting,
          }),
        }),
      }),
    );
    const newSnapshot = store.lookup(operation.fragment);
    // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me: newMe}: any = newSnapshot.data;
    expect(newMe.greeting).toEqual(expectedGreeting);
  };

  const update = environment.applyUpdate({
    storeUpdater: theStore => {
      const alice = nullthrows(theStore.get('1'));
      alice.setValue('Alicia', 'name');
    },
  });
  checkUpdate(1, 'Hello, Alicia!');
  update.dispose();
  checkUpdate(2, 'Hello, Alice!');
  subscription.dispose();
});

it('handles optimistic updates (subscribed after applying)', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest10Query {
      me {
        greeting
      }
    }
  `;

  const update = environment.applyUpdate({
    storeUpdater: theStore => {
      const alice = nullthrows(theStore.get('1'));
      alice.setValue('Alicia', 'name');
    },
  });

  const cb = jest.fn<[Snapshot], void>();
  const operation = createOperationDescriptor(FooQuery, {});
  const snapshot = store.lookup(operation.fragment);
  const subscription = store.subscribe(snapshot, cb);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = snapshot.data;
  expect(me.greeting).toEqual('Hello, Alicia!');

  const checkUpdate = (
    expectedCallbackCount: number,
    expectedGreeting: string,
  ) => {
    expect(cb).toHaveBeenCalledTimes(expectedCallbackCount);
    expect(cb).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          me: expect.objectContaining({
            greeting: expectedGreeting,
          }),
        }),
      }),
    );
    const newSnapshot = store.lookup(operation.fragment);
    // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me: newMe}: any = newSnapshot.data;
    expect(newMe.greeting).toEqual(expectedGreeting);
  };

  update.dispose();
  checkUpdate(1, 'Hello, Alice!');
  subscription.dispose();
});

it('re-computes when something other than its own record is updated', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      'friends(first:1)': {__ref: 'client:1'},
      id: '1',
      name: 'Alice',
    },
    '2': {
      __id: '2',
      __typename: 'User',
      id: '2',
      name: 'Bob',
    },
    'client:1': {
      __id: 'client:1',
      __typename: 'FriendsConnection',
      edges: {
        __refs: ['client:2'],
      },
    },
    'client:2': {
      __id: 'client:2',
      __typename: 'FriendsConnectionEdge',
      cursor: 'cursor:2',
      node: {__ref: '2'},
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest4Query {
      me {
        best_friend_greeting
      }
    }
  `;

  const cb = jest.fn<[Snapshot], void>();
  const operation = createOperationDescriptor(FooQuery, {});
  const snapshot = store.lookup(operation.fragment);
  const subscription = store.subscribe(snapshot, cb);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = snapshot.data;
  expect(me.best_friend_greeting).toEqual('Hello, Bob!');
  environment.commitUpdate(theStore => {
    const bob = nullthrows(theStore.get('2'));
    bob.setValue('Bilbo', 'name');
  });
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        me: expect.objectContaining({
          best_friend_greeting: 'Hello, Bilbo!',
        }),
      }),
    }),
  );
  const newSnapshot = store.lookup(operation.fragment);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me: newMe}: any = newSnapshot.data;
  expect(newMe.best_friend_greeting).toEqual('Hello, Bilbo!');
  subscription.dispose();
});

it('re-computes when a resolver uses another resolver', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest5Query {
      me {
        shouted_greeting
      }
    }
  `;

  const cb = jest.fn<[Snapshot], void>();
  const operation = createOperationDescriptor(FooQuery, {});
  const snapshot = store.lookup(operation.fragment);
  const subscription = store.subscribe(snapshot, cb);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = snapshot.data;
  expect(me.shouted_greeting).toEqual('HELLO, ALICE!');
  environment.commitUpdate(theStore => {
    const alice = nullthrows(theStore.get('1'));
    alice.setValue('Alicia', 'name');
  });
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        me: expect.objectContaining({
          shouted_greeting: 'HELLO, ALICIA!',
        }),
      }),
    }),
  );
  subscription.dispose();
});

it('re-computes when a resolver uses another resolver of another record', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      'friends(first:1)': {__ref: 'client:1'},
      id: '1',
      name: 'Alice',
    },
    '2': {
      __id: '2',
      __typename: 'User',
      id: '2',
      name: 'Bob',
    },
    'client:1': {
      __id: 'client:1',
      __typename: 'FriendsConnection',
      edges: {
        __refs: ['client:2'],
      },
    },
    'client:2': {
      __id: 'client:2',
      __typename: 'FriendsConnectionEdge',
      cursor: 'cursor:2',
      node: {__ref: '2'},
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const store = new RelayStore(source, {gcReleaseBufferSize: 0});
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest6Query {
      me {
        best_friend_shouted_greeting
      }
    }
  `;

  const cb = jest.fn<[Snapshot], void>();
  const operation = createOperationDescriptor(FooQuery, {});
  const snapshot = store.lookup(operation.fragment);
  const subscription = store.subscribe(snapshot, cb);
  // $FlowFixMe[unclear-type] - lookup() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = snapshot.data;
  expect(me.best_friend_shouted_greeting).toEqual('HELLO, BOB!');
  environment.commitUpdate(updateStore => {
    const bob = nullthrows(updateStore.get('2'));
    bob.setValue('Bilbo', 'name');
  });
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        me: expect.objectContaining({
          best_friend_shouted_greeting: 'HELLO, BILBO!',
        }),
      }),
    }),
  );
  subscription.dispose();
});

it('Bubbles null when @required', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: null,
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest8Query {
      me {
        name_passthrough @required(action: NONE)
      }
    }
  `;

  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const operation = createOperationDescriptor(FooQuery, {id: '1'});

  const {data} = read(source, operation.fragment, null, resolverCache);

  // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  const {me}: any = data;
  expect(me).toBe(null); // Resolver result
});

it('Returns null and includes errors when the resolver throws', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest12Query {
      me {
        always_throws
      }
    }
  `;

  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const operation = createOperationDescriptor(FooQuery, {id: '1'});

  const {data, fieldErrors} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  expect(data).toEqual({me: {always_throws: null}}); // Resolver result
  expect(fieldErrors).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: I always throw. What did you expect?],
          "fieldPath": "me.always_throws",
          "handled": false,
          "kind": "relay_resolver.error",
          "owner": "RelayReaderResolverTest12Query",
          "shouldThrow": false,
          "uiContext": undefined,
        },
      ]
    `);

  // Subsequent read should also read the same error/path
  const {data: data2, fieldErrors: relayResolverErrors2} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  expect(data2).toEqual({me: {always_throws: null}}); // Resolver result
  expect(relayResolverErrors2).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: I always throw. What did you expect?],
          "fieldPath": "me.always_throws",
          "handled": false,
          "kind": "relay_resolver.error",
          "owner": "RelayReaderResolverTest12Query",
          "shouldThrow": false,
          "uiContext": undefined,
        },
      ]
    `);
});

it('Returns null and includes errors when a transitive resolver throws', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest13Query {
      me {
        always_throws_transitively
      }
    }
  `;
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const operation = createOperationDescriptor(FooQuery, {id: '1'});

  const {data, fieldErrors} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  expect(data).toEqual({me: {always_throws_transitively: null}}); // Resolver result
  expect(fieldErrors).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: I always throw. What did you expect?],
          "fieldPath": "always_throws",
          "handled": true,
          "kind": "relay_resolver.error",
          "owner": "UserAlwaysThrowsTransitivelyResolver",
          "shouldThrow": false,
          "uiContext": undefined,
        },
      ]
    `);

  // Subsequent read should also read the same error/path
  const {data: data2, fieldErrors: relayResolverErrors2} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  expect(data2).toEqual({me: {always_throws_transitively: null}}); // Resolver result
  expect(relayResolverErrors2).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: I always throw. What did you expect?],
          "fieldPath": "always_throws",
          "handled": true,
          "kind": "relay_resolver.error",
          "owner": "UserAlwaysThrowsTransitivelyResolver",
          "shouldThrow": false,
          "uiContext": undefined,
        },
      ]
    `);
});

it('Catches errors thrown before calling readFragment', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });

  const FooQuery = graphql`
    query RelayReaderResolverTest14Query {
      # A special resolver that triggers this edge case.
      throw_before_read
    }
  `;

  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const operation = createOperationDescriptor(FooQuery, {});

  const {data, fieldErrors} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  expect(data).toEqual({throw_before_read: null}); // Resolver result
  expect(fieldErrors).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: Purposefully throwing before reading to exercise an edge case.],
          "fieldPath": "throw_before_read",
          "handled": false,
          "kind": "relay_resolver.error",
          "owner": "RelayReaderResolverTest14Query",
          "shouldThrow": false,
          "uiContext": undefined,
        },
      ]
    `);
});

it('can return `undefined` without reporting missing data', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const FooQuery = graphql`
    query RelayReaderResolverTest15Query {
      undefined_field
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});

  const {data, isMissingData} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  expect(isMissingData).toBe(false);

  // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  const {undefined_field}: any = data;
  expect(undefined_field).toBe(undefined); // Resolver result
});

it('return value for a field with arguments', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      'profile_picture(scale:1.5)': {
        __ref: '1:profile_picture(scale:1.5)',
      },
    },
    '1:profile_picture(scale:1.5)': {
      __id: '1:profile_picture(scale:1.5)',
      __typename: 'Image',
      uri: 'http://my-url-1.5',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const FooQuery = graphql`
    query RelayReaderResolverTest16Query($scale: Float!) {
      me {
        user_profile_picture_uri_with_scale(scale: $scale)
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {
    scale: 1.5,
  });

  const {data, isMissingData} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );
  expect(isMissingData).toBe(false);

  const {
    me: {user_profile_picture_uri_with_scale}, // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  }: any = data;
  expect(user_profile_picture_uri_with_scale).toBe('http://my-url-1.5'); // Resolver result
});

it('return value for a field with arguments and default value', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      'profile_picture(scale:1.5)': {
        __ref: '1:profile_picture(scale:1.5)',
      },
    },
    '1:profile_picture(scale:1.5)': {
      __id: '1:profile_picture(scale:1.5)',
      __typename: 'Image',
      uri: 'http://my-url-1.5',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const FooQuery = graphql`
    query RelayReaderResolverTest17Query {
      me {
        user_profile_picture_uri_with_scale_and_default_value
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});

  const {data, isMissingData} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );
  expect(isMissingData).toBe(false);

  const {
    me: {user_profile_picture_uri_with_scale_and_default_value}, // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  }: any = data;
  expect(user_profile_picture_uri_with_scale_and_default_value).toBe(
    'http://my-url-1.5',
  ); // Resolver result
});

it('return value for a field with literal argument', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      'profile_picture(scale:2)': {__ref: '1:profile_picture(scale:2)'},
    },
    '1:profile_picture(scale:2)': {
      __id: '1:profile_picture(scale:2)',
      __typename: 'Image',
      uri: 'http://my-url-2',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const FooQuery = graphql`
    query RelayReaderResolverTest18Query {
      me {
        profile_picture2: user_profile_picture_uri_with_scale_and_default_value(
          scale: 2
        )
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {});

  const {data, isMissingData} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  expect(isMissingData).toBe(false);

  const {
    me: {profile_picture2}, // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  }: any = data;
  expect(profile_picture2).toBe('http://my-url-2'); // Resolver result
});

it('return value for a field with literal argument and variable', () => {
  const source = RelayRecordSource.create({
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      'profile_picture(scale:1.5)': {
        __ref: '1:profile_picture(scale:1.5)',
      },
      'profile_picture(scale:2)': {__ref: '1:profile_picture(scale:2)'},
    },
    '1:profile_picture(scale:1.5)': {
      __id: '1:profile_picture(scale:1.5)',
      __typename: 'Image',
      uri: 'http://my-url-1.5',
    },
    '1:profile_picture(scale:2)': {
      __id: '1:profile_picture(scale:2)',
      __typename: 'Image',
      uri: 'http://my-url-2',
    },
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      me: {__ref: '1'},
    },
  });
  const store = new RelayStore(source);
  const resolverCache = new LiveResolverCache(() => source, store);

  const FooQuery = graphql`
    query RelayReaderResolverTest19Query($scale: Float) {
      me {
        profile_picture2: user_profile_picture_uri_with_scale_and_default_value(
          scale: 2
        )
        big_profile_picture: profile_picture(scale: $scale) {
          uri
        }
      }
    }
  `;

  const operation = createOperationDescriptor(FooQuery, {
    scale: 1.5,
  });

  const {data, isMissingData} = read(
    source,
    operation.fragment,
    null,
    resolverCache,
  );

  expect(isMissingData).toBe(false);

  const {
    me: {profile_picture2, big_profile_picture}, // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
  }: any = data;
  expect(profile_picture2).toBe('http://my-url-2'); // Resolver result
  expect(big_profile_picture).toEqual({
    uri: 'http://my-url-1.5',
  });
});

describe('Test arguments and their changes', () => {
  it('should render resolver field and handle change of arguments', () => {
    const Query = graphql`
      query RelayReaderResolverTest20Query($scale: Float!) {
        me {
          profile_picture: user_profile_picture_uri_with_scale(scale: $scale)
        }
      }
    `;
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        'profile_picture(scale:1.5)': {
          __ref: '1:profile_picture(scale:1.5)',
        },
        'profile_picture(scale:2)': {__ref: '1:profile_picture(scale:2)'},
      },
      '1:profile_picture(scale:1.5)': {
        __id: '1:profile_picture(scale:1.5)',
        __typename: 'Image',
        uri: 'http://my-url-1.5',
      },
      '1:profile_picture(scale:2)': {
        __id: '1:profile_picture(scale:2)',
        __typename: 'Image',
        uri: 'http://my-url-2',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);

    let operation = createOperationDescriptor(Query, {scale: 1.5});
    let readResult = read(source, operation.fragment, null, resolverCache);
    expect(readResult.isMissingData).toBe(false);
    expect(readResult.data).toEqual({
      me: {
        profile_picture: 'http://my-url-1.5',
      },
    });

    operation = createOperationDescriptor(Query, {scale: 2});
    readResult = read(source, operation.fragment, null, resolverCache);
    expect(readResult.isMissingData).toBe(false);
    expect(readResult.data).toEqual({
      me: {
        profile_picture: 'http://my-url-2',
      },
    });
  });

  it('should render resolver field and handle change of arguments and missing data', () => {
    const Query = graphql`
      query RelayReaderResolverTest21Query($scale: Float!) {
        me {
          profile_picture: user_profile_picture_uri_with_scale(scale: $scale)
        }
      }
    `;
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        'profile_picture(scale:1.5)': {
          __ref: '1:profile_picture(scale:1.5)',
        },
        'profile_picture(scale:2)': {__ref: '1:profile_picture(scale:2)'},
      },
      '1:profile_picture(scale:1.5)': {
        __id: '1:profile_picture(scale:1.5)',
        __typename: 'Image',
        uri: 'http://my-url-1.5',
      },
      '1:profile_picture(scale:2)': {
        __id: '1:profile_picture(scale:2)',
        __typename: 'Image',
        // uri: 'http://my-url-2', this field now is missing
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);

    let operation = createOperationDescriptor(Query, {scale: 1.5});
    let readResult = read(source, operation.fragment, null, resolverCache);
    expect(readResult.isMissingData).toBe(false);
    expect(readResult.data).toEqual({
      me: {
        profile_picture: 'http://my-url-1.5',
      },
    });

    operation = createOperationDescriptor(Query, {scale: 2});
    readResult = read(source, operation.fragment, null, resolverCache);
    expect(readResult.isMissingData).toBe(true);
    expect(readResult.data).toEqual({
      me: {
        profile_picture: null,
      },
    });
  });

  it('should render resolver field and handle change of fragment and runtime arguments', () => {
    const Query = graphql`
      query RelayReaderResolverTest22Query($scale: Float!, $name: String) {
        me {
          profile_picture: user_profile_picture_uri_with_scale_and_additional_argument(
            scale: $scale
            name: $name
          )
        }
      }
    `;
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        'profile_picture(scale:1.5)': {
          __ref: '1:profile_picture(scale:1.5)',
        },
        'profile_picture(scale:2)': {__ref: '1:profile_picture(scale:2)'},
      },
      '1:profile_picture(scale:1.5)': {
        __id: '1:profile_picture(scale:1.5)',
        __typename: 'Image',
        uri: 'http://my-url-1.5',
      },
      '1:profile_picture(scale:2)': {
        __id: '1:profile_picture(scale:2)',
        __typename: 'Image',
        uri: 'http://my-url-2',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });

    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);

    let operation = createOperationDescriptor(Query, {
      name: 'Alice',
      scale: 1.5,
    });
    let readResult = read(source, operation.fragment, null, resolverCache);
    expect(readResult.isMissingData).toBe(false);
    expect(readResult.data).toEqual({
      me: {
        profile_picture: 'Alice: http://my-url-1.5',
      },
    });
    // Changing runtime (field) arg
    operation = createOperationDescriptor(Query, {
      name: 'Bob',
      scale: 1.5,
    });
    readResult = read(source, operation.fragment, null, resolverCache);
    expect(readResult.isMissingData).toBe(false);
    expect(readResult.data).toEqual({
      me: {
        profile_picture: 'Bob: http://my-url-1.5',
      },
    });
    // Changing fragment arg
    operation = createOperationDescriptor(Query, {name: 'Bob', scale: 2});
    readResult = read(source, operation.fragment, null, resolverCache);
    expect(readResult.isMissingData).toBe(false);
    expect(readResult.data).toEqual({
      me: {
        profile_picture: 'Bob: http://my-url-2',
      },
    });

    // Changing both arguments
    operation = createOperationDescriptor(Query, {
      name: 'Clair',
      scale: 1.5,
    });
    readResult = read(source, operation.fragment, null, resolverCache);
    expect(readResult.isMissingData).toBe(false);
    expect(readResult.data).toEqual({
      me: {
        profile_picture: 'Clair: http://my-url-1.5',
      },
    });
  });
});

it('can create a client edge query in our test enviornment that has valid import', () => {
  // This is not really a runtime test, but more a test to confirm that this query generates
  // an artifact with valid imports in our non-Haste test environment.
  const clientEdgeRuntimeArtifact = graphql`
    query RelayReaderResolverTest24Query {
      me {
        client_edge @waterfall {
          __typename
        }
      }
    }
  `;
  expect(clientEdgeRuntimeArtifact.operation.name).toBe(
    'RelayReaderResolverTest24Query',
  );
});
