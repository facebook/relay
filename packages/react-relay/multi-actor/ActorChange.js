/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

'use strict';

import type {ActorIdentifier} from 'relay-runtime/multi-actor-environment';

const RelayEnvironmentProvider = require('../relay-hooks/RelayEnvironmentProvider');
const useRelayActorEnvironment = require('./useRelayActorEnvironment');
const React = require('react');

export opaque type ActorChangePoint<TFragmentRef> = $ReadOnly<{
  __fragmentRef: TFragmentRef,
  __viewer: ActorIdentifier,
}>;

type ActorChangeProps<TFragmentRef> = {
  actorChangePoint: ActorChangePoint<TFragmentRef>,
  children: (
    fragmentRef: TFragmentRef,
    actorIdentifier: ActorIdentifier,
  ) => React.MixedElement,
};

function ActorChange<TFragmentRef>(
  props: ActorChangeProps<TFragmentRef>,
): React.Element<typeof RelayEnvironmentProvider> {
  const actorEnvironment = useRelayActorEnvironment(
    props.actorChangePoint.__viewer,
  );
  const getEnvironmentForActor = React.useCallback(
    (actorIdentifier: ActorIdentifier) => {
      return actorEnvironment.multiActorEnvironment.forActor(actorIdentifier);
    },
    [actorEnvironment],
  );

  return (
    <RelayEnvironmentProvider
      environment={actorEnvironment}
      getEnvironmentForActor={getEnvironmentForActor}>
      {props.children(
        props.actorChangePoint.__fragmentRef,
        props.actorChangePoint.__viewer,
      )}
    </RelayEnvironmentProvider>
  );
}

module.exports = ActorChange;
