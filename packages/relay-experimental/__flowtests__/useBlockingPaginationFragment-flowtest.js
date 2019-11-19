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

const useBlockingPaginationFragment = require('../useBlockingPaginationFragment');

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
  refetch: FetchFn<TQueryVariables>,
|};

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNonNullable,
): ExpectedReturnType<QueryVariablesSubset, NonNullableData>);

(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNullable,
): ExpectedReturnType<QueryVariables, NullableData>);

// $FlowExpectedError: can't cast nullable to non-nullable
(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNullable,
): ExpectedReturnType<QueryVariables, NonNullableData>);

// $FlowExpectedError: actual type of returned data is correct
(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNonNullable,
): ExpectedReturnType<QueryVariablesSubset, NonNullableData>);
// $FlowExpectedError
(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNullable,
): ExpectedReturnType<QueryVariables, NullableData>);

// Refetch function options:
declare var variables: QueryVariables;
declare var environment: IEnvironment;

const {refetch} = useBlockingPaginationFragment<QueryOperation, _>(
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
