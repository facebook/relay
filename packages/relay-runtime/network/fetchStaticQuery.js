/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule fetchStaticQuery
 * @flow
 */

'use strict';
const {getOperation} = require('RelayStaticGraphQLTag');
const {createOperationSelector} = require('RelayStaticOperationSelector');

import type {CacheConfig} from 'RelayCombinedEnvironmentTypes';
import type {Network, QueryPayload} from 'RelayNetworkTypes';
import type {GraphQLTaggedNode} from 'RelayStaticGraphQLTag';
import type {Variables} from 'RelayTypes';

/**
 * A helper function to fetch the results of a query without writing to Relay.
 * Note that compiling step might add additional `id` and `__typename` fields.
 *
 * NOTE: This module is primarily intended for integrating with classic APIs.
 * Most product code should use a Renderer or Container.
 */
function fetchStaticQuery(
  network: Network,
  taggedNode: GraphQLTaggedNode,
  variables: Variables,
  cacheConfig?: ?CacheConfig,
): Promise<?QueryPayload> {
  const query = getOperation(taggedNode);
  const operation = createOperationSelector(query, variables);
  return network.fetch(operation.node, operation.variables, cacheConfig);
}

module.exports = fetchStaticQuery;
