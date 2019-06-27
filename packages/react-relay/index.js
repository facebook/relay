/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const ReactRelayContext = require('./ReactRelayContext');
const ReactRelayFragmentContainer = require('./ReactRelayFragmentContainer');
const ReactRelayLocalQueryRenderer = require('./ReactRelayLocalQueryRenderer');
const ReactRelayPaginationContainer = require('./ReactRelayPaginationContainer');
const ReactRelayQueryRenderer = require('./ReactRelayQueryRenderer');
const ReactRelayRefetchContainer = require('./ReactRelayRefetchContainer');
const RelayRuntime = require('relay-runtime');

const readInlineData = require('./readInlineData');

export type {
  $FragmentRef,
  $RelayProps,
  RelayFragmentContainer,
  RelayPaginationContainer,
  RelayPaginationProp,
  RelayProp,
  RelayRefetchContainer,
  RelayRefetchProp,
  FetchPolicy,
} from './ReactRelayTypes';
export type {
  DataID,
  DeclarativeMutationConfig,
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
} from 'relay-runtime';

/**
 * The public interface to React Relay.
 */
module.exports = {
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
  fetchQuery: RelayRuntime.fetchQuery,
  graphql: RelayRuntime.graphql,
  requestSubscription: RelayRuntime.requestSubscription,
  readInlineData_EXPERIMENTAL: readInlineData,
};
