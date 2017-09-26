/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactRelayCompatPublic
 * @flow
 * @format
 */

'use strict';

const ReactRelayCompatContainerBuilder = require('ReactRelayCompatContainerBuilder');
const ReactRelayQueryRenderer = require('ReactRelayQueryRenderer');
const RelayCompatContainer = require('RelayCompatContainer');
const RelayCompatMutations = require('RelayCompatMutations');
const RelayCompatPaginationContainer = require('RelayCompatPaginationContainer');
const RelayCompatRefetchContainer = require('RelayCompatRefetchContainer');

const {graphql, fetchQuery} = require('RelayRuntime');

export type {
  RelayPaginationProp,
  RelayProp,
  RelayRefetchProp,
} from 'ReactRelayTypes';
export type {Disposable} from 'RelayCombinedEnvironmentTypes';
export type {DataID} from 'RelayInternalTypes';
export type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
export type {
  Environment,
  OperationSelector,
  RelayContext,
  Selector,
  Snapshot,
} from 'RelayStoreTypes';
export type {Variables} from 'RelayTypes';

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
