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
const ProfilerContext = require('./ProfilerContext');
const RelayEnvironmentProvider = require('./RelayEnvironmentProvider');

const fetchQuery = require('./fetchQuery');
const loadEntryPoint = require('./loadEntryPoint');
const prepareEntryPoint_DEPRECATED = require('./prepareEntryPoint_DEPRECATED');
const useBlockingPaginationFragment = require('./useBlockingPaginationFragment');
const useEntryPointLoader = require('./useEntryPointLoader');
const useFragment = require('./useFragment');
const useLazyLoadQuery = require('./useLazyLoadQuery');
const useMutation = require('./useMutation');
const usePaginationFragment = require('./usePaginationFragment');
const usePreloadedQuery = require('./usePreloadedQuery');
const useQueryLoader = require('./useQueryLoader');
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

  fetchQuery: fetchQuery,

  loadQuery: loadQuery,
  loadEntryPoint: loadEntryPoint,

  prepareEntryPoint_DEPRECATED: prepareEntryPoint_DEPRECATED,

  useBlockingPaginationFragment: useBlockingPaginationFragment,
  useFragment: useFragment,
  useLazyLoadQuery: useLazyLoadQuery,
  useEntryPointLoader: useEntryPointLoader,
  useQueryLoader: useQueryLoader,
  useMutation: useMutation,
  usePaginationFragment: usePaginationFragment,
  usePreloadedQuery: usePreloadedQuery,
  useRefetchableFragment: useRefetchableFragment,
  useRelayEnvironment: useRelayEnvironment,
  useSubscribeToInvalidationState: useSubscribeToInvalidationState,
  useSubscription: useSubscription,
};
