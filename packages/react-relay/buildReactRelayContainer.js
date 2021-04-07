/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const React = require('react');
const ReactRelayContext = require('./ReactRelayContext');
const ReactRelayQueryRendererContext = require('./ReactRelayQueryRendererContext');

const assertFragmentMap = require('./assertFragmentMap');
const invariant = require('invariant');
const readContext = require('./readContext');

const {
  getComponentName,
  getContainerName,
} = require('./ReactRelayContainerUtils');
const {getFragment} = require('relay-runtime');

import type {GeneratedNodeMap} from './ReactRelayTypes';
import type {FragmentMap} from 'relay-runtime';

type ContainerCreator = (
  Component: React$ComponentType<any>,
  fragments: FragmentMap,
) => React$ComponentType<any>;

/**
 * Helper to create the Relay HOCs with ref forwarding, setting the displayName
 * and reading the React context.
 */
function buildReactRelayContainer<TBase: React$ComponentType<any>>(
  ComponentClass: TBase,
  fragmentSpec: GeneratedNodeMap,
  createContainerWithFragments: ContainerCreator,
): TBase {
  // Sanity-check user-defined fragment input
  const containerName = getContainerName(ComponentClass);
  assertFragmentMap(getComponentName(ComponentClass), fragmentSpec);

  const fragments = {};
  for (const key in fragmentSpec) {
    fragments[key] = getFragment(fragmentSpec[key]);
  }
  const Container = createContainerWithFragments(ComponentClass, fragments);
  Container.displayName = containerName;

  function forwardRef(props, ref) {
    const context = readContext(ReactRelayContext);
    invariant(
      context != null,
      '`%s` tried to render a context that was not valid this means that ' +
        '`%s` was rendered outside of a query renderer.',
      containerName,
      containerName,
    );
    const queryRendererContext = readContext(ReactRelayQueryRendererContext);

    return (
      <Container
        {...props}
        __relayContext={context}
        __rootIsQueryRenderer={
          queryRendererContext?.rootIsQueryRenderer ?? false
        }
        componentRef={props.componentRef || ref}
      />
    );
  }
  forwardRef.displayName = containerName;
  const ForwardContainer = React.forwardRef(forwardRef);

  if (__DEV__) {
    // Used by RelayModernTestUtils
    (ForwardContainer: any).__ComponentClass = ComponentClass;
    ForwardContainer.displayName = containerName;
  }

  // $FlowFixMe[incompatible-return]
  return ForwardContainer;
}

module.exports = buildReactRelayContainer;
