/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionQuery
 * @typechecks
 * @flow
 */

'use strict';

import type {ConcreteSubscription} from 'ConcreteQuery';
import type {
  RelayMutationConfig,
  Variables,
} from 'RelayTypes';

const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');

/**
 * @internal
 *
 * Constructs query fragments that are sent with subscriptions, which should ensure
 * that records are added and any records changed as a result of subscriptions are
 * brought up-to-date.
 */

const RelaySubscriptionQuery = {
  /**
   * Takes an AST node for a subscription and creates a RelayQuery.Subscription.
   */
  buildQuery({
    configs,
    input,
    subscription,
  }: {
    configs: Array<RelayMutationConfig>,
    input: Variables,
    subscription: ConcreteSubscription,
  }): RelayQuery.Subscription {
    return RelayQuery.Subscription.create(
      subscription,
      RelayMetaRoute.get('$RelaySubscriptionObserver'),
      {input}
    );
  },
};

module.exports = RelaySubscriptionQuery;
