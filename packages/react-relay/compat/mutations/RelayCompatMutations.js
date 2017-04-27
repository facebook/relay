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
 */

'use strict';

const invariant = require('invariant');

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
  commitUpdate(
    environment: CompatEnvironment,
    config: MutationConfig
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
        environment
      );
      return commitRelay1Mutation(
        // getRelayClassicEnvironment returns a RelayEnvironmentInterface
        // (classic APIs), but we need the modern APIs on old core here.
        (relayClassicEnvironment: $FixMe),
        config
      );
    }
  },
};

function commitRelay1Mutation(
  environment: ClassicEnvironment,
  {
    configs,
    mutation,
    onCompleted,
    onError,
    optimisticResponse,
    variables,
    uploadables,
  }: MutationConfig
): Disposable {
  const {getOperation} = environment.unstable_internal;
  const operation = getOperation(mutation);
  return environment.sendMutation({
    configs: configs || [],
    operation,
    onCompleted,
    onError,
    optimisticResponse: optimisticResponse && optimisticResponse(),
    variables,
    uploadables,
  });
}

module.exports = RelayCompatMutations;
