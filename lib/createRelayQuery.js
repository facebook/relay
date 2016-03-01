/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createRelayQuery
 * @typechecks
 * 
 */

'use strict';

var RelayMetaRoute = require('./RelayMetaRoute');
var RelayQuery = require('./RelayQuery');

var invariant = require('fbjs/lib/invariant');

function createRelayQuery(node, variables) {
  !(typeof variables === 'object' && variables != null && !Array.isArray(variables)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay.Query: Expected `variables` to be an object.') : invariant(false) : undefined;
  return RelayQuery.Root.create(node, RelayMetaRoute.get('$createRelayQuery'), variables);
}

module.exports = createRelayQuery;