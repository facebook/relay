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

const RelayConcreteNode = require('../util/RelayConcreteNode');

const invariant = require('invariant');

import type {CacheConfig, Variables} from '../util/RelayRuntimeTypes';
import type {GraphQLTaggedNode} from './RelayModernGraphQLTag';

/**
 * A helper function to fetch the results of a query. Note that results for
 * fragment spreads are masked: fields must be explicitly listed in the query in
 * order to be accessible in the result object.
 *
 * NOTE: This module is primarily intended for integrating with classic APIs.
 * Most product code should use a Renderer or Container.
 *
 * TODO(t16875667): The return type should be `Promise<?SelectorData>`, but
 * that's not really helpful as `SelectorData` is essentially just `mixed`. We
 * can probably leverage generated flow types here to return the real expected
 * shape.
 */
function fetchRelayModernQuery(
  environment: $FlowFixMe,
  taggedNode: GraphQLTaggedNode,
  variables: Variables,
  cacheConfig?: ?CacheConfig,
): Promise<$FlowFixMe> {
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
