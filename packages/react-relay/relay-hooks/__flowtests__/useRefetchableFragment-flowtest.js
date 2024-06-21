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

import type {
  FetchFn,
  NonNullableData,
  NullableData,
  QueryVariables,
  QueryVariablesSubset,
} from './utils';
import type {IEnvironment} from 'relay-runtime';

import useRefetchableFragment from '../useRefetchableFragment';
import {
  fragmentData,
  keyAnotherNonNullable,
  keyAnotherNullable,
  keyNonNullable,
  keyNullable,
  refetchableFragmentInput,
} from './utils';

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(useRefetchableFragment(refetchableFragmentInput, keyNonNullable): [
  NonNullableData,
  FetchFn<QueryVariablesSubset>,
]);

(useRefetchableFragment(refetchableFragmentInput, keyNullable): [
  NullableData,
  FetchFn<QueryVariables>,
]);

// $FlowExpectedError: can't cast nullable to non-nullable
(useRefetchableFragment(refetchableFragmentInput, keyNullable): [
  NonNullableData,
  FetchFn<QueryVariables>,
]);

// $FlowExpectedError: refetch requires exact type if key is nullable
(useRefetchableFragment(refetchableFragmentInput, keyNullable): [
  NullableData,
  FetchFn<QueryVariablesSubset>,
]);

// $FlowExpectedError: actual type of returned data is correct
(useRefetchableFragment(refetchableFragmentInput, keyAnotherNonNullable): [
  NonNullableData,
  FetchFn<QueryVariablesSubset>,
]);

// $FlowExpectedError - incompatible key types
(useRefetchableFragment(refetchableFragmentInput, keyAnotherNullable): [
  NullableData,
  FetchFn<QueryVariables>,
]);

// $FlowExpectedError: Key should not be a user provided object
useRefetchableFragment(refetchableFragmentInput, {abc: 123});

// $FlowExpectedError: Key should not be an empty object
useRefetchableFragment(refetchableFragmentInput, {});

// $FlowExpectedError: Key should be the `<name>$key` type from generated flow
useRefetchableFragment(refetchableFragmentInput, fragmentData);

// Refetch function options:
declare var variables: QueryVariables;
declare var environment: IEnvironment;

const [, refetch] = useRefetchableFragment(
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
