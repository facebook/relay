/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const warning = require('warning');

const {
  getRelayClassicEnvironment,
  getRelayModernEnvironment,
} = require('../RelayCompatEnvironment');
const {applyOptimisticMutation, commitMutation} = require('relay-runtime');

import type {Environment as ClassicEnvironment} from '../../classic/environment/RelayEnvironmentTypes';
import type {ConcreteOperationDefinition} from '../../classic/query/ConcreteQuery';
import type {CompatEnvironment} from '../react/RelayCompatTypes';
import type {
  Disposable,
  MutationConfig,
  OptimisticMutationConfig,
} from 'relay-runtime';

/**
 * Sets a logging function that logs whether a compat mutation was executed in
 * a modern or classic environment.
 */
type CompatLoggingFunction = (moduleName: string, isModern: boolean) => void;
let injectedCompatLoggingFunction: CompatLoggingFunction = () => {};
function injectCompatLoggingFunction(loggingFunction: CompatLoggingFunction) {
  injectedCompatLoggingFunction = loggingFunction;
}

function commitUpdate<T>(
  environment: CompatEnvironment,
  config: MutationConfig<T>,
  // `moduleName` is used to log the environment type in compat mode
  moduleName: string = 'unknown',
): Disposable {
  const modernEnvironment = getRelayModernEnvironment(environment);
  if (modernEnvironment) {
    injectedCompatLoggingFunction(moduleName, true);
    return commitMutation(modernEnvironment, config);
  } else {
    const classicEnvironment = getRelayClassicEnvironment(environment);
    invariant(
      classicEnvironment,
      'RelayCompatMutations: Expected an object that conforms to the ' +
        '`RelayEnvironmentInterface`, got `%s`.',
      environment,
    );
    injectedCompatLoggingFunction(moduleName, false);
    return commitRelayClassicMutation(
      // getRelayClassicEnvironment returns a RelayEnvironmentInterface
      // (classic APIs), but we need the modern APIs on old core here.
      (classicEnvironment: $FlowFixMe),
      config,
    );
  }
}

function applyUpdate(
  environment: CompatEnvironment,
  config: OptimisticMutationConfig,
  // `moduleName` is used to log the environment type in compat mode
  moduleName: string = 'unknown',
): Disposable {
  const modernEnvironment = getRelayModernEnvironment(environment);
  if (modernEnvironment) {
    injectedCompatLoggingFunction(moduleName, true);
    return applyOptimisticMutation(modernEnvironment, config);
  } else {
    const classicEnvironment = getRelayClassicEnvironment(environment);
    invariant(
      classicEnvironment,
      'RelayCompatMutations: Expected an object that conforms to the ' +
        '`RelayEnvironmentInterface`, got `%s`.',
      environment,
    );
    injectedCompatLoggingFunction(moduleName, false);
    return applyRelayClassicMutation(
      // getRelayClassicEnvironment returns a RelayEnvironmentInterface
      // (classic APIs), but we need the modern APIs on old core here.
      (classicEnvironment: $FlowFixMe),
      config,
    );
  }
}

function commitRelayClassicMutation<T>(
  environment: ClassicEnvironment,
  {
    configs,
    mutation,
    onCompleted,
    onError,
    optimisticResponse,
    variables,
    uploadables,
  }: MutationConfig<T>,
): Disposable {
  const {getRequest} = environment.unstable_internal;
  const operation = getRequest(mutation);
  // TODO: remove this check after we fix flow.
  if (typeof optimisticResponse === 'function') {
    warning(
      false,
      'RelayCompatMutations: Expected `optimisticResponse` to be an object, ' +
        'received a function.',
    );
    optimisticResponse = optimisticResponse();
  }
  if (optimisticResponse) {
    optimisticResponse = validateOptimisticResponse(
      operation,
      optimisticResponse,
    );
  }

  return environment.sendMutation({
    configs: configs || [],
    operation,
    onCompleted,
    onError,
    optimisticResponse,
    variables,
    uploadables,
  });
}

function applyRelayClassicMutation(
  environment: ClassicEnvironment,
  {configs, mutation, optimisticResponse, variables}: OptimisticMutationConfig,
): Disposable {
  const {getRequest} = environment.unstable_internal;
  const operation = getRequest(mutation);
  if (operation.operation !== 'mutation') {
    throw new Error('RelayCompatMutations: Expected mutation operation');
  }

  // RelayClassic can't update anything without response.
  if (!optimisticResponse) {
    return {dispose: () => {}};
  }

  optimisticResponse = validateOptimisticResponse(
    operation,
    optimisticResponse,
  );
  return environment.applyMutation({
    configs: configs || [],
    operation,
    optimisticResponse,
    variables,
  });
}

function validateOptimisticResponse(
  operation: ConcreteOperationDefinition,
  optimisticResponse: Object,
): Object {
  if (
    operation.node.kind === 'Mutation' &&
    operation.node.calls &&
    operation.node.calls.length === 1
  ) {
    const mutationRoot = operation.node.calls[0].name;
    if (optimisticResponse[mutationRoot]) {
      return optimisticResponse[mutationRoot];
    } else {
      warning(
        false,
        'RelayCompatMutations: Expected result from `optimisticResponse`' +
          'to contain the mutation name `%s` as a property, got `%s`',
        mutationRoot,
        optimisticResponse,
      );
    }
  }
  return optimisticResponse;
}

module.exports = {
  applyUpdate,
  commitUpdate,
  injectCompatLoggingFunction,
};
