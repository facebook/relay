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

import type {LoadMoreFn} from '../useLoadMoreFunction';
import type {
  FetchFn,
  NonNullableData,
  NullableData,
  QueryVariables,
  QueryVariablesSubset,
} from './utils';
import type {IEnvironment, Variables} from 'relay-runtime';

import useBlockingPaginationFragment from '../legacy/useBlockingPaginationFragment';
import {
  fragmentData,
  keyAnotherNonNullable,
  keyAnotherNullable,
  keyNonNullable,
  keyNullable,
  refetchableFragmentInput,
} from './utils';

type ExpectedReturnType<
  TRefetchVariables: Variables,
  TLoadMoreVariables: Variables,
  TFragmentData,
> = {
  data: TFragmentData,
  loadNext: LoadMoreFn<TLoadMoreVariables>,
  loadPrevious: LoadMoreFn<TLoadMoreVariables>,
  hasNext: boolean,
  hasPrevious: boolean,
  refetch: FetchFn<TRefetchVariables>,
};

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
// $FlowFixMe[prop-missing]
// $FlowFixMe[incompatible-cast]
(useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNonNullable,
): ExpectedReturnType<QueryVariablesSubset, QueryVariables, NonNullableData>);

(useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNullable,
): ExpectedReturnType<QueryVariables, QueryVariables, NullableData>);

// $FlowExpectedError: can't cast nullable to non-nullable
(useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNullable,
): ExpectedReturnType<QueryVariables, QueryVariables, NonNullableData>);

// $FlowExpectedError: actual type of returned data is correct
(useBlockingPaginationFragment(
  refetchableFragmentInput,
  // $FlowExpectedError[incompatible-call]
  keyAnotherNonNullable,
): ExpectedReturnType<QueryVariables, QueryVariablesSubset, NonNullableData>);

// $FlowExpectedError[incompatible-call] `Example_user$fragmentType` is incompatible with  `FragmentType`
(useBlockingPaginationFragment(
  refetchableFragmentInput,
  // $FlowExpectedError[incompatible-call]
  keyAnotherNullable,
): ExpectedReturnType<QueryVariables, QueryVariables, NullableData>);

// $FlowExpectedError: Key should not be a user provided object
useBlockingPaginationFragment(fragmentInput, {abc: 123});

// $FlowExpectedError: Key should not be an empty object
useBlockingPaginationFragment(fragmentInput, {});

// $FlowExpectedError: Key should be the `<name>$key` type from generated flow
useBlockingPaginationFragment(fragmentInput, fragmentData);

// Refetch function options:
declare var variables: QueryVariables;
declare var environment: IEnvironment;

const {refetch} = useBlockingPaginationFragment(
  refetchableFragmentInput,
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
declare var extraVariables: {nickname: string};
declare var invalidVariables: {foo: string};

const {loadNext} = useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNonNullable,
);
// Accepts extraVariables
loadNext(10, {
  // $FlowFixMe[prop-missing]
  // $FlowFixMe[incompatible-call]
  UNSTABLE_extraVariables: extraVariables,
});

// $FlowFixMe[prop-missing]
loadNext(10, {
  // $FlowExpectedError: doesn't accept variables not available in the Flow type
  UNSTABLE_extraVariables: invalidVariables,
});

// $FlowExpectedError: doesn't exist
loadNext(10, {
  UNSTABLE_foo: invalidVariables,
});
