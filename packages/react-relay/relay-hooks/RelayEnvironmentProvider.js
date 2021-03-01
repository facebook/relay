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
const {deleteQueryResourceForEnvironment} = require('./QueryResource');
const {deleteFragmentResourceForEnvironment} = require('./FragmentResource');

import type {IEnvironment} from 'relay-runtime';

const {useMemo, useEffect} = React;

type Props = $ReadOnly<{|
  children: React.Node,
  environment: IEnvironment,
|}>;

function RelayEnvironmentProvider(props: Props): React.Node {
  const {children, environment} = props;
  const context = useMemo(() => ({environment}), [environment.id]);

  useEffect(() => () => {
    environment.dispose();
    deleteFragmentResourceForEnvironment(environment);
    deleteQueryResourceForEnvironment(environment);
  }, [environment.id]);
  
  return (
    <ReactRelayContext.Provider value={context}>
      {children}
    </ReactRelayContext.Provider>
  );
}

module.exports = RelayEnvironmentProvider;
