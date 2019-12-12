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

const useRelayEnvironment = require('./useRelayEnvironment');

const {commitMutation: defaultCommitMutation} = require('relay-runtime');
const {useState, useEffect, useRef, useCallback} = React;
const useIsMountedRef = require('./useIsMountedRef');

import type {
  GraphQLTaggedNode,
  Disposable,
  MutationConfig,
  MutationParameters,
  IEnvironment,
  PayloadError,
  DeclarativeMutationConfig,
  SelectorStoreUpdater,
  UploadableMap,
} from 'relay-runtime';

export type UseMutationConfig<TMutation: MutationParameters> = {|
  configs?: Array<DeclarativeMutationConfig>,
  onError?: ?(error: Error) => void,
  onCompleted?: ?(
    response: $ElementType<TMutation, 'response'>,
    errors: ?Array<PayloadError>,
  ) => void,
  onUnsubscribe?: ?() => void,
  optimisticResponse?: $ElementType<
    {
      +rawResponse?: {...},
      ...TMutation,
      ...
    },
    'rawResponse',
  >,
  optimisticUpdater?: ?SelectorStoreUpdater,
  updater?: ?SelectorStoreUpdater,
  uploadables?: UploadableMap,
  variables: $ElementType<TMutation, 'variables'>,
|};

function useMutation<TMutation: MutationParameters>(
  mutation: GraphQLTaggedNode,
  commitMutationFn?: (
    environment: IEnvironment,
    config: MutationConfig<TMutation>,
  ) => Disposable = defaultCommitMutation,
): [(UseMutationConfig<TMutation>) => Disposable, boolean] {
  const environment = useRelayEnvironment();
  const isMountedRef = useIsMountedRef();
  const environmentRef = useRef(environment);
  const mutationRef = useRef(mutation);
  const inFlightMutationRef = useRef(null);
  const [isMutationInFlight, setMutationInFlight] = useState(false);

  const cleanup = useCallback(() => {
    if (
      environmentRef.current === environment &&
      mutationRef.current === mutation
    ) {
      inFlightMutationRef.current = null;
      if (isMountedRef.current) {
        setMutationInFlight(false);
      }
    }
  }, [environment, mutation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      environmentRef.current !== environment ||
      mutationRef.current !== mutation
    ) {
      inFlightMutationRef.current = null;
      if (isMountedRef.current) {
        setMutationInFlight(false);
      }
      environmentRef.current = environment;
      mutationRef.current = mutation;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, mutation]);

  const commit = useCallback(
    (config: UseMutationConfig<TMutation>) => {
      if (inFlightMutationRef.current) {
        return {dispose: () => {}};
      }
      if (isMountedRef.current) {
        setMutationInFlight(true);
      }
      const disposable = commitMutationFn(environment, {
        ...config,
        mutation,
        onCompleted: (response, errors) => {
          cleanup();
          config.onCompleted && config.onCompleted(response, errors);
        },
        onError: error => {
          cleanup();
          config.onError && config.onError(error);
        },
        onUnsubscribe: () => {
          cleanup();
          config.onUnsubscribe && config.onUnsubscribe();
        },
      });
      inFlightMutationRef.current = disposable;
      return disposable;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cleanup, commitMutationFn, environment, mutation],
  );

  return [commit, isMutationInFlight];
}

module.exports = useMutation;
