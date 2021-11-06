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

import type {DataID, Disposable, InvalidationState} from 'relay-runtime';

const useRelayEnvironment = require('./useRelayEnvironment');
const {useEffect, useRef} = require('react');

/**
 * This hook subscribes a callback to the invalidation state of the given data
 * ids.
 * Any time the invalidation state of the given data ids changes, the provided
 * callback will be called.
 * If new ids or a new callback are provided, the subscription will be
 * re-established and the previous one will be disposed.
 * The subscription will automatically be disposed on unmount
 */
function useSubscribeToInvalidationState(
  dataIDs: $ReadOnlyArray<DataID>,
  callback: () => void,
): Disposable {
  const environment = useRelayEnvironment();
  const disposableRef = useRef(null);

  const stableDataIDs = Array.from(dataIDs).sort().join('');
  useEffect(() => {
    const store = environment.getStore();
    const invalidationState = store.lookupInvalidationState(dataIDs);
    const disposable = store.subscribeToInvalidationState(
      invalidationState,
      callback,
    );
    disposableRef.current = disposable;
    return () => disposable.dispose();

    // Intentionally excluding dataIDs, since we're using stableDataIDs
    // instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableDataIDs, callback, environment]);

  return {
    dispose: () => {
      if (disposableRef.current != null) {
        disposableRef.current.dispose();
      }
    },
  };
}

module.exports = useSubscribeToInvalidationState;
