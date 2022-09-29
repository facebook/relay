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

import type {GraphQLResponse} from '../../../network/RelayNetworkTypes';
import type {ConcreteRequest} from '../../../util/RelayConcreteNode';
import type {
  DataID,
  OperationType,
  VariablesOf,
} from '../../../util/RelayRuntimeTypes';
import type {Snapshot} from '../../RelayStoreTypes';

const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  resetStore,
} = require('relay-runtime/store/__tests__/resolvers/ExampleExternalStateStore');
const counterNoFragmentResolver = require('relay-runtime/store/__tests__/resolvers/LiveCounterNoFragment');
const counterResolver = require('relay-runtime/store/__tests__/resolvers/LiveCounterResolver');
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

test('Live Resolver without fragment', async () => {
  const initialCallCount = counterNoFragmentResolver.callCount;
  await testResolverGC({
    query: graphql`
      query ResolverGCTestWithoutFragmentQuery {
        counter_no_fragment
      }
    `,
    variables: {},
    payload: {data: {}},
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(counterNoFragmentResolver.callCount - initialCallCount).toBe(1);
      expect(snapshot.data).toEqual({counter_no_fragment: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:counter_no_fragment',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(counterNoFragmentResolver.callCount - initialCallCount).toBe(1);
      expect(snapshot.data).toEqual({counter_no_fragment: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:counter_no_fragment',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      expect(counterNoFragmentResolver.callCount - initialCallCount).toBe(2);
      expect(snapshot.data).toEqual({counter_no_fragment: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:counter_no_fragment',
      ]);
    },
  });
});

test('Live Resolver _with_ root fragment', async () => {
  const initialCallCount = counterResolver.callCount;
  await testResolverGC({
    query: graphql`
      query ResolverGCTestLiveWithRootFragmentQuery {
        counter
      }
    `,
    variables: {},
    payload: {data: {me: {__typename: 'User', id: '1'}}},
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(counterResolver.callCount - initialCallCount).toBe(1);
      expect(snapshot.data).toEqual({counter: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:counter',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(counterResolver.callCount - initialCallCount).toBe(1);
      expect(snapshot.data).toEqual({counter: 0});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:counter',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      expect(counterResolver.callCount - initialCallCount).toBe(2);
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({counter: undefined});
      expect(recordIdsInStore).toEqual(['client:root', 'client:root:counter']);
    },
  });
});

test('Regular resolver with fragment reads live resovler with fragment', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestRegularReadsLiveQuery {
        counter_plus_one
      }
    `,
    variables: {},
    payload: {data: {me: {__typename: 'User', id: '1'}}},
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({counter_plus_one: 1});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:counter',
        'client:root:counter_plus_one',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({counter_plus_one: 1});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:root:counter',
        'client:root:counter_plus_one',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({counter_plus_one: undefined});
      expect(snapshot.missingRequiredFields).toEqual({
        action: 'THROW',
        field: {owner: 'CounterPlusOneResolver', path: 'counter'},
      });
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:counter',
        'client:root:counter_plus_one',
      ]);
    },
  });
});

test('Non-live Resolver with fragment', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestNonLiveWithFragmentQuery {
        me {
          greeting
        }
      }
    `,
    variables: {},
    payload: {data: {me: {__typename: 'User', id: '1', name: 'Elizabeth'}}},
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({me: {greeting: 'Hello, Elizabeth!'}});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:greeting',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({me: {greeting: 'Hello, Elizabeth!'}});
      expect(recordIdsInStore).toEqual([
        'client:root',
        '1',
        'client:1:greeting',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({me: undefined});
      expect(recordIdsInStore).toEqual(['client:root']);
    },
  });
});

test('Non-live Resolver with no fragment and static arguments', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestNoFragmentStaticArgsQuery {
        hello(world: "Planet")
      }
    `,
    variables: {},
    payload: {data: {}},
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
  });
});

test('Non-live Resolver with no fragment and dynamic arguments', async () => {
  await testResolverGC({
    query: graphql`
      query ResolverGCTestNoFragmentDynamicArgsQuery($world: String!) {
        hello(world: $world)
      }
    `,
    variables: {world: 'Planet'},
    payload: {data: {}},
    beforeLookup: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookup: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
    afterRetainedGC: (snapshot, recordIdsInStore) => {
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
    afterFreedGC: recordIdsInStore => {
      expect(recordIdsInStore).toEqual(['client:root']);
    },
    afterLookupAfterFreedGC: (snapshot, recordIdsInStore) => {
      // Note that we _can't_ recreate the Resolver value because it's root fragment has been GGed.
      expect(snapshot.data).toEqual({hello: 'Hello, Planet!'});
      expect(recordIdsInStore).toEqual([
        'client:root',
        'client:root:hello(world:"Planet")',
      ]);
    },
  });
});

type TestProps<T: OperationType> = {
  query: ConcreteRequest,
  variables: VariablesOf<T>,
  payload: GraphQLResponse,
  beforeLookup: (recordIdsInStore: Array<DataID>) => void,
  afterLookup: (snapshot: Snapshot, recordIdsInStore: Array<DataID>) => void,
  afterRetainedGC: (
    snapshot: Snapshot,
    recordIdsInStore: Array<DataID>,
  ) => void,
  afterFreedGC: (recordIdsInStore: Array<DataID>) => void,
  afterLookupAfterFreedGC: (
    snapshot: Snapshot,
    recordIdsInStore: Array<DataID>,
  ) => void,
};

// Test utility for running through the GC lifecycle of a query that contains a
// resolver. Accepts various callbacks which will be called at various points
// during the following:
//
// 1. Lookup the query
// 2. Retain the query
// 3. GC
// 4. Lookup the query
// 5. Free the query
// 6. GC
// 7. Lookup the query
//
// Note that #7 is expected to fail for resolvers that have fragment dependencies.
async function testResolverGC<T: OperationType>({
  query,
  payload,
  variables,
  afterLookup,
  afterRetainedGC,
  afterFreedGC,
  afterLookupAfterFreedGC,
}: TestProps<T>) {
  const source = RelayRecordSource.create();

  // A purposefully empty query used to allow us to ensure we retain the root
  const emptyQueryOperation = createOperationDescriptor(
    graphql`
      query ResolverGCTestGCEmptyQuery {
        __id
      }
    `,
    {},
  );
  const operation = createOperationDescriptor(query, variables);

  const mockLogger = jest.fn();

  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
    log: mockLogger,
  });
  const mockPaylaod = Promise.resolve(payload);
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(() => mockPaylaod),
    store,
    log: mockLogger,
  });

  await environment.execute({operation}).toPromise();

  const snapshot = environment.lookup(operation.fragment);
  afterLookup(snapshot, store.getSource().getRecordIDs());

  environment.retain(emptyQueryOperation);
  const disposable = environment.retain(operation);
  store.__gc();

  const nextSnapshot = environment.lookup(operation.fragment);
  afterRetainedGC(nextSnapshot, store.getSource().getRecordIDs());

  expect(nextSnapshot.isMissingData).toEqual(false); // Sanity check results

  disposable.dispose();
  store.__gc();
  afterFreedGC(store.getSource().getRecordIDs());

  const finalSnapshot = environment.lookup(operation.fragment);

  afterLookupAfterFreedGC(finalSnapshot, store.getSource().getRecordIDs());
}
