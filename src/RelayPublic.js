/**
 * Copyright 2013-2015, Facebook, Inc.
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
const RelayNetworkLayer = require('RelayNetworkLayer');
const RelayPropTypes = require('RelayPropTypes');
const RelayQL = require('RelayQL');
const RelayRootContainer = require('RelayRootContainer');
const RelayRoute = require('RelayRoute');
const RelayStore = require('RelayStore');
const RelayTaskScheduler = require('RelayTaskScheduler');
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
var RelayPublic = {
  Mutation: RelayMutation,
  PropTypes: RelayPropTypes,
  QL: RelayQL,
  RootContainer: RelayRootContainer,
  Route: RelayRoute,
  Store: RelayStore,

  createContainer: RelayContainer.create,
  createQuery: createRelayQuery,
  getQueries: getRelayQueries,
  injectNetworkLayer: RelayNetworkLayer.injectNetworkLayer,
  injectTaskScheduler: RelayTaskScheduler.injectScheduler,
  isContainer: isRelayContainer,
};

module.exports = RelayPublic;
