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

const loadEntryPoint = require('./loadEntryPoint');
const useIsMountedRef = require('./useIsMountedRef');

const {useTrackLoadQueryInRender} = require('./loadQuery');
const {useCallback, useEffect, useRef, useState} = require('react');

import type {
  EntryPoint,
  EntryPointComponent,
  EnvironmentProviderOptions,
  IEnvironmentProvider,
  PreloadedEntryPoint,
} from './EntryPointTypes.flow';

type UseLoadEntryPointHookType<
  TEntryPointParams: {...},
  TPreloadedQueries: {...},
  TPreloadedEntryPoints: {...},
  TRuntimeProps: {...},
  TExtraProps,
  TEntryPointComponent: EntryPointComponent<
    TPreloadedQueries,
    TPreloadedEntryPoints,
    TRuntimeProps,
    TExtraProps,
  >,
> = [
  ?PreloadedEntryPoint<TEntryPointComponent>,
  (params: TEntryPointParams) => void,
  () => void,
];

// NullEntryPointReference needs to implement referential equality,
// so that multiple NullEntryPointReferences can be in the same set
// (corresponding to multiple calls to disposeEntryPoint).
type NullEntryPointReference = {|
  kind: 'NullEntryPointReference',
|};
const initialNullEntryPointReferenceState = {kind: 'NullEntryPointReference'};

function useLoadEntryPoint<
  TEntryPointParams: {...},
  TPreloadedQueries: {...},
  TPreloadedEntryPoints: {...},
  TRuntimeProps: {...},
  TExtraProps,
  TEntryPointComponent: EntryPointComponent<
    TPreloadedQueries,
    TPreloadedEntryPoints,
    TRuntimeProps,
    TExtraProps,
  >,
  TEntryPoint: EntryPoint<TEntryPointParams, TEntryPointComponent>,
>(
  environmentProvider: IEnvironmentProvider<EnvironmentProviderOptions>,
  entryPoint: TEntryPoint,
): UseLoadEntryPointHookType<
  TEntryPointParams,
  TPreloadedQueries,
  TPreloadedEntryPoints,
  TRuntimeProps,
  TExtraProps,
  TEntryPointComponent,
> {
  /**
   * We want to always call `entryPointReference.dispose()` for every call to
   * `setEntryPointReference(loadEntryPoint(...))` so that no leaks of data in Relay
   * stores will occur.
   *
   * However, a call to `setState(newState)` is not always followed by a commit where
   * this value is reflected in the state. Thus, we cannot reliably clean up each ref
   * with `useEffect(() => () => entryPointReference.dispose(), [entryPointReference])`.
   *
   * Instead, we keep track of each call to `loadEntryPoint` in a ref.
   * Relying on the fact that if a state change commits, no state changes that were
   * initiated prior to the currently committing state change will ever subsequently
   * commit, we can safely dispose of all preloaded entry point references
   * associated with state changes initiated prior to the currently committing state
   * change.
   *
   * Finally, when the hook unmounts, we also dispose of all remaining uncommitted
   * entry point references.
   */

  useTrackLoadQueryInRender();

  const isMountedRef = useIsMountedRef();
  const undisposedEntryPointReferencesRef = useRef<
    Set<PreloadedEntryPoint<TEntryPointComponent> | NullEntryPointReference>,
  >(new Set([initialNullEntryPointReferenceState]));

  const [entryPointReference, setEntryPointReference] = useState<
    PreloadedEntryPoint<TEntryPointComponent> | NullEntryPointReference,
  >(initialNullEntryPointReferenceState);

  const disposeEntryPoint = useCallback(() => {
    if (isMountedRef.current) {
      const nullEntryPointReference = {
        kind: 'NullEntryPointReference',
      };
      undisposedEntryPointReferencesRef.current.add(nullEntryPointReference);
      setEntryPointReference(nullEntryPointReference);
    }
  }, [setEntryPointReference, isMountedRef]);

  useEffect(
    function disposePriorEntryPointReferences() {
      // We are relying on the fact that sets iterate in insertion order, and we
      // can remove items from a set as we iterate over it (i.e. no iterator
      // invalidation issues.) Thus, it is safe to loop through
      // undisposedEntryPointReferences until we find entryPointReference, and
      // remove and dispose all previous references.
      //
      // We are guaranteed to find entryPointReference in the set, because if a
      // state change results in a commit, no state changes initiated prior to that
      // one will be committed, and we are disposing and removing references
      // associated with commits that were initiated prior to the currently
      // committing state change. (A useEffect callback is called during the commit
      // phase.)
      const undisposedEntryPointReferences =
        undisposedEntryPointReferencesRef.current;

      if (isMountedRef.current) {
        for (const undisposedEntryPointReference of undisposedEntryPointReferences) {
          if (undisposedEntryPointReference === entryPointReference) {
            break;
          }

          undisposedEntryPointReferences.delete(undisposedEntryPointReference);
          if (
            undisposedEntryPointReference.kind !== 'NullEntryPointReference'
          ) {
            undisposedEntryPointReference.dispose();
          }
        }
      }
    },
    [entryPointReference, isMountedRef],
  );

  useEffect(() => {
    return function disposeAllRemainingEntryPointReferences() {
      // undisposedEntryPointReferences.current is never reassigned
      // eslint-disable-next-line react-hooks/exhaustive-deps
      for (const unhandledStateChange of undisposedEntryPointReferencesRef.current) {
        if (unhandledStateChange.kind !== 'NullEntryPointReference') {
          unhandledStateChange.dispose();
        }
      }
    };
  }, []);

  const entryPointLoaderCallback = useCallback(
    (params: TEntryPointParams) => {
      if (isMountedRef.current) {
        const updatedEntryPointReference = loadEntryPoint(
          environmentProvider,
          entryPoint,
          params,
        );
        undisposedEntryPointReferencesRef.current.add(
          updatedEntryPointReference,
        );
        setEntryPointReference(updatedEntryPointReference);
      }
    },
    [environmentProvider, entryPoint, setEntryPointReference, isMountedRef],
  );

  return [
    entryPointReference.kind === 'NullEntryPointReference'
      ? null
      : entryPointReference,
    entryPointLoaderCallback,
    disposeEntryPoint,
  ];
}

module.exports = useLoadEntryPoint;
