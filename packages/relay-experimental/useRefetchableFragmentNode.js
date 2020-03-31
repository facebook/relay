/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const ProfilerContext = require('./ProfilerContext');
// flowlint untyped-import:off
const Scheduler = require('scheduler');

// flowlint untyped-import:error

const getRefetchMetadata = require('./getRefetchMetadata');
const getValueAtPath = require('./getValueAtPath');
const invariant = require('invariant');
const useFetchTrackingRef = require('./useFetchTrackingRef');
const useFragmentNode = require('./useFragmentNode');
const useIsMountedRef = require('./useIsMountedRef');
const useMemoVariables = require('./useMemoVariables');
const useRelayEnvironment = require('./useRelayEnvironment');
const warning = require('warning');

const {getFragmentResourceForEnvironment} = require('./FragmentResource');
const {getQueryResourceForEnvironment} = require('./QueryResource');
const {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} = require('react');
const {
  __internal: {fetchQuery},
  createOperationDescriptor,
  getFragmentIdentifier,
  getSelector,
} = require('relay-runtime');

import type {
  Disposable,
  FetchPolicy,
  IEnvironment,
  OperationType,
  ReaderFragment,
  RenderPolicy,
  Variables,
} from 'relay-runtime';

export type RefetchFn<
  TQuery: OperationType,
  TOptions = Options,
> = RefetchFnExact<TQuery, TOptions>;

// NOTE: RefetchFnDynamic returns a refetch function that:
//  - Expects the /exact/ set of query variables if the provided key type is
//    /nullable/.
//  - Or, expects /a subset/ of the query variables if the provided key type is
//    /non-null/.
// prettier-ignore
export type RefetchFnDynamic<
  TQuery: OperationType,
  TKey: ?{ +$data?: mixed, ... },
  TOptions = Options,
> = $Call<
  & (( { +$data?: mixed, ... }) => RefetchFnInexact<TQuery, TOptions>)
  & ((?{ +$data?: mixed, ... }) => RefetchFnExact<TQuery, TOptions>),
  TKey
>;

export type ReturnType<
  TQuery: OperationType,
  TKey: ?{+$data?: mixed, ...},
  TOptions = Options,
> = {|
  fragmentData: mixed,
  fragmentRef: mixed,
  refetch: RefetchFnDynamic<TQuery, TKey, TOptions>,
  disableStoreUpdates: () => void,
  enableStoreUpdates: () => void,
|};

export type Options = {|
  fetchPolicy?: FetchPolicy,
  onComplete?: (Error | null) => void,
  UNSTABLE_renderPolicy?: RenderPolicy,
|};

type InternalOptions = {|
  ...Options,
  __environment?: IEnvironment,
|};

type RefetchFnBase<TVars, TOptions> = (
  vars: TVars,
  options?: TOptions,
) => Disposable;

type RefetchFnExact<TQuery: OperationType, TOptions = Options> = RefetchFnBase<
  $ElementType<TQuery, 'variables'>,
  TOptions,
>;
type RefetchFnInexact<
  TQuery: OperationType,
  TOptions = Options,
> = RefetchFnBase<$Shape<$ElementType<TQuery, 'variables'>>, TOptions>;

type Action =
  | {|
      type: 'reset',
      environment: IEnvironment,
      fragmentIdentifier: string,
    |}
  | {|
      type: 'refetch',
      refetchVariables: Variables,
      fetchPolicy?: FetchPolicy,
      renderPolicy?: RenderPolicy,
      onComplete?: (Error | null) => void,
      environment: ?IEnvironment,
    |};

type RefetchState = {|
  fetchPolicy: FetchPolicy | void,
  renderPolicy: RenderPolicy | void,
  mirroredEnvironment: IEnvironment,
  mirroredFragmentIdentifier: string,
  onComplete: ((Error | null) => void) | void,
  refetchEnvironment?: ?IEnvironment,
  refetchVariables: Variables | null,
|};

type DebugIDandTypename = {
  id: string,
  typename: string,
  ...
};

function reducer(state: RefetchState, action: Action): RefetchState {
  switch (action.type) {
    case 'refetch': {
      return {
        ...state,
        refetchVariables: action.refetchVariables,
        fetchPolicy: action.fetchPolicy,
        renderPolicy: action.renderPolicy,
        onComplete: action.onComplete,
        refetchEnvironment: action.environment,
        mirroredEnvironment: action.environment ?? state.mirroredEnvironment,
      };
    }
    case 'reset': {
      return {
        fetchPolicy: undefined,
        renderPolicy: undefined,
        onComplete: undefined,
        refetchVariables: null,
        mirroredEnvironment: action.environment,
        mirroredFragmentIdentifier: action.fragmentIdentifier,
      };
    }
    default: {
      (action.type: empty);
      throw new Error('useRefetchableFragmentNode: Unexpected action type');
    }
  }
}

function useRefetchableFragmentNode<
  TQuery: OperationType,
  TKey: ?{+$data?: mixed, ...},
>(
  fragmentNode: ReaderFragment,
  parentFragmentRef: mixed,
  componentDisplayName: string,
): ReturnType<TQuery, TKey, InternalOptions> {
  const parentEnvironment = useRelayEnvironment();
  const {refetchableRequest, fragmentRefPathInResponse} = getRefetchMetadata(
    fragmentNode,
    componentDisplayName,
  );
  const fragmentIdentifier = getFragmentIdentifier(
    fragmentNode,
    parentFragmentRef,
  );

  const [refetchState, dispatch] = useReducer(reducer, {
    fetchPolicy: undefined,
    renderPolicy: undefined,
    onComplete: undefined,
    refetchVariables: null,
    refetchEnvironment: null,
    mirroredEnvironment: parentEnvironment,
    mirroredFragmentIdentifier: fragmentIdentifier,
  });
  const {startFetch, disposeFetch, completeFetch} = useFetchTrackingRef();
  const refetchGenerationRef = useRef(0);
  const {
    refetchVariables,
    refetchEnvironment,
    fetchPolicy,
    renderPolicy,
    onComplete,
    mirroredEnvironment,
    mirroredFragmentIdentifier,
  } = refetchState;
  const environment = refetchEnvironment ?? parentEnvironment;

  const QueryResource = getQueryResourceForEnvironment(environment);
  const profilerContext = useContext(ProfilerContext);

  const shouldReset =
    environment !== mirroredEnvironment ||
    fragmentIdentifier !== mirroredFragmentIdentifier;
  const [memoRefetchVariables] = useMemoVariables(refetchVariables);
  const refetchQuery = useMemo(
    () =>
      memoRefetchVariables != null
        ? createOperationDescriptor(refetchableRequest, memoRefetchVariables)
        : null,
    [memoRefetchVariables, refetchableRequest],
  );

  let refetchedQueryResult;
  let fragmentRef = parentFragmentRef;
  if (shouldReset) {
    dispatch({
      type: 'reset',
      environment,
      fragmentIdentifier,
    });
  } else if (refetchQuery != null) {
    // check __typename/id is consistent if refetch existing data on Node
    let debugPreviousIDAndTypename: ?DebugIDandTypename;
    if (__DEV__) {
      debugPreviousIDAndTypename = debugFunctions.getInitialIDAndType(
        memoRefetchVariables,
        fragmentRefPathInResponse,
        environment,
      );
    }

    // If refetch has been called, we read/fetch the refetch query here. If
    // the refetch query hasn't been fetched or isn't cached, we will suspend
    // at this point.
    const [queryResult, queryData] = readQuery(
      environment,
      refetchQuery,
      fetchPolicy,
      renderPolicy,
      refetchGenerationRef.current ?? 0,
      componentDisplayName,
      {
        start: startFetch,
        complete: maybeError => {
          completeFetch();
          onComplete && onComplete(maybeError ?? null);

          if (__DEV__) {
            if (!maybeError) {
              debugFunctions.checkSameTypeAfterRefetch(
                debugPreviousIDAndTypename,
                environment,
                fragmentNode,
                componentDisplayName,
              );
            }
          }
        },
      },
      profilerContext,
    );
    refetchedQueryResult = queryResult;
    // After reading/fetching the refetch query, we extract from the
    // refetch query response the new fragment ref we need to use to read
    // the fragment. The new fragment ref will point to the refetch query
    // as its fragment owner.
    const refetchedFragmentRef = getValueAtPath(
      queryData,
      fragmentRefPathInResponse,
    );
    fragmentRef = refetchedFragmentRef;

    if (__DEV__) {
      debugFunctions.checkSameIDAfterRefetch(
        debugPreviousIDAndTypename,
        fragmentRef,
        fragmentNode,
        componentDisplayName,
      );
    }
  }

  // We read and subscribe to the fragment using useFragmentNode.
  // If refetch was called, we read the fragment using the new computed
  // fragment ref from the refetch query response; otherwise, we use the
  // fragment ref passed by the caller as normal.
  const {
    data: fragmentData,
    disableStoreUpdates,
    enableStoreUpdates,
  } = useFragmentNode<mixed>(fragmentNode, fragmentRef, componentDisplayName);

  useEffect(() => {
    // Retain the refetch query if it was fetched and release it
    // in the useEffect cleanup.
    const queryDisposable =
      refetchedQueryResult != null
        ? QueryResource.retain(refetchedQueryResult, profilerContext)
        : null;

    return () => {
      if (queryDisposable) {
        queryDisposable.dispose();
      }
    };
    // NOTE: We disable react-hooks-deps warning because
    // refetchedQueryResult is captured by including refetchQuery, which is
    // already capturing if the query or variables changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [QueryResource, fragmentIdentifier, refetchQuery]);

  const refetch = useRefetchFunction<TQuery>(
    fragmentNode,
    parentFragmentRef,
    fragmentIdentifier,
    fragmentRefPathInResponse,
    fragmentData,
    refetchGenerationRef,
    dispatch,
    disposeFetch,
    componentDisplayName,
  );
  return {
    fragmentData,
    fragmentRef,
    refetch,
    disableStoreUpdates,
    enableStoreUpdates,
  };
}

function useRefetchFunction<TQuery: OperationType>(
  fragmentNode,
  parentFragmentRef,
  fragmentIdentifier,
  fragmentRefPathInResponse,
  fragmentData,
  refetchGenerationRef,
  dispatch,
  disposeFetch,
  componentDisplayName,
): RefetchFn<TQuery, InternalOptions> {
  const isMountedRef = useIsMountedRef();
  // $FlowFixMe
  const dataID = fragmentData?.id;

  return useCallback(
    (providedRefetchVariables, options) => {
      // Bail out and warn if we're trying to refetch after the component
      // has unmounted
      if (isMountedRef.current !== true) {
        warning(
          false,
          'Relay: Unexpected call to `refetch` on unmounted component for fragment ' +
            '`%s` in `%s`. It looks like some instances of your component are ' +
            'still trying to fetch data but they already unmounted. ' +
            'Please make sure you clear all timers, intervals, ' +
            'async calls, etc that may trigger a fetch.',
          fragmentNode.name,
          componentDisplayName,
        );
        return {dispose: () => {}};
      }
      if (
        Scheduler.unstable_getCurrentPriorityLevel() <
        Scheduler.unstable_NormalPriority
      ) {
        warning(
          false,
          'Relay: Unexpected call to `refetch` at a priority higher than ' +
            'expected on fragment `%s` in `%s`. It looks like you tried to ' +
            'call `refetch` under a high priority update, but updates that ' +
            'can cause the component to suspend should be scheduled at ' +
            'normal priority. Make sure you are calling `refetch` inside ' +
            '`startTransition()` from the `useSuspenseTransition()` hook.',
          fragmentNode.name,
          componentDisplayName,
        );
      }
      if (parentFragmentRef == null) {
        warning(
          false,
          'Relay: Unexpected call to `refetch` while using a null fragment ref ' +
            'for fragment `%s` in `%s`. When calling `refetch`, we expect ' +
            "initial fragment data to be non-null. Please make sure you're " +
            'passing a valid fragment ref to `%s` before calling ' +
            '`refetch`, or make sure you pass all required variables to `refetch`.',
          fragmentNode.name,
          componentDisplayName,
          componentDisplayName,
        );
      }
      refetchGenerationRef.current = (refetchGenerationRef.current ?? 0) + 1;

      const environment = options?.__environment;
      const fetchPolicy = options?.fetchPolicy;
      const renderPolicy = options?.UNSTABLE_renderPolicy;
      const onComplete = options?.onComplete;
      const fragmentSelector = getSelector(fragmentNode, parentFragmentRef);
      let parentVariables;
      let fragmentVariables;
      if (fragmentSelector == null) {
        parentVariables = {};
        fragmentVariables = {};
      } else if (fragmentSelector.kind === 'PluralReaderSelector') {
        parentVariables = fragmentSelector.selectors[0]?.owner.variables ?? {};
        fragmentVariables = fragmentSelector.selectors[0]?.variables ?? {};
      } else {
        parentVariables = fragmentSelector.owner.variables;
        fragmentVariables = fragmentSelector.variables;
      }

      // NOTE: A user of `useRefetchableFragment()` may pass a subset of
      // all variables required by the fragment when calling `refetch()`.
      // We fill in any variables not passed by the call to `refetch()` with the
      // variables from the original parent fragment owner.
      const refetchVariables = {
        ...parentVariables,
        /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
         * Flow v0.111.0 was deployed. To see the error, delete this comment
         * and run Flow. */
        ...fragmentVariables,
        ...providedRefetchVariables,
      };
      // TODO (T40777961): Tweak output of @refetchable transform to more
      // easily tell if we need an $id in the refetch vars
      if (
        fragmentRefPathInResponse.includes('node') &&
        !providedRefetchVariables.hasOwnProperty('id')
      ) {
        // @refetchable fragments are guaranteed to have an `id` selection
        // if the type is Node or implements Node. Double-check that there
        // actually is a value at runtime.
        if (typeof dataID !== 'string') {
          warning(
            false,
            'Relay: Expected result to have a string  ' +
              '`id` in order to refetch, got `%s`.',
            dataID,
          );
        }
        refetchVariables.id = dataID;
      }

      dispatch({
        type: 'refetch',
        refetchVariables,
        fetchPolicy,
        renderPolicy,
        onComplete,
        environment,
      });
      return {dispose: disposeFetch};
    },
    // NOTE: We disable react-hooks-deps warning because:
    //   - We know fragmentRefPathInResponse is static, so it can be omitted from
    //     deps
    //   - We know fragmentNode is static, so it can be omitted from deps.
    //   - fragmentNode and parentFragmentRef are also captured by including
    //     fragmentIdentifier
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fragmentIdentifier, dataID, dispatch, disposeFetch],
  );
}

function readQuery(
  environment,
  query,
  fetchPolicy,
  renderPolicy,
  refetchGeneration,
  componentDisplayName,
  {start, complete},
  profilerContext,
) {
  const QueryResource = getQueryResourceForEnvironment(environment);
  const FragmentResource = getFragmentResourceForEnvironment(environment);
  const queryResult = profilerContext.wrapPrepareQueryResource(() => {
    return QueryResource.prepare(
      query,
      fetchQuery(environment, query, {
        networkCacheConfig: {force: true},
      }),
      fetchPolicy,
      renderPolicy,
      {start, error: complete, complete},
      // NOTE: QueryResource will keep a cache entry for a query for the
      // entire lifetime of this component. However, every time refetch is
      // called, we want to make sure we correctly attempt to fetch the query
      // (taking into account the fetchPolicy), even if we're refetching the exact
      // same query (e.g. refreshing it).
      // To do so, we keep track of every time refetch is called with
      // `refetchGenerationRef`, which we can use as a key for the query in
      // QueryResource.
      refetchGeneration,
    );
  });
  const queryData = FragmentResource.read(
    queryResult.fragmentNode,
    queryResult.fragmentRef,
    componentDisplayName,
  ).data;
  invariant(
    queryData != null,
    'Relay: Expected to be able to read refetch query response. ' +
      "If you're seeing this, this is likely a bug in Relay.",
  );
  return [queryResult, queryData];
}

let debugFunctions;
if (__DEV__) {
  debugFunctions = {
    getInitialIDAndType(
      memoRefetchVariables: ?Variables,
      fragmentRefPathInResponse: $ReadOnlyArray<string | number>,
      environment: IEnvironment,
    ): ?DebugIDandTypename {
      const {Record} = require('relay-runtime');
      const id = memoRefetchVariables?.id;
      if (
        fragmentRefPathInResponse.length !== 1 ||
        fragmentRefPathInResponse[0] !== 'node' ||
        id == null
      ) {
        return null;
      }
      const recordSource = environment.getStore().getSource();
      const record = recordSource.get(id);
      const typename = record && Record.getType(record);
      if (typename == null) {
        return null;
      }
      return {
        id,
        typename,
      };
    },

    checkSameTypeAfterRefetch(
      previousIDAndType: ?DebugIDandTypename,
      environment: IEnvironment,
      fragmentNode: ReaderFragment,
      componentDisplayName: string,
    ): void {
      const {Record} = require('relay-runtime');
      if (!previousIDAndType) {
        return;
      }
      const recordSource = environment.getStore().getSource();
      const record = recordSource.get(previousIDAndType.id);
      const typename = record && Record.getType(record);
      if (typename !== previousIDAndType.typename) {
        warning(
          false,
          'Relay: Call to `refetch` returned data with a different ' +
            '__typename: was `%s`, now `%s`, on `%s` in `%s`. ' +
            'Please make sure the server correctly implements' +
            'unique id requirement.',
          previousIDAndType.typename,
          typename,
          fragmentNode.name,
          componentDisplayName,
        );
      }
    },

    checkSameIDAfterRefetch(
      previousIDAndTypename: ?DebugIDandTypename,
      refetchedFragmentRef: mixed,
      fragmentNode: ReaderFragment,
      componentDisplayName: string,
    ): void {
      if (previousIDAndTypename == null) {
        return;
      }
      const {ID_KEY} = require('relay-runtime');
      // $FlowExpectedError
      const resultID = refetchedFragmentRef[ID_KEY];
      if (resultID != null && resultID !== previousIDAndTypename.id) {
        warning(
          false,
          'Relay: Call to `refetch` returned a different id, expected ' +
            '`%s`, got `%s`, on `%s` in `%s`. ' +
            'Please make sure the server correctly implements ' +
            'unique id requirement.',
          resultID,
          previousIDAndTypename.id,
          fragmentNode.name,
          componentDisplayName,
        );
      }
    },
  };
}

module.exports = useRefetchableFragmentNode;
