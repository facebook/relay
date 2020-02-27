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

const EntryPointContainer = require('./EntryPointContainer.react');
const LazyLoadEntryPointContainer_DEPRECATED = require('./LazyLoadEntryPointContainer_DEPRECATED.react');
const MatchContainer = require('./MatchContainer');
const PreloadableQueryRegistry = require('./PreloadableQueryRegistry');
const ProfilerContext = require('./ProfilerContext');
const RelayEnvironmentProvider = require('./RelayEnvironmentProvider');

const fetchQuery = require('./fetchQuery');
const prepareEntryPoint = require('./prepareEntryPoint');
const useBlockingPaginationFragment = require('./useBlockingPaginationFragment');
const useFragment = require('./useFragment');
const useLazyLoadQuery = require('./useLazyLoadQuery');
const useMutation = require('./useMutation');
const usePaginationFragment = require('./usePaginationFragment');
const usePreloadedQuery = require('./usePreloadedQuery');
const useRefetchableFragment = require('./useRefetchableFragment');
const useRelayEnvironment = require('./useRelayEnvironment');
const useSubscribeToInvalidationState = require('./useSubscribeToInvalidationState');
const useSubscription = require('./useSubscription');

const {loadQuery} = require('./loadQuery');

export type * from './EntryPointTypes.flow';
export type {MatchContainerProps, MatchPointer} from './MatchContainer';
export type {ProfilerContextType} from './ProfilerContext';
export type {Direction, LoadMoreFn} from './useLoadMoreFunction';
export type {UseMutationConfig} from './useMutation';
export type {
  RefetchFn,
  RefetchFnDynamic,
  Options as RefetchOptions,
} from './useRefetchableFragmentNode';

module.exports = {
  EntryPointContainer: EntryPointContainer,
  LazyLoadEntryPointContainer_DEPRECATED: LazyLoadEntryPointContainer_DEPRECATED,
  MatchContainer: MatchContainer,
  ProfilerContext: ProfilerContext,
  RelayEnvironmentProvider: RelayEnvironmentProvider,
  PreloadableQueryRegistry: PreloadableQueryRegistry,

  fetchQuery: fetchQuery,

  preloadQuery: loadQuery,
  prepareEntryPoint: prepareEntryPoint,

  useBlockingPaginationFragment: useBlockingPaginationFragment,
  useFragment: useFragment,
  useLazyLoadQuery: useLazyLoadQuery,
  useMutation: useMutation,
  usePaginationFragment: usePaginationFragment,
  usePreloadedQuery: usePreloadedQuery,
  useRefetchableFragment: useRefetchableFragment,
  useRelayEnvironment: useRelayEnvironment,
  useSubscribeToInvalidationState: useSubscribeToInvalidationState,
  useSubscription: useSubscription,
};
