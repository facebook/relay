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

const ReactRelayCompatContainerBuilder = require('./ReactRelayCompatContainerBuilder');
const ReactRelayQueryRenderer = require('../modern/ReactRelayQueryRenderer');
const RelayCompatContainer = require('./react/RelayCompatContainer');
const RelayCompatMutations = require('./mutations/RelayCompatMutations');
const RelayCompatPaginationContainer = require('./react/RelayCompatPaginationContainer');
const RelayCompatRefetchContainer = require('./react/RelayCompatRefetchContainer');
const RelayRuntime = require('RelayRuntime');

export type {
  RelayPaginationProp,
  RelayProp,
  RelayRefetchProp,
  $FragmentRef,
} from '../modern/ReactRelayTypes';
export type {
  DataID,
  DeclarativeMutationConfig,
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  MutationType,
  OperationSelector,
  RangeOperation,
  RelayContext,
  Selector,
  Snapshot,
  Variables,
} from 'RelayRuntime';

/**
 * The public interface to React Relay which supports a compatibility mode to
 * continue to work with the classic Relay runtime.
 */
module.exports = {
  QueryRenderer: ReactRelayQueryRenderer,

  MutationTypes: RelayRuntime.MutationTypes,
  RangeOperations: RelayRuntime.RangeOperations,

  applyOptimisticMutation: RelayCompatMutations.applyUpdate,
  commitMutation: RelayCompatMutations.commitUpdate,
  createFragmentContainer: RelayCompatContainer.createContainer,
  createPaginationContainer: RelayCompatPaginationContainer.createContainer,
  createRefetchContainer: RelayCompatRefetchContainer.createContainer,
  fetchQuery: RelayRuntime.fetchQuery,
  graphql: RelayRuntime.graphql,

  injectDefaultVariablesProvider:
    ReactRelayCompatContainerBuilder.injectDefaultVariablesProvider,
};
