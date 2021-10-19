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
  FetchPolicy,
} from 'relay-runtime';

/**
 * Legacy react-relay exports.
 * Should prefer using interface defined in ./hooks.js
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
};
