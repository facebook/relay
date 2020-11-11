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

const RelayDeclarativeMutationConfig = require('../mutations/RelayDeclarativeMutationConfig');

const warning = require('warning');

const {getRequest} = require('../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../store/RelayModernOperationDescriptor');

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

export type GraphQLSubscriptionConfig<TSubscriptionPayload> = {|
  configs?: Array<DeclarativeMutationConfig>,
  cacheConfig?: CacheConfig,
  subscription: GraphQLTaggedNode,
  variables: Variables,
  onCompleted?: ?() => void,
  onError?: ?(error: Error) => void,
  onNext?: ?(response: ?TSubscriptionPayload) => void,
  updater?: ?SelectorStoreUpdater,
|};

function requestSubscription<TSubscriptionPayload>(
  environment: IEnvironment,
  config: GraphQLSubscriptionConfig<TSubscriptionPayload>,
): Disposable {
  const subscription = getRequest(config.subscription);
  if (subscription.params.operationKind !== 'subscription') {
    throw new Error('requestSubscription: Must use Subscription operation');
  }
  const {
    configs,
    onCompleted,
    onError,
    onNext,
    variables,
    cacheConfig,
  } = config;
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
    .execute({
      operation,
      updater,
    })
    .map(() => {
      const data = environment.lookup(operation.fragment).data;
      // $FlowFixMe[incompatible-cast]
      return (data: TSubscriptionPayload);
    })
    .subscribe({
      next: onNext,
      error: onError,
      complete: onCompleted,
    });
  return {
    dispose: sub.unsubscribe,
  };
}

module.exports = requestSubscription;
