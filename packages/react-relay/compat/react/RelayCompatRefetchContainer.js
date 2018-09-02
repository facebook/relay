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
const ReactRelayRefetchContainer = require('../../modern/ReactRelayRefetchContainer');

const {buildCompatContainer} = require('../ReactRelayCompatContainerBuilder');

import type {
  $RelayProps,
  GeneratedNodeMap,
  RelayRefetchProp,
} from '../../modern/ReactRelayTypes';
import type {RelayCompatContainer} from './RelayCompatTypes';
import type {GraphQLTaggedNode} from 'relay-runtime';

/**
 * Wrap the basic `createContainer()` function with logic to adapt to the
 * `context.relay.environment` in which it is rendered. Specifically, the
 * extraction of the environment-specific version of fragments in the
 * `fragmentSpec` is memoized once per environment, rather than once per
 * instance of the container constructed/rendered.
 */
function createContainer<Props: {}, TComponent: React.ComponentType<Props>>(
  Component: TComponent,
  fragmentSpec: GraphQLTaggedNode | GeneratedNodeMap,
  taggedNode: GraphQLTaggedNode,
): RelayCompatContainer<
  $RelayProps<React$ElementConfig<TComponent>, RelayRefetchProp>,
> {
  return buildCompatContainer(
    Component,
    (fragmentSpec: any),
    (ComponentClass, fragments) => {
      return ReactRelayRefetchContainer.createContainerWithFragments(
        ComponentClass,
        fragments,
        taggedNode,
      );
    },
    /* provides child context */ true,
  );
}

module.exports = {createContainer};
