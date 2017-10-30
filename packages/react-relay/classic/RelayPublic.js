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

const RelayContainer = require('./container/RelayContainer');
const RelayEnvironment = require('./store/RelayEnvironment');
const RelayGraphQLMutation = require('./mutation/RelayGraphQLMutation');
const RelayInternals = require('./tools/RelayInternals');
const RelayMutation = require('./mutation/RelayMutation');
const RelayPropTypes = require('./container/RelayPropTypes');
const RelayQL = require('./query/RelayQL');
const RelayQueryCaching = require('./tools/RelayQueryCaching');
const RelayQueryConfig = require('./query-config/RelayQueryConfig');
const RelayReadyStateRenderer = require('./container/RelayReadyStateRenderer');
const RelayRenderer = require('./container/RelayRenderer');
const RelayRootContainer = require('./container/RelayRootContainer');
const RelayRoute = require('./route/RelayRoute');
const RelayStore = require('./store/RelayStore');

const createRelayQuery = require('./query/createRelayQuery');
const getRelayQueries = require('./container/getRelayQueries');
const isRelayContainer = require('./container/isRelayContainer');

if (typeof global.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
  global.__REACT_DEVTOOLS_GLOBAL_HOOK__._relayInternals = RelayInternals;
}

/**
 * Relay contains the set of public methods used to initialize and orchestrate
 * a React application that uses GraphQL to declare data dependencies.
 */
const RelayPublic = {
  Environment: RelayEnvironment,
  GraphQLMutation: RelayGraphQLMutation,
  Mutation: RelayMutation,
  PropTypes: RelayPropTypes,
  QL: RelayQL,
  QueryConfig: RelayQueryConfig,
  ReadyStateRenderer: RelayReadyStateRenderer,
  Renderer: RelayRenderer,
  RootContainer: RelayRootContainer,
  Route: RelayRoute,
  Store: RelayStore,

  createContainer: RelayContainer.create,
  createQuery: createRelayQuery,
  getQueries: getRelayQueries,
  disableQueryCaching: RelayQueryCaching.disable,
  injectNetworkLayer: RelayStore.injectNetworkLayer.bind(RelayStore),
  injectTaskScheduler: RelayStore.injectTaskScheduler.bind(RelayStore),
  isContainer: isRelayContainer,
};

module.exports = RelayPublic;
