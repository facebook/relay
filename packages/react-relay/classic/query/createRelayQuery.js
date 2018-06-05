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

const RelayMetaRoute = require('../route/RelayMetaRoute');
const RelayQuery = require('./RelayQuery');

const invariant = require('invariant');

import type {RelayConcreteNode} from './RelayQL';
import type {Variables} from 'RelayRuntime';

function createRelayQuery(
  node: RelayConcreteNode,
  variables: Variables,
): RelayQuery.Root {
  invariant(
    typeof variables === 'object' &&
      variables != null &&
      !Array.isArray(variables),
    'Relay.Query: Expected `variables` to be an object.',
  );
  return RelayQuery.Root.create(
    node,
    RelayMetaRoute.get('$createRelayQuery'),
    variables,
  );
}

module.exports = createRelayQuery;
