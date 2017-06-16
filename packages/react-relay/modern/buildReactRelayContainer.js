/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule buildReactRelayContainer
 * @flow
 * @format
 */

'use strict';

const RelayPropTypes = require('RelayPropTypes');

const assertFragmentMap = require('assertFragmentMap');
const mapObject = require('mapObject');

const {getComponentName, getContainerName} = require('RelayContainerUtils');

import type {GeneratedNodeMap} from 'ReactRelayTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {FragmentMap} from 'RelayStoreTypes';

const containerContextTypes = {
  relay: RelayPropTypes.Relay,
};

type ContainerCreator = (
  Component: ReactClass<any>,
  fragments: FragmentMap,
) => ReactClass<any>;

/**
 * Creates a component class whose instances adapt to the
 * `context.relay.environment` in which they are rendered and which have the
 * necessary static methods (`getFragment()` etc) to be composed within classic
 * `Relay.Containers`.
 */
function buildReactRelayContainer<TBase: ReactClass<*>>(
  ComponentClass: TBase,
  fragmentSpec: GraphQLTaggedNode | GeneratedNodeMap,
  createContainerWithFragments: ContainerCreator,
): TBase {
  // Sanity-check user-defined fragment input
  const containerName = getContainerName(ComponentClass);
  assertFragmentMap(getComponentName(ComponentClass), fragmentSpec);

  // Memoize a container for the last environment instance encountered
  let environment;
  let Container;
  function ContainerConstructor(props, context) {
    if (Container == null || context.relay.environment !== environment) {
      environment = context.relay.environment;
      if (__DEV__) {
        const {isRelayModernEnvironment} = require('RelayRuntime');
        if (!isRelayModernEnvironment(environment)) {
          throw new Error(
            'RelayModernContainer: Can only use Relay Modern component ' +
              `${containerName} in a Relay Modern environment!\n` +
              'When using Relay Modern and Relay Classic in the same ' +
              'application, ensure components use Relay Compat to work in ' +
              'both environments.\n' +
              'See: http://facebook.github.io/relay/docs/relay-compat.html',
          );
        }
      }
      const {getFragment: getFragmentFromTag} = environment.unstable_internal;
      const fragments = mapObject(fragmentSpec, getFragmentFromTag);
      Container = createContainerWithFragments(ComponentClass, fragments);
    }
    return new Container(props, context);
  }
  ContainerConstructor.contextTypes = containerContextTypes;
  ContainerConstructor.displayName = containerName;

  if (__DEV__) {
    // Classic container static methods.
    ContainerConstructor.getFragment = function getFragmentOnModernContainer() {
      throw new Error(
        `RelayModernContainer: ${containerName}.getFragment() was called on ` +
          'a Relay Modern component by a Relay Classic or Relay Compat ' +
          'component.\n' +
          'When using Relay Modern and Relay Classic in the same ' +
          'application, ensure components use Relay Compat to work in ' +
          'both environments.\n' +
          'See: http://facebook.github.io/relay/docs/relay-compat.html',
      );
    };
  }

  return (ContainerConstructor: any);
}

module.exports = buildReactRelayContainer;
