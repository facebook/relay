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

import type {LoadMoreFn} from '../useLoadMoreFunction';
import type {
  FetchFn,
  NonNullableData,
  NullableData,
  QueryOperation,
  QueryVariables,
  QueryVariablesSubset,
} from './utils';
import type {IEnvironment, OperationType} from 'relay-runtime';

import useBlockingPaginationFragment from '../useBlockingPaginationFragment';
import {
  fragmentData,
  fragmentInput,
  keyAnotherNonNullable,
  keyAnotherNullable,
  keyNonNullable,
  keyNullable,
} from './utils';

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
  refetch: FetchFn<TQueryVariables>,
|};

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNonNullable,
): ExpectedReturnType<QueryOperation, QueryVariablesSubset, NonNullableData>);

(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNullable,
): ExpectedReturnType<QueryOperation, QueryVariables, NullableData>);

// $FlowExpectedError: can't cast nullable to non-nullable
(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyNullable,
): ExpectedReturnType<QueryOperation, QueryVariables, NonNullableData>);

// $FlowExpectedError: actual type of returned data is correct
(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNonNullable,
): ExpectedReturnType<QueryOperation, QueryVariablesSubset, NonNullableData>);
// $FlowExpectedError
(useBlockingPaginationFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNullable,
): ExpectedReturnType<QueryOperation, QueryVariables, NullableData>);

// $FlowExpectedError: Key should not be a user provided object
useBlockingPaginationFragment<QueryOperation, _>(fragmentInput, {abc: 123});

// $FlowExpectedError: Key should not be an empty object
useBlockingPaginationFragment<QueryOperation, _>(fragmentInput, {});

// $FlowExpectedError: Key should be the `<name>$key` type from generated flow
useBlockingPaginationFragment<QueryOperation, _>(fragmentInput, fragmentData);

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

// LoadMore options
declare var extraVariables: {|nickname: string|};
declare var invalidVariables: {|foo: string|};

const {loadNext} = useBlockingPaginationFragment<QueryOperation, _>(
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
