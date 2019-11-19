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

const useRelayEnvironment = require('./useRelayEnvironment');
const warning = require('warning');

const {getFragmentResourceForEnvironment} = require('./FragmentResource');
const {useEffect, useRef, useState} = require('react');
const {getFragmentIdentifier} = require('relay-runtime');

import type {ReaderFragment} from 'relay-runtime';

type ReturnType<TFragmentData: mixed> = {|
  data: TFragmentData,
  disableStoreUpdates: () => void,
  enableStoreUpdates: () => void,
  shouldUpdateGeneration: number | null,
|};

function useFragmentNode<TFragmentData: mixed>(
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
  componentDisplayName: string,
): ReturnType<TFragmentData> {
  const environment = useRelayEnvironment();
  const FragmentResource = getFragmentResourceForEnvironment(environment);

  const isMountedRef = useRef(false);
  const [, forceUpdate] = useState(0);
  const fragmentIdentifier = getFragmentIdentifier(fragmentNode, fragmentRef);

  // The values of these React refs are counters that should be incremented
  // under their respective conditions. This allows us to use the counters as
  // memoization values to indicate if computations for useMemo or useEffect
  // should be re-executed.
  const mustResubscribeGenerationRef = useRef(0);
  const shouldUpdateGenerationRef = useRef(0);

  const environmentChanged = useHasChanged(environment);
  const fragmentIdentifierChanged = useHasChanged(fragmentIdentifier);

  // If the fragment identifier changes, it means that the variables on the
  // fragment owner changed, or the fragment ref points to different records.
  // In this case, we need to resubscribe to the Relay store.
  const mustResubscribe = environmentChanged || fragmentIdentifierChanged;

  // We only want to update the component consuming this fragment under the
  // following circumstances:
  // - We receive an update from the Relay store, indicating that the data
  //   the component is directly subscribed to has changed.
  // - We need to subscribe and render /different/ data (i.e. the fragment refs
  //   now point to different records, or the context changed).
  //   Note that even if identity of the fragment ref objects changes, we
  //   don't consider them as different unless they point to a different data ID.
  //
  // This prevents unnecessary updates when a parent re-renders this component
  // with the same props, which is a common case when the parent updates due
  // to change in the data /it/ is subscribed to, but which doesn't affect the
  // child.

  if (mustResubscribe) {
    shouldUpdateGenerationRef.current++;
    mustResubscribeGenerationRef.current++;
  }

  // Read fragment data; this might suspend.
  const fragmentResult = FragmentResource.readWithIdentifier(
    fragmentNode,
    fragmentRef,
    fragmentIdentifier,
    componentDisplayName,
  );

  const isListeningForUpdatesRef = useRef(true);
  function enableStoreUpdates() {
    isListeningForUpdatesRef.current = true;
    const didMissUpdates = FragmentResource.checkMissedUpdates(
      fragmentResult,
    )[0];
    if (didMissUpdates) {
      handleDataUpdate();
    }
  }

  function disableStoreUpdates() {
    isListeningForUpdatesRef.current = false;
  }

  function handleDataUpdate() {
    if (
      isMountedRef.current === false ||
      isListeningForUpdatesRef.current === false
    ) {
      return;
    }

    // If we receive an update from the Relay store, we need to make sure the
    // consuming component updates.
    shouldUpdateGenerationRef.current++;

    // React bails out on noop state updates as an optimization.
    // If we want to force an update via setState, we need to pass an value.
    // The actual value can be arbitrary though, e.g. an incremented number.
    forceUpdate(count => count + 1);
  }

  // Establish Relay store subscriptions in the commit phase, only if
  // rendering for the first time, or if we need to subscribe to new data
  useEffect(() => {
    isMountedRef.current = true;
    const disposable = FragmentResource.subscribe(
      fragmentResult,
      handleDataUpdate,
    );

    return () => {
      // When unmounting or resubscribing to new data, clean up current
      // subscription. This will also make sure fragment data is no longer
      // cached for the so next time it its read, it will be read fresh from the
      // Relay store
      isMountedRef.current = false;
      disposable.dispose();
    };
    // NOTE: We disable react-hooks-deps warning because mustResubscribeGenerationRef
    // is capturing all information about whether the effect should be re-ran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustResubscribeGenerationRef.current]);

  if (__DEV__) {
    if (fragmentRef != null && fragmentResult.data == null) {
      warning(
        false,
        'Relay: Expected to have been able to read non-null data for ' +
          'fragment `%s` declared in ' +
          '`%s`, since fragment reference was non-null. ' +
          "Make sure that that `%s`'s parent isn't " +
          'holding on to and/or passing a fragment reference for data that ' +
          'has been deleted.',
        fragmentNode.name,
        componentDisplayName,
        componentDisplayName,
      );
    }
  }

  return {
    // $FlowFixMe
    data: fragmentResult.data,
    disableStoreUpdates,
    enableStoreUpdates,
    shouldUpdateGeneration: shouldUpdateGenerationRef.current,
  };
}

function useHasChanged(value: mixed): boolean {
  const [mirroredValue, setMirroredValue] = useState(value);
  const valueChanged = mirroredValue !== value;
  if (valueChanged) {
    setMirroredValue(value);
  }
  return valueChanged;
}

module.exports = useFragmentNode;
