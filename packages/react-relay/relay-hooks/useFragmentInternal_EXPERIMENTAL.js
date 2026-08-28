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

import type {QueryResult} from './QueryResource';
import type {
  CacheConfig,
  DataID,
  FetchPolicy,
  IEnvironment,
  ReaderFragment,
  ReaderSelector,
  SelectorData,
  Snapshot,
} from 'relay-runtime';
import type {MissingClientEdgeRequestInfo} from 'relay-runtime/store/RelayStoreTypes';

const {getQueryResourceForEnvironment} = require('./QueryResource');
const useRelayEnvironment = require('./useRelayEnvironment');
const useRelayLoggingContext = require('./useRelayLoggingContext');
const invariant = require('invariant');
const {useDebugValue, useEffect, useMemo, useRef, useState} = require('react');
const {
  __internal: {fetchQuery: fetchQueryInternal, getPromiseForActiveRequest},
  RelayFeatureFlags,
  areEqualSelectors,
  createOperationDescriptor,
  getPendingOperationsForFragment,
  getSelector,
  getVariablesFromFragment,
  handlePotentialSnapshotErrors,
  recycleNodesInto,
  stableCopy,
} = require('relay-runtime');
const warning = require('warning');

export type FragmentQueryOptions = {
  fetchPolicy?: FetchPolicy,
  networkCacheConfig?: ?CacheConfig,
};

type FragmentState = Readonly<
  | {kind: 'bailout', environment: IEnvironment}
  | {
      kind: 'singular',
      snapshot: Snapshot,
      epoch: number,
      selector: ReaderSelector,
      environment: IEnvironment,
    }
  | {
      kind: 'plural',
      snapshots: ReadonlyArray<Snapshot>,
      epoch: number,
      selector: ReaderSelector,
      environment: IEnvironment,
    },
>;

type StateUpdaterFunction<T> = ((T) => T) => void;

function isMissingData(state: FragmentState): boolean {
  if (state.kind === 'bailout') {
    return false;
  } else if (state.kind === 'singular') {
    return state.snapshot.isMissingData;
  } else {
    return state.snapshots.some(s => s.isMissingData);
  }
}

// Owners already refetched because a fragment read missing data with no pending
// operation — see ENABLE_MISSING_DATA_OWNER_REFETCH below. An attempt records
// WHEN it was made and WHICH readers were missing under it; both are needed to
// keep recovery from turning into a request loop without also disarming it
// forever.
const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';
interface IMap<K, V> {
  get(key: K): V | void;
  set(key: K, value: V): IMap<K, V>;
}
type MissingDataRefetchAttempt = {
  at: number,
  // How many recovery requests this episode has already spent.
  count: number,
  // The readers that were missing under this attempt, keyed by reader identity
  // (see getReaderKey). The attempt may only be released once every one of
  // them has read back complete.
  missingReaders: Set<string>,
};
const missingDataRefetchesByEnvironment: IMap<
  IEnvironment,
  Map<string, MissingDataRefetchAttempt>,
> = WEAKMAP_SUPPORTED ? new WeakMap() : new Map();
const MAX_MISSING_DATA_REFETCHES = 1000;
// A failed recovery must not disable recovery for the rest of the session, and
// it must not turn into a heartbeat either. An episode may spend
// MAX_MISSING_DATA_REFETCH_ATTEMPTS requests, spaced by a doubling backoff from
// this base, and then stops: a read the server can never satisfy costs a
// bounded number of requests rather than one every cooldown forever, while a
// recovery that failed once — a dropped connection — still gets another chance
// instead of disarming the owner for the environment's lifetime.
//
// The budget is per EPISODE, not per session: releasing the attempt (every
// reader that was missing has read back complete) drops the record entirely, so
// a later episode on the same owner starts again from a full budget.
const MISSING_DATA_REFETCH_COOLDOWN_MS = 30 * 1000;
const MAX_MISSING_DATA_REFETCH_ATTEMPTS = 3;
let nextMissingDataRefetchID = 0;

function getMissingDataRefetches(
  environment: IEnvironment,
): Map<string, MissingDataRefetchAttempt> {
  let refetches = missingDataRefetchesByEnvironment.get(environment);
  if (refetches == null) {
    refetches = new Map<string, MissingDataRefetchAttempt>();
    missingDataRefetchesByEnvironment.set(environment, refetches);
  }
  return refetches;
}

/**
 * Identity of one reader within its owner: the fragment, the record(s) it was
 * pointed at, and the @arguments it was spread with.
 *
 * The fragment NAME alone is not enough. A list renders the same fragment once
 * per row against different records, so one row reading missing while another
 * reads fine is routine — and if both share a key, the healthy row cancels the
 * broken row's attempt and re-arms it on the next round trip. Variables matter
 * for the same reason at a single record: two spreads of one fragment with
 * different @arguments read different fields and can disagree about missingness.
 */
function getReaderKey(
  fragmentName: string,
  fragmentSelector: ReaderSelector,
): string {
  const selectors =
    fragmentSelector.kind === 'PluralReaderSelector'
      ? fragmentSelector.selectors
      : [fragmentSelector];
  return (
    fragmentName +
    '\u0000' +
    selectors
      .map(
        selector =>
          selector.dataID + JSON.stringify(stableCopy(selector.variables)),
      )
      .join(',')
  );
}

/**
 * Record that `readerKey` read missing data under `identifier`'s owner, and
 * report whether this read should issue a recovery refetch.
 */
function markMissingDataRefetch(
  environment: IEnvironment,
  identifier: string,
  readerKey: string,
): boolean {
  const refetches = getMissingDataRefetches(environment);
  const lastAttempt = refetches.get(identifier);
  const now = Date.now();
  if (lastAttempt != null) {
    const backoff =
      MISSING_DATA_REFETCH_COOLDOWN_MS * Math.pow(2, lastAttempt.count - 1);
    if (
      lastAttempt.count >= MAX_MISSING_DATA_REFETCH_ATTEMPTS ||
      now - lastAttempt.at < backoff
    ) {
      // Still broken for this reader. Record it even though we are not
      // refetching: otherwise the attempt forgets that this reader is broken
      // and a healthy sibling can release it (see the complete branch below).
      lastAttempt.missingReaders.add(readerKey);
      return false;
    }
  }
  if (
    !refetches.has(identifier) &&
    refetches.size >= MAX_MISSING_DATA_REFETCHES
  ) {
    // Bound memory; evicting the oldest attempt only re-arms a single refetch
    // for that owner.
    const oldest = refetches.keys().next().value;
    if (oldest != null) {
      refetches.delete(oldest);
    }
  }
  // Replacing the record rather than mutating it is what keeps `missingReaders`
  // from accumulating keys for readers that have since changed identity (a
  // plural reader whose row set grew, a singular one re-pointed at another
  // record): each attempt tracks only the readers that were missing under it.
  refetches.set(identifier, {
    at: now,
    count: lastAttempt == null ? 1 : lastAttempt.count + 1,
    missingReaders: new Set([readerKey]),
  });
  return true;
}

function getMissingClientEdges(
  state: FragmentState,
): ReadonlyArray<MissingClientEdgeRequestInfo> | null {
  if (state.kind === 'bailout') {
    return null;
  } else if (state.kind === 'singular') {
    return state.snapshot.missingClientEdges ?? null;
  } else {
    let edges: null | Array<MissingClientEdgeRequestInfo> = null;
    for (const snapshot of state.snapshots) {
      if (snapshot.missingClientEdges) {
        edges = edges ?? [];
        for (const edge of snapshot.missingClientEdges) {
          edges.push(edge);
        }
      }
    }
    return edges;
  }
}

function getSuspendingLiveResolver(
  state: FragmentState,
): ReadonlyArray<DataID> | null {
  if (state.kind === 'bailout') {
    return null;
  } else if (state.kind === 'singular') {
    return state.snapshot.missingLiveResolverFields ?? null;
  } else {
    let missingFields: null | Array<DataID> = null;
    for (const snapshot of state.snapshots) {
      if (snapshot.missingLiveResolverFields) {
        missingFields = missingFields ?? [];
        for (const edge of snapshot.missingLiveResolverFields) {
          missingFields.push(edge);
        }
      }
    }
    return missingFields;
  }
}

function handlePotentialSnapshotErrorsForState(
  environment: IEnvironment,
  state: FragmentState,
  loggingContext: unknown | void,
): void {
  if (state.kind === 'singular') {
    handlePotentialSnapshotErrors(
      environment,
      state.snapshot.fieldErrors,
      loggingContext,
    );
  } else if (state.kind === 'plural') {
    for (const snapshot of state.snapshots) {
      handlePotentialSnapshotErrors(
        environment,
        snapshot.fieldErrors,
        loggingContext,
      );
    }
  }
}

/**
 * Check for updates to the store that occurred concurrently with rendering the given `state` value,
 * returning a new (updated) state if there were updates or null if there were no changes.
 */
function handleMissedUpdates(
  environment: IEnvironment,
  state: FragmentState,
): null | [/* has data changed */ boolean, FragmentState] {
  if (state.kind === 'bailout') {
    return null;
  }
  // FIXME this is invalid if we've just switched environments.
  const currentEpoch = environment.getStore().getEpoch();
  if (currentEpoch === state.epoch) {
    return null;
  }
  // The store has updated since we rendered (without us being subscribed yet),
  // so check for any updates to the data we're rendering:
  if (state.kind === 'singular') {
    const currentSnapshot = environment.lookup(state.snapshot.selector);
    const updatedData = recycleNodesInto(
      state.snapshot.data,
      currentSnapshot.data,
    );
    const updatedCurrentSnapshot: Snapshot = {
      data: updatedData,
      fieldErrors: currentSnapshot.fieldErrors,
      isMissingData: currentSnapshot.isMissingData,
      missingClientEdges: currentSnapshot.missingClientEdges,
      missingLiveResolverFields: currentSnapshot.missingLiveResolverFields,
      seenRecords: currentSnapshot.seenRecords,
      selector: currentSnapshot.selector,
    };
    return [
      updatedData !== state.snapshot.data,
      {
        environment: state.environment,
        epoch: currentEpoch,
        kind: 'singular',
        selector: state.selector,
        snapshot: updatedCurrentSnapshot,
      },
    ];
  } else {
    let didMissUpdates = false;
    const currentSnapshots = [];
    for (let index = 0; index < state.snapshots.length; index++) {
      const snapshot = state.snapshots[index];
      const currentSnapshot = environment.lookup(snapshot.selector);
      const updatedData = recycleNodesInto(snapshot.data, currentSnapshot.data);
      const updatedCurrentSnapshot: Snapshot = {
        data: updatedData,
        fieldErrors: currentSnapshot.fieldErrors,
        isMissingData: currentSnapshot.isMissingData,
        missingClientEdges: currentSnapshot.missingClientEdges,
        missingLiveResolverFields: currentSnapshot.missingLiveResolverFields,
        seenRecords: currentSnapshot.seenRecords,
        selector: currentSnapshot.selector,
      };
      if (updatedData !== snapshot.data) {
        didMissUpdates = true;
      }
      currentSnapshots.push(updatedCurrentSnapshot);
    }
    invariant(
      currentSnapshots.length === state.snapshots.length,
      'Expected same number of snapshots',
    );
    return [
      didMissUpdates,
      {
        environment: state.environment,
        epoch: currentEpoch,
        kind: 'plural',
        selector: state.selector,
        snapshots: currentSnapshots,
      },
    ];
  }
}

type PromiseWithDisplayName = Promise<unknown> & {displayName?: string};

function handleMissingClientEdge(
  environment: IEnvironment,
  parentFragmentNode: ReaderFragment,
  parentFragmentRef: unknown,
  missingClientEdgeRequestInfo: MissingClientEdgeRequestInfo,
  queryOptions?: FragmentQueryOptions,
): [QueryResult, ?PromiseWithDisplayName] {
  const originalVariables = getVariablesFromFragment(
    parentFragmentNode,
    parentFragmentRef,
  );
  const variables = {
    ...originalVariables,
    id: missingClientEdgeRequestInfo.clientEdgeDestinationID, // TODO should be a reserved name
  };
  const queryOperationDescriptor = createOperationDescriptor(
    missingClientEdgeRequestInfo.request,
    variables,
    queryOptions?.networkCacheConfig,
  );
  // This may suspend. We don't need to do anything with the results; all we're
  // doing here is started the query if needed and retaining and releasing it
  // according to the component mount/suspense cycle; QueryResource
  // already handles this by itself.
  const QueryResource = getQueryResourceForEnvironment(environment);
  const queryResult = QueryResource.prepare(
    queryOperationDescriptor,
    fetchQueryInternal(environment, queryOperationDescriptor),
    queryOptions?.fetchPolicy,
  );

  const promise = getPromiseForActiveRequest(
    environment,
    queryOperationDescriptor.request,
  );
  // $FlowExpectedError[prop-missing]
  if (promise != null && promise.displayName == null) {
    // $FlowExpectedError[prop-missing]
    promise.displayName = missingClientEdgeRequestInfo.request.params.name;
  }
  // $FlowFixMe[incompatible-exact] - Intentionally bypassing exactness check
  return [queryResult, promise];
}

function subscribeToSnapshot(
  environment: IEnvironment,
  state: FragmentState,
  setState: StateUpdaterFunction<FragmentState>,
): () => void {
  if (state.kind === 'bailout') {
    return () => {};
  } else if (state.kind === 'singular') {
    const disposable = environment.subscribe(state.snapshot, latestSnapshot => {
      setState(prevState => {
        // In theory a setState from a subscription could be batched together
        // with a setState to change the fragment selector. Guard against this
        // by bailing out of the state update if the selector has changed.
        let nextState: FragmentState | null = null;
        if (
          prevState.kind !== 'singular' ||
          prevState.snapshot.selector !== latestSnapshot.selector ||
          prevState.environment !== environment
        ) {
          const updates = handleMissedUpdates(prevState.environment, prevState);
          if (updates != null) {
            const [dataChanged, updatedState] = updates;
            environment.__log({
              hasDataChanges: dataChanged,
              name: 'useFragment.subscription.missedUpdates',
            });
            nextState = dataChanged ? updatedState : prevState;
          } else {
            nextState = prevState;
          }
        } else {
          nextState = {
            environment: state.environment,
            epoch: environment.getStore().getEpoch(),
            kind: 'singular',
            selector: state.selector,
            snapshot: latestSnapshot,
          };
        }
        return nextState;
      });
    });
    return () => {
      disposable.dispose();
    };
  } else {
    const disposables = state.snapshots.map((snapshot, index) =>
      environment.subscribe(snapshot, latestSnapshot => {
        setState(prevState => {
          // In theory a setState from a subscription could be batched together
          // with a setState to change the fragment selector. Guard against this
          // by bailing out of the state update if the selector has changed.
          let nextState: FragmentState | null = null;
          if (
            prevState.kind !== 'plural' ||
            prevState.snapshots[index]?.selector !== latestSnapshot.selector ||
            prevState.environment !== environment
          ) {
            const updates = handleMissedUpdates(
              prevState.environment,
              prevState,
            );
            if (updates != null) {
              const [dataChanged, updatedState] = updates;
              environment.__log({
                hasDataChanges: dataChanged,
                name: 'useFragment.subscription.missedUpdates',
              });
              nextState = dataChanged ? updatedState : prevState;
            } else {
              nextState = prevState;
            }
          } else {
            const updated = [...prevState.snapshots];
            updated[index] = latestSnapshot;
            nextState = {
              environment: state.environment,
              epoch: environment.getStore().getEpoch(),
              kind: 'plural',
              selector: state.selector,
              snapshots: updated,
            };
          }
          return nextState;
        });
      }),
    );
    return () => {
      for (const d of disposables) {
        d.dispose();
      }
    };
  }
}

function getFragmentState(
  environment: IEnvironment,
  fragmentSelector: ?ReaderSelector,
): FragmentState {
  if (fragmentSelector == null) {
    return {environment, kind: 'bailout'};
  } else if (fragmentSelector.kind === 'PluralReaderSelector') {
    // Note that if fragmentRef is an empty array, fragmentSelector will be null so we'll hit the above case.
    // Null is returned by getSelector if fragmentRef has no non-null items.
    return {
      environment,
      epoch: environment.getStore().getEpoch(),
      kind: 'plural',
      selector: fragmentSelector,
      snapshots: fragmentSelector.selectors.map(s => environment.lookup(s)),
    };
  } else {
    return {
      environment,
      epoch: environment.getStore().getEpoch(),
      kind: 'singular',
      selector: fragmentSelector,
      snapshot: environment.lookup(fragmentSelector),
    };
  }
}

// fragmentNode cannot change during the lifetime of the component, though fragmentRef may change.
hook useFragmentInternal_EXPERIMENTAL(
  fragmentNode: ReaderFragment,
  fragmentRef: unknown,
  hookDisplayName: string,
  queryOptions?: FragmentQueryOptions,
): ?SelectorData | Array<?SelectorData> {
  const fragmentSelector = useMemo(
    () => getSelector(fragmentNode, fragmentRef),
    [fragmentNode, fragmentRef],
  );

  const isPlural = fragmentNode?.metadata?.plural === true;

  if (isPlural) {
    invariant(
      fragmentRef == null || Array.isArray(fragmentRef),
      'Relay: Expected fragment pointer%s for fragment `%s` to be ' +
        'an array, instead got `%s`. Remove `@relay(plural: true)` ' +
        'from fragment `%s` to allow the prop to be an object.',
      fragmentNode.name,
      typeof fragmentRef,
      fragmentNode.name,
    );
  } else {
    invariant(
      !Array.isArray(fragmentRef),
      'Relay: Expected fragment pointer%s for fragment `%s` not to be ' +
        'an array, instead got `%s`. Add `@relay(plural: true)` ' +
        'to fragment `%s` to allow the prop to be an array.',
      fragmentNode.name,
      typeof fragmentRef,
      fragmentNode.name,
    );
  }
  invariant(
    fragmentRef == null ||
      (isPlural && Array.isArray(fragmentRef) && fragmentRef.length === 0) ||
      fragmentSelector != null,
    'Relay: Expected to receive an object where `...%s` was spread, ' +
      'but the fragment reference was not found`. This is most ' +
      'likely the result of:\n' +
      "- Forgetting to spread `%s` in `%s`'s parent's fragment.\n" +
      '- Conditionally fetching `%s` but unconditionally passing %s prop ' +
      'to `%s`. If the parent fragment only fetches the fragment conditionally ' +
      '- with e.g. `@include`, `@skip`, or inside a `... on SomeType { }` ' +
      'spread - then the fragment reference will not exist. ' +
      'This issue can generally be fixed by adding `@alias` after `...%s`.\n' +
      'See https://relay.dev/docs/next/guides/alias-directive/',
    fragmentNode.name,
    fragmentNode.name,
    hookDisplayName,
    fragmentNode.name,
    hookDisplayName,
  );

  const environment = useRelayEnvironment();
  let loggerContext;
  if (RelayFeatureFlags.ENABLE_UI_CONTEXT_ON_RELAY_LOGGER) {
    // $FlowFixMe[react-rule-hook] - the condition is static
    // $FlowFixMe[react-rule-hook-conditional]
    loggerContext = useRelayLoggingContext();
  }
  const [_state, setState] = useState<FragmentState>(() =>
    getFragmentState(environment, fragmentSelector),
  );
  let state = _state;
  const previousEnvironment = state.environment;

  if (
    !areEqualSelectors(fragmentSelector, state.selector) ||
    environment !== state.environment
  ) {
    // Enqueue setState to record the new selector and state
    const newState = getFragmentState(environment, fragmentSelector);
    setState(newState);
    // But render with the latest state w/o waiting for the setState. Otherwise
    // the component would render the wrong information temporarily (including
    // possibly incorrectly triggering some warnings below).
    state = newState;
  }

  if (
    RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH &&
    isMissingData(state)
  ) {
    // `state` is a snapshot taken at an earlier store epoch, and the render
    // path has no other way to refresh it: `getFragmentState` above re-reads
    // only when the selector or environment changed, and `handleMissedUpdates`
    // — the only epoch-refreshing read — is reachable only from effects. The
    // recovery branch below suspends by throwing during render, so those
    // effects never run for that render. A recovery refetch that lands while
    // this tree is suspended (or hidden inside a React <Activity>) therefore
    // restores the records without the reader ever seeing them: the retry
    // render still reads `isMissingData`, the once-per-owner marker is already
    // spent, and the fragment renders the partial snapshot that recovery had
    // just repaired.
    //
    // Re-read against the current store before deciding. This converges:
    // `handleMissedUpdates` returns null when the epoch has not advanced, and
    // the state adopted here carries the current epoch, so the next render
    // re-reads nothing. Adopting a state that is still missing is intentional
    // — `handlePotentialSnapshotErrorsForState` below reports
    // `snapshot.fieldErrors`, and those have to describe the read that
    // actually failed rather than a stale one.
    const recoveryReread = handleMissedUpdates(environment, state);
    if (recoveryReread != null) {
      setState(recoveryReread[1]);
      state = recoveryReread[1];
    }
  }

  // The purpose of this is to detect whether we have ever committed, because we
  // don't suspend on store updates, only when the component either is first trying
  // to mount or when the our selector changes. The selector change in particular is
  // how we suspend for pagination and refetch. Also, fragment selector can be null
  // or undefined, so we use false as a special value to distinguish from all fragment
  // selectors; false means that the component hasn't mounted yet.
  const committedFragmentSelectorRef = useRef<false | ?ReaderSelector>(false);
  useEffect(() => {
    committedFragmentSelectorRef.current = fragmentSelector;
  }, [fragmentSelector]);

  // Handle the queries for any missing client edges; this may suspend.
  // FIXME handle client edges in parallel.
  if (
    fragmentNode.metadata?.hasClientEdges === true ||
    RelayFeatureFlags.CHECK_ALL_FRAGMENTS_FOR_MISSING_CLIENT_EDGES
  ) {
    // The fragment is validated to be static (in useFragment) and hasClientEdges is
    // a static (constant) property of the fragment. In practice, this effect will
    // always or never run for a given invocation of this hook.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // $FlowFixMe[react-rule-hook]
    // $FlowFixMe[react-rule-hook-conditional]
    const [clientEdgeQueries, activeRequestPromises] = useMemo(() => {
      const missingClientEdges = getMissingClientEdges(state);
      // eslint-disable-next-line no-shadow
      let clientEdgeQueries;
      const activeRequestPromises: Array<PromiseWithDisplayName> = [];
      if (missingClientEdges?.length) {
        clientEdgeQueries = [] as Array<QueryResult>;
        for (const edge of missingClientEdges) {
          const [queryResult, requestPromise] = handleMissingClientEdge(
            environment,
            fragmentNode,
            fragmentRef,
            edge,
            queryOptions,
          );
          clientEdgeQueries.push(queryResult);
          if (requestPromise != null) {
            activeRequestPromises.push(requestPromise);
          }
        }
      }
      return [clientEdgeQueries, activeRequestPromises];
    }, [state, environment, fragmentNode, fragmentRef, queryOptions]);

    if (activeRequestPromises.length) {
      invariant(fragmentSelector != null, 'refinement, see invariants above');
      const fragmentOwner =
        fragmentSelector.kind === 'PluralReaderSelector'
          ? fragmentSelector.selectors[0].owner
          : fragmentSelector.owner;
      environment.__log({
        name: 'suspense.client_edge',
        fragment: fragmentNode,
        fragmentOwner,
        // $FlowFixMe[react-rule-unsafe-ref]
        isMount: committedFragmentSelectorRef.current === false,
      });
      const allPromises = Promise.all(activeRequestPromises);
      // $FlowExpectedError[prop-missing] Expando to annotate Promises.
      allPromises.displayName = `RelayClientEdge(${activeRequestPromises
        .map(promise => promise.displayName)
        .join(',')})`;
      throw allPromises;
    }

    // See above note
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // $FlowFixMe[react-rule-hook]
    // $FlowFixMe[react-rule-hook-conditional]
    useEffect(() => {
      const QueryResource = getQueryResourceForEnvironment(environment);
      if (clientEdgeQueries?.length) {
        const disposables = [];
        for (const query of clientEdgeQueries) {
          disposables.push(QueryResource.retain(query));
        }
        return () => {
          for (const disposable of disposables) {
            disposable.dispose();
          }
        };
      }
    }, [environment, clientEdgeQueries]);
  }

  if (isMissingData(state)) {
    // Suspend if a Live Resolver within this fragment is in a suspended state:
    const suspendingLiveResolvers = getSuspendingLiveResolver(state);
    if (suspendingLiveResolvers != null && suspendingLiveResolvers.length > 0) {
      invariant(fragmentSelector != null, 'refinement, see invariants above');
      const fragmentOwner =
        fragmentSelector.kind === 'PluralReaderSelector'
          ? fragmentSelector.selectors[0].owner
          : fragmentSelector.owner;
      environment.__log({
        name: 'suspense.resolver',
        fragment: fragmentNode,
        fragmentOwner,
        // $FlowFixMe[react-rule-unsafe-ref]
        isMount: committedFragmentSelectorRef.current === false,
        suspendingLiveResolvers,
      });
      const promise = Promise.all(
        suspendingLiveResolvers.map(liveStateID => {
          // $FlowFixMe[prop-missing] This is expected to be a RelayModernStore
          return environment.getStore().getLiveResolverPromise(liveStateID);
        }),
      );
      // $FlowExpectedError[prop-missing] Expando to annotate Promises.
      promise.displayName = 'RelayLiveResolver(' + fragmentNode.name + ')';
      throw promise;
    }
    // Suspend if an active operation bears on this fragment, either the
    // fragment's owner or some other mutation etc. that could affect it.
    // We only suspend when the component is first trying to mount or changing
    // selectors, not if data becomes missing later:
    if (
      RelayFeatureFlags.ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE ||
      environment !== previousEnvironment ||
      committedFragmentSelectorRef.current === false ||
      // $FlowFixMe[react-rule-unsafe-ref]
      !areEqualSelectors(committedFragmentSelectorRef.current, fragmentSelector)
    ) {
      invariant(fragmentSelector != null, 'refinement, see invariants above');
      const fragmentOwner =
        fragmentSelector.kind === 'PluralReaderSelector'
          ? fragmentSelector.selectors[0].owner
          : fragmentSelector.owner;
      const pendingOperationsResult = getPendingOperationsForFragment(
        environment,
        fragmentNode,
        fragmentOwner,
      );
      if (pendingOperationsResult) {
        environment.__log({
          name: 'suspense.missing_data',
          fragment: fragmentNode,
          fragmentOwner,
          // $FlowFixMe[react-rule-unsafe-ref]
          isMount: committedFragmentSelectorRef.current === false,
          pendingOperations: pendingOperationsResult.pendingOperations,
        });
        throw pendingOperationsResult.promise;
      }
    }
    // A fragment can read missing data with NO pending operation when its
    // records were garbage-collected while unobserved: a React <Activity>
    // route was hidden (its store subscription disposed), the owner query's
    // retain lapsed, GC correctly collected records only that owner reached,
    // and the fragment ref survived in React state. On restore — or on a
    // fresh mount with a surviving ref (Activity may either preserve or
    // remount the hook, so recovery cannot be limited to committed
    // fragments) — the read is partial, and the component would render
    // `undefined` for fields the fragment explicitly fetched, crashing
    // consumers that trust the schema types.
    //
    // When enabled, recover by refetching the fragment's owner query once and
    // suspending on the request instead of rendering the partial snapshot.
    // `force: true` plus a unique QueryResource cache breaker ensure a real
    // network request even when a completed QueryResource entry or a
    // response-cache layer would otherwise short-circuit it. Only query
    // owners are refetched — a mutation or subscription must never
    // re-execute. A per-owner attempt record (per environment) prevents
    // request loops when the refetch itself cannot fill the data; in that
    // case execution falls through to today's partial-render behavior until
    // the attempt's cooldown elapses.
    //
    // Retention of the refetched payload: when the owner query is still
    // mounted (the <Activity> route case) its own retain keeps the data
    // durably; when only the fragment ref survived, the data is held by the
    // prepare() call's temporary retain (a TEMPORARY_RETAIN_DURATION_MS TTL)
    // and is GC-eligible again after it lapses. That is by design — the
    // attempt is released once the data reads back complete (see the else
    // branch below), so a later GC episode simply recovers again with one more
    // request rather than staying broken.
    //
    // For a plural fragment only selectors[0].owner is refetched, matching
    // how the rest of this function attributes a plural read to its first
    // owner.
    if (
      RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH &&
      fragmentSelector != null
    ) {
      const fragmentOwner =
        fragmentSelector.kind === 'PluralReaderSelector'
          ? fragmentSelector.selectors[0].owner
          : fragmentSelector.owner;
      if (fragmentOwner.node.params.operationKind === 'query') {
        const refetchOperation = createOperationDescriptor(
          fragmentOwner.node,
          fragmentOwner.variables,
          {...fragmentOwner.cacheConfig, force: true},
        );
        const activeRequestPromise = getPromiseForActiveRequest(
          environment,
          refetchOperation.request,
        );
        if (activeRequestPromise != null) {
          throw activeRequestPromise;
        }
        // Marking + fetching during render is the same tradeoff QueryResource
        // itself makes (it writes its cache during render): a discarded
        // concurrent render leaves the attempt recorded with its fetch already
        // in flight, which at worst suppresses one later refetch until the
        // cooldown elapses or a data-complete render releases the attempt.
        if (
          markMissingDataRefetch(
            environment,
            fragmentOwner.identifier,
            getReaderKey(fragmentNode.name, fragmentSelector),
          )
        ) {
          const QueryResource = getQueryResourceForEnvironment(environment);
          const cacheBreaker = `missing-data-${nextMissingDataRefetchID++}`;
          QueryResource.prepare(
            refetchOperation,
            fetchQueryInternal(environment, refetchOperation),
            'network-only',
            undefined,
            undefined,
            cacheBreaker,
            undefined,
          );
          // Defensive parity with the activeRequestPromise check above: with
          // an async network, prepare() already throws the pending promise
          // itself, so this only fires if prepare() returned synchronously
          // (e.g. a synchronous network resolved the payload).
          const refetchPromise = getPromiseForActiveRequest(
            environment,
            refetchOperation.request,
          );
          if (refetchPromise != null) {
            throw refetchPromise;
          }
        }
      }
    }
  } else if (
    RelayFeatureFlags.ENABLE_MISSING_DATA_OWNER_REFETCH &&
    fragmentSelector != null
  ) {
    const fragmentOwner =
      fragmentSelector.kind === 'PluralReaderSelector'
        ? fragmentSelector.selectors[0].owner
        : fragmentSelector.owner;
    const refetches = missingDataRefetchesByEnvironment.get(environment);
    const attempt = refetches?.get(fragmentOwner.identifier);
    if (
      refetches != null &&
      attempt != null &&
      fragmentOwner.node.params.operationKind === 'query'
    ) {
      // This branch runs for a fragment whose OWN read is complete, and one
      // query owner is shared by every fragment spread under it. Releasing the
      // attempt on `check(owner)` alone therefore lets a healthy reader disarm
      // a broken one: reader A reads missing and takes an attempt, the
      // response lands, sibling B reads fine and releases it, A re-reads
      // missing and takes a *fresh* attempt — an unbounded refetch loop at
      // network speed.
      //
      // `environment.check()` is not a proxy for "no reader is missing". It
      // walks the normalization AST from the query root and only asks whether
      // records exist, while a reader walks one fragment's AST from the record
      // its pointer captured and additionally applies @required, client
      // resolvers, and missing_expected_data. A query can report 'available'
      // while a fragment under it reads missing — and 'stale' can even be
      // returned for an unretained owner whose data is genuinely absent. So
      // the still-missing readers are tracked explicitly rather than inferred,
      // and `check` is kept only as a secondary, conservative gate.
      //
      // Releasing at all still matters: a store-wide invalidation leaves data
      // present but 'stale', and consecutive episodes must each be able to
      // recover. Over-conservatism is survivable now that an attempt also
      // expires on its own after MISSING_DATA_REFETCH_COOLDOWN_MS.
      attempt.missingReaders.delete(
        getReaderKey(fragmentNode.name, fragmentSelector),
      );
      if (attempt.missingReaders.size === 0) {
        const ownerOperation = createOperationDescriptor(
          fragmentOwner.node,
          fragmentOwner.variables,
          fragmentOwner.cacheConfig,
        );
        if (environment.check(ownerOperation).status !== 'missing') {
          refetches.delete(fragmentOwner.identifier);
        }
      }
    }
  }

  // Report required fields only if we're not suspending, since that means
  // they're missing even though we are out of options for possibly fetching them:
  handlePotentialSnapshotErrorsForState(environment, state, loggerContext);

  // We emulate CRUD effects using a ref and two effects:
  // - The ref tracks the current state (including updates from the subscription)
  //   and the dispose function for the current subscription. This is null until
  //   a subscription is established.
  // - The first effect is the "update" effect, and re-runs when the environment
  //   or state changes. It is responsible for disposing of the previous subscription
  //   and establishing a new one, but it manualy reconciles the current state
  //   with the subscribed state and bails out if it is already subscribed to the
  //   correct (current) state.
  // - The second effect is the mount/unmount (and attach/reattach effect). It
  //   makes sure that the subscription is disposed when the component unmounts
  //   or detaches (<Activity> going hidden), and then re-subscribes when the component
  //   re-attaches (<Activity> going visible). These cases wouldn't fire the
  //   "update" effect because the state and environment don't change.
  const storeSubscriptionRef = useRef<
    | {
        kind: 'initialized',
        dispose: () => void,
        selector: ?ReaderSelector,
        environment: IEnvironment,
      }
    | {kind: 'missed-updates'}
    | {kind: 'uninitialized'},
  >({kind: 'uninitialized'});
  // $FlowFixMe[react-rule-hook] - the condition is static
  useEffect(() => {
    const storeSubscription = storeSubscriptionRef.current;
    if (storeSubscription.kind === 'initialized') {
      if (
        state.environment === storeSubscription.environment &&
        state.selector === storeSubscription.selector
      ) {
        // We're already subscribed to the same selector, so no need to do anything
        return;
      } else {
        // The selector has changed, so we need to dispose of the previous subscription
        storeSubscription.dispose();
        storeSubscriptionRef.current = {kind: 'uninitialized'};
      }
    }
    if (state.kind === 'bailout') {
      return;
    }
    // The FragmentState that we'll actually subscribe to. Note that it's possible that
    // a concurrent modification to the store didn't affect the snapshot _data_ (so we don't
    // need to re-render), but did affect the seen records. So if there were missed updates
    // we use that state to subscribe.
    let stateForSubscription: FragmentState = state;
    // No subscription yet or the selector has changed, so we need to subscribe
    // first check for updates since the state was rendered
    const updates = handleMissedUpdates(state.environment, state);
    if (updates !== null) {
      const [didMissUpdates, updatedState] = updates;
      // TODO: didMissUpdates only checks for changes to snapshot data, but it's possible
      // that other snapshot properties may have changed that should also trigger a re-render,
      // such as changed missing resolver fields, missing client edges, etc.
      // A potential alternative is for handleMissedUpdates() to recycle the entire state
      // value, and return the new (recycled) state only if there was some change. In that
      // case the code would always setState if something in the snapshot changed, in addition
      // to using the latest snapshot to subscribe.
      if (didMissUpdates) {
        setState(updatedState);
        storeSubscriptionRef.current = {kind: 'missed-updates'};
        // We missed updates, we're going to render again anyway so wait until then to subscribe
        // Setting the ref to kind: missed-updates ensures the second useEffect (simulating the
        // setup/teardown part of the crud effect) will not set up the subscription w the stale
        // state
        return;
      }
      stateForSubscription = updatedState;
    }
    const dispose = subscribeToSnapshot(
      state.environment,
      stateForSubscription,
      setState,
    );
    storeSubscriptionRef.current = {
      dispose,
      environment: state.environment,
      kind: 'initialized',
      selector: state.selector,
    };
  }, [state]);
  // $FlowFixMe[react-rule-hook] - the condition is static
  useEffect(() => {
    if (
      storeSubscriptionRef.current.kind === 'uninitialized' &&
      state.kind !== 'bailout'
    ) {
      const dispose = subscribeToSnapshot(state.environment, state, setState);
      storeSubscriptionRef.current = {
        dispose,
        environment: state.environment,
        kind: 'initialized',
        selector: state.selector,
      };
    }
    return () => {
      if (storeSubscriptionRef.current.kind === 'initialized') {
        storeSubscriptionRef.current.dispose();
      }
      storeSubscriptionRef.current = {kind: 'uninitialized'};
    };
    // NOTE: this intentionally has no dependencies, see above comment about
    // simulating a CRUD effect
  }, []);

  let data: ?SelectorData | Array<?SelectorData>;
  if (isPlural) {
    // Plural fragments require allocating an array of the snapshot data values,
    // which has to be memoized to avoid triggering downstream re-renders.
    //
    // Note that isPlural is a constant property of the fragment and does not change
    // for a particular useFragment invocation site
    const fragmentRefIsNullish = fragmentRef == null; // for less sensitive memoization
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // $FlowFixMe[react-rule-hook]
    // $FlowFixMe[react-rule-hook-conditional]
    data = useMemo(() => {
      if (state.kind === 'bailout') {
        // Bailout state can happen if the fragmentRef is a plural array that is empty or has no
        // non-null entries. In that case, the compatible behavior is to return [] instead of null.
        return fragmentRefIsNullish ? null : [];
      } else {
        invariant(
          state.kind === 'plural',
          'Expected state to be plural because fragment is plural',
        );
        return state.snapshots.map(s => s.data);
      }
    }, [state, fragmentRefIsNullish]);
  } else if (state.kind === 'bailout') {
    // This case doesn't allocate a new object so it doesn't have to be memoized
    data = null;
  } else {
    // This case doesn't allocate a new object so it doesn't have to be memoized
    invariant(
      state.kind === 'singular',
      'Expected state to be singular because fragment is singular',
    );
    data = state.snapshot.data;
  }

  if (RelayFeatureFlags.LOG_MISSING_RECORDS_IN_PROD || __DEV__) {
    if (
      fragmentRef != null &&
      (data === undefined ||
        (Array.isArray(data) &&
          data.length > 0 &&
          data.every(d => d === undefined)))
    ) {
      warning(
        false,
        'Relay: Expected to have been able to read non-null data for ' +
          'fragment `%s` declared in ' +
          '`%s`, since fragment reference was non-null. ' +
          "Make sure that that `%s`'s parent isn't " +
          'holding on to and/or passing a fragment reference for data that ' +
          'has been deleted.',
        fragmentNode.name,
        hookDisplayName,
        hookDisplayName,
      );
    }
  }

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // $FlowFixMe[react-rule-hook]
    // $FlowFixMe[react-rule-hook-conditional]
    useDebugValue({data, fragment: fragmentNode.name});
  }

  return data;
}

module.exports = useFragmentInternal_EXPERIMENTAL;
