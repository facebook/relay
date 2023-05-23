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

import type {IEnvironment} from 'relay-runtime';
import type {
  ActorIdentifier,
  IActorEnvironment,
} from 'relay-runtime/multi-actor-environment';

const ReactRelayContext = require('./../ReactRelayContext');
const React = require('react');

const {useMemo} = React;

type Props = $ReadOnly<{
  children: React.Node,
  environment: IEnvironment,
  getEnvironmentForActor?: ?(
    actorIdentifier: ActorIdentifier,
  ) => IActorEnvironment,
}>;

function RelayEnvironmentProvider(props: Props): React.Node {
  const {children, environment, getEnvironmentForActor} = props;
  const context = useMemo(
    () => ({environment, getEnvironmentForActor}),
    [environment, getEnvironmentForActor],
  );
  return (
    <ReactRelayContext.Provider value={context}>
      {children}
    </ReactRelayContext.Provider>
  );
}

module.exports = RelayEnvironmentProvider;
