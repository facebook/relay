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

'use strict';

// flowlint untyped-import:off
const Scheduler = require('scheduler');

// flowlint untyped-import:error

const getPaginationMetadata = require('./getPaginationMetadata');
const invariant = require('invariant');
const useLoadMoreFunction = require('./useLoadMoreFunction');
const useRefetchableFragmentNode = require('./useRefetchableFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
const warning = require('warning');

const {useCallback, useEffect, useRef, useState} = require('react');
const {
  getFragment,
  getFragmentIdentifier,
  getFragmentOwner,
} = require('relay-runtime');

import type {LoadMoreFn, UseLoadMoreFunctionArgs} from './useLoadMoreFunction';
import type {RefetchFnDynamic} from './useRefetchableFragmentNode';
import type {
  GraphQLResponse,
  GraphQLTaggedNode,
  Observer,
  OperationType,
} from 'relay-runtime';

export type ReturnType<TQuery: OperationType, TKey, TFragmentData> = {|
  data: TFragmentData,
  loadNext: LoadMoreFn,
  loadPrevious: LoadMoreFn,
  hasNext: boolean,
  hasPrevious: boolean,
  refetch: RefetchFnDynamic<TQuery, TKey>,
|};

function useBlockingPaginationFragment<
  TQuery: OperationType,
  TKey: ?{+$data?: mixed},
>(
  fragmentInput: GraphQLTaggedNode,
  parentFragmentRef: TKey,
  componentDisplayName: string = 'useBlockingPaginationFragment()',
): ReturnType<
  TQuery,
  TKey,
  // NOTE: This $Call ensures that the type of the returned data is either:
  //   - nullable if the provided ref type is nullable
  //   - non-nullable if the provided ref type is non-nullable
  // prettier-ignore
  $Call<
    & (<TFragmentData>( {+$data?: TFragmentData}) =>  TFragmentData)
    & (<TFragmentData>(?{+$data?: TFragmentData}) => ?TFragmentData),
    TKey,
  >,
> {
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(
    fragmentNode,
    `first argument of ${componentDisplayName}`,
  );

  const {
    connectionPathInFragmentData,
    fragmentRefPathInResponse,
    paginationRequest,
    paginationMetadata,
    stream,
  } = getPaginationMetadata(fragmentNode, componentDisplayName);
  invariant(
    stream === false,
    'Relay: @stream_connection is not compatible with `useBlockingPaginationFragment`. ' +
      'Use `useStreamingPaginationFragment` instead.',
  );

  const {
    fragmentData,
    fragmentRef,
    refetch,
    disableStoreUpdates,
    enableStoreUpdates,
  } = useRefetchableFragmentNode<TQuery, TKey>(
    fragmentNode,
    parentFragmentRef,
    componentDisplayName,
  );
  const fragmentIdentifier = getFragmentIdentifier(fragmentNode, fragmentRef);

  // $FlowFixMe - TODO T39154660 Use FragmentPointer type instead of mixed
  const fragmentOwner = getFragmentOwner(fragmentNode, fragmentRef);

  // Backward pagination
  const [loadPrevious, hasPrevious, disposeFetchPrevious] = useLoadMore({
    direction: 'backward',
    fragmentNode,
    fragmentIdentifier,
    fragmentOwner,
    fragmentData,
    connectionPathInFragmentData,
    fragmentRefPathInResponse,
    paginationRequest,
    paginationMetadata,
    disableStoreUpdates,
    enableStoreUpdates,
    componentDisplayName,
  });

  // Forward pagination
  const [loadNext, hasNext, disposeFetchNext] = useLoadMore({
    direction: 'forward',
    fragmentNode,
    fragmentIdentifier,
    fragmentOwner,
    fragmentData,
    connectionPathInFragmentData,
    fragmentRefPathInResponse,
    paginationRequest,
    paginationMetadata,
    disableStoreUpdates,
    enableStoreUpdates,
    componentDisplayName,
  });

  const refetchPagination: RefetchFnDynamic<TQuery, TKey> = useCallback(
    (variables, options) => {
      disposeFetchNext();
      disposeFetchPrevious();
      return refetch(variables, {...options, __environment: undefined});
    },
    [disposeFetchNext, disposeFetchPrevious, refetch],
  );

  return {
    data: fragmentData,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    refetch: refetchPagination,
  };
}

function useLoadMore(args: {|
  disableStoreUpdates: () => void,
  enableStoreUpdates: () => void,
  ...$Exact<
    $Diff<
      UseLoadMoreFunctionArgs,
      {observer: Observer<GraphQLResponse>, onReset: () => void},
    >,
  >,
|}): [LoadMoreFn, boolean, () => void] {
  const {disableStoreUpdates, enableStoreUpdates, ...loadMoreArgs} = args;
  const [requestPromise, setRequestPromise] = useState(null);
  const requestPromiseRef = useRef(null);
  const promiseResolveRef = useRef(null);

  const promiseResolve = () => {
    if (promiseResolveRef.current != null) {
      promiseResolveRef.current();
      promiseResolveRef.current = null;
    }
  };

  const handleReset = () => {
    promiseResolve();
  };

  const observer = {
    complete: promiseResolve,
    // NOTE: loadMore is a no-op if a request is already in flight, so we
    // can safely assume that `start` will only be called once while a
    // request is in flight.
    start: () => {
      // NOTE: We disable store updates when we suspend to ensure
      // that higher-pri updates from the Relay store don't disrupt
      // any Suspense timeouts passed via withSuspenseConfig.
      disableStoreUpdates();

      const promise = new Promise(resolve => {
        promiseResolveRef.current = () => {
          requestPromiseRef.current = null;
          resolve();
        };
      });
      requestPromiseRef.current = promise;
      setRequestPromise(promise);
    },

    // NOTE: Since streaming is disallowed with this hook, this means that the
    // first payload will always contain the entire next page of items,
    // while subsequent paylaods will contain @defer'd payloads.
    // This allows us to unsuspend here, on the first payload, and allow
    // descendant components to suspend on their respective @defer payloads
    next: promiseResolve,

    // TODO: Handle error; we probably don't want to throw an error
    // and blow away the whole list of items.
    error: promiseResolve,
  };
  const [_loadMore, hasMore, disposeFetch] = useLoadMoreFunction({
    ...loadMoreArgs,
    observer,
    onReset: handleReset,
  });

  // NOTE: To determine if we need to suspend, we check that the promise in
  // state is the same as the promise on the ref, which ensures that we
  // wont incorrectly suspend on other higher-pri updates before the update
  // to suspend has committed.
  if (requestPromise != null && requestPromise === requestPromiseRef.current) {
    throw requestPromise;
  }

  useEffect(() => {
    if (requestPromise == null) {
      // NOTE: After suspense pagination has resolved, we re-enable store updates
      // for this fragment. This may cause the component to re-render if
      // we missed any updates to the fragment data other than the pagination update.
      enableStoreUpdates();
    }
    // NOTE: We know the identity of enableStoreUpdates wont change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPromise]);

  const loadMore = useCallback(
    (...callArgs) => {
      if (
        Scheduler.unstable_getCurrentPriorityLevel() <
        Scheduler.unstable_NormalPriority
      ) {
        warning(
          false,
          'Relay: Unexpected call to `%s` at a priority higher than ' +
            'expected on fragment `%s` in `%s`. It looks like you tried to ' +
            'call `refetch` under a high priority update, but updates that ' +
            'can cause the component to suspend should be scheduled at ' +
            'normal priority. Make sure you are calling `refetch` inside ' +
            '`startTransition()` from the `useSuspenseTransition()` hook.',
          args.direction === 'forward' ? 'loadNext' : 'loadPrevious',
          args.fragmentNode.name,
          args.componentDisplayName,
        );
      }

      return _loadMore(...callArgs);
    },
    [
      _loadMore,
      args.componentDisplayName,
      args.direction,
      args.fragmentNode.name,
    ],
  );

  return [loadMore, hasMore, disposeFetch];
}

module.exports = useBlockingPaginationFragment;
