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

const useFragment = require('../useFragment');
const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {RelayEnvironmentProvider} = require('react-relay');
const {
  FRAGMENT_OWNER_KEY,
  RecordSource,
  Store,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const RelayFeatureFlags = require('relay-runtime/util/RelayFeatureFlags');
const {createMockEnvironment} = require('relay-test-utils');

const {act} = ReactTestingLibrary;
// $FlowFixMe[missing-export] Not yet exists in the Flow types in OSS
const Activity: $FlowFixMe = React.unstable_Activity;
const Suspense = React.Suspense;

let environment;
let gqlFragment;
let gqlOwnerQuery;
let gqlKeepAliveQuery;
let ownerOperation;
let keepAliveOperation;
let ownerRetention;
let userRef;

beforeEach(() => {
  RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH = true;
  // Recovery is what happens when prevention did not apply, so these cases
  // need the collection to actually occur. ENABLE_SUBSCRIPTION_GC_ROOTS would
  // keep a subscribed fragment's records alive and the recovery path would
  // never be reached — see the both-flags case in
  // useFragment-missing-data-recovery-attempt-test.js.
  RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = false;

  // gcReleaseBufferSize 0 + a synchronous scheduler make GC deterministic in
  // one dispose; the default 10-slot release buffer gets there over a session.
  environment = createMockEnvironment({
    store: new Store(new RecordSource(), {
      gcReleaseBufferSize: 0,
      gcScheduler: run => run(),
    }),
  });

  // `name` is read alongside the field that goes missing so that
  // writeOverlappingParentRecord() changes this fragment's DATA. Without it a
  // re-read yields an identical partial snapshot, recycleNodesInto returns the
  // same object, the subscription never fires, and the component never
  // re-renders — which would make the assertions that follow such a write
  // vacuous rather than failing.
  gqlFragment = graphql`
    fragment useFragmentMissingDataOwnerRefetchTestUserFragment on User {
      name
      birthdate {
        day
      }
    }
  `;
  // The fragment's owner: what a route or list rendered from.
  gqlOwnerQuery = graphql`
    query useFragmentMissingDataOwnerRefetchTestOwnerQuery($id: ID!) {
      node(id: $id) {
        ...useFragmentMissingDataOwnerRefetchTestUserFragment
          @dangerously_unaliased_fixme
      }
    }
  `;
  // A longer-lived query that overlaps the User record but NOT the birthdate
  // record: its retain keeps the User alive across GC, so collecting the
  // owner query leaves a dangling `user.birthdate` link.
  gqlKeepAliveQuery = graphql`
    query useFragmentMissingDataOwnerRefetchTestKeepAliveQuery($id: ID!) {
      node(id: $id) {
        id
      }
    }
  `;

  ownerOperation = createOperationDescriptor(gqlOwnerQuery, {id: '1'});
  keepAliveOperation = createOperationDescriptor(gqlKeepAliveQuery, {id: '1'});
  environment.commitPayload(ownerOperation, {
    node: {
      __typename: 'User',
      id: '1',
      name: 'Alice',
      birthdate: {day: 15, month: 7, year: 1991},
    },
  });
  environment.commitPayload(keepAliveOperation, {
    node: {__typename: 'User', id: '1'},
  });
  environment.retain(keepAliveOperation); // held for the session
  ownerRetention = environment.retain(ownerOperation);
  userRef = (environment.lookup(ownerOperation.fragment).data as $FlowFixMe)
    .node;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH = false;
  // RTL auto-cleanup is disabled globally (scripts/jest/environment.js), so
  // trees rendered here stay mounted and subscribed to a superseded
  // environment unless each test unmounts them.
  ReactTestingLibrary.cleanup();
});

component UserBirthday(userRef: unknown) {
  // $FlowFixMe[incompatible-call]
  const data = useFragment(gqlFragment, userRef as $FlowFixMe);
  return data?.birthdate?.day ?? 'partial';
}

component TestHarness(
  mode: 'visible' | 'hidden' = 'visible',
  userRef: unknown,
) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Fallback">
        <Activity mode={mode}>
          <UserBirthday userRef={userRef} />
        </Activity>
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

// Release the owner query and let GC run for real. Root reachability works as
// designed: the keep-alive query keeps the User; the birthdate record,
// reachable only through the owner query, is collected — `user.birthdate`
// now dangles.
function collectOwnerOnlyRecords() {
  act(() => {
    ownerRetention.dispose();
  });
  const source = environment.getStore().getSource();
  expect(source.get('1')).not.toBe(undefined);
  expect(source.get('client:1:birthdate')).toBe(undefined);
}

// GC bumps no epoch and notifies no subscriber; the dangling link surfaces at
// the next store write that changes the parent record (any mutation or
// revalidation touching the User).
let writeCounter = 0;
function writeOverlappingParentRecord() {
  act(() => {
    environment.commitUpdate(store => {
      store.get('1')?.setValue(`Alice ${++writeCounter}`, 'name');
    });
  });
}

function expectSingleForcedOwnerRefetch() {
  const operations = environment.mock.getAllOperations();
  expect(operations.length).toBe(1);
  expect(operations[0].request.node).toBe(gqlOwnerQuery);
  expect(operations[0].request.cacheConfig?.force).toBe(true);
  return operations[0];
}

async function resolveOwnerRefetch(operation: $FlowFixMe) {
  await act(async () => {
    environment.mock.resolve(operation, {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          birthdate: {day: 15, month: 7, year: 1991},
        },
      },
    });
    jest.runAllImmediates();
  });
}

test('refetches the owner once and suspends when a subscribed fragment re-reads missing data after GC', async () => {
  const renderer = ReactTestingLibrary.render(
    <TestHarness userRef={userRef} />,
  );
  expect(renderer.container.textContent).toBe('15');

  collectOwnerOnlyRecords();
  writeOverlappingParentRecord();

  // Instead of rendering the partial snapshot, the fragment issues one forced
  // owner refetch and suspends on it.
  expect(renderer.container.textContent).toBe('Fallback');
  const refetch = expectSingleForcedOwnerRefetch();

  await resolveOwnerRefetch(refetch);
  expect(renderer.container.textContent).toBe('15');
});

test('recovers a fragment restored by <Activity> (hidden → GC → visible)', async () => {
  const renderer = ReactTestingLibrary.render(
    <TestHarness mode="visible" userRef={userRef} />,
  );
  expect(renderer.container.textContent).toBe('15');

  // Hiding disposes the fragment's store subscription; the write while hidden
  // is what the restored hook discovers as missed updates.
  renderer.rerender(<TestHarness mode="hidden" userRef={userRef} />);
  collectOwnerOnlyRecords();
  writeOverlappingParentRecord();
  renderer.rerender(<TestHarness mode="visible" userRef={userRef} />);
  act(() => {
    jest.runAllImmediates();
  });

  expect(renderer.container.textContent).toBe('Fallback');
  const refetch = expectSingleForcedOwnerRefetch();

  await resolveOwnerRefetch(refetch);
  expect(renderer.container.textContent).toBe('15');
});

test('recovers a remounted fragment whose ref outlived the owner (fresh mount, missing data)', async () => {
  const renderer = ReactTestingLibrary.render(
    <TestHarness userRef={userRef} />,
  );
  expect(renderer.container.textContent).toBe('15');

  renderer.unmount();
  collectOwnerOnlyRecords();

  // A new component mounts with the ref that survived in app state
  // (virtualized list row, navigation back-stack…).
  const remounted = ReactTestingLibrary.render(
    <TestHarness userRef={userRef} />,
  );

  expect(remounted.container.textContent).toBe('Fallback');
  const refetch = expectSingleForcedOwnerRefetch();

  await resolveOwnerRefetch(refetch);
  expect(remounted.container.textContent).toBe('15');
});

test('does not retry immediately: a transport error does not start a request loop', async () => {
  const renderer = ReactTestingLibrary.render(
    <TestHarness userRef={userRef} />,
  );
  collectOwnerOnlyRecords();
  writeOverlappingParentRecord();
  expect(renderer.container.textContent).toBe('Fallback');
  expect(environment.mock.getAllOperations().length).toBe(1);

  await act(async () => {
    environment.mock.reject(
      environment.mock.getAllOperations()[0],
      new Error('network is down'),
    );
    jest.runAllImmediates();
  });

  // The read is still missing, but the attempt's cooldown holds: no new
  // pending operation appears (getAllOperations lists pending ones; the
  // rejected refetch is gone), and the fragment falls through to today's
  // partial render. That the owner is re-armed once the cooldown elapses is
  // covered in useFragment-missing-data-recovery-attempt-test.js.
  writeOverlappingParentRecord();
  expect(environment.mock.getAllOperations().length).toBe(0);
  expect(renderer.container.textContent).toBe('partial');
});

test('the attempt is released once data reads back complete: a second GC episode recovers again', async () => {
  const renderer = ReactTestingLibrary.render(
    <TestHarness userRef={userRef} />,
  );
  collectOwnerOnlyRecords();
  writeOverlappingParentRecord();
  await resolveOwnerRefetch(expectSingleForcedOwnerRefetch());
  expect(renderer.container.textContent).toBe('15');

  // The recovered data is held only by the refetch's temporary retain (the
  // owner query's own retain lapsed before episode one). Let that TTL expire —
  // GC legitimately collects the birthdate again.
  await act(async () => {
    jest.runAllTimers();
  });
  expect(environment.getStore().getSource().get('client:1:birthdate')).toBe(
    undefined,
  );

  // The data-complete render after episode one released the attempt, so this
  // episode recovers with one more request instead of staying broken.
  writeOverlappingParentRecord();
  expect(renderer.container.textContent).toBe('Fallback');
  const refetch = expectSingleForcedOwnerRefetch();

  await resolveOwnerRefetch(refetch);
  expect(renderer.container.textContent).toBe('15');
});

test("a store-wide invalidation ('stale') releases the attempt instead of permanently disarming recovery", async () => {
  // Episode one fails at transport, so the attempt is retained with the data
  // still missing.
  const renderer = ReactTestingLibrary.render(
    <TestHarness userRef={userRef} />,
  );
  collectOwnerOnlyRecords();
  writeOverlappingParentRecord();
  await act(async () => {
    environment.mock.reject(
      environment.mock.getAllOperations()[0],
      new Error('network is down'),
    );
    jest.runAllImmediates();
  });
  expect(renderer.container.textContent).toBe('partial');

  // The data heals through an unrelated write, and the whole store is then
  // invalidated (e.g. an auth boundary): the complete read now checks as
  // 'stale', not 'available'. That must still release the attempt.
  await act(async () => {
    environment.commitPayload(ownerOperation, {
      node: {
        __typename: 'User',
        id: '1',
        birthdate: {day: 15, month: 7, year: 1991},
      },
    });
    environment.commitUpdate(store => {
      store.invalidateStore();
    });
    jest.runAllImmediates();
  });
  expect(renderer.container.textContent).toBe('15');

  // Episode two: expire any temporary retain left by episode one's failed
  // refetch, then a retain/release cycle lets GC collect the healed birthdate
  // again. Recovery must re-arm — a permanently retained attempt would render
  // 'partial' here.
  await act(async () => {
    jest.runAllTimers();
  });
  act(() => {
    environment.retain(ownerOperation).dispose();
  });
  expect(environment.getStore().getSource().get('client:1:birthdate')).toBe(
    undefined,
  );
  writeOverlappingParentRecord();

  expect(renderer.container.textContent).toBe('Fallback');
  const refetch = expectSingleForcedOwnerRefetch();

  await resolveOwnerRefetch(refetch);
  expect(renderer.container.textContent).toBe('15');
});

test('never re-executes a non-query owner', () => {
  const ref = userRef as $FlowFixMe;
  const mutationOwnedRef = {
    ...ref,
    [FRAGMENT_OWNER_KEY]: {
      ...ref[FRAGMENT_OWNER_KEY],
      node: {
        ...ref[FRAGMENT_OWNER_KEY].node,
        params: {
          ...ref[FRAGMENT_OWNER_KEY].node.params,
          operationKind: 'mutation',
        },
      },
    },
  };
  collectOwnerOnlyRecords();

  const renderer = ReactTestingLibrary.render(
    <TestHarness userRef={mutationOwnedRef} />,
  );

  // No refetch is attempted for a mutation-owned fragment; the partial render
  // is unchanged from today's behavior.
  expect(environment.mock.getAllOperations().length).toBe(0);
  expect(renderer.container.textContent).toBe('partial');
});

test('does not change behavior when the flag is off', () => {
  RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH = false;

  const renderer = ReactTestingLibrary.render(
    <TestHarness userRef={userRef} />,
  );
  collectOwnerOnlyRecords();
  writeOverlappingParentRecord();

  // Today's behavior: no request, partial snapshot rendered.
  expect(environment.mock.getAllOperations().length).toBe(0);
  expect(renderer.container.textContent).toBe('partial');
});
