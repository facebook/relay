/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DataID } from './util/RelayRuntimeTypes';

export { resolverDataInjector } from './store/live-resolvers/resolverDataInjector';
export { observeFragment } from './store/observeFragmentExperimental';
export { observeQuery } from './store/observeQueryExperimental';
export { waitForFragmentData } from './store/waitForFragmentExperimental';

export type IdOf<_A extends string, Typename extends undefined | string = undefined> = Typename extends undefined
    ? { id: DataID }
    : { id: DataID; __typename: Typename };

interface ErrorResult<E> {
    ok: false;
    errors: readonly E[];
}

interface OkayResult<T> {
    ok: true;
    value: T;
}

// The type returned by fields annotated with `@catch`
export type Result<T, E> = OkayResult<T> | ErrorResult<E>;

export function isValueResult<T = unknown>(input: Result<T, unknown>): input is OkayResult<T>;

export function isErrorResult<E = unknown>(input: Result<unknown, E>): input is ErrorResult<E>;
