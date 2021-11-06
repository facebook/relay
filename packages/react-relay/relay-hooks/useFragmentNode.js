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

import type {ReaderFragment} from 'relay-runtime';

const {getFragmentResourceForEnvironment} = require('./FragmentResource');
const useRelayEnvironment = require('./useRelayEnvironment');
const {useEffect, useRef, useState} = require('react');
const {getFragmentIdentifier} = require('relay-runtime');
const warning = require('warning');

type ReturnType<TFragmentData: mixed> = {|
  data: TFragmentData,
  disableStoreUpdates: () => void,
  enableStoreUpdates: () => void,
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
    const didMissUpdates =
      FragmentResource.checkMissedUpdates(fragmentResult)[0];
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

    // React bails out on noop state updates as an optimization.
    // If we want to force an update via setState, we need to pass an value.
    // The actual value can be arbitrary though, e.g. an incremented number.
    forceUpdate(count => count + 1);
  }

  // Establish Relay store subscriptions in the commit phase, only if
  // rendering for the first time, or if we need to subscribe to new data
  // If the fragment identifier changes, it means that the variables on the
  // fragment owner changed, or the fragment ref points to different records.
  // In this case, we need to resubscribe to the Relay store.
  useEffect(() => {
    isMountedRef.current = true;
    const disposable = FragmentResource.subscribe(
      fragmentResult,
      handleDataUpdate,
    );

    return () => {
      // When unmounting or resubscribing to new data, clean up current
      // subscription. This will also make sure fragment data is no longer
      // cached so that next time it its read, it will be freshly read from
      // the Relay store
      isMountedRef.current = false;
      disposable.dispose();
    };
    // NOTE: We disable react-hooks-deps warning because environment and fragmentIdentifier
    // is capturing all information about whether the effect should be re-ran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, fragmentIdentifier]);

  if (__DEV__) {
    if (
      fragmentRef != null &&
      (fragmentResult.data === undefined ||
        (Array.isArray(fragmentResult.data) &&
          fragmentResult.data.length > 0 &&
          fragmentResult.data.every(data => data === undefined)))
    ) {
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
    // $FlowFixMe[incompatible-return]
    data: fragmentResult.data,
    disableStoreUpdates,
    enableStoreUpdates,
  };
}

module.exports = useFragmentNode;
