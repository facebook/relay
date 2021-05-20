/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const React = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');

import type {IEnvironment} from 'relay-runtime';

const {useMemo} = React;

type Props = $ReadOnly<{|
  children: React.Node,
  environment: IEnvironment,
|}>;

function RelayEnvironmentProvider(props: Props): React.Node {
  const {children, environment} = props;
  const context = useMemo(() => ({environment}), [environment]);
  return (
    <ReactRelayContext.Provider value={context}>
      {children}
    </ReactRelayContext.Provider>
  );
}

module.exports = RelayEnvironmentProvider;
