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

export type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
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
  createFragmentContainer: (ReactRelayFragmentContainer.createContainer: $FlowFixMe),
  createPaginationContainer: (ReactRelayPaginationContainer.createContainer: $FlowFixMe),
  createRefetchContainer: (ReactRelayRefetchContainer.createContainer: $FlowFixMe),
  commitLocalUpdate: commitLocalUpdate,
  commitMutation: commitMutation,
  fetchQuery: fetchQuery,
  graphql: graphql,
  requestSubscription: requestSubscription,
};
