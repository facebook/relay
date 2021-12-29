/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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

import type {Disposable, Fragment, FragmentType} from 'relay-runtime';

declare export var fragmentInput: Fragment<
  Example_user$fragmentType,
  Example_user$data,
>;

declare export opaque type Example_user$fragmentType: FragmentType;
export type Example_user$data = NonNullableData;
export type Example_user$key = {
  +$data?: Example_user$data,
  +$fragmentSpreads: Example_user$fragmentType,
  ...
};

export type NonNullableData = {|
  +id: string,
  +count: number,
|};
export type NullableData = ?NonNullableData;
export type NonNullablePluralData = $ReadOnlyArray<NonNullableData>;
export type NullablePluralData = ?$ReadOnlyArray<NonNullableData>;

export type AnotherNonNullableData = {|
  +name: ?string,
  +friends: ?number,
|};

declare export var keyNonNullable: Example_user$key;

declare export var keyNonNullablePlural: $ReadOnlyArray<Example_user$key>;

declare export var keyNullablePlural: ?$ReadOnlyArray<Example_user$key>;

declare export var keyNullable: ?Example_user$key;

declare export var keyAnotherNonNullable: {
  +$data: AnotherNonNullableData,
  +$fragmentSpreads: FragmentType,
  ...
};

declare export var keyAnotherNullable: ?{
  +$data: AnotherNonNullableData,
  +$fragmentSpreads: FragmentType,
  ...
};

declare export var fragmentData: {
  +$fragmentType: FragmentType,
  ...
};

export type QueryOperation = {|
  +variables: QueryVariables,
  +response: {...},
|};

export type QueryVariables = {|
  id: string,
  nickname: ?string,
  name: string,
|};

export type QueryVariablesSubset = {
  id: string,
  ...
};

export type FetchFn<TVars> = (vars: TVars) => Disposable;
