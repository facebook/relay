/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');

const assertFragmentMap = require('react-relay/modern/assertFragmentMap');
const createFragmentRenderer_UNSTABLE = require('./createFragmentRenderer_UNSTABLE');

const {
  getComponentName,
  getContainerName,
} = require('react-relay/modern/ReactRelayContainerUtils');

import type {$FragmentRefs} from './createFragmentRenderer_UNSTABLE';
import type {GeneratedNodeMap} from 'react-relay/modern/ReactRelayTypes';
import type {GraphQLTaggedNode} from 'relay-runtime';

function createFragmentContainer_UNSTABLE<
  Props: {},
  TComponent: React.ComponentType<Props>,
>(
  Component: TComponent,
  fragmentMap: GraphQLTaggedNode | GeneratedNodeMap,
): React.ComponentType<$FragmentRefs<React.ElementConfig<TComponent>>> {
  const containerName = getContainerName(Component);
  assertFragmentMap(getComponentName(Component), fragmentMap);

  // $FlowExpectedError - The compiler converts a GraphQLTaggedNode into a GeneratedNodeMap for us
  const actualFragmentMap: GeneratedNodeMap = (fragmentMap: any);

  const FragmentRenderer = createFragmentRenderer_UNSTABLE(actualFragmentMap);
  function FragmentContainer(props) {
    const fragmentRefs = {};
    Object.keys(props).forEach(key => {
      if (actualFragmentMap.hasOwnProperty(key)) {
        fragmentRefs[key] = props[key];
      }
    });
    const {__relayForwardedRef, ...restProps} = props;
    return (
      <FragmentRenderer {...fragmentRefs}>
        {({data}) => (
          <Component ref={__relayForwardedRef} {...restProps} {...data} />
        )}
      </FragmentRenderer>
    );
  }

  const forwardRef = (props, ref) => (
    <FragmentContainer __relayForwardedRef={ref} {...props} />
  );
  forwardRef.displayName = containerName;
  // $FlowFixMe - TODO T29156721 forwardRef isn't Flow typed yet
  const ContainerWithRefForwarding = React.forwardRef(forwardRef);

  if (__DEV__) {
    ContainerWithRefForwarding.__ComponentClass = Component;
  }
  return ContainerWithRefForwarding;
}

module.exports = createFragmentContainer_UNSTABLE;
