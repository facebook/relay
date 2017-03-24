/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCompatRefetchContainer
 * @flow
 */

'use strict';

const ReactRelayRefetchContainer = require('ReactRelayRefetchContainer');

const {buildCompatContainer} = require('ReactRelayCompatContainerBuilder');

import type {GeneratedNodeMap} from 'ReactRelayTypes';
import type {GraphQLTaggedNode} from 'RelayStaticGraphQLTag';

function createContainer<TBase: ReactClass<*>>(
  Component: TBase,
  fragmentSpec: GraphQLTaggedNode | GeneratedNodeMap,
  taggedNode: GraphQLTaggedNode,
): TBase {
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
  );
}

module.exports = {createContainer};
