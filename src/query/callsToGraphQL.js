/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule callsToGraphQL
 * @flow
 * @typechecks
 */

'use strict';

import type {Call} from 'RelayInternalTypes';
var GraphQL = require('GraphQL_EXPERIMENTAL');

/**
 * @internal
 *
 * Convert from plain object `{name,value}` calls to GraphQL call nodes.
 */
function callsToGraphQL(calls: Array<Call>): Array<GraphQL.Call> {
  return calls.map(({name, value}) => new GraphQL.Callv(name, value));
}

module.exports = callsToGraphQL;
