/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {
  Disposable,
  GraphQLSubscriptionConfig,
  IEnvironment,
} from 'relay-runtime';

const useRelayEnvironment = require('./useRelayEnvironment');
const {useEffect} = require('react');
const {requestSubscription} = require('relay-runtime');

type RequestSubscriptionFn<TVariables, TData, TRawResponse> = (
  environment: IEnvironment,
  config: GraphQLSubscriptionConfig<TVariables, TData, TRawResponse>,
) => Disposable;

function useSubscription<TVariables, TData, TRawResponse>(
  config: GraphQLSubscriptionConfig<TVariables, TData, TRawResponse>,
  requestSubscriptionFn?: RequestSubscriptionFn<
    TVariables,
    TData,
    TRawResponse,
  >,
): void {
  // N.B. this will re-subscribe every render if config or requestSubscriptionFn
  // are not memoized.
  // Please do not pass an object defined in-line.
  const actualRequestSubscription: RequestSubscriptionFn<
    TVariables,
    TData,
    TRawResponse,
  > = requestSubscriptionFn ?? (requestSubscription: $FlowFixMe);
  const environment = useRelayEnvironment();
  useEffect(() => {
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const {dispose} = actualRequestSubscription(environment, config);
    // $FlowFixMe[incompatible-call]
    return dispose;
  }, [environment, config, actualRequestSubscription]);
}

module.exports = useSubscription;
