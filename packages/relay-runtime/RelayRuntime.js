/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRuntime
 * @flow
 */

'use strict';

const RelayConnectionHandler = require('RelayConnectionHandler');
const RelayCore = require('RelayCore');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayModernEnvironment = require('RelayModernEnvironment');
const RelayModernGraphQLTag = require('RelayModernGraphQLTag');
const RelayNetwork = require('RelayNetwork');
const RelayViewerHandler = require('RelayViewerHandler');

const commitLocalUpdate = require('commitLocalUpdate');
const commitRelayModernMutation = require('commitRelayModernMutation');
const fetchRelayModernQuery = require('fetchRelayModernQuery');
const isRelayModernEnvironment = require('isRelayModernEnvironment');
const requestRelaySubscription = require('requestRelaySubscription');

export type {
  GeneratedNode,
  ConcreteBatch,
  ConcreteFragment,
} from 'RelayConcreteNode';

/**
 * The public interface to Relay Runtime.
 */
module.exports = {
  // Core API
  Environment: RelayModernEnvironment,
  Network: RelayNetwork,
  RecordSource: RelayInMemoryRecordSource,
  Store: RelayMarkSweepStore,

  areEqualSelectors: RelayCore.areEqualSelectors,
  createFragmentSpecResolver: RelayCore.createFragmentSpecResolver,
  createOperationSelector: RelayCore.createOperationSelector,
  getDataIDsFromObject: RelayCore.getDataIDsFromObject,
  getFragment: RelayModernGraphQLTag.getFragment,
  getOperation: RelayModernGraphQLTag.getOperation,
  getSelector: RelayCore.getSelector,
  getSelectorList: RelayCore.getSelectorList,
  getSelectorsFromObject: RelayCore.getSelectorsFromObject,
  getVariablesFromObject: RelayCore.getVariablesFromObject,
  graphql: RelayModernGraphQLTag.graphql,

  // Extensions
  ConnectionHandler: RelayConnectionHandler,
  ViewerHandler: RelayViewerHandler,

  // Helpers (can be implemented via the above API)
  commitLocalUpdate: commitLocalUpdate,
  commitMutation: commitRelayModernMutation,
  fetchQuery: fetchRelayModernQuery,
  isRelayModernEnvironment: isRelayModernEnvironment,
  requestSubscription: requestRelaySubscription,
};
