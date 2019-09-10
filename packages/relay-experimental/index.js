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

const MatchContainer = require('./MatchContainer');
const ProfilerContext = require('./ProfilerContext');
const RelayEnvironmentProvider = require('./RelayEnvironmentProvider');

const fetchQuery = require('./fetchQuery');
const useBlockingPaginationFragment = require('./useBlockingPaginationFragment');
const useFragment = require('./useFragment');
const useLegacyPaginationFragment = require('./useLegacyPaginationFragment');
const useQuery = require('./useQuery');
const useRefetchableFragment = require('./useRefetchableFragment');
const useRelayEnvironment = require('./useRelayEnvironment');

export type {MatchContainerProps, MatchPointer} from './MatchContainer';
export type {ProfilerContextType} from './ProfilerContext';
export type {FetchPolicy} from './QueryResource';
export type {Direction, LoadMoreFn} from './useLoadMoreFunction';
export type {
  RefetchFn,
  Options as RefetchOptions,
} from './useRefetchableFragmentNode';

module.exports = {
  MatchContainer: MatchContainer,
  ProfilerContext: ProfilerContext,
  RelayEnvironmentProvider: RelayEnvironmentProvider,

  fetchQuery: fetchQuery,

  useQuery: useQuery,
  useFragment: useFragment,
  useBlockingPaginationFragment: useBlockingPaginationFragment,
  usePaginationFragment: useLegacyPaginationFragment,
  useRefetchableFragment: useRefetchableFragment,
  useRelayEnvironment: useRelayEnvironment,
  useLegacyPaginationFragment: useLegacyPaginationFragment,
};
