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

const invariant = require('invariant');

const {fetchQuery} = require('../utils/fetchQueryUtils');

import type {
  ExecutePayload,
  Observer,
  GraphQLTaggedNode,
  IEnvironment,
  CacheConfig,
  OperationType,
} from 'relay-runtime';

/**
 * Facilitates fetching a query given its variables and an environment, while
 * retaining data for the query and de-duping identical requests that are
 * _in-flight_.
 *
 * Observing a request:
 * ====================
 * fetchQuery_UNSTABLE takes an Observer which you can use to observe network
 * responses and other events like errors or when the request is complete:
 *
 * ```
 * fetchQuery_UNSTABLE(environment, query, variables, {
 *   // Called when network requests starts
 *   start: (subsctiption) => {},
 *
 *   // Called after a payload is received and written to the local store
 *   next: (payload) => {},
 *
 *   // Called when network requests errors
 *   error: (error) => {},
 *
 *   // Called when network requests fully completes
 *   complete: () => {},
 *
 *   // Called when network request is unsubscribed
 *   unsubscribe: (subscription) => {},
 * });
 * ```
 *
 * In-flight request de-duping:
 * ============================
 * By default, calling fetchQuery_UNSTABLE multiple times with the same
 * environment, query and variables will not initiate a new request if a request
 * for those same parameters is already in flight.
 *
 * A request is marked in-flight from the moment it starts until the moment it
 * fully completes, regardless of error or successful completion.
 *
 * NOTE: If the request completes _synchronously_, calling fetchQuery_UNSTABLE
 * a second time with the same arguments in the same tick will _NOT_ de-dupe
 * the request given that it will no longer be in-flight.
 *
 *
 * Data Retention:
 * ===============
 * This function will _retain_ data for the given query and variables on the
 * provided Relay environment; this means that it prevent that data from being
 * garbage collected (i.e. deleted) from the Relay store.
 * In order to release the data, the will return a Disposable which can be used to
 * dispose of the retained data:
 *
 * ```
 * const disposable = fetchQuery_UNSTABLE(...);
 *
 * // After calling this, the data might be garbage collected (i.e. deleted)
 * // from the Relay local store
 * disposable.dispose();
 * ```
 */
function fetchQuery_UNSTABLE<TQuery: OperationType>(args: {|
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  variables: $ElementType<TQuery, 'variables'>,
  observer?: Observer<ExecutePayload>,
  networkLayerCacheConfig?: CacheConfig,
|}) {
  const {environment, variables, query} = args;
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const queryNode = getRequest(query);
  invariant(
    queryNode.operationKind === 'query',
    'fetchQuery_UNSTABLE: Expected query operation',
  );
  const operationSelector = createOperationSelector(queryNode, variables);
  return fetchQuery({
    environment,
    query: operationSelector,
    observer: args.observer,
    networkLayerCacheConfig: args.networkLayerCacheConfig,
  });
}

module.exports = fetchQuery_UNSTABLE;
