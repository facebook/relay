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

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayNetwork = require('RelayNetwork');
const RelayRecordState = require('RelayRecordState');
const RelayStaticEnvironment = require('RelayStaticEnvironment');
const RelayStaticGraphQLTag = require('RelayStaticGraphQLTag');
const RelayMarkSweepStore = require('RelayMarkSweepStore');

const commitLocalUpdate = require('commitLocalUpdate');
const commitRelayStaticMutation = require('commitRelayStaticMutation');
const fetchRelayStaticQuery = require('fetchRelayStaticQuery');
const isRelayStaticEnvironment = require('isRelayStaticEnvironment');
const requestRelaySubscription = require('requestRelaySubscription');

/**
 * The public interface to Relay Runtime.
 */
module.exports = {
  // Core API
  ...RelayCore,
  graphql: RelayStaticGraphQLTag.graphql,
  Environment: RelayStaticEnvironment,
  Network: RelayNetwork,
  RecordSource: RelayInMemoryRecordSource,
  Store: RelayMarkSweepStore,

  // Helpers (can be implemented via the core API)
  commitLocalUpdate: commitLocalUpdate,
  commitMutation: commitRelayStaticMutation,
  fetchQuery: fetchRelayStaticQuery,
  isRelayStaticEnvironment: isRelayStaticEnvironment,
  requestSubscription: requestRelaySubscription,

  // Internal API, exported only for compatibility with the react-relay/legacy
  RelayRecordState: RelayRecordState,
};
