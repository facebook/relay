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
import type {Snapshot} from '../../RelayStoreTypes';

const {
  live_external_greeting: LiveExternalGreeting,
} = require('./LiveExternalGreeting');
const {RelayFeatureFlags, suspenseSentinel} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  GLOBAL_STORE,
  resetStore,
} = require('relay-runtime/store/__tests__/resolvers/ExampleExternalStateStore');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore');
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
  resetStore();
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
});

test('unsubscribe happens when record is updated due to missing data', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
    '0': {
      __id: '0',
      __typename: 'User',
      id: '0',
      name: 'user 0',
    },
    '1': {
      __id: '1',
      __typename: 'User',
      id: '1',
      name: 'user 1',
    },
    '2': {
      __id: '2',
      __typename: 'User',
      id: '2',
      name: 'user 2',
    },
  });
  const operation = createOperationDescriptor(
    graphql`
      query LiveResolversTestUnsubscribesWhenSuspendsQuery {
        user: live_user_suspends_when_odd @waterfall {
          id
        }
        greeting: live_external_greeting
      }
    `,
    {},
  );
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const snapshot = environment.lookup(operation.fragment);
  // lookup() doesn't have the nice types of reading a fragment through the actual APIs
  let data: $FlowExpectedError = snapshot.data;
  const environmentUpdateHandler = jest.fn(() => {
    data = environment.lookup(operation.fragment).data;
  });
  // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
  environment.subscribe(snapshot, environmentUpdateHandler);

  const {__debug} = LiveExternalGreeting;

  // Initial values
  expect(environmentUpdateHandler).not.toHaveBeenCalled();
  expect(data.user.id).toBe('0');
  expect(data.greeting).toBe('Welcome user 0');
  expect(__debug.state.subscribers.size).toBe(1);

  // Make `live_user_suspends_when_odd` update & suspend
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  expect(environmentUpdateHandler).toHaveBeenCalledTimes(1);
  expect(data.user).toBe(suspenseSentinel());
  expect(data.greeting).toBe(undefined);
  expect(__debug.state.subscribers.size).toBe(0);

  // Make `live_custom_external_greeting` update
  // This shouldn't do anything since unsubscribe has happened
  expect(() => {
    __debug.updateSalutation('Yo');
  }).not.toThrow();

  // Make `live_user_suspends_when_odd` update & unsuspend
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  expect(environmentUpdateHandler).toHaveBeenCalledTimes(2);
  expect(data.user.id).toBe('2');
  expect(data.greeting).toBe('Yo user 2');
  expect(__debug.state.subscribers.size).toBe(1);
});

test('Updates can be batched', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const operation = createOperationDescriptor(
    graphql`
      query LiveResolversTestBatchingQuery {
        # Together these fields create two subscriptions to the underlying
        # GLOBAL_STORE.
        counter_no_fragment
        counter_no_fragment_with_arg(prefix: "sup")
      }
    `,
    {},
  );
  const log = jest.fn();
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
    log,
  });
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
    log,
  });

  function getBatchLogEventNames(): string[] {
    return log.mock.calls
      .map(log => log[0].name)
      .filter(name => {
        return name.startsWith('liveresolver.batch');
      });
  }

  const snapshot = environment.lookup(operation.fragment);

  const handler = jest.fn<[Snapshot], void>();
  environment.subscribe(snapshot, handler);

  expect(handler.mock.calls.length).toBe(0);

  // Update without batching
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});

  // We get notified once per live resolver. :(
  expect(handler.mock.calls.length).toBe(2);

  let lastCallCount = handler.mock.calls.length;

  expect(getBatchLogEventNames()).toEqual([]);

  // Update _with_ batching.
  store.batchLiveStateUpdates(() => {
    GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  });

  expect(getBatchLogEventNames()).toEqual([
    'liveresolver.batch.start',
    'liveresolver.batch.end',
  ]);

  // We get notified once per batch! :)
  expect(handler.mock.calls.length - lastCallCount).toBe(1);

  lastCallCount = handler.mock.calls.length;

  // Update with batching, but update throws.
  // This might happen if some other subscriber to the store throws when they
  // get notified of an error.
  expect(() => {
    store.batchLiveStateUpdates(() => {
      GLOBAL_STORE.dispatch({type: 'INCREMENT'});
      throw new Error('An Example Error');
    });
  }).toThrowError('An Example Error');

  expect(getBatchLogEventNames()).toEqual([
    'liveresolver.batch.start',
    'liveresolver.batch.end',
    'liveresolver.batch.start',
    'liveresolver.batch.end',
  ]);

  // We still notify our subscribers
  expect(handler.mock.calls.length - lastCallCount).toBe(1);

  // Nested calls to batchLiveStateUpdate throw
  expect(() => {
    store.batchLiveStateUpdates(() => {
      store.batchLiveStateUpdates(() => {});
    });
  }).toThrow('Unexpected nested call to batchLiveStateUpdates.');

  expect(getBatchLogEventNames()).toEqual([
    'liveresolver.batch.start',
    'liveresolver.batch.end',
    'liveresolver.batch.start',
    'liveresolver.batch.end',
    // Here we can see the nesting
    'liveresolver.batch.start',
    'liveresolver.batch.start',
    'liveresolver.batch.end',
    'liveresolver.batch.end',
  ]);
});

test('Errors thrown during _initial_ read() are caught as resolver errors', () => {
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const operation = createOperationDescriptor(
    graphql`
      query LiveResolversTestHandlesErrorOnReadQuery {
        counter_throws_when_odd
      }
    `,
    {},
  );
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const snapshot = environment.lookup(operation.fragment);
  expect(snapshot.relayResolverErrors).toEqual([
    {
      error: Error('What?'),
      field: {
        owner: 'LiveResolversTestHandlesErrorOnReadQuery',
        path: 'counter_throws_when_odd',
      },
    },
  ]);
  const data: $FlowExpectedError = snapshot.data;
  expect(data.counter_throws_when_odd).toBe(null);
});

test('Errors thrown during read() _after update_ are caught as resolver errors', () => {
  const source = RelayRecordSource.create({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
    },
  });
  const operation = createOperationDescriptor(
    graphql`
      query LiveResolversTestHandlesErrorOnUpdateQuery {
        counter_throws_when_odd
      }
    `,
    {},
  );
  const store = new LiveResolverStore(source, {
    gcReleaseBufferSize: 0,
  });
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  const snapshot = environment.lookup(operation.fragment);

  const handler = jest.fn<[Snapshot], void>();
  environment.subscribe(snapshot, handler);

  // Confirm there are no initial errors
  expect(snapshot.relayResolverErrors).toEqual([]);
  const data: $FlowExpectedError = snapshot.data;
  expect(data.counter_throws_when_odd).toBe(0);

  // This should trigger a read that throws
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});

  expect(handler).toHaveBeenCalled();

  const nextSnapshot = handler.mock.calls[0][0];

  expect(nextSnapshot.relayResolverErrors).toEqual([
    {
      error: Error('What?'),
      field: {
        owner: 'LiveResolversTestHandlesErrorOnUpdateQuery',
        path: 'counter_throws_when_odd',
      },
    },
  ]);
  const nextData: $FlowExpectedError = nextSnapshot.data;
  expect(nextData.counter_throws_when_odd).toBe(null);

  handler.mockReset();

  // Put the live resolver back into a state where it is valid
  GLOBAL_STORE.dispatch({type: 'INCREMENT'});

  const finalSnapshot = handler.mock.calls[0][0];

  // Confirm there are no initial errors
  expect(finalSnapshot.relayResolverErrors).toEqual([]);
  const finalData: $FlowExpectedError = finalSnapshot.data;
  expect(finalData.counter_throws_when_odd).toBe(2);
});
