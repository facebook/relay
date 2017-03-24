/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule fetchRelayCompatQuery
 * @flow
 */

'use strict';

const fetchRelayStaticQuery = require('fetchRelayStaticQuery');
const invariant = require('invariant');

const {
  getRelayClassicEnvironment,
  getRelayStaticEnvironment,
} = require('RelayCompatEnvironment');

import type {
  CacheConfig,
  SelectorData,
} from 'RelayCombinedEnvironmentTypes';
import type {CompatContext} from 'RelayCompatTypes';
import type {GraphQLTaggedNode} from 'RelayStaticGraphQLTag';
import type {Variables} from 'RelayTypes';

/**
 * A helper function to fetch the results of a query. Note that results for
 * fragment spreads are masked: fields must be explicitly listed in the query in
 * order to be accessible in the result object.
 *
 * NOTE: This module is primarily intended for integrating with classic APIs.
 * Most product code should use a Renderer or Container.
 */
function fetchRelayCompatQuery(
  context: CompatContext,
  taggedNode: GraphQLTaggedNode,
  variables: Variables,
  cacheConfig?: ?CacheConfig,
): Promise<?SelectorData> {
  const environment =
    getRelayStaticEnvironment(context) ||
    getRelayClassicEnvironment(context);
  invariant(
    environment,
    'fetchRelayStaticQuery: Expected a valid Relay environment, got `%s`.',
    context,
  );
  return fetchRelayStaticQuery(
    environment,
    taggedNode,
    variables,
    cacheConfig
  );
}

module.exports = fetchRelayCompatQuery;
