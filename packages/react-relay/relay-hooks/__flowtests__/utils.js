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

import type {Disposable, FragmentType, GraphQLTaggedNode} from 'relay-runtime';

declare export var fragmentInput: GraphQLTaggedNode;

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

declare export var keyNonNullable: {
  +$data?: NonNullableData,
  +$fragmentSpreads: FragmentType,
  ...
};

declare export var keyNonNullablePlural: $ReadOnlyArray<{
  +$data?: NonNullablePluralData,
  +$fragmentSpreads: FragmentType,
  ...
}>;

declare export var keyNullablePlural: ?$ReadOnlyArray<{
  +$data?: NonNullablePluralData,
  +$fragmentSpreads: FragmentType,
  ...
}>;

declare export var keyNullable: ?{
  +$data?: NonNullableData,
  +$fragmentSpreads: FragmentType,
  ...
};

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
