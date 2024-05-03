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
// $FlowFixMe[prop-missing]
// $FlowFixMe[incompatible-cast]
// $FlowFixMe[incompatible-exact]
// $FlowFixMe[react-rule-hook]
(useRefetchableFragment(refetchableFragmentInput, keyNonNullable): [
  NonNullableData,
  FetchFn<QueryVariablesSubset>,
]);

// $FlowFixMe[react-rule-hook]
(useRefetchableFragment(refetchableFragmentInput, keyNullable): [
  NullableData,
  FetchFn<QueryVariables>,
]);

// $FlowExpectedError: can't cast nullable to non-nullable
// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-cast]
(useRefetchableFragment(refetchableFragmentInput, keyNullable): [
  NonNullableData,
  FetchFn<QueryVariables>,
]);

// $FlowExpectedError: refetch requires exact type if key is nullable
// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-exact]
// $FlowFixMe[prop-missing]
(useRefetchableFragment(refetchableFragmentInput, keyNullable): [
  NullableData,
  FetchFn<QueryVariablesSubset>,
]);

// $FlowExpectedError: actual type of returned data is correct
// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-call]
// $FlowFixMe[incompatible-exact]
// $FlowFixMe[prop-missing]
// $FlowFixMe[incompatible-cast]
(useRefetchableFragment(refetchableFragmentInput, keyAnotherNonNullable): [
  NonNullableData,
  FetchFn<QueryVariablesSubset>,
]);

// $FlowExpectedError - incompatible key types
// $FlowFixMe[react-rule-hook]
// $FlowFixMe[incompatible-call]
(useRefetchableFragment(refetchableFragmentInput, keyAnotherNullable): [
  NullableData,
  FetchFn<QueryVariables>,
]);

// $FlowExpectedError: Key should not be a user provided object
// $FlowFixMe[react-rule-hook]
// $FlowFixMe[prop-missing]
useRefetchableFragment(refetchableFragmentInput, {abc: 123});

// $FlowExpectedError: Key should not be an empty object
// $FlowFixMe[react-rule-hook]
// $FlowFixMe[prop-missing]
useRefetchableFragment(refetchableFragmentInput, {});

// $FlowExpectedError: Key should be the `<name>$key` type from generated flow
// $FlowFixMe[react-rule-hook]
// $FlowFixMe[prop-missing]
useRefetchableFragment(refetchableFragmentInput, fragmentData);

// Refetch function options:
declare var variables: QueryVariables;
declare var environment: IEnvironment;

// $FlowFixMe[react-rule-hook]
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
