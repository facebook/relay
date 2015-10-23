/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNetworkLayer
 * @typechecks
 * @flow
 */

'use strict';

var Promise = require('Promise');
import type RelayMutationRequest from 'RelayMutationRequest';
var RelayProfiler = require('RelayProfiler');
import type RelayQueryRequest from 'RelayQueryRequest';

var invariant = require('invariant');

type NetworkLayer = {
  sendMutation: (mutationRequest: RelayMutationRequest) => ?Promise;
  sendQueries: (queryRequests: Array<RelayQueryRequest>) => ?Promise;
  supports: (...options: Array<string>) => boolean;
};

var injectedNetworkLayer;

/**
 * @internal
 *
 * `RelayNetworkLayer` provides a method to inject custom network behavior.
 */
var RelayNetworkLayer = {
  injectNetworkLayer(networkLayer: ?NetworkLayer): void {
    injectedNetworkLayer = networkLayer;
  },

  sendMutation(mutationRequest: RelayMutationRequest): void {
    var profiler = RelayProfiler.profile('RelayNetworkLayer.sendMutation');
    var networkLayer = getCurrentNetworkLayer();
    var promise = networkLayer.sendMutation(mutationRequest);
    if (promise) {
      Promise.resolve(promise).done();
    }
    profiler.stop();
  },

  sendQueries(queryRequests: Array<RelayQueryRequest>): void {
    var profiler = RelayProfiler.profile('RelayNetworkLayer.sendQueries');
    var networkLayer = getCurrentNetworkLayer();
    var promise = networkLayer.sendQueries(queryRequests);
    if (promise) {
      Promise.resolve(promise).done();
    }
    profiler.stop();
  },

  supports(...options: Array<string>): boolean {
    var networkLayer = getCurrentNetworkLayer();
    return networkLayer.supports(...options);
  },
};

function getCurrentNetworkLayer(): NetworkLayer {
  invariant(
    injectedNetworkLayer,
    'RelayNetworkLayer: Use `injectNetworkLayer` to configure a network layer.'
  );
  return injectedNetworkLayer;
}

module.exports = RelayNetworkLayer;
