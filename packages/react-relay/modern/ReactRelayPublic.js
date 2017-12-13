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

export type {DataID} from '../classic/tools/RelayInternalTypes';
export type {Variables} from '../classic/tools/RelayTypes';
export type {
  RelayPaginationProp,
  RelayProp,
  RelayRefetchProp,
} from './ReactRelayTypes';
export type {
  Disposable,
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
  createFragmentContainer: ReactRelayFragmentContainer.createContainer,
  createPaginationContainer: ReactRelayPaginationContainer.createContainer,
  createRefetchContainer: ReactRelayRefetchContainer.createContainer,
  commitLocalUpdate: commitLocalUpdate,
  commitMutation: commitMutation,
  fetchQuery: fetchQuery,
  graphql: graphql,
  requestSubscription: requestSubscription,
};
