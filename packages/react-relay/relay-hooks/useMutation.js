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

import type {
  CommitMutationConfig,
  DeclarativeMutationConfig,
  Disposable,
  IEnvironment,
  Mutation,
  MutationParameters,
  PayloadError,
  SelectorStoreUpdater,
  UploadableMap,
  Variables,
} from 'relay-runtime';

const useIsMountedRef = require('./useIsMountedRef');
const useRelayEnvironment = require('./useRelayEnvironment');
const React = require('react');
const {commitMutation: defaultCommitMutation} = require('relay-runtime');

const {useState, useEffect, useRef, useCallback} = React;

export type UseMutationConfig<TMutation: MutationParameters> = {
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
};

type UseMutationConfigInternal<TVariables, TData, TRawResponse> = {
  configs?: Array<DeclarativeMutationConfig>,
  onError?: ?(error: Error) => void,
  onCompleted?: ?(response: TData, errors: ?Array<PayloadError>) => void,
  onNext?: ?() => void,
  onUnsubscribe?: ?() => void,
  optimisticResponse?: TRawResponse,
  optimisticUpdater?: ?SelectorStoreUpdater<TData>,
  updater?: ?SelectorStoreUpdater<TData>,
  uploadables?: UploadableMap,
  variables: TVariables,
};

hook useMutation<TVariables: Variables, TData, TRawResponse = {...}>(
  mutation: Mutation<TVariables, TData, TRawResponse>,
  commitMutationFn?: (
    environment: IEnvironment,
    config: CommitMutationConfig<TVariables, TData, TRawResponse>,
  ) => Disposable = defaultCommitMutation,
): [
  (UseMutationConfigInternal<TVariables, TData, TRawResponse>) => Disposable,
  boolean,
] {
  const environment = useRelayEnvironment();
  const isMountedRef = useIsMountedRef();
  const environmentRef = useRef(environment);
  const mutationRef = useRef(mutation);
  const inFlightMutationsRef = useRef(new Set<Disposable>());
  const [isMutationInFlight, setMutationInFlight] = useState(false);

  const cleanup = useCallback(
    (disposable: Disposable) => {
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
    (config: UseMutationConfigInternal<TVariables, TData, TRawResponse>) => {
      if (isMountedRef.current) {
        setMutationInFlight(true);
      }
      const disposable: Disposable = commitMutationFn(environment, {
        ...config,
        mutation,
        onCompleted: (response: TData, errors: ?Array<PayloadError>) => {
          cleanup(disposable);
          config.onCompleted?.(response, errors);
        },
        onError: (error: Error) => {
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
      return disposable;
    },
    [cleanup, commitMutationFn, environment, isMountedRef, mutation],
  );

  return [commit, isMutationInFlight];
}

module.exports = useMutation;
