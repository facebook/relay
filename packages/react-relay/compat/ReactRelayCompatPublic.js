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

const {graphql, fetchQuery} = require('RelayRuntime');

export type {
  Disposable,
} from '../classic/environment/RelayCombinedEnvironmentTypes';
export type {DataID} from '../classic/tools/RelayInternalTypes';
export type {Variables} from '../classic/tools/RelayTypes';
export type {
  RelayPaginationProp,
  RelayProp,
  RelayRefetchProp,
} from '../modern/ReactRelayTypes';
export type {
  GraphQLTaggedNode,
  IEnvironment,
  OperationSelector,
  RelayContext,
  Selector,
  Snapshot,
} from 'RelayRuntime';

/**
 * The public interface to React Relay which supports a compatibility mode to
 * continue to work with the classic React runtime.
 */
module.exports = {
  QueryRenderer: ReactRelayQueryRenderer,
  applyOptimisticMutation: RelayCompatMutations.applyUpdate,
  commitMutation: RelayCompatMutations.commitUpdate,
  createFragmentContainer: (RelayCompatContainer.createContainer: $FlowFixMe),
  createPaginationContainer: (RelayCompatPaginationContainer.createContainer: $FlowFixMe),
  createRefetchContainer: (RelayCompatRefetchContainer.createContainer: $FlowFixMe),
  fetchQuery: fetchQuery,
  graphql: graphql,
  injectDefaultVariablesProvider:
    ReactRelayCompatContainerBuilder.injectDefaultVariablesProvider,
};
