/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactRelayPublic
 * @flow
 * @format
 */

'use strict';

const ReactRelayFragmentContainer = require('ReactRelayFragmentContainer');
const ReactRelayPaginationContainer = require('ReactRelayPaginationContainer');
const ReactRelayQueryRenderer = require('ReactRelayQueryRenderer');
const ReactRelayRefetchContainer = require('ReactRelayRefetchContainer');

const {
  commitLocalUpdate,
  commitMutation,
  fetchQuery,
  graphql,
  requestSubscription,
} = require('RelayRuntime');

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
 * The public interface to React Relay.
 */
module.exports = {
  QueryRenderer: ReactRelayQueryRenderer,
  createFragmentContainer: (ReactRelayFragmentContainer.createContainer: $FlowFixMe),
  createPaginationContainer: (ReactRelayPaginationContainer.createContainer: $FlowFixMe),
  createRefetchContainer: (ReactRelayRefetchContainer.createContainer: $FlowFixMe),
  commitLocalUpdate: commitLocalUpdate,
  commitMutation: commitMutation,
  fetchQuery: fetchQuery,
  graphql: graphql,
  requestSubscription: requestSubscription,
};
