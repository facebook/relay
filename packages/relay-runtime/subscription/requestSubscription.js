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

import type {DeclarativeMutationConfig} from '../mutations/RelayDeclarativeMutationConfig';
import type {GraphQLTaggedNode} from '../query/GraphQLTag';
import type {
  IEnvironment,
  SelectorStoreUpdater,
} from '../store/RelayStoreTypes';
import type {
  CacheConfig,
  Disposable,
  Variables,
} from '../util/RelayRuntimeTypes';

const RelayDeclarativeMutationConfig = require('../mutations/RelayDeclarativeMutationConfig');
const {getRequest} = require('../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../store/RelayModernOperationDescriptor');
const {createReaderSelector} = require('../store/RelayModernSelector');
const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const warning = require('warning');

export type SubscriptionParameters = {|
  +response: {...},
  +variables: interface {},
  +rawResponse?: {...},
|};

export type GraphQLSubscriptionConfig<T: SubscriptionParameters> = {|
  configs?: Array<DeclarativeMutationConfig>,
  cacheConfig?: CacheConfig,
  subscription: GraphQLTaggedNode,
  variables: T['variables'],
  onCompleted?: ?() => void,
  onError?: ?(error: Error) => void,
  onNext?: ?(response: ?T['response']) => void,
  updater?: ?SelectorStoreUpdater<T['response']>,
|};

export type DEPRECATED_GraphQLSubscriptionConfig<TSubscriptionPayload> = {|
  configs?: Array<DeclarativeMutationConfig>,
  cacheConfig?: CacheConfig,
  subscription: GraphQLTaggedNode,
  variables: Variables,
  onCompleted?: ?() => void,
  onError?: ?(error: Error) => void,
  onNext?: ?(response: ?TSubscriptionPayload) => void,
  updater?: ?SelectorStoreUpdater<TSubscriptionPayload>,
|};

function requestSubscription<TSubscriptionPayload>(
  environment: IEnvironment,
  config: DEPRECATED_GraphQLSubscriptionConfig<TSubscriptionPayload>,
): Disposable {
  const subscription = getRequest(config.subscription);
  if (subscription.params.operationKind !== 'subscription') {
    throw new Error('requestSubscription: Must use Subscription operation');
  }
  const {configs, onCompleted, onError, onNext, variables, cacheConfig} =
    config;
  const operation = createOperationDescriptor(
    subscription,
    variables,
    cacheConfig,
  );

  warning(
    !(config.updater && configs),
    'requestSubscription: Expected only one of `updater` and `configs` to be provided',
  );

  const {updater} = configs
    ? RelayDeclarativeMutationConfig.convert(
        configs,
        subscription,
        null /* optimisticUpdater */,
        config.updater,
      )
    : config;

  const sub = environment
    .executeSubscription({
      operation,
      updater,
    })
    .subscribe({
      next: responses => {
        if (onNext != null) {
          let selector = operation.fragment;
          let nextID;
          if (Array.isArray(responses)) {
            nextID = responses[0]?.extensions?.__relay_subscription_root_id;
          } else {
            nextID = responses.extensions?.__relay_subscription_root_id;
          }
          if (typeof nextID === 'string') {
            selector = createReaderSelector(
              selector.node,
              nextID,
              selector.variables,
              selector.owner,
            );
          }
          const data = environment.lookup(selector).data;
          // $FlowFixMe[incompatible-cast]
          onNext((data: TSubscriptionPayload));
        }
      },
      error: onError,
      complete: onCompleted,
    });
  return {
    dispose: sub.unsubscribe,
  };
}

module.exports = requestSubscription;
