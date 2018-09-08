/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');

import type {GraphQLTaggedNode} from '../query/RelayModernGraphQLTag';
import type {Environment, Snapshot} from '../store/RelayStoreTypes';
import type {Variables} from '../util/RelayRuntimeTypes';

/**
 * Reads a query from the local Relay Store.
 * Returns the Snapshot which contains the data result for the query.
 */
function readQuery_UNSTABLE(
  environment: Environment,
  gqlNode: GraphQLTaggedNode,
  variables: Variables,
): Snapshot {
  const {
    getRequest,
    isRequest,
    createOperationSelector,
  } = environment.unstable_internal;
  invariant(
    isRequest(gqlNode),
    'readQuery_UNSTABLE: Expected graphql node to be a query',
  );
  const queryNode = getRequest(gqlNode);
  const operation = createOperationSelector(queryNode, variables);
  return environment.lookup(operation.fragment);
}

module.exports = readQuery_UNSTABLE;
