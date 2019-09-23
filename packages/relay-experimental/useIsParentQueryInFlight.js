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

const React = require('react');

const invariant = require('invariant');
const useRelayEnvironment = require('./useRelayEnvironment');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');

const {
  __internal: {getObservableForRequestInFlight},
  getFragment,
  getFragmentOwner,
} = require('relay-runtime');

import type {GraphQLTaggedNode} from 'relay-runtime';

const {useEffect, useState, useMemo} = React;

function useIsParentQueryInFlight<TKey: ?{+$data?: mixed}>(
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
    // $FlowFixMe - TODO T39154660 Use FragmentPointer type instead of mixed
    const fragmentOwnerOrOwners = getFragmentOwner(fragmentNode, fragmentRef);
    if (fragmentOwnerOrOwners == null) {
      return null;
    }
    invariant(
      !Array.isArray(fragmentOwnerOrOwners),
      'useIsParentQueryInFlight: Plural fragments are not supported.',
    );
    return getObservableForRequestInFlight(environment, fragmentOwnerOrOwners);
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
