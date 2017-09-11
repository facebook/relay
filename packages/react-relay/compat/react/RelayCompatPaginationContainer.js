/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCompatPaginationContainer
 * @flow
 * @format
 */

'use strict';

const ReactRelayPaginationContainer = require('ReactRelayPaginationContainer');
const RelayPropTypes = require('RelayPropTypes');

const {buildCompatContainer} = require('ReactRelayCompatContainerBuilder');

import type {ConnectionConfig} from 'ReactRelayPaginationContainer';
import type {GeneratedNodeMap} from 'ReactRelayTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';

/**
 * Wrap the basic `createContainer()` function with logic to adapt to the
 * `context.relay.environment` in which it is rendered. Specifically, the
 * extraction of the environment-specific version of fragments in the
 * `fragmentSpec` is memoized once per environment, rather than once per
 * instance of the container constructed/rendered.
 */
function createContainer<TBase: React$ComponentType<*>>(
  Component: TBase,
  fragmentSpec: GraphQLTaggedNode | GeneratedNodeMap,
  connectionConfig: ConnectionConfig,
): TBase {
  const Container = buildCompatContainer(
    Component,
    (fragmentSpec: any),
    (ComponentClass, fragments) => {
      return ReactRelayPaginationContainer.createContainerWithFragments(
        ComponentClass,
        fragments,
        connectionConfig,
      );
    },
  );
  /* $FlowFixMe(>=0.53.0) This comment suppresses an error
   * when upgrading Flow's support for React. Common errors found when
   * upgrading Flow's React support are documented at
   * https://fburl.com/eq7bs81w */
  Container.childContextTypes = {
    relay: RelayPropTypes.Relay,
  };
  return Container;
}

module.exports = {createContainer};
