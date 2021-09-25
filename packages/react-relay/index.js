/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const ReactRelayContext = require('./ReactRelayContext');
const ReactRelayFragmentContainer = require('./ReactRelayFragmentContainer');
const ReactRelayLocalQueryRenderer = require('./ReactRelayLocalQueryRenderer');
const ReactRelayPaginationContainer = require('./ReactRelayPaginationContainer');
const ReactRelayQueryRenderer = require('./ReactRelayQueryRenderer');
const ReactRelayRefetchContainer = require('./ReactRelayRefetchContainer');
const EntryPointContainer = require('./relay-hooks/EntryPointContainer.react');
const loadEntryPoint = require('./relay-hooks/loadEntryPoint');
const {loadQuery} = require('./relay-hooks/loadQuery');
const RelayEnvironmentProvider = require('./relay-hooks/RelayEnvironmentProvider');
const useEntryPointLoader = require('./relay-hooks/useEntryPointLoader');
const useFragment = require('./relay-hooks/useFragment');
const useLazyLoadQuery = require('./relay-hooks/useLazyLoadQuery');
const useMutation = require('./relay-hooks/useMutation');
const usePaginationFragment = require('./relay-hooks/usePaginationFragment');
const usePreloadedQuery = require('./relay-hooks/usePreloadedQuery');
const useQueryLoader = require('./relay-hooks/useQueryLoader');
const useRefetchableFragment = require('./relay-hooks/useRefetchableFragment');
const useRelayEnvironment = require('./relay-hooks/useRelayEnvironment');
const useSubscribeToInvalidationState = require('./relay-hooks/useSubscribeToInvalidationState');
const useSubscription = require('./relay-hooks/useSubscription');
const RelayRuntime = require('relay-runtime');

export type {
  $FragmentRef,
  $RelayProps,
  RelayFragmentContainer,
  RelayPaginationContainer,
  RelayPaginationProp,
  RelayProp,
  RelayRefetchContainer,
  RelayRefetchProp,
} from './ReactRelayTypes';
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
} from './relay-hooks/useRefetchableFragmentNode';
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

/**
 * The public interface to react-relay.
 * Currently contains both Relay Hooks and legacy Container APIs.
 * Will eventually only export the interface from ./hooks.js.
 */
module.exports = {
  ConnectionHandler: RelayRuntime.ConnectionHandler,
  QueryRenderer: ReactRelayQueryRenderer,
  LocalQueryRenderer: ReactRelayLocalQueryRenderer,

  MutationTypes: RelayRuntime.MutationTypes,
  RangeOperations: RelayRuntime.RangeOperations,

  ReactRelayContext,

  applyOptimisticMutation: RelayRuntime.applyOptimisticMutation,
  commitLocalUpdate: RelayRuntime.commitLocalUpdate,
  commitMutation: RelayRuntime.commitMutation,
  createFragmentContainer: ReactRelayFragmentContainer.createContainer,
  createPaginationContainer: ReactRelayPaginationContainer.createContainer,
  createRefetchContainer: ReactRelayRefetchContainer.createContainer,
  fetchQuery_DEPRECATED: RelayRuntime.fetchQuery_DEPRECATED,
  graphql: RelayRuntime.graphql,
  readInlineData: RelayRuntime.readInlineData,
  requestSubscription: RelayRuntime.requestSubscription,

  // Relay Hooks
  EntryPointContainer: EntryPointContainer,
  RelayEnvironmentProvider: RelayEnvironmentProvider,

  fetchQuery: RelayRuntime.fetchQuery,

  loadQuery: loadQuery,
  loadEntryPoint: loadEntryPoint,

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
