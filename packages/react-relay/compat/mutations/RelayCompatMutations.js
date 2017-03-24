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

const commitRelayStaticMutation = require('commitRelayStaticMutation');
const invariant = require('invariant');

const {
  getRelayClassicEnvironment,
  getRelayStaticEnvironment,
} = require('RelayCompatEnvironment');

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {CompatContext} from 'RelayCompatTypes';
import type {Environment as ClassicEnvironment} from 'RelayEnvironmentTypes';
import type {MutationConfig} from 'commitRelayStaticMutation';

const RelayCompatMutations = {
  commitUpdate(
    context: CompatContext,
    config: MutationConfig
  ): Disposable {
    const relayStaticEnvironment = getRelayStaticEnvironment(context);
    if (relayStaticEnvironment) {
      return commitRelayStaticMutation(relayStaticEnvironment, config);
    } else {
      const relayClassicEnvironment = getRelayClassicEnvironment(context);
      invariant(
        relayClassicEnvironment,
        'RelayCompatMutations: Expected an object that conforms to the ' +
        '`RelayEnvironmentInterface`, got `%s`.',
        context
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
  });
}

module.exports = RelayCompatMutations;
