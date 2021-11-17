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

import type {LoadMoreFn, UseLoadMoreFunctionArgs} from './useLoadMoreFunction';
import type {RefetchFnDynamic} from './useRefetchableFragmentNode';
import type {
  FragmentType,
  GraphQLResponse,
  GraphQLTaggedNode,
  Observer,
  OperationType,
} from 'relay-runtime';

const useLoadMoreFunction = require('./useLoadMoreFunction');
const useRefetchableFragmentNode = require('./useRefetchableFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
const invariant = require('invariant');
const {useCallback, useEffect, useRef, useState} = require('react');
const {
  getFragment,
  getFragmentIdentifier,
  getPaginationMetadata,
} = require('relay-runtime');

export type ReturnType<TQuery: OperationType, TKey, TFragmentData> = {|
  data: TFragmentData,
  loadNext: LoadMoreFn<TQuery>,
  loadPrevious: LoadMoreFn<TQuery>,
  hasNext: boolean,
  hasPrevious: boolean,
  refetch: RefetchFnDynamic<TQuery, TKey>,
|};

function useBlockingPaginationFragment<
  TQuery: OperationType,
  TKey: ?{+$data?: mixed, +$fragmentSpreads: FragmentType, ...},
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
    & (<TFragmentData>( { +$data?: TFragmentData, ... }) =>  TFragmentData)
    & (<TFragmentData>(?{ +$data?: TFragmentData, ... }) => ?TFragmentData),
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
    identifierField,
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

  // Backward pagination
  const [loadPrevious, hasPrevious, disposeFetchPrevious] = useLoadMore<TQuery>(
    {
      componentDisplayName,
      connectionPathInFragmentData,
      direction: 'backward',
      disableStoreUpdates,
      enableStoreUpdates,
      fragmentData,
      fragmentIdentifier,
      fragmentNode,
      fragmentRef,
      identifierField,
      paginationMetadata,
      paginationRequest,
    },
  );

  // Forward pagination
  const [loadNext, hasNext, disposeFetchNext] = useLoadMore<TQuery>({
    componentDisplayName,
    connectionPathInFragmentData,
    direction: 'forward',
    disableStoreUpdates,
    enableStoreUpdates,
    fragmentData,
    fragmentIdentifier,
    fragmentNode,
    fragmentRef,
    identifierField,
    paginationMetadata,
    paginationRequest,
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

function useLoadMore<TQuery: OperationType>(args: {|
  disableStoreUpdates: () => void,
  enableStoreUpdates: () => void,
  ...$Exact<
    $Diff<
      UseLoadMoreFunctionArgs,
      {
        observer: Observer<GraphQLResponse>,
        onReset: () => void,
        ...
      },
    >,
  >,
|}): [LoadMoreFn<TQuery>, boolean, () => void] {
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
  const [loadMore, hasMore, disposeFetch] = useLoadMoreFunction<TQuery>({
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
    if (requestPromise !== requestPromiseRef.current) {
      // NOTE: After suspense pagination has resolved, we re-enable store updates
      // for this fragment. This may cause the component to re-render if
      // we missed any updates to the fragment data other than the pagination update.
      enableStoreUpdates();
    }
    // NOTE: We know the identity of enableStoreUpdates wont change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPromise]);

  return [loadMore, hasMore, disposeFetch];
}

module.exports = useBlockingPaginationFragment;
