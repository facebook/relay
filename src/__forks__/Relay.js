/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Relay
 * @typechecks
 * @flow
 */

'use strict';

const RelayDefaultNetworkLayer = require('RelayDefaultNetworkLayer');
const RelayPublic = require('RelayPublic');
const RelayStore = require('RelayStore');

// By default, assume that GraphQL is served at `/graphql` on the same domain.
RelayStore.injectNetworkLayer(new RelayDefaultNetworkLayer('/graphql'));

module.exports = {
  ...RelayPublic,
  // Expose the default network layer to allow convenient re-configuration.
  DefaultNetworkLayer: RelayDefaultNetworkLayer,
};
