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
 */

'use strict';

const RelayDefaultNetworkLayer = require('RelayDefaultNetworkLayer');
const RelayPublic = require('RelayPublic');
const RelayStore = require('RelayStore');

const warning = require('warning');

if (__DEV__) {
  warning(
    typeof Promise === 'function' && Array.prototype.find,
    'Relay relies on polyfills for ES6 features in older browsers. ' +
    'Babel provides a good one: https://babeljs.io/docs/usage/polyfill/'
  );
}

// By default, assume that GraphQL is served at `/graphql` on the same domain.
// To override, use `Relay.injectNetworkLayer`.
RelayStore.injectDefaultNetworkLayer(new RelayDefaultNetworkLayer('/graphql'));

module.exports = {
  ...RelayPublic,
  // Expose the default network layer to allow convenient re-configuration.
  DefaultNetworkLayer: RelayDefaultNetworkLayer,
};
