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

const RelayNetwork = require('../../network/RelayNetwork');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');

// Two operations reference the same User record. Only DetailQuery selects its
// profilePicture child (a separate, linked record); ListQuery selects only id/name.
const ListQuery = graphql`
  query RelayModernStoreSubscriptionGcTestListQuery($id: ID!) {
    node(id: $id) {
      ... on User {
        id
        name
      }
    }
  }
`;
const DetailQuery = graphql`
  query RelayModernStoreSubscriptionGcTestQuery($id: ID!, $size: [Int]) {
    node(id: $id) {
      ... on User {
        id
        profilePicture(size: $size) {
          uri
        }
      }
    }
  }
`;

function setup() {
  const store = new RelayModernStore(new RelayRecordSource(), {
    gcReleaseBufferSize: 0, // evict a released operation immediately
    gcScheduler: run => run(), // run GC synchronously for a deterministic test
  });
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(() =>
      Promise.reject(new Error('no network in test')),
    ),
    store,
  });
  const detail = createOperationDescriptor(DetailQuery, {id: '4', size: 32});
  const list = createOperationDescriptor(ListQuery, {id: '4'});
  environment.commitPayload(detail, {
    node: {
      id: '4',
      __typename: 'User',
      profilePicture: {uri: 'http://x/4.jpg'},
    },
  });
  environment.commitPayload(list, {
    node: {id: '4', __typename: 'User', name: 'Zuck'},
  });
  const hasProfilePicture = () =>
    Array.from(environment.getStore().getSource().getRecordIDs()).some(id =>
      /profilePicture/.test(id),
    );
  return {environment, detail, list, hasProfilePicture};
}

describe('RelayModernStore garbage collection with active subscriptions', () => {
  it('keeps a linked child that a live subscription still reads after its owner operation is released', () => {
    const {environment, detail, list, hasProfilePicture} = setup();

    // Both screens are mounted: the detail page and a list page that the router
    // keeps alive (e.g. under React <Activity>).
    const listRetain = environment.retain(list);
    const detailRetain = environment.retain(detail);

    // A live fragment subscription reads profilePicture (the mounted useFragment).
    const snapshot = environment.lookup(detail.fragment);
    expect(snapshot.isMissingData).toBe(false);
    expect(
      Array.from(snapshot.seenRecords).some(id => /profilePicture/.test(id)),
    ).toBe(true);
    const subscription = environment.subscribe(snapshot, () => {});

    // Navigate away from the detail page: its query retention is released. The list
    // op stays retained (its <Activity> subtree is kept mounted). GC runs.
    detailRetain.dispose();

    // DESIRED (post-fix): the child survives because a live subscription still
    // reads it. CURRENT (bug): the profilePicture record is collected (only the
    // released DetailQuery selected it), and the next read of the detail operation
    // is a partial read.
    expect(hasProfilePicture()).toBe(true);
    const after = environment.lookup(detail.fragment);
    expect(after.isMissingData).toBe(false);
    expect((after.data as $FlowFixMe).node.profilePicture).toEqual({
      uri: 'http://x/4.jpg',
    });

    subscription.dispose();
    listRetain.dispose();
  });

  it('collects the child once the subscription is disposed (no over-retention)', () => {
    const {environment, detail, list, hasProfilePicture} = setup();

    const listRetain = environment.retain(list);
    const detailRetain = environment.retain(detail);
    const subscription = environment.subscribe(
      environment.lookup(detail.fragment),
      () => {},
    );

    // With no active subscription and no retained op selecting it, the child must
    // be collected — the fix must not leak records past a subscription's lifetime.
    subscription.dispose();
    detailRetain.dispose();

    expect(hasProfilePicture()).toBe(false);

    listRetain.dispose();
  });
});
