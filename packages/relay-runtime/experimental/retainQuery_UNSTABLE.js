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

import type {GraphQLTaggedNode} from '../query/RelayModernGraphQLTag';
import type {Environment} from '../store/RelayStoreTypes';
import type {OperationType} from '../util/RelayRuntimeTypes';

function retainQuery_UNSTABLE<TQuery: OperationType>(
  environment: Environment,
  query: GraphQLTaggedNode,
  variables: $ElementType<TQuery, 'variables'>,
) {
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const queryRequestNode = getRequest(query);
  const operation = createOperationSelector(queryRequestNode, variables);
  return environment.retain(operation.root);
}

module.exports = retainQuery_UNSTABLE;
