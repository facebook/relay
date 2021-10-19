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

import type {ReaderFragment} from 'relay-runtime';

const useRelayEnvironment = require('./useRelayEnvironment');
const invariant = require('invariant');
const React = require('react');
const {
  __internal: {getObservableForActiveRequest},
  getSelector,
} = require('relay-runtime');

const {useEffect, useState, useMemo} = React;

function useIsOperationNodeActive(
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
): boolean {
  const environment = useRelayEnvironment();
  const observable = useMemo(() => {
    const selector = getSelector(fragmentNode, fragmentRef);
    if (selector == null) {
      return null;
    }
    invariant(
      selector.kind === 'SingularReaderSelector',
      'useIsOperationNodeActive: Plural fragments are not supported.',
    );
    return getObservableForActiveRequest(environment, selector.owner);
  }, [environment, fragmentNode, fragmentRef]);
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
