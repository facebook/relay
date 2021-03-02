/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const React = require('react');

const useRelayEnvironment = require('./useRelayEnvironment');

const {requestSubscription} = require('relay-runtime');

import type {GraphQLSubscriptionConfig} from 'relay-runtime';

function useSubscription<TSubscriptionPayload>(
  config: GraphQLSubscriptionConfig<TSubscriptionPayload>,
  requestSubscriptionFn?: typeof requestSubscription,
): void {
  // N.B. this will re-subscribe every render if config or requestSubscriptionFn
  // are not memoized.
  // Please do not pass an object defined in-line.
  const actualRequestSubscription =
    requestSubscriptionFn ?? requestSubscription;
  const environment = useRelayEnvironment();
  React.useEffect(() => {
    const {dispose} = requestSubscription(environment, config);
    return dispose;
  }, [environment, config, actualRequestSubscription]);
}

module.exports = useSubscription;
