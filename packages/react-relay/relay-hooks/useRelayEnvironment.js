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

import type {IEnvironment} from 'relay-runtime';

const invariant = require('invariant');
const {useContext} = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');

function useRelayEnvironment(): IEnvironment {
  const context = useContext(ReactRelayContext);
  invariant(
    context != null,
    'useRelayEnvironment: Expected to have found a Relay environment provided by ' +
      'a `RelayEnvironmentProvider` component. ' +
      'This usually means that useRelayEnvironment was used in a ' +
      'component that is not a descendant of a `RelayEnvironmentProvider`. ' +
      'Please make sure a `RelayEnvironmentProvider` has been rendered somewhere ' +
      'as a parent or ancestor of your component.',
  );
  return context.environment;
}

module.exports = useRelayEnvironment;
