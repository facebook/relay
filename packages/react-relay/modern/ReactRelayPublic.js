/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayPublic
 * @flow
 */

'use strict';

const ReactRelayFragmentContainer = require('ReactRelayFragmentContainer');
const ReactRelayPaginationContainer = require('ReactRelayPaginationContainer');
const ReactRelayQueryRenderer = require('ReactRelayQueryRenderer');
const ReactRelayRefetchContainer = require('ReactRelayRefetchContainer');
const RelayStaticGraphQLTag = require('RelayStaticGraphQLTag');

const commitLocalUpdate = require('commitLocalUpdate');
const commitRelayStaticMutation = require('commitRelayStaticMutation');
const fetchRelayStaticQuery = require('fetchRelayStaticQuery');
const requestRelaySubscription = require('requestRelaySubscription');

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
 * The public interface to React Relay.
 */
module.exports = {
  QueryRenderer: ReactRelayQueryRenderer,
  commitLocalUpdate: commitLocalUpdate,
  commitMutation: commitRelayStaticMutation,
  createFragmentContainer: ReactRelayFragmentContainer.createContainer,
  createPaginationContainer: ReactRelayPaginationContainer.createContainer,
  createRefetchContainer: ReactRelayRefetchContainer.createContainer,
  fetchQuery: fetchRelayStaticQuery,
  graphql: RelayStaticGraphQLTag.graphql,
  requestSubscription: requestRelaySubscription,
};
