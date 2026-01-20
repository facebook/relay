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

const ReactRelayContext = require('./../ReactRelayContext');
const invariant = require('invariant');
const {useContext} = require('react');

/**
 * Hook used to access a Relay environment that was set by a [`RelayEnvironmentProvider`](../relay-environment-provider):
 *
 * @example
 * const React = require('React');
 *
 * const {useRelayEnvironment} = require('react-relay');
 *
 * function MyComponent() {
 *   const environment = useRelayEnvironment();
 *
 *   const handler = useCallback(() => {
 *     // For example, can be used to pass the environment to functions
 *     // that require a Relay environment.
 *     commitMutation(environment, ...);
 *   }, [environment])
 *
 *   return (...);
 * }
 *
 * module.exports = MyComponent;
 */
hook useRelayEnvironment(): IEnvironment {
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
