/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const EntryPointContainer = require('./relay-experimental/EntryPointContainer.react');
const MatchContainer = require('./relay-experimental/MatchContainer');
const ProfilerContext = require('./relay-experimental/ProfilerContext');
const RelayEnvironmentProvider = require('./relay-experimental/RelayEnvironmentProvider');

const fetchQuery = require('./relay-experimental/fetchQuery');
const loadQuery = require('./relay-experimental/loadQuery');

const loadEntryPoint = require('./relay-experimental/loadEntryPoint');

const useBlockingPaginationFragment = require('./relay-experimental/useBlockingPaginationFragment');
const useEntryPointLoader = require('./relay-experimental/useEntryPointLoader');
const useFragment = require('./relay-experimental/useFragment');
const useLazyLoadQuery = require('./relay-experimental/useLazyLoadQuery');
const useMutation = require('./relay-experimental/useMutation');
const usePaginationFragment = require('./relay-experimental/usePaginationFragment');
const usePreloadedQuery = require('./relay-experimental/usePreloadedQuery');
const useQueryLoader = require('./relay-experimental/useQueryLoader');
const useRefetchableFragment = require('./relay-experimental/useRefetchableFragment');
const useRelayEnvironment = require('./relay-experimental/useRelayEnvironment');
const useSubscribeToInvalidationState = require('./relay-experimental/useSubscribeToInvalidationState')
const useSubscription = require('./relay-experimental/useSubscription');

const {graphql} = require('relay-runtime');

export type {
  LoadMoreFn,
  RefetchFn,
  RefetchFnDynamic,
} from 'relay-experimental';

export type {
  FetchPolicy,
  RenderPolicy,
} from 'relay-runtime';

/**
 * The public interface for Relay Hooks
 */
module.exports = {
  EntryPointContainer: EntryPointContainer,
  MatchContainer: MatchContainer,
  ProfilerContext: ProfilerContext,
  RelayEnvironmentProvider: RelayEnvironmentProvider,

  fetchQuery: fetchQuery,
  loadEntryPoint: loadEntryPoint,
  loadQuery: loadQuery,

  graphql: graphql,
  useBlockingPaginationFragment: useBlockingPaginationFragment,
  useEntryPointLoader: useEntryPointLoader,
  useFragment: useFragment,
  useLazyLoadQuery: useLazyLoadQuery,
  useMutation: useMutation,
  usePaginationFragment: usePaginationFragment,
  usePreloadedQuery: usePreloadedQuery,
  useQueryLoader: useQueryLoader,
  useRefetchableFragment: useRefetchableFragment,
  useRelayEnvironment: useRelayEnvironment,
  useSubscribeToInvalidationState: useSubscribeToInvalidationState,
  useSubscription: useSubscription,
};
