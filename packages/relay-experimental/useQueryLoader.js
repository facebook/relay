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

const useIsMountedRef = require('./useIsMountedRef');
const useRelayEnvironment = require('./useRelayEnvironment');

const {loadQuery, useTrackLoadQueryInRender} = require('./loadQuery');
const {useCallback, useEffect, useRef, useState} = require('react');

import type {
  PreloadableConcreteRequest,
  LoadQueryOptions,
  PreloadedQuery,
} from './EntryPointTypes.flow';
import type {GraphQLTaggedNode, OperationType} from 'relay-runtime';

type useQueryLoaderHookType<TQuery: OperationType> = [
  ?PreloadedQuery<TQuery>,
  (
    variables: $ElementType<TQuery, 'variables'>,
    options?: LoadQueryOptions,
  ) => void,
  () => void,
];

// NullQueryReference needs to implement referential equality,
// so that multiple NullQueryReferences can be in the same set
// (corresponding to multiple calls to disposeQuery).
type NullQueryReference = {|
  kind: 'NullQueryReference',
|};
const initialNullQueryReferenceState = {kind: 'NullQueryReference'};

function useQueryLoader<TQuery: OperationType>(
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
): useQueryLoaderHookType<TQuery> {
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

  const environment = useRelayEnvironment();
  useTrackLoadQueryInRender();

  const isMountedRef = useIsMountedRef();
  const undisposedQueryReferencesRef = useRef(
    new Set([initialNullQueryReferenceState]),
  );

  const [queryReference, setQueryReference] = useState<
    PreloadedQuery<TQuery> | NullQueryReference,
  >(initialNullQueryReferenceState);

  const disposeQuery = useCallback(() => {
    if (isMountedRef.current) {
      const nullQueryReference = {
        kind: 'NullQueryReference',
      };
      undisposedQueryReferencesRef.current.add(nullQueryReference);
      setQueryReference(nullQueryReference);
    }
  }, [setQueryReference, isMountedRef]);

  useEffect(
    function ensureQueryReferenceDisposal() {
      // We are relying on the fact that sets iterate in insertion order, and we
      // can remove items from a set as we iterate over it (i.e. no iterator
      // invalidation issues.) Thus, it is safe to loop through
      // undisposedQueryReferences until we find queryReference, and
      // remove and dispose all previous references.
      //
      // We are guaranteed to find queryReference in the set, because if a
      // state change results in a commit, no state changes initiated prior to that
      // one will be committed, and we are disposing and removing references
      // associated with commits that were initiated prior to the currently
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
            undisposedQueryReference.dispose();
          }
        }
      }
    },
    [queryReference, isMountedRef],
  );

  useEffect(() => {
    return function disposeAllRemainingQueryReferences() {
      // undisposedQueryReferences.current is never reassigned
      // eslint-disable-next-line react-hooks/exhaustive-deps
      for (const unhandledStateChange of undisposedQueryReferencesRef.current) {
        if (unhandledStateChange.kind !== 'NullQueryReference') {
          unhandledStateChange.dispose();
        }
      }
    };
  }, []);

  const queryLoaderCallback = useCallback(
    (
      variables: $ElementType<TQuery, 'variables'>,
      options?: LoadQueryOptions,
    ) => {
      if (isMountedRef.current) {
        const updatedQueryReference = loadQuery(
          environment,
          preloadableRequest,
          variables,
          options,
        );
        undisposedQueryReferencesRef.current.add(updatedQueryReference);
        setQueryReference(updatedQueryReference);
      }
    },
    [environment, preloadableRequest, setQueryReference, isMountedRef],
  );

  return [
    queryReference.kind === 'NullQueryReference' ? null : queryReference,
    queryLoaderCallback,
    disposeQuery,
  ];
}

module.exports = useQueryLoader;
