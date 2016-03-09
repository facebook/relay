/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayInternals
 * @flow
 */

'use strict';

const RelayStore = require('RelayStore');

const flattenRelayQuery = require('flattenRelayQuery');
const printRelayQuery = require('printRelayQuery');

/**
 * This module contains internal Relay modules that we expose for development
 * tools. They should be considered private APIs.
 *
 * @internal
 */
const RelayInternals = {
  NetworkLayer: RelayStore.getStoreData().getNetworkLayer(),
  DefaultStoreData: RelayStore.getStoreData(),
  flattenRelayQuery: flattenRelayQuery,
  printRelayQuery: printRelayQuery,
};

module.exports = RelayInternals;
