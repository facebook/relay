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

import type {
  ConcreteRequest,
  Direction,
  Disposable,
  GraphQLResponse,
  Observer,
  ReaderFragment,
  ReaderPaginationMetadata,
  Subscription,
  Variables,
} from 'relay-runtime';

const getConnectionState = require('./getConnectionState');
const useIsMountedRef = require('./useIsMountedRef');
const useIsOperationNodeActive = require('./useIsOperationNodeActive');
const useRelayEnvironment = require('./useRelayEnvironment');
const invariant = require('invariant');
const {useCallback, useRef, useState} = require('react');
const {
  __internal: {fetchQuery},
  createOperationDescriptor,
  getPaginationVariables,
  getRefetchMetadata,
  getSelector,
} = require('relay-runtime');
const warning = require('warning');

export type LoadMoreFn<TVariables: Variables> = (
  count: number,
  options?: {
    onComplete?: (Error | null) => void,
    UNSTABLE_extraVariables?: Partial<TVariables>,
  },
) => Disposable;

export type UseLoadMoreFunctionArgs = {
  direction: Direction,
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
  fragmentIdentifier: string,
  fragmentData: mixed,
  connectionPathInFragmentData: $ReadOnlyArray<string | number>,
  paginationRequest: ConcreteRequest,
  paginationMetadata: ReaderPaginationMetadata,
  componentDisplayName: string,
  observer: Observer<GraphQLResponse>,
  onReset: () => void,
};

hook useLoadMoreFunction_EXPERIMENTAL<TVariables: Variables>(
  args: UseLoadMoreFunctionArgs,
): [
  // Function to load more data
  LoadMoreFn<TVariables>,
  // Whether the connection has more data to load
  boolean,
  // Force dispose function which cancels the in-flight fetch itself, and callbacks
  () => void,
] {
  const {
    direction,
    fragmentNode,
    fragmentRef,
    fragmentIdentifier,
    fragmentData,
    connectionPathInFragmentData,
    paginationRequest,
    paginationMetadata,
    componentDisplayName,
    observer,
    onReset,
  } = args;
  const environment = useRelayEnvironment();

  const {identifierInfo} = getRefetchMetadata(
    fragmentNode,
    componentDisplayName,
  );
  const identifierValue =
    identifierInfo?.identifierField != null &&
    fragmentData != null &&
    typeof fragmentData === 'object'
      ? fragmentData[identifierInfo.identifierField]
      : null;

  const fetchStatusRef = useRef<
    {kind: 'fetching', subscription: Subscription} | {kind: 'none'},
  >({kind: 'none'});
  const [mirroredEnvironment, setMirroredEnvironment] = useState(environment);
  const [mirroredFragmentIdentifier, setMirroredFragmentIdentifier] =
    useState(fragmentIdentifier);

  const isParentQueryActive = useIsOperationNodeActive(
    fragmentNode,
    fragmentRef,
  );

  const forceDisposeFn = useCallback(() => {
    // $FlowFixMe[react-rule-unsafe-ref]
    if (fetchStatusRef.current.kind === 'fetching') {
      // $FlowFixMe[react-rule-unsafe-ref]
      fetchStatusRef.current.subscription.unsubscribe();
    }
    // $FlowFixMe[react-rule-unsafe-ref]
    fetchStatusRef.current = {kind: 'none'};
  }, []);

  const shouldReset =
    environment !== mirroredEnvironment ||
    fragmentIdentifier !== mirroredFragmentIdentifier;
  if (shouldReset) {
    forceDisposeFn();
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

  const isMountedRef = useIsMountedRef();
  const loadMore = useCallback(
    (
      count: number,
      options: void | {
        UNSTABLE_extraVariables?: Partial<TVariables>,
        onComplete?: (Error | null) => void,
      },
    ) => {
      // TODO(T41131846): Fetch/Caching policies for loadMore

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
      if (
        fetchStatusRef.current.kind === 'fetching' ||
        fragmentData == null ||
        isParentQueryActive
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
          onComplete(null);
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
      const extraVariables = options?.UNSTABLE_extraVariables;
      const baseVariables = {
        ...parentVariables,
        ...fragmentVariables,
      };
      const paginationVariables = getPaginationVariables(
        direction,
        count,
        cursor,
        baseVariables,
        {...extraVariables},
        paginationMetadata,
      );

      // If the query needs an identifier value ('id' or similar) and one
      // was not explicitly provided, read it from the fragment data.
      if (identifierInfo != null) {
        // @refetchable fragments are guaranteed to have an `id` selection
        // if the type is Node, implements Node, or is @fetchable. Double-check
        // that there actually is a value at runtime.
        if (typeof identifierValue !== 'string') {
          warning(
            false,
            'Relay: Expected result to have a string  ' +
              '`%s` in order to refetch, got `%s`.',
            identifierInfo.identifierField,
            identifierValue,
          );
        }
        paginationVariables[identifierInfo.identifierQueryVariableName] =
          identifierValue;
      }

      const paginationQuery = createOperationDescriptor(
        paginationRequest,
        paginationVariables,
        {force: true},
      );
      fetchQuery(environment, paginationQuery).subscribe({
        ...observer,
        start: subscription => {
          fetchStatusRef.current = {kind: 'fetching', subscription};
          observer.start && observer.start(subscription);
        },
        complete: () => {
          fetchStatusRef.current = {kind: 'none'};
          observer.complete && observer.complete();
          onComplete && onComplete(null);
        },
        error: error => {
          fetchStatusRef.current = {kind: 'none'};
          observer.complete && observer.complete();
          onComplete && onComplete(error);
        },
      });
      return {
        dispose: () => {},
      };
    },
    // NOTE: We disable react-hooks-deps warning because all values
    // inside paginationMetadata are static
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      environment,
      identifierValue,
      direction,
      cursor,
      isParentQueryActive,
      fragmentData,
      fragmentNode.name,
      fragmentRef,
      componentDisplayName,
    ],
  );
  return [loadMore, hasMore, forceDisposeFn];
}

module.exports = useLoadMoreFunction_EXPERIMENTAL;
