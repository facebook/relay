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
  RecordSource,
  Store,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const RelayFeatureFlags = require('relay-runtime/util/RelayFeatureFlags');
const {createMockEnvironment} = require('relay-test-utils');

const {act} = ReactTestingLibrary;
const Suspense = React.Suspense;

/**
 * Two properties of the recovery attempt that guards
 * ENABLE_MISSING_DATA_OWNER_REFETCH, both of which a naive marker gets wrong in
 * opposite directions:
 *
 * - It must EXPIRE. A marker with no clock turns one transient failure (a
 *   dropped connection) into a permanent opt-out: the owner can never recover
 *   again for the life of the environment, because the only release path runs
 *   from a complete read that will never happen.
 *
 * - It must not be released by a reader OTHER than the ones it was taken for.
 *   One query owner is shared by every fragment spread under it, so a healthy
 *   reader releasing the attempt lets a still-broken reader take a fresh one on
 *   the very next round trip — an unbounded refetch loop at network speed,
 *   which presents as a screen that never leaves its skeleton. `check(owner)`
 *   cannot stand in for "no reader is missing": it walks the normalization AST
 *   from the query root asking only whether records exist, while a reader walks
 *   one fragment from the record its pointer captured.
 *
 * The readers here disagree with `check` by pointing a fragment at a record
 * that is not reachable from the query root, which is what an escaped fragment
 * ref does. No GC is needed for that: `check(owner)` stays 'available'
 * throughout, while the reader reads missing.
 */

let environment;
let gqlFragment;
let gqlSiblingFragment;
let gqlPluralFragment;
let gqlPluralQuery;
let gqlOwnerQuery;
let gqlKeepAliveQuery;
let ownerOperation;
let pluralOperation;
let pluralRefs;
let keepAliveOperation;
let ownerRetention;
let userRef;
let nowSpy;
let currentTime;

const COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 3;
/** A fragment ref aimed at a record the owner query never reaches. */
const ORPHAN_ID = 'not-in-this-query';

beforeEach(() => {
  RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH = true;
  // Recovery is what happens when prevention did not apply, so these cases
  // need the collection to actually occur. ENABLE_SUBSCRIPTION_GC_ROOTS would
  // keep a subscribed fragment's records alive and the recovery path would
  // never be reached — see the both-flags case in
  // useFragment-missing-data-recovery-attempt-test.js.
  RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = false;

  // Date.now is advanced by hand so the cooldown can be crossed deliberately;
  // starting from the real clock keeps every other Relay timestamp sane.
  currentTime = Date.now();
  nowSpy = jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

  environment = createMockEnvironment({
    store: new Store(new RecordSource(), {
      gcReleaseBufferSize: 0,
      gcScheduler: run => run(),
    }),
  });

  // `name` is read alongside the field that goes missing so that a write to the
  // parent changes this fragment's DATA. Without it a re-read produces an
  // identical partial snapshot, recycleNodesInto returns the same object, the
  // subscription never fires, and the component never re-renders — which would
  // silently make the assertions below vacuous rather than failing them.
  gqlFragment = graphql`
    fragment useFragmentMissingDataRecoveryAttemptTestUserFragment on User {
      name
      birthdate {
        day
      }
    }
  `;
  // A second reader under the same owner whose data survives everything the
  // first one loses — the "healthy sibling".
  gqlSiblingFragment = graphql`
    fragment useFragmentMissingDataRecoveryAttemptTestSiblingFragment on User {
      name
    }
  `;
  gqlPluralFragment = graphql`
    fragment useFragmentMissingDataRecoveryAttemptTestPluralFragment on User
    @relay(plural: true) {
      name
      birthdate {
        day
      }
    }
  `;
  gqlPluralQuery = graphql`
    query useFragmentMissingDataRecoveryAttemptTestPluralQuery($ids: [ID!]) {
      nodes(ids: $ids) {
        ...useFragmentMissingDataRecoveryAttemptTestPluralFragment
          @dangerously_unaliased_fixme
      }
    }
  `;
  gqlOwnerQuery = graphql`
    query useFragmentMissingDataRecoveryAttemptTestOwnerQuery($id: ID!) {
      node(id: $id) {
        ...useFragmentMissingDataRecoveryAttemptTestUserFragment
          @dangerously_unaliased_fixme
        ...useFragmentMissingDataRecoveryAttemptTestSiblingFragment
          @dangerously_unaliased_fixme
      }
    }
  `;
  // Overlaps the owner on `User:1` without selecting `birthdate`, so releasing
  // the owner leaves a dangling `user.birthdate` link rather than removing the
  // user outright.
  gqlKeepAliveQuery = graphql`
    query useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery($id: ID!) {
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
  environment.retain(keepAliveOperation);
  ownerRetention = environment.retain(ownerOperation);

  // A plural owner over records the singular fixture does not touch, so
  // releasing one owner cannot disturb the other.
  pluralOperation = createOperationDescriptor(gqlPluralQuery, {
    ids: ['8', '9', '10'],
  });
  environment.commitPayload(pluralOperation, {
    nodes: [
      {
        __typename: 'User',
        id: '8',
        name: 'Eight',
        birthdate: {day: 8, month: 8, year: 1988},
      },
      {
        __typename: 'User',
        id: '9',
        name: 'Nine',
        birthdate: {day: 9, month: 9, year: 1999},
      },
      {
        __typename: 'User',
        id: '10',
        name: 'Ten',
        birthdate: {day: 10, month: 10, year: 2000},
      },
    ],
  });
  environment.retain(pluralOperation);
  pluralRefs = (environment.lookup(pluralOperation.fragment).data as $FlowFixMe)
    .nodes;
  userRef = (environment.lookup(ownerOperation.fragment).data as $FlowFixMe)
    .node;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH = false;
  RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = false;
  nowSpy.mockRestore();
  ReactTestingLibrary.cleanup();
});

function advanceClock(ms: number) {
  currentTime += ms;
}

/** Same fragment, aimed at a record the owner query does not reach. */
function orphanRef(): $FlowFixMe {
  return {...(userRef as $FlowFixMe), __id: ORPHAN_ID};
}

component Birthday(userRef: unknown) {
  // $FlowFixMe[incompatible-call]
  const data = useFragment(gqlFragment, userRef as $FlowFixMe);
  return data?.birthdate?.day ?? 'partial';
}

component PluralBirthdays(userRefs: unknown) {
  // $FlowFixMe[incompatible-call]
  const data = useFragment(gqlPluralFragment, userRefs as $FlowFixMe);
  return (data ?? []).map(each => each?.birthdate?.day ?? 'partial').join('/');
}

component Sibling(userRef: unknown) {
  // $FlowFixMe[incompatible-call]
  const data = useFragment(gqlSiblingFragment, userRef as $FlowFixMe);
  return data?.name ?? 'partial';
}

component Harness(children: React.Node) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Fallback">{children}</Suspense>
    </RelayEnvironmentProvider>
  );
}

function collectOwnerOnlyRecords() {
  act(() => {
    ownerRetention.dispose();
  });
  expect(environment.getStore().getSource().get('1')).not.toBe(undefined);
  expect(environment.getStore().getSource().get('client:1:birthdate')).toBe(
    undefined,
  );
}

// GC bumps no epoch and notifies no subscriber; the dangling link surfaces at
// the next store write that touches the parent record.
let writeCounter = 0;
function writeOverlappingParentRecord() {
  act(() => {
    environment.commitUpdate(store => {
      store.get('1')?.setValue(`Alice ${++writeCounter}`, 'name');
    });
  });
}

function pendingRecoveryOperations(): $FlowFixMe {
  const operations = environment.mock.getAllOperations();
  operations.forEach(operation => {
    expect(operation.request.node).toBe(gqlOwnerQuery);
    expect(operation.request.cacheConfig?.force).toBe(true);
  });
  return operations;
}

async function resolveRecovery(operation: $FlowFixMe) {
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

describe('the attempt expires', () => {
  it('re-arms recovery for a new episode once the cooldown has elapsed', async () => {
    const renderer = ReactTestingLibrary.render(
      <Harness>
        <Birthday userRef={userRef} />
      </Harness>,
    );
    expect(renderer.container.textContent).toBe('15');

    // Episode one fails at the transport, leaving the data missing.
    collectOwnerOnlyRecords();
    writeOverlappingParentRecord();
    expect(pendingRecoveryOperations().length).toBe(1);
    await act(async () => {
      environment.mock.reject(
        environment.mock.getAllOperations()[0],
        new Error('network is down'),
      );
      jest.runAllImmediates();
    });
    expect(renderer.container.textContent).toBe('partial');

    // Within the cooldown, further missing reads must NOT retry — that is the
    // loop protection, and it is why the attempt is kept at all.
    writeOverlappingParentRecord();
    expect(pendingRecoveryOperations().length).toBe(0);
    advanceClock(COOLDOWN_MS - 1);
    writeOverlappingParentRecord();
    expect(pendingRecoveryOperations().length).toBe(0);

    // Past it, a genuinely new episode gets a fresh attempt. Without expiry
    // this owner would stay disarmed for the life of the environment.
    advanceClock(2);
    writeOverlappingParentRecord();
    const retry = pendingRecoveryOperations();
    expect(retry.length).toBe(1);

    await resolveRecovery(retry[0]);
    expect(renderer.container.textContent).toBe('15');
  });

  it('spends a bounded number of requests on a read that can never be satisfied', async () => {
    const renderer = ReactTestingLibrary.render(
      <Harness>
        <Birthday userRef={userRef} />
      </Harness>,
    );
    collectOwnerOnlyRecords();

    // Every recovery fails at the transport, so the read never heals and the
    // attempt is never released. Expiry alone would make this a request every
    // cooldown for the life of the app; the per-episode budget stops it.
    let requests = 0;
    for (let round = 0; round < 8; round++) {
      writeOverlappingParentRecord();
      const pending = pendingRecoveryOperations();
      if (pending.length > 0) {
        requests++;
        await act(async () => {
          environment.mock.reject(pending[0], new Error('network is down'));
          jest.runAllImmediates();
        });
      }
      // Past any backoff the budget could still be honouring.
      advanceClock(COOLDOWN_MS * 8);
    }

    expect(requests).toBe(MAX_ATTEMPTS);
    expect(renderer.container.textContent).toBe('partial');
  });
});

describe('prevention and recovery', () => {
  it('never reaches recovery for a subscribed reader when subscription GC roots are on', () => {
    // The two flags address the same hazard at different points: GC roots stop
    // the collection while a fragment is observing, and the recovery path
    // repairs the cases roots cannot reach — a hidden <Activity> route, whose
    // subscription is torn down, or a ref that outlived its owner. Pinning them
    // together states that relationship instead of leaving it to be inferred
    // from each flag's tests in isolation.
    RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = true;

    const renderer = ReactTestingLibrary.render(
      <Harness>
        <Birthday userRef={userRef} />
      </Harness>,
    );
    expect(renderer.container.textContent).toBe('15');

    act(() => {
      ownerRetention.dispose();
    });
    expect(
      environment.getStore().getSource().get('client:1:birthdate'),
    ).not.toBe(undefined);

    writeOverlappingParentRecord();
    expect(pendingRecoveryOperations().length).toBe(0);
    expect(renderer.container.textContent).toBe('15');
  });
});

describe('the attempt is not released by an unrelated reader', () => {
  it('holds when a DIFFERENT fragment under the same owner reads complete', async () => {
    // The healthy reader renders first, so on every retry it takes the release
    // branch before the broken one re-reads. That ordering is what turns a
    // premature release into a loop rather than a one-off.
    const renderer = ReactTestingLibrary.render(
      <Harness>
        <Sibling userRef={userRef} />
        <Birthday userRef={orphanRef()} />
      </Harness>,
    );

    // `check` disagrees with the reader: every record the query selects is
    // present, so the owner is 'available' — while the orphan-pointed reader
    // reads missing and takes an attempt.
    expect(environment.check(ownerOperation).status).toBe('available');
    expect(renderer.container.textContent).toBe('Fallback');
    expect(pendingRecoveryOperations().length).toBe(1);

    // The response cannot heal a reader pointed outside the query, so this
    // round trip is the moment a premature release would re-arm.
    await resolveRecovery(pendingRecoveryOperations()[0]);
    expect(pendingRecoveryOperations().length).toBe(0);
  });

  it('holds when ANOTHER ROW of the same fragment reads complete', async () => {
    // The same fragment rendered twice against different records — an ordinary
    // list. A guard keyed by fragment NAME cannot tell these two apart, so the
    // healthy row releases the broken row's attempt and the loop reopens.
    const renderer = ReactTestingLibrary.render(
      <Harness>
        <Birthday userRef={userRef} />
        <Birthday userRef={orphanRef()} />
      </Harness>,
    );

    expect(environment.check(ownerOperation).status).toBe('available');
    expect(renderer.container.textContent).toBe('Fallback');
    expect(pendingRecoveryOperations().length).toBe(1);

    await resolveRecovery(pendingRecoveryOperations()[0]);
    expect(pendingRecoveryOperations().length).toBe(0);
  });

  it('releases when the plural row set changed between the missing read and the complete read', async () => {
    // A reader's identity has to survive its own row set changing — a list that
    // paginates while a recovery is in flight is the ordinary case. Keyed by the
    // joined dataID list, the read that goes missing and the read that comes
    // back complete produce DIFFERENT keys, so the completion deletes a key that
    // was never added and the attempt is never released: the next genuinely new
    // missing episode finds a live attempt and gets no recovery at all.
    const renderer = ReactTestingLibrary.render(
      <Harness>
        <PluralBirthdays userRefs={[pluralRefs[0], pluralRefs[1]]} />
      </Harness>,
    );
    expect(renderer.container.textContent).toBe('8/9');

    act(() => {
      const source = environment.getStore().getSource() as $FlowFixMe;
      source.remove('client:9:birthdate');
      environment.commitUpdate(store => {
        store.get('9')?.setValue('Nine!', 'name');
      });
    });
    expect(renderer.container.textContent).toBe('Fallback');
    expect(environment.mock.getAllOperations().length).toBe(1);

    await act(async () => {
      environment.mock.resolve(environment.mock.getAllOperations()[0], {
        data: {
          nodes: [
            {
              __typename: 'User',
              id: '8',
              name: 'Eight',
              birthdate: {day: 8, month: 8, year: 1988},
            },
            {
              __typename: 'User',
              id: '9',
              name: 'Nine',
              birthdate: {day: 9, month: 9, year: 1999},
            },
            {
              __typename: 'User',
              id: '10',
              name: 'Ten',
              birthdate: {day: 10, month: 10, year: 2000},
            },
          ],
        },
      });
      // The list grows in the SAME commit as the response, so the suspended
      // reader's retry render never sees its old row set complete — the only
      // complete read it performs covers the new one.
      renderer.rerender(
        <Harness>
          <PluralBirthdays userRefs={pluralRefs} />
        </Harness>,
      );
      jest.runAllImmediates();
    });
    expect(renderer.container.textContent).toBe('8/9/10');

    // Everything the missing read covered is complete now, so a brand-new
    // episode must be able to recover rather than finding a stale attempt.
    act(() => {
      const source = environment.getStore().getSource() as $FlowFixMe;
      source.remove('client:8:birthdate');
      environment.commitUpdate(store => {
        store.get('8')?.setValue('Eight!', 'name');
      });
    });
    expect(environment.mock.getAllOperations().length).toBe(1);
  });

  it('holds when a plural reader over a DIFFERENT row set reads complete', async () => {
    // Reader identity has to survive the plural branch too: keyed only by
    // fragment name, every plural reader under one owner collapses into one
    // identity and the healthy row set releases the holed one's attempt.
    const renderer = ReactTestingLibrary.render(
      <Harness>
        <PluralBirthdays userRefs={[pluralRefs[0]]} />
        <PluralBirthdays userRefs={[pluralRefs[0], pluralRefs[1]]} />
      </Harness>,
    );
    expect(renderer.container.textContent).toBe('88/9');

    // Remove the record the way GC does. `store.delete()` is not equivalent: it
    // writes an explicit null, which the reader resolves as a value rather than
    // as missing data. Store.getSource() is typed read-only, hence the cast.
    act(() => {
      const source = environment.getStore().getSource() as $FlowFixMe;
      source.remove('client:9:birthdate');
      // Force a re-read of the holed row. Removing a record notifies nobody,
      // and a plural reader re-reads only the sub-snapshots whose records the
      // write touched — so writing to a different row would leave this one
      // reading its pre-removal snapshot.
      environment.commitUpdate(store => {
        store.get('9')?.setValue('Nine!', 'name');
      });
    });

    expect(renderer.container.textContent).toBe('Fallback');
    const pending = environment.mock.getAllOperations();
    expect(pending.length).toBe(1);
    expect(pending[0].request.node).toBe(gqlPluralQuery);

    // The response leaves `User:9` untouched, so the holed reader is still
    // missing when the healthy one takes the release branch. `User:8`'s name
    // does change, which is what makes the healthy reader re-render and reach
    // that branch at all.
    await act(async () => {
      environment.mock.resolve(pending[0], {
        data: {
          nodes: [
            {
              __typename: 'User',
              id: '8',
              name: 'Eight (refetched)',
              birthdate: {day: 8, month: 8, year: 1988},
            },
            null,
          ],
        },
      });
      jest.runAllImmediates();
    });

    expect(environment.mock.getAllOperations().length).toBe(0);
  });
});
