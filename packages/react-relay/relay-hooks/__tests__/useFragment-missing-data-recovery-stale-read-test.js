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
const useLazyLoadQuery = require('../useLazyLoadQuery');
const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {RelayEnvironmentProvider} = require('react-relay');
const {Record, createOperationDescriptor, graphql} = require('relay-runtime');
const RelayFeatureFlags = require('relay-runtime/util/RelayFeatureFlags');
const {createMockEnvironment} = require('relay-test-utils');

const {act} = ReactTestingLibrary;
// $FlowFixMe[missing-export] Not yet exists in the Flow types in OSS
const Activity: $FlowFixMe = React.unstable_Activity;
const Suspense = React.Suspense;

/**
 * The recovery path added for ENABLE_MISSING_DATA_OWNER_REFETCH decides whether
 * data is missing from `state` — a snapshot taken at an earlier store epoch.
 * Nothing in the render path refreshes it: `getFragmentState` re-reads only
 * when the selector or environment changed, and `handleMissedUpdates`, the only
 * epoch-refreshing read, runs exclusively from effects. Because the recovery
 * branch suspends by throwing during render, those effects never run for that
 * render.
 *
 * So when a recovery refetch lands while the tree is suspended — which is what
 * a hidden React <Activity> guarantees, since hiding tears the effects down —
 * the restore render re-reads nothing. The records are back in the store and
 * `environment.check(owner)` reports 'available', yet the reader still sees the
 * pre-recovery snapshot, judges the data missing, finds the once-per-owner
 * marker already spent, and hands its consumers the partial snapshot that
 * recovery had just repaired — a field the schema declares non-nullable arrives
 * as `undefined`, which is the crash this feature exists to prevent. A later
 * commit does heal the reader, so asserting only the FINAL rendered output
 * cannot see this: the assertions below are on the sequence of renders.
 *
 * This needs no GC: any partial record reachable from the fragment produces the
 * same missing read. The store here is left complete and a mutation links in a
 * record that carries only `id`, which is what an unmount updater writing a
 * freshly created object does in a real app.
 */

/** Every value the fragment consumer rendered, in order. */
let renderLog: Array<string>;
let environment;
let gqlFragment;
let gqlQuery;
let operation;

const VARIABLES = {id: '1'};

beforeEach(() => {
  RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH = true;
  RelayFeatureFlags.ENABLE_ACTIVITY_COMPATIBILITY = true;
  renderLog = [];

  environment = createMockEnvironment();

  gqlFragment = graphql`
    fragment useFragmentMissingDataRecoveryStaleReadTestUserFragment on User {
      name
      author {
        id
        name
      }
    }
  `;
  gqlQuery = graphql`
    query useFragmentMissingDataRecoveryStaleReadTestQuery($id: ID!) {
      node(id: $id) {
        ...useFragmentMissingDataRecoveryStaleReadTestUserFragment
          @dangerously_unaliased_fixme
      }
    }
  `;

  operation = createOperationDescriptor(gqlQuery, VARIABLES);
  // The store starts complete, so mounting serves from the store and issues no
  // request — the "navigate back to a page you already loaded" read.
  environment.commitPayload(operation, {
    node: {
      __typename: 'User',
      id: '1',
      name: 'Alice',
      author: {__typename: 'User', id: '2', name: 'Bob'},
    },
  });
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH = false;
  ReactTestingLibrary.cleanup();
});

// `author.name` is non-nullable in the schema, so PARTIAL standing in for it is
// a value product code would never see — real code dereferences it and throws.
// Reading defensively keeps that observable as data instead of an incidental
// TypeError, and every render is recorded so an intermediate partial cannot
// hide behind a later healed one.
const PARTIAL = 'partial';

component Author(userRef: unknown) {
  // $FlowFixMe[incompatible-call]
  const data = useFragment(gqlFragment, userRef as $FlowFixMe);
  const authorName = data?.author?.name ?? PARTIAL;
  renderLog.push(authorName);
  return authorName;
}

component Page() {
  const data = useLazyLoadQuery(gqlQuery, VARIABLES) as $FlowFixMe;
  return <Author userRef={data.node} />;
}

component Harness(hidden: boolean) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Fallback">
        <Activity mode={hidden ? 'hidden' : 'visible'}>
          <Page />
        </Activity>
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

/**
 * Link a record that carries only `id` into the relationship the fragment
 * reads, so `author.name` reads missing. This is the shape an unmount updater
 * leaves behind when it writes a just-created object it only has the id for.
 */
function linkPartialAuthorRecord() {
  act(() => {
    environment.commitUpdate(store => {
      const partial = store.create('3', 'User');
      partial.setValue('3', 'id');
      const user = store.get('1');
      if (user == null) {
        throw new Error('expected User:1 in the store');
      }
      user.setLinkedRecord(partial, 'author');
    });
  });
}

function expectSingleRecoveryRefetch() {
  const operations = environment.mock.getAllOperations();
  expect(operations.length).toBe(1);
  expect(operations[0].request.node).toBe(gqlQuery);
  expect(operations[0].request.cacheConfig?.force).toBe(true);
  return operations[0];
}

async function resolveRecovery(pendingOperation: $FlowFixMe) {
  await act(async () => {
    environment.mock.resolve(pendingOperation, {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          author: {__typename: 'User', id: '3', name: 'Carol'},
        },
      },
    });
    jest.runAllImmediates();
  });
}

test('recovers when the refetch resolves while the fragment is visible', async () => {
  const renderer = ReactTestingLibrary.render(<Harness hidden={false} />);
  expect(renderer.container.textContent).toBe('Bob');

  linkPartialAuthorRecord();

  // The partial read suspends on a forced refetch of the owner rather than
  // rendering the partial snapshot.
  expect(renderer.container.textContent).toBe('Fallback');
  await resolveRecovery(expectSingleRecoveryRefetch());

  expect(renderer.container.textContent).toBe('Carol');
});

test('recovers when the refetch resolves while the fragment is hidden inside <Activity>', async () => {
  const renderer = ReactTestingLibrary.render(<Harness hidden={false} />);
  expect(renderer.container.textContent).toBe('Bob');

  linkPartialAuthorRecord();
  expect(renderer.container.textContent).toBe('Fallback');
  const refetch = expectSingleRecoveryRefetch();

  // The user navigates away. The route is not unmounted — it is hidden, so
  // only its effects are destroyed and the hook keeps its (now stale) state.
  await act(async () => {
    renderer.rerender(<Harness hidden={true} />);
  });

  // The recovery response lands while the tree is hidden. This is the whole
  // reproduction: no effect can refresh the reader's snapshot in this window.
  await resolveRecovery(refetch);

  // The store is genuinely repaired before the restore read happens.
  expect(environment.check(operation).status).toBe('available');
  const restoredAuthor = environment.getStore().getSource().get('3');
  expect(restoredAuthor).not.toBe(undefined);
  expect(Record.getValue(restoredAuthor as $FlowFixMe, 'name')).toBe('Carol');

  const rendersBeforeRestore = renderLog.length;
  await act(async () => {
    renderer.rerender(<Harness hidden={false} />);
    jest.runAllImmediates();
  });

  // Restoring must re-read the current store. Without that re-read the reader
  // judges the repaired data missing and emits one partial render before a
  // later commit heals it — so assert on every render the restore produced,
  // not just the last one.
  const restoreRenders = renderLog.slice(rendersBeforeRestore);
  // not.toContain passes trivially on an empty array, so pin that the restore
  // actually rendered something before trusting it.
  expect(restoreRenders.length).toBeGreaterThan(0);
  expect(restoreRenders).not.toContain(PARTIAL);
  expect(renderer.container.textContent).toBe('Carol');
  // And it recovers by re-reading rather than by spending another refetch.
  expect(environment.mock.getAllOperations().length).toBe(0);
});
