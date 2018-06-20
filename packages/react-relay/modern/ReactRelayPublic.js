/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const ReactRelayFragmentContainer = require('./ReactRelayFragmentContainer');
const ReactRelayPaginationContainer = require('./ReactRelayPaginationContainer');
const ReactRelayQueryRenderer = require('./ReactRelayQueryRenderer');
const ReactRelayRefetchContainer = require('./ReactRelayRefetchContainer');
const RelayRuntime = require('RelayRuntime');

export type {
  RelayPaginationProp,
  RelayProp,
  RelayRefetchProp,
  $FragmentRef,
} from './ReactRelayTypes';
export type {
  DataID,
  DeclarativeMutationConfig,
  Disposable,
  // RelayRuntime has two environment exports: one interface, one concrete.
  IEnvironment as Environment,
  GraphQLTaggedNode,
  MutationType,
  OperationSelector,
  RangeOperation,
  RelayContext,
  Selector,
  Snapshot,
  Variables,
} from 'RelayRuntime';

/**
 * The public interface to React Relay.
 */
module.exports = {
  QueryRenderer: ReactRelayQueryRenderer,

  MutationTypes: RelayRuntime.MutationTypes,
  RangeOperations: RelayRuntime.RangeOperations,

  applyOptimisticMutation: RelayRuntime.applyOptimisticMutation,
  commitLocalUpdate: RelayRuntime.commitLocalUpdate,
  commitMutation: RelayRuntime.commitMutation,
  createFragmentContainer: ReactRelayFragmentContainer.createContainer,
  createPaginationContainer: ReactRelayPaginationContainer.createContainer,
  createRefetchContainer: ReactRelayRefetchContainer.createContainer,
  fetchQuery: RelayRuntime.fetchQuery,
  graphql: RelayRuntime.graphql,
  requestSubscription: RelayRuntime.requestSubscription,
};
