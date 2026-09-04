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

const RelayNetwork = require('../../network/RelayNetwork');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {graphql} = require('relay-runtime');
const {
  disallowWarnings,
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();
disallowWarnings();

/**
 * GC reachability is computed from retained operations only
 * (`RelayModernStore._collect()` walks `this._roots`). An active store
 * subscription — the thing a mounted fragment observes the store through — is
 * not a root. So a record that a rendered fragment is reading gets collected
 * as soon as no *retained* operation happens to select it.
 *
 * The topology below is the one that occurs in a real app. Two operations
 * overlap on the same parent record but select different subtrees:
 *
 *   KeepAliveQuery  node(id:"1") { id }            — retained for the session
 *   OwnerQuery      node(id:"1") { ...fragment }   — retained by a route
 *
 * The keep-alive query holds `User:1`, so the parent survives; the subtrees
 * only the owner query reaches (`birthdate`, `friends`) do not. When the
 * owner's retain lapses — a React <Activity> route is hidden, so the effect
 * holding it is torn down — GC collects those subtrees while a fragment is
 * still subscribed to them. The next read of that fragment returns `undefined`
 * for fields the schema declares non-nullable.
 *
 * Both flag states are pinned here on purpose: the `false` cases document the
 * behavior these tests exist to change, so a future refactor cannot quietly
 * restore it while the `true` cases keep passing.
 */

let OwnerQuery;
let KeepAliveQuery;
let UserFragment;
let FriendsFragment;
let environment;
let store;
let ownerOperation;
let keepAliveOperation;

const BIRTHDATE_ID = 'client:1:birthdate';
const FRIENDS_ID = 'client:1:friends(first:1)';

beforeEach(() => {
  UserFragment = graphql`
    fragment RelayModernStoreSubscriptionGCTestUserFragment on User {
      name
      birthdate {
        day
      }
    }
  `;
  FriendsFragment = graphql`
    fragment RelayModernStoreSubscriptionGCTestFriendsFragment on User {
      friends(first: 1) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;
  OwnerQuery = graphql`
    query RelayModernStoreSubscriptionGCTestOwnerQuery($id: ID!) {
      node(id: $id) {
        ...RelayModernStoreSubscriptionGCTestUserFragment
          @dangerously_unaliased_fixme
        ...RelayModernStoreSubscriptionGCTestFriendsFragment
          @dangerously_unaliased_fixme
      }
    }
  `;
  // Overlaps the owner query on `User:1` but selects neither subtree, so its
  // retain keeps the parent alive while leaving the children collectable.
  KeepAliveQuery = graphql`
    query RelayModernStoreSubscriptionGCTestKeepAliveQuery($id: ID!) {
      node(id: $id) {
        id
      }
    }
  `;

  // gcReleaseBufferSize 0 makes a released operation immediately eligible;
  // with the default buffer the same thing happens a few navigations later.
  store = new RelayModernStore(RelayRecordSource.create(), {
    gcReleaseBufferSize: 0,
  });
  environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });

  ownerOperation = createOperationDescriptor(OwnerQuery, {id: '1'});
  keepAliveOperation = createOperationDescriptor(KeepAliveQuery, {id: '1'});

  environment.commitPayload(ownerOperation, {
    node: {
      __typename: 'User',
      id: '1',
      name: 'Alice',
      birthdate: {day: 15, month: 7, year: 1991},
      friends: {
        edges: [{node: {__typename: 'User', id: '2', name: 'Bob'}}],
      },
    },
  });
  environment.commitPayload(keepAliveOperation, {
    node: {__typename: 'User', id: '1'},
  });
  environment.retain(keepAliveOperation);
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = false;
});

function lookupUser(): Snapshot {
  return environment.lookup(
    createReaderSelector(UserFragment, '1', {}, ownerOperation.request),
  );
}

function lookupFriends(): Snapshot {
  return environment.lookup(
    createReaderSelector(FriendsFragment, '1', {}, ownerOperation.request),
  );
}

/**
 * Release the route's retain and let GC run for real — no store internals are
 * stubbed, so the test fails if the fix stops being reachable from a real
 * collection pass.
 */
function releaseOwnerAndCollect() {
  environment.retain(ownerOperation).dispose();
  jest.runAllTimers();
}

describe('GC and active subscriptions', () => {
  it('collects a record an active subscription is reading (flag off)', () => {
    // Set explicitly rather than relying on the module default: this case
    // documents the behavior the flag exists to change, so it has to keep
    // asserting that even after the default flips.
    RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = false;

    const snapshot = lookupUser();
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.seenRecords.has(BIRTHDATE_ID)).toBe(true);
    environment.subscribe(snapshot, jest.fn());

    releaseOwnerAndCollect();

    // The parent survives on the keep-alive query's retain, so the fragment
    // still resolves `User:1` — and then dereferences a link to a record that
    // is gone.
    expect(store.getSource().get('1')).not.toBe(undefined);
    expect(store.getSource().get(BIRTHDATE_ID)).toBe(undefined);
    expect(lookupUser().isMissingData).toBe(true);
  });

  it('retains a record an active subscription is reading (flag on)', () => {
    RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = true;

    const snapshot = lookupUser();
    expect(snapshot.isMissingData).toBe(false);
    environment.subscribe(snapshot, jest.fn());

    releaseOwnerAndCollect();

    expect(store.getSource().get(BIRTHDATE_ID)).not.toBe(undefined);
    const reread = lookupUser();
    expect(reread.isMissingData).toBe(false);
    expect(reread.data).toEqual({name: 'Alice', birthdate: {day: 15}});
  });

  it('retains a whole connection subtree an active subscription is reading (flag on)', () => {
    RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = true;

    const snapshot = lookupFriends();
    expect(snapshot.isMissingData).toBe(false);
    // The connection record, its edge, and the edge's node are all read, so
    // all three have to survive: collecting any one of them makes the next
    // read partial.
    expect(snapshot.seenRecords.has(FRIENDS_ID)).toBe(true);
    expect(snapshot.seenRecords.has('2')).toBe(true);
    environment.subscribe(snapshot, jest.fn());

    releaseOwnerAndCollect();

    expect(store.getSource().get(FRIENDS_ID)).not.toBe(undefined);
    expect(store.getSource().get('2')).not.toBe(undefined);
    const reread = lookupFriends();
    expect(reread.isMissingData).toBe(false);
    expect(reread.data).toEqual({
      friends: {edges: [{node: {id: '2', name: 'Bob'}}]},
    });
  });

  it('still collects records nothing is observing (flag on)', () => {
    RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = true;

    // Read without subscribing: a lookup alone is not a commitment.
    lookupUser();

    releaseOwnerAndCollect();

    expect(store.getSource().get(BIRTHDATE_ID)).toBe(undefined);
    expect(store.getSource().get(FRIENDS_ID)).toBe(undefined);
    // The retained keep-alive query's records are untouched.
    expect(store.getSource().get('1')).not.toBe(undefined);
  });

  it('collects once the subscription is disposed (flag on)', () => {
    RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = true;

    const subscription = environment.subscribe(lookupUser(), jest.fn());
    releaseOwnerAndCollect();
    expect(store.getSource().get(BIRTHDATE_ID)).not.toBe(undefined);

    // Unmounting ends the commitment, and losing the last root that reached
    // these records has to schedule a collection by itself: no retain is being
    // released here, so nothing else in the store would ever notice. Without
    // that, data a subscription was pinning stays for the rest of the session.
    subscription.dispose();
    jest.runAllTimers();
    expect(store.getSource().get(BIRTHDATE_ID)).toBe(undefined);
  });

  it('collects when a release-triggered pass is preempted by a subscription that then goes away (flag on)', () => {
    RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = true;

    // React tears an <Activity> route down in effect declaration order, and
    // useLazyLoadQueryNode declares its retain effect above the fragment hook
    // that subscribes. So the release runs first and the GC it schedules still
    // sees the subscription, which marks exactly the records the route was
    // being hidden to release. Only the pass triggered by the subscription
    // going away can collect them.
    const subscription = environment.subscribe(lookupUser(), jest.fn());
    releaseOwnerAndCollect();
    expect(store.getSource().get(BIRTHDATE_ID)).not.toBe(undefined);

    subscription.dispose();
    jest.runAllTimers();
    expect(store.getSource().get(BIRTHDATE_ID)).toBe(undefined);
    expect(store.getSource().get(FRIENDS_ID)).toBe(undefined);
  });

  it('marks only what a subscription actually read (flag on)', () => {
    RelayFeatureFlags.ENABLE_SUBSCRIPTION_GC_ROOTS = true;

    // Observing one subtree must not resurrect the other: `seenRecords` is
    // the reader's traversal, not the owner operation's selection.
    environment.subscribe(lookupUser(), jest.fn());

    releaseOwnerAndCollect();

    expect(store.getSource().get(BIRTHDATE_ID)).not.toBe(undefined);
    expect(store.getSource().get(FRIENDS_ID)).toBe(undefined);
  });
});
