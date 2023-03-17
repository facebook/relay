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

import type {
  MissingFieldHandler,
  RecordSourceProxy,
  UpdatableData,
} from '../store/RelayStoreTypes';
import type {UpdatableQuery, Variables} from '../util/RelayRuntimeTypes';

const {getUpdatableQuery} = require('../query/GraphQLTag');
const {createUpdatableProxy} = require('./createUpdatableProxy');

function readUpdatableQuery<TVariables: Variables, TData>(
  query: UpdatableQuery<TVariables, TData>,
  variables: TVariables,
  proxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): UpdatableData<TData> {
  const updatableQuery = getUpdatableQuery(query);

  return {
    // $FlowFixMe[incompatible-call]
    updatableData: createUpdatableProxy<TData>(
      proxy.getRoot(),
      variables,
      updatableQuery.fragment.selections,
      proxy,
      missingFieldHandlers,
    ),
  };
}

module.exports = {readUpdatableQuery};
