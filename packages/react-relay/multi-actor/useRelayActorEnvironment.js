/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {
  ActorIdentifier,
  IActorEnvironment,
} from 'relay-runtime/multi-actor-environment';

const ReactRelayContext = require('./../ReactRelayContext');
const invariant = require('invariant');
const {useContext} = require('react');

hook useRelayActorEnvironment(
  actorIdentifier: ActorIdentifier,
): IActorEnvironment {
  const context = useContext(ReactRelayContext);
  invariant(
    context != null,
    'useRelayActorEnvironment: Expected to have found a Relay environment provided by ' +
      'a `RelayEnvironmentProvider` component. ' +
      'This usually means that useRelayActorEnvironment was used in a ' +
      'component that is not a descendant of a `RelayEnvironmentProvider`. ' +
      'Please make sure a `RelayEnvironmentProvider` has been rendered somewhere ' +
      'as a parent or ancestor of your component.',
  );
  const getEnvironmentForActor = context.getEnvironmentForActor;
  invariant(
    getEnvironmentForActor != null,
    'useRelayActorEnvironment: Expected to have a function `getEnvironmentForActor`.' +
      'This usually means that `RelayEnvironmentProvider`. was not properly set up for use in the ' +
      'multi actor application. Please make sure the provider has defined a `getEnvironmentForActor`.',
  );

  return getEnvironmentForActor(actorIdentifier);
}

module.exports = useRelayActorEnvironment;
