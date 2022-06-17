/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

import type {
  LoadQueryOptions,
  PreloadableConcreteRequest,
  PreloadedQuery,
} from './EntryPointTypes.flow';
import type {
  GraphQLTaggedNode,
  IEnvironment,
  OperationType,
} from 'relay-runtime';

const {loadQuery, useTrackLoadQueryInRender} = require('./loadQuery');
const useIsMountedRef = require('./useIsMountedRef');
const useRelayEnvironment = require('./useRelayEnvironment');
const {useCallback, useEffect, useRef, useState} = require('react');
const {getRequest} = require('relay-runtime');

export type LoaderFn<TQuery: OperationType> = (
  variables: TQuery['variables'],
  options?: UseQueryLoaderLoadQueryOptions,
) => void;

export type UseQueryLoaderLoadQueryOptions = $ReadOnly<{
  ...LoadQueryOptions,
  +__environment?: ?IEnvironment,
}>;

type UseQueryLoaderHookReturnType<TQuery: OperationType> = [
  ?PreloadedQuery<TQuery>,
  LoaderFn<TQuery>,
  () => void,
];

// NullQueryReference needs to implement referential equality,
// so that multiple NullQueryReferences can be in the same set
// (corresponding to multiple calls to disposeQuery).
type NullQueryReference = {
  kind: 'NullQueryReference',
};
const initialNullQueryReferenceState = {kind: 'NullQueryReference'};

function requestIsLiveQuery<TQuery: OperationType>(
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
): boolean {
  if (preloadableRequest.kind === 'PreloadableConcreteRequest') {
    return (preloadableRequest: $FlowFixMe).params.metadata.live !== undefined;
  }
  const request = getRequest(preloadableRequest);
  return request.params.metadata.live !== undefined;
}

function useQueryLoader<TQuery: OperationType>(
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  initialQueryReference?: ?PreloadedQuery<TQuery>,
): UseQueryLoaderHookReturnType<TQuery> {
  /**
   * We want to always call `queryReference.dispose()` for every call to
   * `setQueryReference(loadQuery(...))` so that no leaks of data in Relay stores
   * will occur.
   *
   * However, a call to `setState(newState)` is not always followed by a commit where
   * this value is reflected in the state. Thus, we cannot reliably clean up each
   * ref with `useEffect(() => () => queryReference.dispose(), [queryReference])`.
   *
   * Instead, we keep track of each call to `loadQuery` in a ref.
   * Relying on the fact that if a state change commits, no state changes that were
   * initiated prior to the currently committing state change will ever subsequently
   * commit, we can safely dispose of all preloaded query references
   * associated with state changes initiated prior to the currently committing state
   * change.
   *
   * Finally, when the hook unmounts, we also dispose of all remaining uncommitted
   * query references.
   */

  const initialQueryReferenceInternal =
    initialQueryReference ?? initialNullQueryReferenceState;

  const environment = useRelayEnvironment();
  useTrackLoadQueryInRender();

  const isMountedRef = useIsMountedRef();
  const undisposedQueryReferencesRef = useRef<
    Set<PreloadedQuery<TQuery> | NullQueryReference>,
  >(new Set([initialQueryReferenceInternal]));

  const [queryReference, setQueryReference] = useState<
    PreloadedQuery<TQuery> | NullQueryReference,
  >(() => initialQueryReferenceInternal);

  const [previousInitialQueryReference, setPreviousInitialQueryReference] =
    useState<PreloadedQuery<TQuery> | NullQueryReference>(
      () => initialQueryReferenceInternal,
    );

  if (initialQueryReferenceInternal !== previousInitialQueryReference) {
    // Rendering the query reference makes it "managed" by this hook, so
    // we start keeping track of it so we can dispose it when it is no longer
    // necessary here
    // TODO(T78446637): Handle disposal of managed query references in
    // components that were never mounted after rendering
    undisposedQueryReferencesRef.current.add(initialQueryReferenceInternal);
    setPreviousInitialQueryReference(initialQueryReferenceInternal);
    setQueryReference(initialQueryReferenceInternal);
  }

  const disposeQuery = useCallback(() => {
    if (isMountedRef.current) {
      undisposedQueryReferencesRef.current.add(initialNullQueryReferenceState);
      setQueryReference(initialNullQueryReferenceState);
    }
  }, [isMountedRef]);

  const queryLoaderCallback = useCallback(
    (
      variables: TQuery['variables'],
      options?: ?UseQueryLoaderLoadQueryOptions,
    ) => {
      const mergedOptions: ?UseQueryLoaderLoadQueryOptions =
        options != null && options.hasOwnProperty('__environment')
          ? {
              fetchPolicy: options.fetchPolicy,
              networkCacheConfig: options.networkCacheConfig,
              __nameForWarning: options.__nameForWarning,
            }
          : options;
      if (isMountedRef.current) {
        const updatedQueryReference = loadQuery(
          options?.__environment ?? environment,
          preloadableRequest,
          variables,
          (mergedOptions: $FlowFixMe),
        );
        undisposedQueryReferencesRef.current.add(updatedQueryReference);
        setQueryReference(updatedQueryReference);
      }
    },
    [environment, preloadableRequest, setQueryReference, isMountedRef],
  );

  const maybeHiddenOrFastRefresh = useRef(false);
  useEffect(() => {
    return () => {
      // Attempt to detect if the component was
      // hidden (by Offscreen API), or fast refresh occured;
      // Only in these situations would the effect cleanup
      // for "unmounting" run multiple times, so if
      // we are ever able to read this ref with a value
      // of true, it means that one of these cases
      // has happened.
      maybeHiddenOrFastRefresh.current = true;
    };
  }, []);

  useEffect(() => {
    if (maybeHiddenOrFastRefresh.current === true) {
      // This block only runs if the component has previously "unmounted"
      // due to it being hidden by the Offscreen API, or during fast refresh.
      // At this point, the current queryReference will have been disposed
      // by the previous cleanup, so instead of attempting to
      // do our regular commit setup, which would incorrectly leave our
      // current queryReference disposed, we need to load the query again
      // and force a re-render by calling queryLoaderCallback again,
      // so that the queryReference is correctly re-retained, and
      // potentially refetched if necessary.
      maybeHiddenOrFastRefresh.current = false;
      if (queryReference.kind !== 'NullQueryReference') {
        queryLoaderCallback(queryReference.variables, {
          fetchPolicy: queryReference.fetchPolicy,
          networkCacheConfig: queryReference.networkCacheConfig,
        });
      }
      return;
    }

    // When a new queryReference is committed, we iterate over all
    // query references in undisposedQueryReferences and dispose all of
    // the refs that aren't the currently committed one. This ensures
    // that we don't leave any dangling query references for the
    // case that loadQuery is called multiple times before commit; when
    // this happens, multiple state updates will be scheduled, but only one
    // will commit, meaning that we need to keep track of and dispose any
    // query references that don't end up committing.
    // - We are relying on the fact that sets iterate in insertion order, and we
    // can remove items from a set as we iterate over it (i.e. no iterator
    // invalidation issues.) Thus, it is safe to loop through
    // undisposedQueryReferences until we find queryReference, and
    // remove and dispose all previous references.
    // - We are guaranteed to find queryReference in the set, because if a
    // state update results in a commit, no state updates initiated prior to that
    // one will be committed, and we are disposing and removing references
    // associated with updates that were scheduled prior to the currently
    // committing state change. (A useEffect callback is called during the commit
    // phase.)
    const undisposedQueryReferences = undisposedQueryReferencesRef.current;

    if (isMountedRef.current) {
      for (const undisposedQueryReference of undisposedQueryReferences) {
        if (undisposedQueryReference === queryReference) {
          break;
        }

        undisposedQueryReferences.delete(undisposedQueryReference);
        if (undisposedQueryReference.kind !== 'NullQueryReference') {
          if (requestIsLiveQuery(preloadableRequest)) {
            undisposedQueryReference.dispose &&
              undisposedQueryReference.dispose();
          } else {
            undisposedQueryReference.releaseQuery &&
              undisposedQueryReference.releaseQuery();
          }
        }
      }
    }
  }, [queryReference, isMountedRef, queryLoaderCallback, preloadableRequest]);

  useEffect(() => {
    return function disposeAllRemainingQueryReferences() {
      // undisposedQueryReferences.current is never reassigned
      // eslint-disable-next-line react-hooks/exhaustive-deps
      for (const undisposedQueryReference of undisposedQueryReferencesRef.current) {
        if (undisposedQueryReference.kind !== 'NullQueryReference') {
          if (requestIsLiveQuery(preloadableRequest)) {
            undisposedQueryReference.dispose &&
              undisposedQueryReference.dispose();
          } else {
            undisposedQueryReference.releaseQuery &&
              undisposedQueryReference.releaseQuery();
          }
        }
      }
    };
  }, [preloadableRequest]);

  return [
    queryReference.kind === 'NullQueryReference' ? null : queryReference,
    queryLoaderCallback,
    disposeQuery,
  ];
}

module.exports = useQueryLoader;
