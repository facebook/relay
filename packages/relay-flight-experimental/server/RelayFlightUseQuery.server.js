/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {GraphQLTaggedNode, OperationType} from 'relay-runtime';

import {executeOperation, isAvailable} from 'RelayFlightOperationMap.server';
import {lookup} from 'RelayFlightStore.server';

import {getRequest} from 'relay-runtime/query/GraphQLTag';
import {createOperationDescriptor} from 'relay-runtime/store/RelayModernOperationDescriptor';

export default function useQuery<TQuery: OperationType>(
  query: GraphQLTaggedNode,
  variables: TQuery['variables'],
): TQuery['response'] {
  const operation = createOperationDescriptor(getRequest(query), variables);
  if (!isAvailable(operation)) {
    executeOperation(operation);
  }

  return lookup(operation.fragment).data;
}
