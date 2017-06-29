/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule applyRelayModernOptimisticMutation
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const isRelayModernEnvironment = require('isRelayModernEnvironment');
const setRelayModernMutationConfigs = require('setRelayModernMutationConfigs');

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {Environment, SelectorStoreUpdater} from 'RelayStoreTypes';
import type {RelayMutationConfig} from 'RelayTypes';
import type {Variables} from 'RelayTypes';

export type OptimisticMutationConfig = {|
  configs?: ?Array<RelayMutationConfig>,
  mutation: GraphQLTaggedNode,
  variables: Variables,
  optimisticUpdater?: ?SelectorStoreUpdater,
  optimisticResponse?: Object,
|};

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
function applyRelayModernOptimisticMutation(
  environment: Environment,
  config: OptimisticMutationConfig,
): Disposable {
  invariant(
    isRelayModernEnvironment(environment),
    'commitRelayModernMutation: expect `environment` to be an instance of ' +
      '`RelayModernEnvironment`.',
  );
  const {createOperationSelector, getOperation} = environment.unstable_internal;
  const mutation = getOperation(config.mutation);
  let {optimisticUpdater} = config;
  const {configs, optimisticResponse, variables} = config;
  const operation = createOperationSelector(mutation, variables);
  if (configs) {
    ({optimisticUpdater} = setRelayModernMutationConfigs(
      configs,
      mutation,
      optimisticUpdater,
    ));
  }

  return environment.applyUpdate({
    operation,
    selectorStoreUpdater: optimisticUpdater,
    response: optimisticResponse,
  });
}

module.exports = applyRelayModernOptimisticMutation;
