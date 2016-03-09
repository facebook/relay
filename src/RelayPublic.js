/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayPublic
 * @typechecks
 * @flow
 */

'use strict';

const RelayContainer = require('RelayContainer');
const RelayMutation = require('RelayMutation');
const RelayPropTypes = require('RelayPropTypes');
const RelayQL = require('RelayQL');
const RelayRootContainer = require('RelayRootContainer');
const RelayRoute = require('RelayRoute');
const RelayStore = require('RelayStore');
const RelayInternals = require('RelayInternals');

const createRelayQuery = require('createRelayQuery');
const getRelayQueries = require('getRelayQueries');
const isRelayContainer = require('isRelayContainer');

if (typeof global.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
  global.__REACT_DEVTOOLS_GLOBAL_HOOK__._relayInternals = RelayInternals;
}

/**
 * Relay contains the set of public methods used to initialize and orchestrate
 * a React application that uses GraphQL to declare data dependencies.
 */
const RelayPublic = {
  Mutation: RelayMutation,
  PropTypes: RelayPropTypes,
  QL: RelayQL,
  RootContainer: RelayRootContainer,
  Route: RelayRoute,
  Store: RelayStore,

  createContainer: RelayContainer.create,
  createQuery: createRelayQuery,
  getQueries: getRelayQueries,
  injectNetworkLayer: RelayStore.injectNetworkLayer.bind(RelayStore),
  injectTaskScheduler: RelayStore.injectTaskScheduler.bind(RelayStore),
  isContainer: isRelayContainer,
};

module.exports = RelayPublic;
