'use strict';

var Promise = require('fbjs/lib/Promise');

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNetworkLayer
 * @typechecks
 * 
 */

'use strict';

var RelayProfiler = require('./RelayProfiler');

var invariant = require('fbjs/lib/invariant');

var injectedNetworkLayer;

/**
 * @internal
 *
 * `RelayNetworkLayer` provides a method to inject custom network behavior.
 */
var RelayNetworkLayer = {
  injectNetworkLayer: function injectNetworkLayer(networkLayer) {
    injectedNetworkLayer = networkLayer;
  },

  sendMutation: function sendMutation(mutationRequest) {
    var networkLayer = getCurrentNetworkLayer();
    var promise = networkLayer.sendMutation(mutationRequest);
    if (promise) {
      Promise.resolve(promise).done();
    }
  },

  sendQueries: function sendQueries(queryRequests) {
    var networkLayer = getCurrentNetworkLayer();
    var promise = networkLayer.sendQueries(queryRequests);
    if (promise) {
      Promise.resolve(promise).done();
    }
  },

  supports: function supports() {
    var networkLayer = getCurrentNetworkLayer();
    return networkLayer.supports.apply(networkLayer, arguments);
  }
};

function getCurrentNetworkLayer() {
  !injectedNetworkLayer ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayNetworkLayer: Use `injectNetworkLayer` to configure a network layer.') : invariant(false) : undefined;
  return injectedNetworkLayer;
}

RelayProfiler.instrumentMethods(RelayNetworkLayer, {
  sendMutation: 'RelayNetworkLayer.sendMutation',
  sendQueries: 'RelayNetworkLayer.sendQueries'
});

module.exports = RelayNetworkLayer;