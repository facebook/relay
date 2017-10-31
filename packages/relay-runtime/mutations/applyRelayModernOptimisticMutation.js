/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule applyRelayModernOptimisticMutation
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const isRelayModernEnvironment = require('isRelayModernEnvironment');
const setRelayModernMutationConfigs = require('setRelayModernMutationConfigs');

import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {Environment, SelectorStoreUpdater} from 'RelayStoreTypes';
import type {Disposable} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';
import type {RelayMutationConfig} from 'react-relay/classic/tools/RelayTypes';
import type {Variables} from 'react-relay/classic/tools/RelayTypes';

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
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const mutation = getRequest(config.mutation);
  if (mutation.operationKind !== 'mutation') {
    throw new Error('commitRelayModernMutation: Expected mutation operation');
  }
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
