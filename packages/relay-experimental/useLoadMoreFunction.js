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

const getPaginationVariables = require('./getPaginationVariables');
const getValueAtPath = require('./getValueAtPath');
const invariant = require('invariant');
const useFetchTrackingRef = require('./useFetchTrackingRef');
const useIsMountedRef = require('./useIsMountedRef');
const useRelayEnvironment = require('./useRelayEnvironment');
const warning = require('warning');

const {useCallback, useEffect, useState} = require('react');
const {
  ConnectionInterface,
  __internal: {fetchQuery, hasRequestInFlight},
  createOperationDescriptor,
  getSelector,
} = require('relay-runtime');

import type {
  ConcreteRequest,
  Disposable,
  GraphQLResponse,
  Observer,
  ReaderFragment,
  ReaderPaginationMetadata,
  RequestDescriptor,
} from 'relay-runtime';

export type Direction = 'forward' | 'backward';

export type LoadMoreFn = (
  count: number,
  options?: {|
    onComplete?: (Error | null) => void,
  |},
) => Disposable;

export type UseLoadMoreFunctionArgs = {|
  direction: Direction,
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
  fragmentIdentifier: string,
  fragmentData: mixed,
  connectionPathInFragmentData: $ReadOnlyArray<string | number>,
  fragmentRefPathInResponse: $ReadOnlyArray<string | number>,
  paginationRequest: ConcreteRequest,
  paginationMetadata: ReaderPaginationMetadata,
  componentDisplayName: string,
  observer: Observer<GraphQLResponse>,
  onReset: () => void,
|};

function useLoadMoreFunction(
  args: UseLoadMoreFunctionArgs,
): [LoadMoreFn, boolean, () => void] {
  const {
    direction,
    fragmentNode,
    fragmentRef,
    fragmentIdentifier,
    fragmentData,
    connectionPathInFragmentData,
    fragmentRefPathInResponse,
    paginationRequest,
    paginationMetadata,
    componentDisplayName,
    observer,
    onReset,
  } = args;
  const environment = useRelayEnvironment();
  const {
    isFetchingRef,
    startFetch,
    disposeFetch,
    completeFetch,
  } = useFetchTrackingRef();
  // $FlowFixMe
  const dataID = fragmentData?.id;
  const isMountedRef = useIsMountedRef();
  const [mirroredEnvironment, setMirroredEnvironment] = useState(environment);
  const [mirroredFragmentIdentifier, setMirroredFragmentIdentifier] = useState(
    fragmentIdentifier,
  );

  const shouldReset =
    environment !== mirroredEnvironment ||
    fragmentIdentifier !== mirroredFragmentIdentifier;
  if (shouldReset) {
    disposeFetch();
    onReset();
    setMirroredEnvironment(environment);
    setMirroredFragmentIdentifier(fragmentIdentifier);
  }

  const {cursor, hasMore} = getConnectionState(
    direction,
    fragmentNode,
    fragmentData,
    connectionPathInFragmentData,
  );

  // Dispose of pagination requests in flight when unmounting
  useEffect(() => {
    return () => {
      disposeFetch();
    };
  }, [disposeFetch]);

  const loadMore = useCallback(
    (count, options) => {
      // TODO(T41131846): Fetch/Caching policies for loadMore
      // TODO(T41140071): Handle loadMore while refetch is in flight and vice-versa

      const onComplete = options?.onComplete;
      if (isMountedRef.current !== true) {
        // Bail out and warn if we're trying to paginate after the component
        // has unmounted
        warning(
          false,
          'Relay: Unexpected fetch on unmounted component for fragment ' +
            '`%s` in `%s`. It looks like some instances of your component are ' +
            'still trying to fetch data but they already unmounted. ' +
            'Please make sure you clear all timers, intervals, ' +
            'async calls, etc that may trigger a fetch.',
          fragmentNode.name,
          componentDisplayName,
        );
        return {dispose: () => {}};
      }

      const fragmentSelector = getSelector(fragmentNode, fragmentRef);
      const isParentQueryInFlight =
        fragmentSelector != null &&
        fragmentSelector.kind !== 'PluralReaderSelector' &&
        hasRequestInFlight(environment, fragmentSelector.owner);
      if (
        isFetchingRef.current === true ||
        fragmentData == null ||
        isParentQueryInFlight
      ) {
        if (fragmentSelector == null) {
          warning(
            false,
            'Relay: Unexpected fetch while using a null fragment ref ' +
              'for fragment `%s` in `%s`. When fetching more items, we expect ' +
              "initial fragment data to be non-null. Please make sure you're " +
              'passing a valid fragment ref to `%s` before paginating.',
            fragmentNode.name,
            componentDisplayName,
            componentDisplayName,
          );
        }

        if (onComplete) {
          // We make sure to always call onComplete asynchronously to prevent
          // accidental loops in product code.
          Scheduler.unstable_next(() => onComplete(null));
        }
        return {dispose: () => {}};
      }

      invariant(
        fragmentSelector != null &&
          fragmentSelector.kind !== 'PluralReaderSelector',
        'Relay: Expected to be able to find a non-plural fragment owner for ' +
          "fragment `%s` when using `%s`. If you're seeing this, " +
          'this is likely a bug in Relay.',
        fragmentNode.name,
        componentDisplayName,
      );

      const parentVariables = fragmentSelector.owner.variables;
      const fragmentVariables = fragmentSelector.variables;
      const baseVariables = {
        ...parentVariables,
        ...fragmentVariables,
      };
      const paginationVariables = getPaginationVariables(
        direction,
        count,
        cursor,
        baseVariables,
        paginationMetadata,
      );

      // TODO (T40777961): Tweak output of @refetchable transform to more
      // easily tell if we need an $id in the refetch vars
      if (fragmentRefPathInResponse.includes('node')) {
        // @refetchable fragments are guaranteed to have an `id` selection
        // if the type is Node or implements Node. Double-check that there
        // actually is a value at runtime.
        if (typeof dataID !== 'string') {
          warning(
            false,
            'Relay: Expected result to have a string  ' +
              '`id` in order to refetch/paginate, got `%s`.',
            dataID,
          );
        }
        paginationVariables.id = dataID;
      }

      const paginationQuery = createOperationDescriptor(
        paginationRequest,
        paginationVariables,
      );
      fetchQuery(environment, paginationQuery, {
        networkCacheConfig: {force: true},
      }).subscribe({
        ...observer,
        start: subscription => {
          startFetch(subscription);
          observer.start && observer.start(subscription);
        },
        complete: () => {
          completeFetch();
          observer.complete && observer.complete();
          onComplete && onComplete(null);
        },
        error: error => {
          completeFetch();
          observer.error && observer.error(error);
          onComplete && onComplete(error);
        },
      });
      return {dispose: disposeFetch};
    },
    // NOTE: We disable react-hooks-deps warning because all values
    // inside paginationMetadata are static
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      environment,
      dataID,
      direction,
      cursor,
      startFetch,
      disposeFetch,
      completeFetch,
      isFetchingRef,
      fragmentData,
      fragmentNode.name,
      fragmentRef,
      componentDisplayName,
    ],
  );
  return [loadMore, hasMore, disposeFetch];
}

function getConnectionState(
  direction: Direction,
  fragmentNode: ReaderFragment,
  fragmentData: mixed,
  connectionPathInFragmentData: $ReadOnlyArray<string | number>,
): {|
  cursor: ?string,
  hasMore: boolean,
|} {
  const {
    EDGES,
    PAGE_INFO,
    HAS_NEXT_PAGE,
    HAS_PREV_PAGE,
    END_CURSOR,
    START_CURSOR,
  } = ConnectionInterface.get();
  const connection = getValueAtPath(fragmentData, connectionPathInFragmentData);
  if (connection == null) {
    return {cursor: null, hasMore: false};
  }

  invariant(
    typeof connection === 'object',
    'Relay: Expected connection in fragment `%s` to have been `null`, or ' +
      'a plain object with %s and %s properties. Instead got `%s`.',
    fragmentNode.name,
    EDGES,
    PAGE_INFO,
    connection,
  );

  const edges = connection[EDGES];
  const pageInfo = connection[PAGE_INFO];
  if (edges == null || pageInfo == null) {
    return {cursor: null, hasMore: false};
  }

  invariant(
    Array.isArray(edges),
    'Relay: Expected connection in fragment `%s` to have a plural `%s` field. ' +
      'Instead got `%s`.',
    fragmentNode.name,
    EDGES,
    edges,
  );
  invariant(
    typeof pageInfo === 'object',
    'Relay: Expected connection in fragment `%s` to have a `%s` field. ' +
      'Instead got `%s`.',
    fragmentNode.name,
    PAGE_INFO,
    pageInfo,
  );

  const cursor =
    direction === 'forward'
      ? pageInfo[END_CURSOR] ?? null
      : pageInfo[START_CURSOR] ?? null;
  invariant(
    cursor === null || typeof cursor === 'string',
    'Relay: Expected page info for connection in fragment `%s` to have a ' +
      'valid `%s`. Instead got `%s`.',
    fragmentNode.name,
    START_CURSOR,
    cursor,
  );

  let hasMore;
  if (direction === 'forward') {
    hasMore = cursor != null && pageInfo[HAS_NEXT_PAGE] === true;
  } else {
    hasMore = cursor != null && pageInfo[HAS_PREV_PAGE] === true;
  }

  return {cursor, hasMore};
}

module.exports = useLoadMoreFunction;
