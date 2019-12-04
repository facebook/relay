/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const useLegacyPaginationFragment = require('../useLegacyPaginationFragment');

import type {LoadMoreFn} from '../useLoadMoreFunction';
import {
  fragmentInput,
  keyAnotherNonNullable,
  keyAnotherNullable,
  keyNonNullable,
  keyNullable,
} from './utils';
import type {
  FetchFn,
  NonNullableData,
  NullableData,
  QueryOperation,
  QueryVariables,
  QueryVariablesSubset,
} from './utils';
import type {IEnvironment} from 'relay-runtime';

type ExpectedReturnType<TQueryVariables, TFragmentData> = {|
  data: TFragmentData,
  loadNext: LoadMoreFn,
  loadPrevious: LoadMoreFn,
  hasNext: boolean,
  hasPrevious: boolean,
  isLoadingNext: boolean,
  isLoadingPrevious: boolean,
  refetch: FetchFn<TQueryVariables>,
|};

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(useLegacyPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNonNullable,
): ExpectedReturnType<QueryVariablesSubset, NonNullableData>);

(useLegacyPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNullable,
): ExpectedReturnType<QueryVariables, NullableData>);

// $FlowExpectedError: can't cast nullable to non-nullable
(useLegacyPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNullable,
): ExpectedReturnType<QueryVariables, NonNullableData>);

// $FlowExpectedError: actual type of returned data is correct
(useLegacyPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNonNullable,
): ExpectedReturnType<QueryVariablesSubset, NonNullableData>);
// $FlowExpectedError
(useLegacyPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNullable,
): ExpectedReturnType<QueryVariables, NullableData>);

// Refetch function options:
declare var variables: QueryVariables;
declare var environment: IEnvironment;

const {refetch} = useLegacyPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNonNullable,
);
// $FlowExpectedError: internal option
refetch(variables, {
  __environment: environment,
});

// $FlowExpectedError: doesn't exist
refetch(variables, {
  NON_EXIST: 'NON_EXIST',
});
