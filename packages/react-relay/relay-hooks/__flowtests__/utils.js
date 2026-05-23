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
  Disposable,
  Fragment,
  FragmentType,
  RefetchableFragment,
} from 'relay-runtime';

declare export var fragmentInput: Fragment<
  Example_user$fragmentType,
  Example_user$data,
>;

declare export var refetchableFragmentInput: RefetchableFragment<
  Example_user$fragmentType,
  Example_user$data,
  QueryVariables,
>;

declare export opaque type Example_user$fragmentType: FragmentType;
export type Example_user$data = NonNullableData;
export type Example_user$key = {
  readonly $data?: Example_user$data,
  readonly $fragmentSpreads: Example_user$fragmentType,
  ...
};

export type NonNullableData = {
  readonly id: string,
  readonly count: number,
};
export type NullableData = ?NonNullableData;
export type NonNullablePluralData = ReadonlyArray<NonNullableData>;
export type NullablePluralData = ?ReadonlyArray<NonNullableData>;

export type AnotherNonNullableData = {
  readonly name: ?string,
  readonly friends: ?number,
};

declare export var keyNonNullable: Example_user$key;

declare export var keyNonNullablePlural: ReadonlyArray<Example_user$key>;

declare export var keyNullablePlural: ?ReadonlyArray<Example_user$key>;

declare export var keyNullable: ?Example_user$key;

declare export var keyAnotherNonNullable: {
  readonly $data: AnotherNonNullableData,
  readonly $fragmentSpreads: FragmentType,
  ...
};

declare export var keyAnotherNullable: ?{
  readonly $data: AnotherNonNullableData,
  readonly $fragmentSpreads: FragmentType,
  ...
};

declare export var fragmentData: {
  readonly $fragmentType: FragmentType,
  ...
};

export type QueryOperation = {
  readonly variables: QueryVariables,
  readonly response: {...},
};

export type QueryVariables = {
  id: string,
  nickname: ?string,
  name: string,
};

export type QueryVariablesSubset = {
  id: string,
  ...
};

export type FetchFn<TVars> = (vars: TVars) => Disposable;
