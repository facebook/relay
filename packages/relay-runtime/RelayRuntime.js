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

const RelayStaticGraphQLTag = require('RelayStaticGraphQLTag');

const commitLocalUpdate = require('commitLocalUpdate');
const commitRelayStaticMutation = require('commitRelayStaticMutation');
const fetchRelayStaticQuery = require('fetchRelayStaticQuery');
const isRelayStaticEnvironment = require('isRelayStaticEnvironment');
const requestRelaySubscription = require('requestRelaySubscription');

/**
 * The public interface to Relay Runtime.
 */
module.exports = {
  commitLocalUpdate: commitLocalUpdate,
  commitMutation: commitRelayStaticMutation,
  fetchQuery: fetchRelayStaticQuery,
  requestSubscription: requestRelaySubscription,
  graphql: RelayStaticGraphQLTag.graphql,
  getFragment: RelayStaticGraphQLTag.getFragment,
  getOperation: RelayStaticGraphQLTag.getOperation,
  isRelayStaticEnvironment: isRelayStaticEnvironment,
};
