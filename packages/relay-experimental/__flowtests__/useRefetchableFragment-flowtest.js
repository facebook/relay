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

const useRefetchableFragment = require('../useRefetchableFragment');

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

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(useRefetchableFragment<QueryOperation, _>(fragmentInput, keyNonNullable): [
  NonNullableData,
  FetchFn<QueryVariablesSubset>,
]);

(useRefetchableFragment<QueryOperation, _>(fragmentInput, keyNullable): [
  NullableData,
  FetchFn<QueryVariables>,
]);

// $FlowExpectedError: can't cast nullable to non-nullable
(useRefetchableFragment<QueryOperation, _>(fragmentInput, keyNullable): [
  NonNullableData,
  FetchFn<QueryVariables>,
]);

// $FlowExpectedError: refetch requires exact type if key is nullable
(useRefetchableFragment<QueryOperation, _>(fragmentInput, keyNullable): [
  NullableData,
  FetchFn<QueryVariablesSubset>,
]);

// $FlowExpectedError: actual type of returned data is correct
(useRefetchableFragment<QueryOperation, _>(
  fragmentInput,
  keyAnotherNonNullable,
): [NonNullableData, FetchFn<QueryVariablesSubset>]);
// $FlowExpectedError
(useRefetchableFragment<QueryOperation, _>(fragmentInput, keyAnotherNullable): [
  NullableData,
  FetchFn<QueryVariables>,
]);

// Refetch function options:
declare var variables: QueryVariables;
declare var environment: IEnvironment;

const [_, refetch] = useRefetchableFragment<QueryOperation, _>(
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
