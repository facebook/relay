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

import type {DataID} from './util/RelayRuntimeTypes';

const resolverDataInjector = require('./store/experimental-live-resolvers/resolverDataInjector');

// Annotates a strong object return type, where `A` is the GraphQL typename and `Typename` is the
// `__typename` field for returning an interface
// eslint-disable-next-line no-unused-vars
export type IdOf<A: string, Typename: void | string = void> = [
  Typename,
] extends [void]
  ? {id: DataID}
  : {id: DataID, __typename: Typename};

// Annotates a `RelayResolverValue` GraphQL return type
// eslint-disable-next-line no-unused-vars
export type RelayResolverValue<A> = A;

type ErrorResult<Error> = {
  ok: false,
  errors: $ReadOnlyArray<Error>,
};

type OkayResult<T> = {
  ok: true,
  value: T,
};

export type Result<T, Error> = OkayResult<T> | ErrorResult<Error>;

function isValueResult<T = mixed>(
  input: Result<T, Error>,
): input is OkayResult<T> {
  return input.ok === true;
}

function isErrorResult<T = mixed>(
  input: Result<T, Error>,
): input is ErrorResult<Error> {
  return input.ok === false;
}

module.exports = {
  resolverDataInjector,
  isValueResult,
  isErrorResult,
};
