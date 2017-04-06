/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayCompatPublic
 * @flow
 */

'use strict';

const ReactRelayCompatContainerBuilder = require('ReactRelayCompatContainerBuilder');
const ReactRelayQueryRenderer = require('ReactRelayQueryRenderer');
const RelayCompatContainer = require('RelayCompatContainer');
const RelayCompatMutations = require('RelayCompatMutations');
const RelayCompatPaginationContainer = require('RelayCompatPaginationContainer');
const RelayCompatRefetchContainer = require('RelayCompatRefetchContainer');

const {graphql, fetchQuery} = require('RelayRuntime');

export type {GraphQLTaggedNode} from 'RelayStaticGraphQLTag';
export type {
  Environment,
  OperationSelector,
  RelayContext,
  Selector,
  Snapshot,
} from 'RelayStoreTypes';
export type {DataID} from 'RelayInternalTypes';
export type {Disposable} from 'RelayCombinedEnvironmentTypes';
export type {Variables} from 'RelayTypes';
export type {
  RelayPaginationProp,
  RelayProp,
  RelayRefetchProp,
} from 'ReactRelayTypes';

/**
 * The public interface to React Relay which supports a compatibility mode to
 * continue to work with the classic React runtime.
 */
module.exports = {
  QueryRenderer: ReactRelayQueryRenderer,
  commitMutation: RelayCompatMutations.commitUpdate,
  createFragmentContainer: (RelayCompatContainer.createContainer: $FlowFixMe),
  createPaginationContainer: (RelayCompatPaginationContainer.createContainer: $FlowFixMe),
  createRefetchContainer: (RelayCompatRefetchContainer.createContainer: $FlowFixMe),
  fetchQuery: fetchQuery,
  graphql: graphql,
  injectDefaultVariablesProvider:
    ReactRelayCompatContainerBuilder.injectDefaultVariablesProvider,
};
