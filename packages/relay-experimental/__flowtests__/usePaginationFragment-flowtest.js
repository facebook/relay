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

const usePaginationFragment = require('../usePaginationFragment');

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
import type {IEnvironment, OperationType} from 'relay-runtime';

type ExpectedReturnType<
  TQuery: OperationType,
  TQueryVariables,
  TFragmentData,
> = {|
  data: TFragmentData,
  loadNext: LoadMoreFn<TQuery>,
  loadPrevious: LoadMoreFn<TQuery>,
  hasNext: boolean,
  hasPrevious: boolean,
  isLoadingNext: boolean,
  isLoadingPrevious: boolean,
  refetch: FetchFn<TQueryVariables>,
|};

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(usePaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNonNullable,
): ExpectedReturnType<QueryOperation, QueryVariablesSubset, NonNullableData>);

(usePaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNullable,
): ExpectedReturnType<QueryOperation, QueryVariables, NullableData>);

// $FlowExpectedError: can't cast nullable to non-nullable
(usePaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNullable,
): ExpectedReturnType<QueryOperation, QueryVariables, NonNullableData>);

// $FlowExpectedError: actual type of returned data is correct
(usePaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNonNullable,
): ExpectedReturnType<QueryOperation, QueryVariablesSubset, NonNullableData>);
// $FlowExpectedError
(usePaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNullable,
): ExpectedReturnType<QueryOperation, QueryVariables, NullableData>);

// Refetch function options:
declare var variables: QueryVariables;
declare var environment: IEnvironment;

const {refetch} = usePaginationFragment<QueryOperation, _>(
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

// LoadMore options
declare var extraVariables: {|nickname: string|};
declare var invalidVariables: {|foo: string|};

const {loadNext} = usePaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNonNullable,
);
// Accepts extraVariables
loadNext(10, {
  UNSTABLE_extraVariables: extraVariables,
});

// $FlowExpectedError: doesn't accept variables not available in the Flow type
loadNext(10, {
  UNSTABLE_extraVariables: invalidVariables,
});

// $FlowExpectedError: doesn't exist
loadNext(10, {
  UNSTABLE_foo: invalidVariables,
});
