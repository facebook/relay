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
const nullthrows = require('nullthrows');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const RelayModernStore = require('relay-runtime/store/RelayModernStore');
const {read} = require('relay-runtime/store/RelayReader');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {RecordResolverCache} = require('relay-runtime/store/ResolverCache');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
});

describe('Relay Resolver', () => {
  it('returns the result of the resolver function', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

    const FooQuery = graphql`
      query RelayReaderResolverTest1Query {
        me {
          greeting
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {});

    const {data, seenRecords} = read(source, operation.fragment, resolverCache);

    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me.greeting).toEqual('Hello, Alice!'); // Resolver result
    expect(me.name).toEqual(undefined); // Fields needed by resolver's fragment don't end up in the result

    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      'client:1:greeting',
      'client:root',
    ]);
  });

  it('are passed field arguments', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

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

    const {data} = read(source, operation.fragment, resolverCache);

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
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = true;
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
          __errors: {
            lastName: [
              {
                message: 'There was an error!',
                path: ['me', 'lastName'],
              },
            ],
          },
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
      const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
      const {errorResponseFields} = store.lookup(operation.fragment);
      expect(errorResponseFields).toEqual([
        {
          error: {message: 'There was an error!', path: ['me', 'lastName']},
          owner: 'RelayReaderResolverTestFieldErrorQuery',
          path: 'me.lastName',
        },
      ]);
    });

    it("doesn't propagate errors from the resolver up to the reader when flag is disabled", () => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = false;
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
          __errors: {
            lastName: [
              {
                message: 'There was an error!',
                path: ['me', 'lastName'],
              },
            ],
          },
        },
      });

      const FooQuery = graphql`
        query RelayReaderResolverTestFieldError1Query {
          me {
            lastName
          }
        }
      `;

      const operation = createOperationDescriptor(FooQuery, {});
      const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
      const {errorResponseFields} = store.lookup(operation.fragment);
      expect(errorResponseFields).toEqual(null);
    });
  });

  it('propagates @required errors from the resolver up to the reader', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: null, // The missing field
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
    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
    const {missingRequiredFields} = store.lookup(operation.fragment);
    expect(missingRequiredFields).toEqual({
      action: 'LOG',
      fields: [{owner: 'UserRequiredNameResolver', path: 'name'}],
    });

    // Lookup a second time to ensure that we still report the missing fields when
    // reading from the cache.
    const {missingRequiredFields: missingRequiredFieldsTakeTwo} = store.lookup(
      operation.fragment,
    );

    expect(missingRequiredFieldsTakeTwo).toEqual({
      action: 'LOG',
      fields: [{owner: 'UserRequiredNameResolver', path: 'name'}],
    });
  });

  it('propagates missing data errors from the resolver up to the reader', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: undefined, // The missing data
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
    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
    const {isMissingData} = store.lookup(operation.fragment);
    expect(isMissingData).toBe(true);

    // Lookup a second time to ensure that we still report the missing fields when
    // reading from the cache.
    const {isMissingData: isStillMissingData} = store.lookup(
      operation.fragment,
    );
    expect(isStillMissingData).toBe(true);
  });

  it('merges @required logs from resolver field with parent', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: null, // The missing field
        lastName: null, // Another missing field
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
    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
    const {missingRequiredFields} = store.lookup(operation.fragment);
    expect(missingRequiredFields).toEqual({
      action: 'LOG',
      fields: [
        {owner: 'UserRequiredNameResolver', path: 'name'},
        {
          owner: 'RelayReaderResolverTestRequiredWithParentQuery',
          path: 'me.lastName',
        },
      ],
    });

    // Lookup a second time to ensure that we still report the missing fields when
    // reading from the cache.
    const {missingRequiredFields: missingRequiredFieldsTakeTwo} = store.lookup(
      operation.fragment,
    );

    expect(missingRequiredFieldsTakeTwo).toEqual({
      action: 'LOG',
      fields: [
        {owner: 'UserRequiredNameResolver', path: 'name'},
        {
          owner: 'RelayReaderResolverTestRequiredWithParentQuery',
          path: 'me.lastName',
        },
      ],
    });
  });

  it('works when the field is aliased', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

    const FooQuery = graphql`
      query RelayReaderResolverTest11Query {
        me {
          the_alias: greeting
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {});

    const {data} = read(source, operation.fragment, resolverCache);

    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me.the_alias).toEqual('Hello, Alice!'); // Resolver result
    expect(me.greeting).toEqual(undefined); // Unaliased name
  });

  it('re-computes when an upstream is updated', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });

    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });

    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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
      // $FlowFixMe
      (UserConstantDependentResolver: any);

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

  it('handles optimistic updates (applied after subscribing)', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });

    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });

    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
        'friends(first:1)': {__ref: 'client:1'},
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
      '2': {
        __id: '2',
        id: '2',
        __typename: 'User',
        name: 'Bob',
      },
    });

    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });

    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
        'friends(first:1)': {__ref: 'client:1'},
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
      '2': {
        __id: '2',
        id: '2',
        __typename: 'User',
        name: 'Bob',
      },
    });

    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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

  it('errors if the ENABLE_RELAY_RESOLVERS feature flag is not enabled', () => {
    RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;

    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });

    const FooQuery = graphql`
      query RelayReaderResolverTest7Query {
        me {
          greeting
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {});

    expect(() => {
      read(source, operation.fragment);
    }).toThrowErrorMatchingInlineSnapshot(
      '"Relay Resolver fields are not yet supported."',
    );
  });

  it('Bubbles null when @required', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: null,
      },
    });

    const FooQuery = graphql`
      query RelayReaderResolverTest8Query {
        me {
          name_passthrough @required(action: NONE)
        }
      }
    `;

    const resolverCache = new RecordResolverCache(() => source);

    const operation = createOperationDescriptor(FooQuery, {id: '1'});

    const {data} = read(source, operation.fragment, resolverCache);

    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me).toBe(null); // Resolver result
  });

  it('Returns null and includes errors when the resolver throws', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
      },
    });

    const FooQuery = graphql`
      query RelayReaderResolverTest12Query {
        me {
          always_throws
        }
      }
    `;

    const resolverCache = new RecordResolverCache(() => source);

    const operation = createOperationDescriptor(FooQuery, {id: '1'});

    const {data, relayResolverErrors} = read(
      source,
      operation.fragment,
      resolverCache,
    );

    expect(data).toEqual({me: {always_throws: null}}); // Resolver result
    expect(relayResolverErrors).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: I always throw. What did you expect?],
          "field": Object {
            "owner": "RelayReaderResolverTest12Query",
            "path": "me.always_throws",
          },
        },
      ]
    `);

    // Subsequent read should also read the same error/path
    const {data: data2, relayResolverErrors: relayResolverErrors2} = read(
      source,
      operation.fragment,
      resolverCache,
    );

    expect(data2).toEqual({me: {always_throws: null}}); // Resolver result
    expect(relayResolverErrors2).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: I always throw. What did you expect?],
          "field": Object {
            "owner": "RelayReaderResolverTest12Query",
            "path": "me.always_throws",
          },
        },
      ]
    `);
  });

  it('Returns null and includes errors when a transitive resolver throws', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
      },
    });

    const FooQuery = graphql`
      query RelayReaderResolverTest13Query {
        me {
          always_throws_transitively
        }
      }
    `;

    const resolverCache = new RecordResolverCache(() => source);

    const operation = createOperationDescriptor(FooQuery, {id: '1'});

    const {data, relayResolverErrors} = read(
      source,
      operation.fragment,
      resolverCache,
    );

    expect(data).toEqual({me: {always_throws_transitively: null}}); // Resolver result
    expect(relayResolverErrors).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: I always throw. What did you expect?],
          "field": Object {
            "owner": "UserAlwaysThrowsTransitivelyResolver",
            "path": "always_throws",
          },
        },
      ]
    `);

    // Subsequent read should also read the same error/path
    const {data: data2, relayResolverErrors: relayResolverErrors2} = read(
      source,
      operation.fragment,
      resolverCache,
    );

    expect(data2).toEqual({me: {always_throws_transitively: null}}); // Resolver result
    expect(relayResolverErrors2).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: I always throw. What did you expect?],
          "field": Object {
            "owner": "UserAlwaysThrowsTransitivelyResolver",
            "path": "always_throws",
          },
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

    const resolverCache = new RecordResolverCache(() => source);

    const operation = createOperationDescriptor(FooQuery, {});

    const {data, relayResolverErrors} = read(
      source,
      operation.fragment,
      resolverCache,
    );

    expect(data).toEqual({throw_before_read: null}); // Resolver result
    expect(relayResolverErrors).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": [Error: Purposefully throwing before reading to exercise an edge case.],
          "field": Object {
            "owner": "RelayReaderResolverTest14Query",
            "path": "throw_before_read",
          },
        },
      ]
    `);
  });

  it('can return `undefined` without reporting missing data', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

    const FooQuery = graphql`
      query RelayReaderResolverTest15Query {
        undefined_field
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {});

    const {data, isMissingData} = read(
      source,
      operation.fragment,
      resolverCache,
    );

    expect(isMissingData).toBe(false);

    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {undefined_field}: any = data;
    expect(undefined_field).toBe(undefined); // Resolver result
  });

  it('return value for a field with arguments', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profile_picture(scale:1.5)': {__ref: '1:profile_picture(scale:1.5)'},
      },
      '1:profile_picture(scale:1.5)': {
        __id: '1:profile_picture(scale:1.5)',
        __typename: 'Image',
        uri: 'http://my-url-1.5',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

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
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profile_picture(scale:1.5)': {__ref: '1:profile_picture(scale:1.5)'},
      },
      '1:profile_picture(scale:1.5)': {
        __id: '1:profile_picture(scale:1.5)',
        __typename: 'Image',
        uri: 'http://my-url-1.5',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

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
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profile_picture(scale:2)': {__ref: '1:profile_picture(scale:2)'},
      },
      '1:profile_picture(scale:2)': {
        __id: '1:profile_picture(scale:2)',
        __typename: 'Image',
        uri: 'http://my-url-2',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

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
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profile_picture(scale:1.5)': {__ref: '1:profile_picture(scale:1.5)'},
        'profile_picture(scale:2)': {__ref: '1:profile_picture(scale:2)'},
      },
      '1:profile_picture(scale:2)': {
        __id: '1:profile_picture(scale:2)',
        __typename: 'Image',
        uri: 'http://my-url-2',
      },
      '1:profile_picture(scale:1.5)': {
        __id: '1:profile_picture(scale:1.5)',
        __typename: 'Image',
        uri: 'http://my-url-1.5',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

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
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'profile_picture(scale:1.5)': {__ref: '1:profile_picture(scale:1.5)'},
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
      });
      const resolverCache = new RecordResolverCache(() => source);

      let operation = createOperationDescriptor(Query, {scale: 1.5});
      let readResult = read(source, operation.fragment, resolverCache);
      expect(readResult.isMissingData).toBe(false);
      expect(readResult.data).toEqual({
        me: {
          profile_picture: 'http://my-url-1.5',
        },
      });

      operation = createOperationDescriptor(Query, {scale: 2});
      readResult = read(source, operation.fragment, resolverCache);
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
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'profile_picture(scale:1.5)': {__ref: '1:profile_picture(scale:1.5)'},
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
      });
      const resolverCache = new RecordResolverCache(() => source);

      let operation = createOperationDescriptor(Query, {scale: 1.5});
      let readResult = read(source, operation.fragment, resolverCache);
      expect(readResult.isMissingData).toBe(false);
      expect(readResult.data).toEqual({
        me: {
          profile_picture: 'http://my-url-1.5',
        },
      });

      operation = createOperationDescriptor(Query, {scale: 2});
      readResult = read(source, operation.fragment, resolverCache);
      expect(readResult.isMissingData).toBe(true);
      expect(readResult.data).toEqual({
        me: {
          profile_picture: undefined,
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
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'profile_picture(scale:1.5)': {__ref: '1:profile_picture(scale:1.5)'},
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
      });

      const resolverCache = new RecordResolverCache(() => source);

      let operation = createOperationDescriptor(Query, {
        scale: 1.5,
        name: 'Alice',
      });
      let readResult = read(source, operation.fragment, resolverCache);
      expect(readResult.isMissingData).toBe(false);
      expect(readResult.data).toEqual({
        me: {
          profile_picture: 'Alice: http://my-url-1.5',
        },
      });
      // Changing runtime (field) arg
      operation = createOperationDescriptor(Query, {scale: 1.5, name: 'Bob'});
      readResult = read(source, operation.fragment, resolverCache);
      expect(readResult.isMissingData).toBe(false);
      expect(readResult.data).toEqual({
        me: {
          profile_picture: 'Bob: http://my-url-1.5',
        },
      });
      // Changing fragment arg
      operation = createOperationDescriptor(Query, {scale: 2, name: 'Bob'});
      readResult = read(source, operation.fragment, resolverCache);
      expect(readResult.isMissingData).toBe(false);
      expect(readResult.data).toEqual({
        me: {
          profile_picture: 'Bob: http://my-url-2',
        },
      });

      // Changing both arguments
      operation = createOperationDescriptor(Query, {scale: 1.5, name: 'Clair'});
      readResult = read(source, operation.fragment, resolverCache);
      expect(readResult.isMissingData).toBe(false);
      expect(readResult.data).toEqual({
        me: {
          profile_picture: 'Clair: http://my-url-1.5',
        },
      });
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
