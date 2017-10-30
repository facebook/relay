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

const {
  commitLocalUpdate,
  commitMutation,
  fetchQuery,
  graphql,
  requestSubscription,
} = require('RelayRuntime');

export type {
  Disposable,
} from '../classic/environment/RelayCombinedEnvironmentTypes';
export type {DataID} from '../classic/tools/RelayInternalTypes';
export type {Variables} from '../classic/tools/RelayTypes';
export type {
  RelayPaginationProp,
  RelayProp,
  RelayRefetchProp,
} from './ReactRelayTypes';
export type {
  // RelayRuntime has two environment exports: one interface, one concrete.
  IEnvironment as Environment,
  GraphQLTaggedNode,
  OperationSelector,
  RelayContext,
  Selector,
  Snapshot,
} from 'RelayRuntime';

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
