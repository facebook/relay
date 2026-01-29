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
// $FlowFixMe[incompatible-type]
// $FlowFixMe[incompatible-exact]
// $FlowFixMe[react-rule-hook]
useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNonNullable,
) as ExpectedReturnType<QueryVariablesSubset, QueryVariables, NonNullableData>;

// $FlowFixMe[react-rule-hook]
useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNullable,
) as ExpectedReturnType<QueryVariables, QueryVariables, NullableData>;

// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-type] can't cast nullable to non-nullable
useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNullable,
) as ExpectedReturnType<QueryVariables, QueryVariables, NonNullableData>;

// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-exact]
// $FlowFixMe[prop-missing]
// $FlowFixMe[incompatible-type] actual type of returned data is correct
useBlockingPaginationFragment(
  refetchableFragmentInput,
  // $FlowExpectedError[incompatible-type]
  keyAnotherNonNullable,
) as ExpectedReturnType<QueryVariables, QueryVariablesSubset, NonNullableData>;

// $FlowExpectedError[incompatible-type] `Example_user$fragmentType` is incompatible with  `FragmentType`
// $FlowFixMe[react-rule-hook]
useBlockingPaginationFragment(
  refetchableFragmentInput,
  // $FlowExpectedError[incompatible-type]
  keyAnotherNullable,
) as ExpectedReturnType<QueryVariables, QueryVariables, NullableData>;

// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-type] Key should not be a user provided object
// $FlowFixMe[cannot-resolve-name]
useBlockingPaginationFragment(fragmentInput, {abc: 123});

// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-type] Key should not be an empty object
// $FlowFixMe[cannot-resolve-name]
useBlockingPaginationFragment(fragmentInput, {});

// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-type]
// $FlowFixMe[cannot-resolve-name] Key should be the `<name>$key` type from generated flow
useBlockingPaginationFragment(fragmentInput, fragmentData);

// Refetch function options:
declare var variables: QueryVariables;
declare var environment: IEnvironment;

// $FlowFixMe[react-rule-hook]
const {refetch} = useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNonNullable,
);
// $FlowExpectedError[incompatible-type] : internal option
refetch(variables, {
  __environment: environment,
});

// $FlowExpectedError[incompatible-type] : doesn't exist
refetch(variables, {
  NON_EXIST: 'NON_EXIST',
});

// LoadMore options
declare var extraVariables: {nickname: string};
declare var invalidVariables: {foo: string};

// $FlowFixMe[react-rule-hook]
const {loadNext} = useBlockingPaginationFragment(
  refetchableFragmentInput,
  keyNonNullable,
);
// Accepts extraVariables
loadNext(10, {
  // $FlowFixMe[prop-missing]
  // $FlowFixMe[incompatible-type]
  UNSTABLE_extraVariables: extraVariables,
});

// $FlowFixMe[prop-missing]
loadNext(10, {
  // $FlowExpectedError[incompatible-type] : doesn't accept variables not available in the Flow type
  UNSTABLE_extraVariables: invalidVariables,
});

// $FlowExpectedError[incompatible-type] : doesn't exist
loadNext(10, {
  UNSTABLE_foo: invalidVariables,
});
