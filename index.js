/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 */

'use strict';

var RelayDefaultNetworkLayer = require('./lib/RelayDefaultNetworkLayer');
var RelayPublic = require('./lib/RelayPublic');

// By default, assume that GraphQL is served at `/graphql` on the same domain.
RelayPublic.injectNetworkLayer(new RelayDefaultNetworkLayer('/graphql'));

module.exports = {
  ...RelayPublic,
  // Expose the default network layer to allow convenient re-configuration.
  DefaultNetworkLayer: RelayDefaultNetworkLayer,
};
