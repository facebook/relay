/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule requestRelaySubscription
 * @flow
 * @format
 */

'use strict';

const setRelayModernMutationConfigs = require('setRelayModernMutationConfigs');
const warning = require('warning');

import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {Environment, SelectorStoreUpdater} from 'RelayStoreTypes';
import type {Disposable} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';
import type {
  RelayMutationConfig,
  Variables,
} from 'react-relay/classic/tools/RelayTypes';

export type GraphQLSubscriptionConfig = {|
  configs?: Array<RelayMutationConfig>,
  subscription: GraphQLTaggedNode,
  variables: Variables,
  onCompleted?: ?() => void,
  onError?: ?(error: Error) => void,
  onNext?: ?(response: ?Object) => void,
  updater?: ?SelectorStoreUpdater,
|};

function requestRelaySubscription(
  environment: Environment,
  config: GraphQLSubscriptionConfig,
): Disposable {
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const subscription = getRequest(config.subscription);
  if (subscription.operationKind !== 'subscription') {
    throw new Error(
      'requestRelaySubscription: Must use Subscription operation',
    );
  }
  const {configs, onCompleted, onError, onNext, variables} = config;
  const operation = createOperationSelector(subscription, variables);

  warning(
    !(config.updater && configs),
    'requestRelaySubscription: Expected only one of `updater` and `configs` to be provided',
  );

  const {updater} = configs
    ? setRelayModernMutationConfigs(
        configs,
        subscription,
        null /* optimisticUpdater */,
        config.updater,
      )
    : config;

  return environment
    .execute({
      operation,
      updater,
      cacheConfig: {force: true},
    })
    .map(() => environment.lookup(operation.fragment).data)
    .subscribeLegacy({
      onNext,
      onError,
      onCompleted,
    });
}

module.exports = requestRelaySubscription;
