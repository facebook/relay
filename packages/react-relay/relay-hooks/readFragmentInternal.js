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
  FetchPolicy,
  IEnvironment,
  ReaderFragment,
  ReaderSelector,
  SelectorData,
  Snapshot,
} from 'relay-runtime';
import type {MissingClientEdgeRequestInfo} from 'relay-runtime/store/RelayStoreTypes';

const {getQueryResourceForEnvironment} = require('./QueryResource');
const invariant = require('invariant');
const {
  __internal: {fetchQuery: fetchQueryInternal},
  RelayFeatureFlags,
  createOperationDescriptor,
  getPendingOperationsForFragment,
  getSelector,
  getVariablesFromFragment,
  handlePotentialSnapshotErrors,
} = require('relay-runtime');
const warning = require('warning');

type FragmentQueryOptions = {
  fetchPolicy?: FetchPolicy,
  networkCacheConfig?: ?CacheConfig,
};

type FragmentState = $ReadOnly<
  | {kind: 'bailout'}
  | {kind: 'singular', snapshot: Snapshot, epoch: number}
  | {kind: 'plural', snapshots: $ReadOnlyArray<Snapshot>, epoch: number},
>;

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

function handlePotentialSnapshotErrorsForState(
  environment: IEnvironment,
  state: FragmentState,
): void {
  if (state.kind === 'singular') {
    handlePotentialSnapshotErrors(
      environment,
      state.snapshot.errorResponseFields,
    );
  } else if (state.kind === 'plural') {
    for (const snapshot of state.snapshots) {
      handlePotentialSnapshotErrors(environment, snapshot.errorResponseFields);
    }
  }
}

function handleMissingClientEdge(
  environment: IEnvironment,
  parentFragmentNode: ReaderFragment,
  parentFragmentRef: mixed,
  missingClientEdgeRequestInfo: MissingClientEdgeRequestInfo,
  queryOptions?: FragmentQueryOptions,
): QueryResult {
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
  return QueryResource.prepare(
    queryOperationDescriptor,
    fetchQueryInternal(environment, queryOperationDescriptor),
    queryOptions?.fetchPolicy,
  );
}

function getFragmentState(
  environment: IEnvironment,
  fragmentSelector: ?ReaderSelector,
): FragmentState {
  if (fragmentSelector == null) {
    return {kind: 'bailout'};
  } else if (fragmentSelector.kind === 'PluralReaderSelector') {
    if (fragmentSelector.selectors.length === 0) {
      return {kind: 'bailout'};
    } else {
      return {
        kind: 'plural',
        snapshots: fragmentSelector.selectors.map(s => environment.lookup(s)),
        epoch: environment.getStore().getEpoch(),
      };
    }
  } else {
    return {
      kind: 'singular',
      snapshot: environment.lookup(fragmentSelector),
      epoch: environment.getStore().getEpoch(),
    };
  }
}

// fragmentNode cannot change during the lifetime of the component, though fragmentRef may change.
function readFragmentInternal(
  environment: IEnvironment,
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
  hookDisplayName: string,
  queryOptions?: FragmentQueryOptions,
  fragmentKey?: string,
): {
  +data: ?SelectorData | Array<?SelectorData>,
  +clientEdgeQueries: ?Array<QueryResult>,
} {
  const fragmentSelector = getSelector(fragmentNode, fragmentRef);
  const isPlural = fragmentNode?.metadata?.plural === true;

  if (isPlural) {
    invariant(
      fragmentRef == null || Array.isArray(fragmentRef),
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

  const state = getFragmentState(environment, fragmentSelector);

  // Handle the queries for any missing client edges; this may suspend.
  // FIXME handle client edges in parallel.
  let clientEdgeQueries = null;
  if (fragmentNode.metadata?.hasClientEdges === true) {
    const missingClientEdges = getMissingClientEdges(state);
    if (missingClientEdges?.length) {
      clientEdgeQueries = ([]: Array<QueryResult>);
      for (const edge of missingClientEdges) {
        clientEdgeQueries.push(
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
  }

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

  let data: ?SelectorData | Array<?SelectorData>;
  if (state.kind === 'bailout') {
    data = isPlural ? [] : null;
  } else if (state.kind === 'singular') {
    data = state.snapshot.data;
  } else {
    data = state.snapshots.map(s => s.data);
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

  return {data, clientEdgeQueries};
}

module.exports = readFragmentInternal;
