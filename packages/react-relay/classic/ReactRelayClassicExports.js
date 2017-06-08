/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayClassicExports
 * @flow
 * @format
 */

'use strict';

const RelayDefaultNetworkLayer = require('RelayDefaultNetworkLayer');
const RelayPublic = require('RelayPublic');
const RelayStore = require('RelayStore');

// As early as possible, check for the existence of the JavaScript globals which
// React Relay relies upon, and produce a clear message if they do not exist.
if (__DEV__) {
  if (
    typeof Map !== 'function' ||
    typeof Set !== 'function' ||
    typeof Promise !== 'function' ||
    typeof Object.assign !== 'function' ||
    typeof Array.prototype.find !== 'function'
  ) {
    throw new Error(
      'react-relay requires Map, Set, Promise, Object.assign, and Array#find ' +
        'to exist. Use a polyfill to provide these for older browsers.',
    );
  }
}

// By default, assume that GraphQL is served at `/graphql` on the same domain.
// To override, use `Relay.injectNetworkLayer`.
RelayStore.injectDefaultNetworkLayer(new RelayDefaultNetworkLayer('/graphql'));

module.exports = {
  ...RelayPublic,
  // Expose the default network layer to allow convenient re-configuration.
  DefaultNetworkLayer: RelayDefaultNetworkLayer,
};
