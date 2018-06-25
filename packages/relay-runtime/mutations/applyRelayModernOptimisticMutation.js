/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayDeclarativeMutationConfig = require('./RelayDeclarativeMutationConfig');

const invariant = require('invariant');
const isRelayModernEnvironment = require('../store/isRelayModernEnvironment');

import type {GraphQLTaggedNode} from '../query/RelayModernGraphQLTag';
import type {Environment, SelectorStoreUpdater} from '../store/RelayStoreTypes';
import type {Disposable, Variables} from '../util/RelayRuntimeTypes';
import type {DeclarativeMutationConfig} from './RelayDeclarativeMutationConfig';

export type OptimisticMutationConfig = {|
  configs?: ?Array<DeclarativeMutationConfig>,
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
    ({optimisticUpdater} = RelayDeclarativeMutationConfig.convert(
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
