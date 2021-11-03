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

import type {LoaderFn} from './useQueryLoader';
import type {
  Disposable,
  FetchPolicy,
  IEnvironment,
  OperationDescriptor,
  OperationType,
  ReaderFragment,
  RenderPolicy,
  Variables,
  VariablesOf,
} from 'relay-runtime';

const {getFragmentResourceForEnvironment} = require('./FragmentResource');
const ProfilerContext = require('./ProfilerContext');
const {getQueryResourceForEnvironment} = require('./QueryResource');
const useFragmentNode = require('./useFragmentNode');
const useIsMountedRef = require('./useIsMountedRef');
const useQueryLoader = require('./useQueryLoader');
const useRelayEnvironment = require('./useRelayEnvironment');
const invariant = require('invariant');
const {useCallback, useContext, useReducer} = require('react');
const {
  __internal: {fetchQuery},
  createOperationDescriptor,
  getFragmentIdentifier,
  getRefetchMetadata,
  getSelector,
  getValueAtPath,
} = require('relay-runtime');
const warning = require('warning');

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
  VariablesOf<TQuery>,
  TOptions,
>;
type RefetchFnInexact<
  TQuery: OperationType,
  TOptions = Options,
> = RefetchFnBase<$Shape<VariablesOf<TQuery>>, TOptions>;

type Action =
  | {|
      type: 'reset',
      environment: IEnvironment,
      fragmentIdentifier: string,
    |}
  | {|
      type: 'refetch',
      refetchQuery: OperationDescriptor,
      fetchPolicy?: FetchPolicy,
      renderPolicy?: RenderPolicy,
      onComplete?: (Error | null) => void,
      refetchEnvironment: ?IEnvironment,
    |};

type RefetchState = {|
  fetchPolicy: FetchPolicy | void,
  mirroredEnvironment: IEnvironment,
  mirroredFragmentIdentifier: string,
  onComplete: ((Error | null) => void) | void,
  refetchEnvironment?: ?IEnvironment,
  refetchQuery: OperationDescriptor | null,
  renderPolicy: RenderPolicy | void,
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
        fetchPolicy: action.fetchPolicy,
        mirroredEnvironment:
          action.refetchEnvironment ?? state.mirroredEnvironment,
        onComplete: action.onComplete,
        refetchEnvironment: action.refetchEnvironment,
        refetchQuery: action.refetchQuery,
        renderPolicy: action.renderPolicy,
      };
    }
    case 'reset': {
      return {
        fetchPolicy: undefined,
        mirroredEnvironment: action.environment,
        mirroredFragmentIdentifier: action.fragmentIdentifier,
        onComplete: undefined,
        refetchQuery: null,
        renderPolicy: undefined,
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
  const {refetchableRequest, fragmentRefPathInResponse, identifierField} =
    getRefetchMetadata(fragmentNode, componentDisplayName);
  const fragmentIdentifier = getFragmentIdentifier(
    fragmentNode,
    parentFragmentRef,
  );

  const [refetchState, dispatch] = useReducer(reducer, {
    fetchPolicy: undefined,
    mirroredEnvironment: parentEnvironment,
    mirroredFragmentIdentifier: fragmentIdentifier,
    onComplete: undefined,
    refetchEnvironment: null,
    refetchQuery: null,
    renderPolicy: undefined,
  });
  const {
    fetchPolicy,
    mirroredEnvironment,
    mirroredFragmentIdentifier,
    onComplete,
    refetchEnvironment,
    refetchQuery,
    renderPolicy,
  } = refetchState;
  const environment = refetchEnvironment ?? parentEnvironment;

  const QueryResource = getQueryResourceForEnvironment(environment);
  const FragmentResource = getFragmentResourceForEnvironment(environment);
  const profilerContext = useContext(ProfilerContext);

  const shouldReset =
    environment !== mirroredEnvironment ||
    fragmentIdentifier !== mirroredFragmentIdentifier;
  const [queryRef, loadQuery, disposeQuery] =
    useQueryLoader<TQuery>(refetchableRequest);

  let fragmentRef = parentFragmentRef;
  if (shouldReset) {
    dispatch({
      type: 'reset',
      environment,
      fragmentIdentifier,
    });
    disposeQuery();
  } else if (refetchQuery != null && queryRef != null) {
    // If refetch was called, we expect to have a refetchQuery and queryRef
    // in state, since both state updates to set the refetchQuery and the
    // queryRef occur simultaneously.
    // In this case, we need to read the refetched query data (potentially
    // suspending if it's in flight), and extract the new fragment ref
    // from the query in order read the current @refetchable fragment
    // with the updated fragment owner as the new refetchQuery.

    // Before observing the refetch, record the current ID and typename
    // so that, if we are refetching existing data on
    // a field that implements Node, after refetching we
    // can validate that the received data is consistent
    let debugPreviousIDAndTypename: ?DebugIDandTypename;
    if (__DEV__) {
      debugPreviousIDAndTypename = debugFunctions.getInitialIDAndType(
        refetchQuery.request.variables,
        fragmentRefPathInResponse,
        environment,
      );
    }

    const handleQueryCompleted = maybeError => {
      onComplete && onComplete(maybeError ?? null);
    };

    // The queryRef.source obtained from useQueryLoader will be
    // an observable we can consume /if/ a network request was
    // started. Otherwise, given that QueryResource.prepare
    // always expects an observable we fall back to a new network
    // observable. Note however that if loadQuery did not make a network
    // request, we don't expect to make one here, unless the state of
    // the cache has changed between the call to refetch and this
    // render.
    const fetchObservable =
      queryRef.source != null
        ? queryRef.source
        : fetchQuery(environment, refetchQuery);

    // Now wwe can we read the refetch query here using the
    // queryRef provided from useQueryLoader. Note that the
    // network request is started during the call to refetch,
    // but if the refetch query is still in flight, we will suspend
    // at this point:
    const queryResult = profilerContext.wrapPrepareQueryResource(() => {
      return QueryResource.prepare(
        refetchQuery,
        fetchObservable,
        fetchPolicy,
        renderPolicy,
        {
          error: handleQueryCompleted,
          complete: () => {
            // Validate that the type of the object we got back matches the type
            // of the object already in the store
            if (__DEV__) {
              debugFunctions.checkSameTypeAfterRefetch(
                debugPreviousIDAndTypename,
                environment,
                fragmentNode,
                componentDisplayName,
              );
            }
            handleQueryCompleted();
          },
        },
        queryRef.fetchKey,
        profilerContext,
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
      // Validate that the id of the object we got back matches the id
      // we queried for in the variables.
      // We do this during render instead of onComplete to make sure we are
      // only validating the most recent refetch.
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

  const refetch = useRefetchFunction<TQuery>(
    componentDisplayName,
    dispatch,
    disposeQuery,
    fragmentData,
    fragmentIdentifier,
    fragmentNode,
    fragmentRefPathInResponse,
    identifierField,
    loadQuery,
    parentFragmentRef,
    refetchableRequest,
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
  componentDisplayName,
  dispatch,
  disposeQuery,
  fragmentData,
  fragmentIdentifier,
  fragmentNode,
  fragmentRefPathInResponse,
  identifierField,
  loadQuery: LoaderFn<TQuery>,
  parentFragmentRef,
  refetchableRequest,
): RefetchFn<TQuery, InternalOptions> {
  const isMountedRef = useIsMountedRef();
  const identifierValue =
    identifierField != null &&
    fragmentData != null &&
    typeof fragmentData === 'object'
      ? fragmentData[identifierField]
      : null;
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

      const refetchEnvironment = options?.__environment;
      const fetchPolicy = options?.fetchPolicy;
      const renderPolicy = options?.UNSTABLE_renderPolicy;
      const onComplete = options?.onComplete;
      const fragmentSelector = getSelector(fragmentNode, parentFragmentRef);
      let parentVariables: Variables;
      let fragmentVariables: Variables;
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

      // A user of `useRefetchableFragment()` may pass a subset of
      // all variables required by the fragment when calling `refetch()`.
      // We fill in any variables not passed by the call to `refetch()` with the
      // variables from the original parent fragment owner.
      const refetchVariables: VariablesOf<TQuery> = {
        ...(parentVariables: $FlowFixMe),
        ...fragmentVariables,
        ...providedRefetchVariables,
      };

      // If the query needs an identifier value ('id' or similar) and one
      // was not explicitly provided, read it from the fragment data.
      if (
        identifierField != null &&
        !providedRefetchVariables.hasOwnProperty('id')
      ) {
        // @refetchable fragments are guaranteed to have an `id` selection
        // if the type is Node, implements Node, or is @fetchable. Double-check
        // that there actually is a value at runtime.
        if (typeof identifierValue !== 'string') {
          warning(
            false,
            'Relay: Expected result to have a string  ' +
              '`%s` in order to refetch, got `%s`.',
            identifierField,
            identifierValue,
          );
        }
        (refetchVariables: $FlowFixMe).id = identifierValue;
      }

      const refetchQuery = createOperationDescriptor(
        refetchableRequest,
        refetchVariables,
        {force: true},
      );

      // We call loadQuery which will start a network request if necessary
      // and update the querRef from useQueryLoader.
      // Note the following:
      // - loadQuery will dispose of any previously refetched queries.
      // - We use the variables extracted off the OperationDescriptor
      // so that they have been filtered out to include only the
      // variables actually declared in the query.
      loadQuery(refetchQuery.request.variables, {
        fetchPolicy,
        __environment: refetchEnvironment,
        __nameForWarning: 'refetch',
      });

      dispatch({
        type: 'refetch',
        fetchPolicy,
        onComplete,
        refetchEnvironment,
        refetchQuery,
        renderPolicy,
      });
      return {dispose: disposeQuery};
    },
    // NOTE: We disable react-hooks-deps warning because:
    //   - We know fragmentRefPathInResponse is static, so it can be omitted from
    //     deps
    //   - We know fragmentNode is static, so it can be omitted from deps.
    //   - fragmentNode and parentFragmentRef are also captured by including
    //     fragmentIdentifier
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fragmentIdentifier, dispatch, disposeQuery, identifierValue, loadQuery],
  );
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
      // $FlowExpectedError[incompatible-use]
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
