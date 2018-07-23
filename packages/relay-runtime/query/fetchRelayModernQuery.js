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

const RelayConcreteNode = require('../util/RelayConcreteNode');

const invariant = require('invariant');

import type {CacheConfig, OperationType} from '../util/RelayRuntimeTypes';
import type {GraphQLTaggedNode} from './RelayModernGraphQLTag';

/**
 * A helper function to fetch the results of a query. Note that results for
 * fragment spreads are masked: fields must be explicitly listed in the query in
 * order to be accessible in the result object.
 */

function fetchRelayModernQuery<T: OperationType>(
  environment: $FlowFixMe,
  taggedNode: GraphQLTaggedNode,
  variables: $PropertyType<T, 'variables'>,
  cacheConfig?: ?CacheConfig,
): Promise<$PropertyType<T, 'response'>> {
  invariant(
    environment.unstable_internal,
    'fetchRelayModernQuery: Expected a valid Relay environment, got `%s`.',
    environment,
  );
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const query = getRequest(taggedNode);
  if (query.kind === RelayConcreteNode.BATCH_REQUEST) {
    throw new Error(
      'fetchRelayModernQuery: Batch request not supported in this API.',
    );
  }
  if (query.operationKind !== 'query') {
    throw new Error('fetchRelayModernQuery: Expected query operation');
  }
  const operation = createOperationSelector(query, variables);

  return environment
    .execute({operation, cacheConfig})
    .map(() => environment.lookup(operation.fragment).data)
    .toPromise();
}

module.exports = fetchRelayModernQuery;
