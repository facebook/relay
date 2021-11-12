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

import type {
  DeclarativeMutationConfig,
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  MutationConfig,
  MutationParameters,
  PayloadError,
  SelectorStoreUpdater,
  UploadableMap,
} from 'relay-runtime';

const useIsMountedRef = require('./useIsMountedRef');
const useRelayEnvironment = require('./useRelayEnvironment');
const React = require('react');
const {commitMutation: defaultCommitMutation} = require('relay-runtime');

const {useState, useEffect, useRef, useCallback} = React;

export type UseMutationConfig<TMutation: MutationParameters> = {|
  configs?: Array<DeclarativeMutationConfig>,
  onError?: ?(error: Error) => void,
  onCompleted?: ?(
    response: TMutation['response'],
    errors: ?Array<PayloadError>,
  ) => void,
  onNext?: ?() => void,
  onUnsubscribe?: ?() => void,
  optimisticResponse?: {
    +rawResponse?: {...},
    ...TMutation,
    ...
  }['rawResponse'],
  optimisticUpdater?: ?SelectorStoreUpdater<TMutation['response']>,
  updater?: ?SelectorStoreUpdater<TMutation['response']>,
  uploadables?: UploadableMap,
  variables: TMutation['variables'],
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
  const inFlightMutationsRef = useRef(new Set());
  const [isMutationInFlight, setMutationInFlight] = useState(false);

  const cleanup = useCallback(
    disposable => {
      if (
        environmentRef.current === environment &&
        mutationRef.current === mutation
      ) {
        inFlightMutationsRef.current.delete(disposable);
        if (isMountedRef.current) {
          setMutationInFlight(inFlightMutationsRef.current.size > 0);
        }
      }
    },
    [environment, isMountedRef, mutation],
  );

  useEffect(() => {
    if (
      environmentRef.current !== environment ||
      mutationRef.current !== mutation
    ) {
      inFlightMutationsRef.current = new Set();
      if (isMountedRef.current) {
        setMutationInFlight(false);
      }
      environmentRef.current = environment;
      mutationRef.current = mutation;
    }
  }, [environment, isMountedRef, mutation]);

  const commit = useCallback(
    (config: UseMutationConfig<TMutation>) => {
      const disposable = commitMutationFn(environment, {
        ...config,
        mutation,
        onCompleted: (response, errors) => {
          cleanup(disposable);
          config.onCompleted?.(response, errors);
        },
        onError: error => {
          cleanup(disposable);
          config.onError?.(error);
        },
        onUnsubscribe: () => {
          cleanup(disposable);
          config.onUnsubscribe?.();
        },
        onNext: () => {
          config.onNext?.();
        },
      });
      inFlightMutationsRef.current.add(disposable);
      if (isMountedRef.current) {
        setMutationInFlight(true);
      }
      return disposable;
    },
    [cleanup, commitMutationFn, environment, isMountedRef, mutation],
  );

  return [commit, isMutationInFlight];
}

module.exports = useMutation;
