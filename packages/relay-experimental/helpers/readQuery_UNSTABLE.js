/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {
  GraphQLTaggedNode,
  IEnvironment,
  Snapshot,
  Variables,
} from 'relay-runtime';

/**
 * Reads a query from the local Relay Store.
 * Returns the Snapshot which contains the data result for the query.
 */
function readQuery_UNSTABLE(
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  variables: Variables,
): Snapshot {
  const {getRequest, createOperationSelector} = environment.unstable_internal;
  const queryNode = getRequest(query);
  const operation = createOperationSelector(queryNode, variables);
  return environment.lookup(operation.fragment);
}

module.exports = readQuery_UNSTABLE;
