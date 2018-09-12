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
  OperationType,
} from 'relay-runtime';

function retainQuery_UNSTABLE<TQuery: OperationType>(
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  variables: $ElementType<TQuery, 'variables'>,
) {
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const queryRequestNode = getRequest(query);
  const operation = createOperationSelector(queryRequestNode, variables);
  return environment.retain(operation.root);
}

module.exports = retainQuery_UNSTABLE;
