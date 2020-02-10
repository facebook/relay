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

const React = require('react');

const invariant = require('invariant');
const useRelayEnvironment = require('./useRelayEnvironment');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');

const {
  __internal: {getObservableForActiveRequest},
  getFragment,
  getSelector,
} = require('relay-runtime');

import type {GraphQLTaggedNode} from 'relay-runtime';

const {useEffect, useState, useMemo} = React;

function useIsParentQueryInFlight<TKey: ?{+$data?: mixed, ...}>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): boolean {
  const environment = useRelayEnvironment();
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(
    fragmentNode,
    'first argument of useIsParentQueryInFlight()',
  );
  const observable = useMemo(() => {
    const selector = getSelector(fragmentNode, fragmentRef);
    if (selector == null) {
      return null;
    }
    invariant(
      selector.kind === 'SingularReaderSelector',
      'useIsParentQueryInFlight: Plural fragments are not supported.',
    );
    return getObservableForActiveRequest(environment, selector.owner);
  }, [environment, fragmentNode, fragmentRef]);
  const [isInFlight, setIsInFlight] = useState(observable != null);

  useEffect(() => {
    let subscription;
    setIsInFlight(observable != null);
    if (observable != null) {
      const onCompleteOrError = () => {
        setIsInFlight(false);
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

  return isInFlight;
}

module.exports = useIsParentQueryInFlight;
