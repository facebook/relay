/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createRelayQuery
 * @flow
 */

'use strict';

const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');

const invariant = require('invariant');

function createRelayQuery(
  node: Object,
  variables: {[key: string]: mixed}
): RelayQuery.Root {
  invariant(
    typeof variables === 'object' &&
    variables != null &&
    !Array.isArray(variables),
    'Relay.Query: Expected `variables` to be an object.'
  );
  return RelayQuery.Root.create(
    node,
    RelayMetaRoute.get('$createRelayQuery'),
    variables
  );
}

module.exports = createRelayQuery;
