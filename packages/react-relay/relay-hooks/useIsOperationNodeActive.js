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

import type {ReaderFragment, RequestDescriptor} from 'relay-runtime';

const useRelayEnvironment = require('./useRelayEnvironment');
const invariant = require('invariant');
const React = require('react');
const {
  __internal: {getObservableForActiveRequest},
  getSelector,
} = require('relay-runtime');

const {useEffect, useState, useMemo} = React;

// The observable memo is keyed on `owner` (the request's RequestDescriptor)
// rather than on `fragmentRef`. `fragmentRef` is a wrapper that Relay
// re-materializes with a fresh identity on every render (a raw
// `environment.lookup` re-read), so keying on it recreated the Observable every
// render — each `getObservableForActiveRequest` call returns a fresh
// `Observable` — which re-ran the effect below and re-flipped `isActive` every
// render: a self-sustaining re-render loop that could exceed React's
// update-depth limit ("Maximum update depth exceeded") while a request stayed
// active. `owner`, by contrast, is stable across those re-reads (it maps to the
// query) and changes only when a new query is created — e.g. a refetch/reload —
// which is exactly when we do want a fresh Observable. The `owner` derivation is
// memoized so `getSelector` doesn't run every render in the steady state.
hook useIsOperationNodeActive(
  fragmentNode: ReaderFragment,
  fragmentRef: unknown,
): boolean {
  const environment = useRelayEnvironment();
  const owner = useMemo((): ?RequestDescriptor => {
    const selector = getSelector(fragmentNode, fragmentRef);
    if (selector == null) {
      return null;
    }
    invariant(
      selector.kind === 'SingularReaderSelector',
      'useIsOperationNodeActive: Plural fragments are not supported.',
    );
    return selector.owner;
  }, [fragmentNode, fragmentRef]);
  const observable = useMemo(
    () =>
      owner != null ? getObservableForActiveRequest(environment, owner) : null,
    [environment, owner],
  );
  const [isActive, setIsActive] = useState(observable != null);

  useEffect(() => {
    let subscription;
    setIsActive(observable != null);
    if (observable != null) {
      const onCompleteOrError = () => {
        setIsActive(false);
      };
      subscription = observable.subscribe({
        complete: onCompleteOrError,
        error: onCompleteOrError,
      });
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [observable]);

  return isActive;
}

module.exports = useIsOperationNodeActive;
