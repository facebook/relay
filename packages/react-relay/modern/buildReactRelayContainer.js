/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('../classic/container/RelayPropTypes');

const assertFragmentMap = require('./assertFragmentMap');
const mapObject = require('mapObject');

const {
  getComponentName,
  getContainerName,
} = require('./ReactRelayContainerUtils');

import type {GeneratedNodeMap} from './ReactRelayTypes';
import type {GraphQLTaggedNode, FragmentMap} from 'RelayRuntime';

const containerContextTypes = {
  relay: RelayPropTypes.Relay,
};

type ContainerCreator = (
  Component: React$ComponentType<any>,
  fragments: FragmentMap,
) => React$ComponentType<any>;

/**
 * Creates a component class whose instances adapt to the
 * `context.relay.environment` in which they are rendered and which have the
 * necessary static methods (`getFragment()` etc) to be composed within classic
 * `Relay.Containers`.
 */
function buildReactRelayContainer<TBase: React$ComponentType<*>>(
  ComponentClass: TBase,
  fragmentSpec: GraphQLTaggedNode | GeneratedNodeMap,
  createContainerWithFragments: ContainerCreator,
  providesChildContext: boolean,
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

      // Attach static lifecycle to wrapper component so React can see it.
      ContainerConstructor.getDerivedStateFromProps = (Container: any).getDerivedStateFromProps;
    }
    // $FlowFixMe
    return new Container(props, context);
  }
  ContainerConstructor.contextTypes = containerContextTypes;
  if (providesChildContext) {
    ContainerConstructor.childContextTypes = containerContextTypes;
  }

  function forwardRef(props, ref) {
    return (
      <ContainerConstructor
        {...props}
        componentRef={props.componentRef || ref}
      />
    );
  }
  forwardRef.displayName = containerName;
  // $FlowFixMe
  const ForwardContainer = React.forwardRef(forwardRef);

  if (__DEV__) {
    ForwardContainer.__ComponentClass = ComponentClass;
    // Classic container static methods.
    ForwardContainer.getFragment = function getFragmentOnModernContainer() {
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

  return ForwardContainer;
}

module.exports = buildReactRelayContainer;
