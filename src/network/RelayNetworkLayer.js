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
 * @flow
 */

'use strict';

import type RelayMutationRequest from 'RelayMutationRequest';
const RelayProfiler = require('RelayProfiler');
import type RelayQueryRequest from 'RelayQueryRequest';
import type RelaySubscriptionRequest from 'RelaySubscriptionRequest';
import type {Subscription} from 'RelayTypes';

const invariant = require('invariant');
const warning = require('warning');

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
    var networkLayer = getCurrentNetworkLayer();
    var promise = networkLayer.sendMutation(mutationRequest);
    if (promise) {
      Promise.resolve(promise).done();
    }
  },

  sendQueries(queryRequests: Array<RelayQueryRequest>): void {
    var networkLayer = getCurrentNetworkLayer();
    var promise = networkLayer.sendQueries(queryRequests);
    if (promise) {
      Promise.resolve(promise).done();
    }
  },

  sendSubscription(subscriptionRequest: RelaySubscriptionRequest): Subscription {
    const networkLayer = getCurrentNetworkLayer();

    invariant(
      networkLayer.sendSubscription
      && typeof networkLayer.sendSubscription === 'function',
      '%s: does not support subscriptions.  Expected `sendSubscription` to be ' +
      'a function',
      networkLayer.constructor.name
    );

    const result = networkLayer.sendSubscription(subscriptionRequest);

    if (result) {
      if (typeof result === 'function') {
        return {
          dispose: result,
        };
      } else if (result.dispose && typeof result.dispose === 'function') {
        return result;
      }
    }

    warning(
      false,
      'RelayNetworkLayer: `sendSubscription` should return a disposable ' +
      'or a function.'
    );

    return {
      dispose() { }, // noop
    };
  },

  supports(...options: Array<string>): boolean {
    var networkLayer = getCurrentNetworkLayer();
    return networkLayer.supports(...options);
  },
};

function getCurrentNetworkLayer(): $FlowIssue {
  invariant(
    injectedNetworkLayer,
    'RelayNetworkLayer: Use `injectNetworkLayer` to configure a network layer.'
  );
  return injectedNetworkLayer;
}

RelayProfiler.instrumentMethods(RelayNetworkLayer, {
  sendMutation: 'RelayNetworkLayer.sendMutation',
  sendQueries: 'RelayNetworkLayer.sendQueries',
  sendSubscription: 'RelayNetworkLayer.sendSubscription',
});

module.exports = RelayNetworkLayer;
