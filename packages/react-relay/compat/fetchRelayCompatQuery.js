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

const invariant = require('invariant');
const isClassicRelayEnvironment = require('isClassicRelayEnvironment');
const isRelayStaticEnvironment = require('isRelayStaticEnvironment');

const {fetchQuery} = require('RelayRuntime');

import type {
  CacheConfig,
  SelectorData,
} from 'RelayCombinedEnvironmentTypes';
import type {CompatEnvironment} from 'RelayCompatTypes';
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
  environment: CompatEnvironment,
  taggedNode: GraphQLTaggedNode,
  variables: Variables,
  cacheConfig?: ?CacheConfig,
): Promise<?SelectorData> {
  invariant(
    isClassicRelayEnvironment(environment) || isRelayStaticEnvironment(environment),
    'fetchRelayCompatQuery: Expected a valid Relay environment, got `%s`.',
    environment,
  );
  return fetchQuery(
    environment,
    taggedNode,
    variables,
    cacheConfig
  );
}

module.exports = fetchRelayCompatQuery;
