/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule requestRelaySubscription
 * @flow
 * @format
 */

'use strict';

const setRelayModernMutationConfigs = require('setRelayModernMutationConfigs');
const warning = require('warning');

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {RelayResponsePayload} from 'RelayNetworkTypes';
import type {Environment, RecordSourceSelectorProxy} from 'RelayStoreTypes';
import type {RelayMutationConfig, Variables} from 'RelayTypes';

export type GraphQLSubscriptionConfig = {|
  configs?: Array<RelayMutationConfig>,
  subscription: GraphQLTaggedNode,
  variables: Variables,
  onCompleted?: ?() => void,
  onError?: ?(error: Error) => void,
  onNext?: ?(response: ?Object) => void,
  updater?: ?(store: RecordSourceSelectorProxy) => void,
|};

function requestRelaySubscription(
  environment: Environment,
  config: GraphQLSubscriptionConfig,
): Disposable {
  const {createOperationSelector, getOperation} = environment.unstable_internal;
  const subscription = getOperation(config.subscription);
  const {configs, onCompleted, onError, onNext, variables} = config;
  let {updater} = config;
  const operation = createOperationSelector(subscription, variables);

  warning(
    !(updater && configs),
    'requestRelaySubscription: Expected only one of `updater` and `configs` to be provided',
  );

  if (configs) {
    ({updater} = setRelayModernMutationConfigs(
      configs,
      subscription,
      null /* optimisticUpdater */,
      updater,
    ));
  }
  return environment.sendSubscription({
    onCompleted,
    onError,
    onNext(payload: ?RelayResponsePayload) {
      if (onNext) {
        const snapshot = environment.lookup(operation.fragment);
        onNext(snapshot.data);
      }
    },
    updater,
    operation,
  });
}

module.exports = requestRelaySubscription;
