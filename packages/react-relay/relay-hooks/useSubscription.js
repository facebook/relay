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

import type {
  Disposable,
  GraphQLSubscriptionConfig,
  IEnvironment,
  SubscriptionParameters,
} from 'relay-runtime';

const useRelayEnvironment = require('./useRelayEnvironment');
const {useEffect} = require('react');
const {requestSubscription} = require('relay-runtime');

type RequestSubscriptionFn<TSubscriptionParameters: SubscriptionParameters> = (
  environment: IEnvironment,
  config: GraphQLSubscriptionConfig<TSubscriptionParameters>,
) => Disposable;

function useSubscription<TSubscriptionParameters: SubscriptionParameters>(
  config: GraphQLSubscriptionConfig<TSubscriptionParameters>,
  requestSubscriptionFn?: RequestSubscriptionFn<TSubscriptionParameters>,
): void {
  // N.B. this will re-subscribe every render if config or requestSubscriptionFn
  // are not memoized.
  // Please do not pass an object defined in-line.
  const actualRequestSubscription: RequestSubscriptionFn<TSubscriptionParameters> =
    requestSubscriptionFn ?? (requestSubscription: $FlowFixMe);
  const environment = useRelayEnvironment();
  useEffect(() => {
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const {dispose} = actualRequestSubscription(environment, config);
    // $FlowFixMe[incompatible-call]
    return dispose;
  }, [environment, config, actualRequestSubscription]);
}

module.exports = useSubscription;
