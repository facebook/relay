/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

import type {ClientQuery, Query, RenderPolicy, Variables} from 'relay-runtime';

const useLazyLoadQuery = require('./useLazyLoadQuery');

/**
 * This hook can be used to render client-only queries.
 * These queries are consist of queries for client-only data,
 * schematized via local schema extensions and/or Relay resolvers.
 */
function useClientQuery<TVariables: Variables, TData>(
  gqlQuery: ClientQuery<TVariables, TData>,
  variables: TVariables,
  options?: {
    UNSTABLE_renderPolicy?: RenderPolicy,
  },
): TData {
  // $FlowFixMe[incompatible-type] client queries can be used with useLazyLoadQuery, but only with `store-only` policy.
  const query: Query<TVariables, TData> = gqlQuery;

  return useLazyLoadQuery(query, variables, {
    ...options,
    fetchPolicy: 'store-only',
  });
}

module.exports = useClientQuery;
