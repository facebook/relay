/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {IEnvironment, Query, Variables} from 'relay-runtime';

const {fetchQuery} = require('relay-runtime');

async function serverFetchQuery<TVariables extends Variables, TData>(
  environment: IEnvironment,
  query: Query<TVariables, TData>,
  variables: TVariables,
): Promise<TData> {
  const observable = fetchQuery(environment, query, variables);
  const result = await observable.toPromise();
  if (result == null) {
    throw new Error('Unexpected null response from fetchQuery');
  }
  return result;
}

module.exports = serverFetchQuery;
