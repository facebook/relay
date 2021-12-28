/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {GraphQLTaggedNode} from '../query/GraphQLTag';
import type {
  IEnvironment,
  MutationParameters,
  SelectorStoreUpdater,
} from '../store/RelayStoreTypes';
import type {Disposable, Variables} from '../util/RelayRuntimeTypes';
import type {DeclarativeMutationConfig} from './RelayDeclarativeMutationConfig';

const {getRequest} = require('../query/GraphQLTag');
const isRelayModernEnvironment = require('../store/isRelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../store/RelayModernOperationDescriptor');
const RelayDeclarativeMutationConfig = require('./RelayDeclarativeMutationConfig');
const invariant = require('invariant');

export type OptimisticMutationConfig<TMutation: MutationParameters> = {|
  configs?: ?Array<DeclarativeMutationConfig>,
  mutation: GraphQLTaggedNode,
  variables: Variables,
  optimisticUpdater?: ?SelectorStoreUpdater<TMutation['response']>,
  optimisticResponse?: Object,
|};

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
function applyOptimisticMutation<TMutation: MutationParameters>(
  environment: IEnvironment,
  config: OptimisticMutationConfig<TMutation>,
): Disposable {
  invariant(
    isRelayModernEnvironment(environment),
    'commitMutation: expected `environment` to be an instance of ' +
      '`RelayModernEnvironment`.',
  );
  const mutation = getRequest(config.mutation);
  if (mutation.params.operationKind !== 'mutation') {
    throw new Error('commitMutation: Expected mutation operation');
  }
  let {optimisticUpdater} = config;
  const {configs, optimisticResponse, variables} = config;
  const operation = createOperationDescriptor(mutation, variables);
  if (configs) {
    ({optimisticUpdater} = RelayDeclarativeMutationConfig.convert(
      configs,
      mutation,
      optimisticUpdater,
    ));
  }

  return environment.applyMutation({
    operation,
    response: optimisticResponse,
    updater: optimisticUpdater,
  });
}

module.exports = applyOptimisticMutation;
