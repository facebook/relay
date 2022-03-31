/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {RecordSourceProxy, UpdatableData} from '../store/RelayStoreTypes';
import type {UpdatableQuery, Variables} from '../util/RelayRuntimeTypes';

const {getUpdatableQuery} = require('../query/GraphQLTag');
const {getArgumentValues} = require('../store/RelayStoreUtils');
const {createUpdatableProxy} = require('./createUpdatableProxy');

const nonUpdatableKeys = ['id', '__id', '__typename', 'js'];

function readUpdatableQuery_EXPERIMENTAL<TVariables: Variables, TData>(
  query: UpdatableQuery<TVariables, TData>,
  variables: TVariables,
  proxy: RecordSourceProxy,
): UpdatableData<TData> {
  const updatableQuery = getUpdatableQuery(query);

  return {
    updatableData: createUpdatableProxy(
      proxy.getRoot(),
      variables,
      updatableQuery.fragment.selections,
      proxy,
    ),
  };
}

module.exports = {readUpdatableQuery_EXPERIMENTAL};
