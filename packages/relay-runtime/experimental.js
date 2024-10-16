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

export type {FragmentState} from './store/observeFragmentExperimental';
import type {DataID} from './util/RelayRuntimeTypes';

const resolverDataInjector = require('./store/live-resolvers/resolverDataInjector');
const {observeFragment} = require('./store/observeFragmentExperimental');
const {waitForFragmentData} = require('./store/waitForFragmentExperimental');

// Annotates a strong object return type, where `A` is the GraphQL typename and `Typename` is the
// `__typename` field for returning an interface
// eslint-disable-next-line no-unused-vars
export type IdOf<A: string, Typename: void | string = void> = [
  Typename,
] extends [void]
  ? {id: DataID}
  : {id: DataID, __typename: Typename};

/**
 * Annotates a `RelayResolverValue` GraphQL return type. Using this type in the
 * return position of a Relay Resolver informs Relay that it should model this
 * field as returning a `RelayResolverValue` type. See the docs for more
 * information:
 *
 * https://relay.dev/docs/next/guides/relay-resolvers/return-types/#javascript-values
 *
 * Note: This type forces the value to be non-maybe. This is required in order
 * to allow the Relay compiler to to "see", via static analysis, if the field
 * can return null or not. If the field is nullable, you can type it as
 * returning `?RelayResolverValue<T>`.
 */
export type RelayResolverValue<A> = $NonMaybeType<A>;

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
  observeFragment,
  waitForFragmentData,
};
