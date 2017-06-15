/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCompatMutations
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const warning = require('warning');

const {
  getRelayClassicEnvironment,
  getRelayModernEnvironment,
} = require('RelayCompatEnvironment');
const {commitMutation} = require('RelayRuntime');

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {CompatEnvironment} from 'RelayCompatTypes';
import type {Environment as ClassicEnvironment} from 'RelayEnvironmentTypes';
import type {MutationConfig} from 'commitRelayModernMutation';

const RelayCompatMutations = {
  /* $FlowFixMe(site=react_native_fb) - Flow now prevents you from calling a
   * function with more arguments than it expects. This comment suppresses an
   * error that was noticed when we made this change. Delete this comment to
   * see the error. */
  commitUpdate<T>(
    environment: CompatEnvironment,
    config: MutationConfig<T>,
  ): Disposable {
    const relayStaticEnvironment = getRelayModernEnvironment(environment);
    if (relayStaticEnvironment) {
      return commitMutation(relayStaticEnvironment, config);
    } else {
      const relayClassicEnvironment = getRelayClassicEnvironment(environment);
      invariant(
        relayClassicEnvironment,
        'RelayCompatMutations: Expected an object that conforms to the ' +
          '`RelayEnvironmentInterface`, got `%s`.',
        environment,
      );
      return commitRelayClassicMutation(
        // getRelayClassicEnvironment returns a RelayEnvironmentInterface
        // (classic APIs), but we need the modern APIs on old core here.
        (relayClassicEnvironment: $FixMe),
        config,
      );
    }
  },
};

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
  const {getOperation} = environment.unstable_internal;
  const operation = getOperation(mutation);
  // TODO: remove this check after we fix flow.
  if (typeof optimisticResponse === 'function') {
    warning(
      false,
      'RelayCompatMutations: Expected `optimisticResponse` to be an object, ' +
        'received a function.',
    );
    optimisticResponse = optimisticResponse();
  }
  if (
    optimisticResponse &&
    operation.node.kind === 'Mutation' &&
    operation.node.calls &&
    operation.node.calls.length === 1
  ) {
    const mutationRoot = operation.node.calls[0].name;
    if (optimisticResponse[mutationRoot]) {
      optimisticResponse = optimisticResponse[mutationRoot];
    } else {
      warning(
        false,
        'RelayCompatMutations: Expected `optimisticResponse`' +
          'to contain the mutation name `%s` as a property, got `%s`',
        mutationRoot,
        optimisticResponse,
      );
    }
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

module.exports = RelayCompatMutations;
