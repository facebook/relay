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
import type {Environment} from '../store/RelayStoreTypes';
import type {Variables} from '../util/RelayRuntimeTypes';

/**
 * Checks if a query is fully available locally in the Relay Store
 */
function checkQuery_UNSTABLE(
  environment: Environment,
  gqlNode: GraphQLTaggedNode,
  variables: Variables,
): boolean {
  const {
    getRequest,
    isRequest,
    createOperationSelector,
  } = environment.unstable_internal;
  invariant(
    isRequest(gqlNode),
    'checkQuery_UNSTABLE: Expected graphql node to be a query',
  );
  const queryNode = getRequest(gqlNode);
  const operation = createOperationSelector(queryNode, variables);
  return environment.check(operation.root);
}

module.exports = checkQuery_UNSTABLE;
