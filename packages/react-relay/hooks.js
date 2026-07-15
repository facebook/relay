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

/* eslint relay-internal/esm-compatible-cjs: error */

const EntryPointContainer = require('./relay-hooks/EntryPointContainer.react');
const loadEntryPoint = require('./relay-hooks/loadEntryPoint');
const {loadQuery} = require('./relay-hooks/loadQuery');
const ProfilerContext = require('./relay-hooks/ProfilerContext');
const RelayEnvironmentProvider = require('./relay-hooks/RelayEnvironmentProvider');
const useEntryPointLoader = require('./relay-hooks/useEntryPointLoader');
const useFragment = require('./relay-hooks/useFragment');
const useLazyLoadQuery = require('./relay-hooks/useLazyLoadQuery');
const useMutation = require('./relay-hooks/useMutation');
const useMutationAction_EXPERIMENTAL = require('./relay-hooks/useMutationAction_EXPERIMENTAL');
const usePaginationFragment = require('./relay-hooks/usePaginationFragment');
const usePreloadedQuery = require('./relay-hooks/usePreloadedQuery');
const useQueryLoader = require('./relay-hooks/useQueryLoader');
const useRefetchableFragment = require('./relay-hooks/useRefetchableFragment');
const useRelayEnvironment = require('./relay-hooks/useRelayEnvironment');
const useSubscribeToInvalidationState = require('./relay-hooks/useSubscribeToInvalidationState');
const useSubscription = require('./relay-hooks/useSubscription');
const RelayRuntime = require('relay-runtime');

export type * from './relay-hooks/EntryPointTypes.flow';
export type {
  MatchContainerProps,
  MatchPointer,
} from './relay-hooks/MatchContainer';
export type {ProfilerContextType} from './relay-hooks/ProfilerContext';
export type {LoadMoreFn} from './relay-hooks/useLoadMoreFunction';
export type {UseMutationConfig} from './relay-hooks/useMutation';
export type {UseQueryLoaderLoadQueryOptions} from './relay-hooks/useQueryLoader';
export type {
  RefetchFn,
  RefetchFnDynamic,
  Options as RefetchOptions,
} from './relay-hooks/legacy/useRefetchableFragmentNode';
export type {
  DataID,
  DeclarativeMutationConfig,
  Direction,
  Disposable,
  // RelayRuntime has two environment exports: one interface, one concrete.
  IEnvironment as Environment,
  GraphQLTaggedNode,
  MutationType,
  NormalizationSelector,
  OperationDescriptor,
  RangeOperation,
  ReaderSelector,
  RelayContext,
  Snapshot,
  Variables,
  FetchPolicy,
} from 'relay-runtime';

const {
  ConnectionHandler,
  applyOptimisticMutation,
  commitLocalUpdate,
  commitMutation,
  graphql,
  readInlineData,
  requestSubscription,
  fetchQuery,
} = RelayRuntime;

/**
 * The public interface for Relay Hooks.
 * This will eventually become the main public interface for react-relay.
 */
module.exports = {
  ConnectionHandler,

  applyOptimisticMutation,
  commitLocalUpdate,
  commitMutation,
  graphql,
  readInlineData,
  requestSubscription,

  EntryPointContainer: EntryPointContainer,
  RelayEnvironmentProvider: RelayEnvironmentProvider,

  ProfilerContext: ProfilerContext,

  fetchQuery,

  loadQuery: loadQuery,
  loadEntryPoint: loadEntryPoint,

  useFragment: useFragment,
  useLazyLoadQuery: useLazyLoadQuery,
  useEntryPointLoader: useEntryPointLoader,
  useQueryLoader: useQueryLoader,
  useMutation: useMutation,
  useMutationAction_EXPERIMENTAL: useMutationAction_EXPERIMENTAL,
  usePaginationFragment: usePaginationFragment,
  usePreloadedQuery: usePreloadedQuery,
  useRefetchableFragment: useRefetchableFragment,
  useRelayEnvironment: useRelayEnvironment,
  useSubscribeToInvalidationState: useSubscribeToInvalidationState,
  useSubscription: useSubscription,
};
