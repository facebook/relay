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

var RelayContainer = require('RelayContainer');
var RelayMutation = require('RelayMutation');
var RelayNetworkLayer = require('RelayNetworkLayer');
var RelayPropTypes = require('RelayPropTypes');
var RelayQL = require('RelayQL');
var RelayRootContainer = require('RelayRootContainer');
var RelayRoute = require('RelayRoute');
var RelayStore = require('RelayStore');
var RelayTaskScheduler = require('RelayTaskScheduler');
var RelayInternals = require('RelayInternals');

var createRelayQuery = require('createRelayQuery');
var getRelayQueries = require('getRelayQueries');
var isRelayContainer = require('isRelayContainer');

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
  Query: RelayQL,
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
