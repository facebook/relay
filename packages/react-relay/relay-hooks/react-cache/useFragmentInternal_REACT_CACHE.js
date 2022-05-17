/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {
  CacheConfig,
  FetchPolicy,
  IEnvironment,
  ReaderFragment,
  ReaderSelector,
  SelectorData,
  Snapshot,
} from 'relay-runtime';
import type {MissingClientEdgeRequestInfo} from 'relay-runtime/store/RelayStoreTypes';

const useRelayEnvironment = require('../useRelayEnvironment');
const getQueryResultOrFetchQuery = require('./getQueryResultOrFetchQuery_REACT_CACHE');
const invariant = require('invariant');
const {useDebugValue, useEffect, useMemo, useRef, useState} = require('react');
const {
  areEqualSelectors,
  createOperationDescriptor,
  getPendingOperationsForFragment,
  getSelector,
  getVariablesFromFragment,
  handlePotentialSnapshotErrors,
  recycleNodesInto,
} = require('relay-runtime');
const warning = require('warning');

type FragmentQueryOptions = {|
  fetchPolicy?: FetchPolicy,
  networkCacheConfig?: ?CacheConfig,
|};

type FragmentState = $ReadOnly<
  | {|kind: 'bailout', plural: boolean|}
  | {|kind: 'singular', snapshot: Snapshot, epoch: number|}
  | {|kind: 'plural', snapshots: $ReadOnlyArray<Snapshot>, epoch: number|},
>;

type StateUpdater<T> = (T | (T => T)) => void;
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

function getMissingClientEdges(
  state: FragmentState,
): $ReadOnlyArray<MissingClientEdgeRequestInfo> | null {
  if (state.kind === 'bailout') {
    return null;
  } else if (state.kind === 'singular') {
    return state.snapshot.missingClientEdges ?? null;
  } else {
    let edges = null;
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

function handlePotentialSnapshotErrorsForState(
  environment: IEnvironment,
  state: FragmentState,
): void {
  if (state.kind === 'singular') {
    handlePotentialSnapshotErrors(
      environment,
      state.snapshot.missingRequiredFields,
      state.snapshot.relayResolverErrors,
    );
  } else if (state.kind === 'plural') {
    for (const snapshot of state.snapshots) {
      handlePotentialSnapshotErrors(
        environment,
        snapshot.missingRequiredFields,
        snapshot.relayResolverErrors,
      );
    }
  }
}

function handleMissedUpdates(
  environment: IEnvironment,
  state: FragmentState,
  setState: StateUpdater<FragmentState>,
): void {
  if (state.kind === 'bailout') {
    return;
  }
  // FIXME this is invalid if we've just switched environments.
  const currentEpoch = environment.getStore().getEpoch();
  if (currentEpoch === state.epoch) {
    return;
  }
  // The store has updated since we rendered (without us being subscribed yet),
  // so check for any updates to the data we're rendering:
  if (state.kind === 'singular') {
    const currentSnapshot = environment.lookup(state.snapshot.selector);
    const updatedData = recycleNodesInto(
      state.snapshot.data,
      currentSnapshot.data,
    );
    if (updatedData !== state.snapshot.data) {
      setState({
        kind: 'singular',
        snapshot: currentSnapshot,
        epoch: currentEpoch,
      });
    }
  } else {
    let updates = null;
    for (let index = 0; index < state.snapshots.length; index++) {
      const snapshot = state.snapshots[index];
      const currentSnapshot = environment.lookup(snapshot.selector);
      const updatedData = recycleNodesInto(snapshot.data, currentSnapshot.data);
      if (updatedData !== snapshot.data) {
        updates =
          updates === null ? new Array(state.snapshots.length) : updates;
        updates[index] = snapshot;
      }
    }
    if (updates !== null) {
      const theUpdates = updates; // preserve flow refinement.
      setState(existing => {
        invariant(
          existing.kind === 'plural',
          'Cannot go from singular to plural or from bailout to plural.',
        );
        const updated = [...existing.snapshots];
        for (let index = 0; index < theUpdates.length; index++) {
          const updatedSnapshot = theUpdates[index];
          if (updatedSnapshot) {
            updated[index] = updatedSnapshot;
          }
        }
        return {kind: 'plural', snapshots: updated, epoch: currentEpoch};
      });
    }
  }
}

function handleMissingClientEdge(
  environment: IEnvironment,
  parentFragmentNode: ReaderFragment,
  parentFragmentRef: mixed,
  missingClientEdgeRequestInfo: MissingClientEdgeRequestInfo,
  queryOptions?: FragmentQueryOptions,
): () => () => void {
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
  // according to the component mount/suspense cycle; getQueryResultOrFetchQuery
  // already handles this by itself.
  const [_, effect] = getQueryResultOrFetchQuery(
    environment,
    queryOperationDescriptor,
    {
      fetchPolicy: queryOptions?.fetchPolicy,
    },
  );
  return effect;
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
      setState(_ => ({
        kind: 'singular',
        snapshot: latestSnapshot,
        epoch: environment.getStore().getEpoch(),
      }));
    });
    return () => {
      disposable.dispose();
    };
  } else {
    const disposables = state.snapshots.map((snapshot, index) =>
      environment.subscribe(snapshot, latestSnapshot => {
        setState(existing => {
          invariant(
            existing.kind === 'plural',
            'Cannot go from singular to plural or from bailout to plural.',
          );
          const updated = [...existing.snapshots];
          updated[index] = latestSnapshot;
          return {
            kind: 'plural',
            snapshots: updated,
            epoch: environment.getStore().getEpoch(),
          };
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
  isPlural: boolean,
): FragmentState {
  if (fragmentSelector == null) {
    return {kind: 'bailout', plural: isPlural};
  } else if (fragmentSelector.kind === 'PluralReaderSelector') {
    return {
      kind: 'plural',
      snapshots: fragmentSelector.selectors.map(s => environment.lookup(s)),
      epoch: environment.getStore().getEpoch(),
    };
  } else {
    return {
      kind: 'singular',
      snapshot: environment.lookup(fragmentSelector),
      epoch: environment.getStore().getEpoch(),
    };
  }
}

// fragmentNode cannot change during the lifetime of the component, though fragmentRef may change.
function useFragmentInternal_REACT_CACHE(
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
  hookDisplayName: string,
  queryOptions?: FragmentQueryOptions,
  fragmentKey?: string,
): {|
  data: ?SelectorData | Array<?SelectorData>,
  disableStoreUpdates: () => void,
  enableStoreUpdates: () => void,
|} {
  const fragmentSelector = getSelector(fragmentNode, fragmentRef);

  const isPlural = fragmentNode?.metadata?.plural === true;

  if (isPlural) {
    invariant(
      Array.isArray(fragmentRef),
      'Relay: Expected fragment pointer%s for fragment `%s` to be ' +
        'an array, instead got `%s`. Remove `@relay(plural: true)` ' +
        'from fragment `%s` to allow the prop to be an object.',
      fragmentKey != null ? ` for key \`${fragmentKey}\`` : '',
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
      fragmentKey != null ? ` for key \`${fragmentKey}\`` : '',
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
      'spread  - then the fragment reference will not exist. ' +
      'In this case, pass `null` if the conditions for evaluating the ' +
      'fragment are not met (e.g. if the `@include(if)` value is false.)',
    fragmentNode.name,
    fragmentNode.name,
    hookDisplayName,
    fragmentNode.name,
    fragmentKey == null ? 'a fragment reference' : `the \`${fragmentKey}\``,
    hookDisplayName,
  );

  const environment = useRelayEnvironment();
  const [rawState, setState] = useState<FragmentState>(() =>
    getFragmentState(environment, fragmentSelector, isPlural),
  );
  // On second look this separate rawState may not be needed at all, it can just be
  // put into getFragmentState. Exception: can we properly handle the case where the
  // fragmentRef goes from non-null to null?
  const stateFromRawState = state => {
    if (fragmentRef == null) {
      return {kind: 'bailout', plural: false};
    } else if (state.kind === 'plural' && state.snapshots.length === 0) {
      return {kind: 'bailout', plural: true};
    } else {
      return state;
    }
  };
  const state = stateFromRawState(rawState);

  // This copy of the state we only update when something requires us to
  // unsubscribe and re-subscribe, namely a changed environment or
  // fragment selector.
  const [rawSubscribedState, setSubscribedState] = useState(state);
  // FIXME since this is used as an effect dependency, it needs to be memoized.
  const subscribedState = stateFromRawState(rawSubscribedState);

  const [previousFragmentSelector, setPreviousFragmentSelector] =
    useState(fragmentSelector);
  const [previousEnvironment, setPreviousEnvironment] = useState(environment);
  if (
    !areEqualSelectors(fragmentSelector, previousFragmentSelector) ||
    environment !== previousEnvironment
  ) {
    setPreviousFragmentSelector(fragmentSelector);
    setPreviousEnvironment(environment);
    const newState = getFragmentState(environment, fragmentSelector, isPlural);
    setState(newState);
    setSubscribedState(newState); // This causes us to form a new subscription
  }

  // Handle the queries for any missing client edges; this may suspend.
  // FIXME handle client edges in parallel.
  const missingClientEdges = getMissingClientEdges(state);
  let effects;
  if (missingClientEdges?.length) {
    effects = [];
    for (const edge of missingClientEdges) {
      effects.push(
        handleMissingClientEdge(
          environment,
          fragmentNode,
          fragmentRef,
          edge,
          queryOptions,
        ),
      );
    }
  }

  useEffect(() => {
    if (effects?.length) {
      const cleanups = [];
      for (const effect of effects) {
        cleanups.push(effect());
      }
      return () => {
        for (const cleanup of cleanups) {
          cleanup();
        }
      };
    }
  });

  if (isMissingData(state)) {
    // Suspend if an active operation bears on this fragment, either the
    // fragment's owner or some other mutation etc. that could affect it:
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
      throw pendingOperationsResult.promise;
    }
    // Report required fields only if we're not suspending, since that means
    // they're missing even though we are out of options for possibly fetching them:
    handlePotentialSnapshotErrorsForState(environment, state);
  }

  // Subscriptions:
  const isListeningForUpdatesRef = useRef(true);
  function enableStoreUpdates() {
    isListeningForUpdatesRef.current = true;
    handleMissedUpdates(environment, state, setState);
  }
  function disableStoreUpdates() {
    isListeningForUpdatesRef.current = false;
  }

  useEffect(() => {
    handleMissedUpdates(environment, subscribedState, setState);
    return subscribeToSnapshot(environment, subscribedState, updater => {
      if (isListeningForUpdatesRef.current) {
        setState(latestState => {
          if (
            latestState.snapshot?.selector !==
            subscribedState.snapshot?.selector
          ) {
            // Ignore updates to the subscription if it's for a previous fragment selector
            // than the latest one to be rendered. This can happen if the store is updated
            // after we re-render with a new fragmentRef prop but before the effect fires
            // in which we unsubscribe to the old one and subscribe to the new one.
            // (NB: it's safe to compare the selectors by reference because the selector
            // is recycled into new snapshots.)
            return latestState;
          } else {
            return updater(latestState);
          }
        });
      }
    });
  }, [environment, subscribedState]);

  const data = useMemo(
    () =>
      state.kind === 'bailout'
        ? state.plural
          ? []
          : null
        : state.kind === 'singular'
        ? state.snapshot.data
        : state.snapshots.map(s => s.data),
    [state],
  );

  if (__DEV__) {
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
    useDebugValue({fragment: fragmentNode.name, data});
  }

  return {
    data,
    disableStoreUpdates,
    enableStoreUpdates,
  };
}

module.exports = useFragmentInternal_REACT_CACHE;
