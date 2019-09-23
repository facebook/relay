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

'use strict';

import type {
  Disposable,
  FragmentReference,
  GraphQLTaggedNode,
} from 'relay-runtime';

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
  +$fragmentRefs: FragmentReference,
};

declare export var keyNonNullablePlural: $ReadOnlyArray<{
  +$data?: NonNullablePluralData,
  +$fragmentRefs: FragmentReference,
}>;

declare export var keyNullablePlural: ?$ReadOnlyArray<{
  +$data?: NonNullablePluralData,
  +$fragmentRefs: FragmentReference,
}>;

declare export var keyNullable: ?{
  +$data?: NonNullableData,
  +$fragmentRefs: FragmentReference,
};

declare export var keyAnotherNonNullable: {
  +$data: AnotherNonNullableData,
  +$fragmentRefs: FragmentReference,
};

declare export var keyAnotherNullable: ?{
  +$data: AnotherNonNullableData,
  +$fragmentRefs: FragmentReference,
};

export type QueryOperation = {|
  +variables: QueryVariables,
  +response: {},
|};

export type QueryVariables = {|
  id: string,
  nickname: ?string,
  name: string,
|};

export type QueryVariablesSubset = {
  id: string,
};

export type FetchFn<TVars> = (vars: TVars) => Disposable;
