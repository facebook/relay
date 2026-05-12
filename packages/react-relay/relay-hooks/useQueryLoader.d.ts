/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {LoadQueryOptions, PreloadedQuery} from '../ReactRelayTypes';
import {
  DisposeFn,
  GraphQLTaggedNode,
  IEnvironment,
  OperationType,
  PreloadableConcreteRequest,
  VariablesOf,
} from 'relay-runtime';

export type useQueryLoaderHookType<TQuery extends OperationType> = [
    PreloadedQuery<TQuery> | null | undefined,
    (variables: VariablesOf<TQuery>, options?: UseQueryLoaderLoadQueryOptions) => void,
    DisposeFn,
];

export type UseQueryLoaderLoadQueryOptions =
    & LoadQueryOptions
    & Readonly<{
        __environment?: IEnvironment | null | undefined;
    }>;

export function useQueryLoader<TQuery extends OperationType>(
    preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
    initialQueryReference?: PreloadedQuery<TQuery> | null,
): useQueryLoaderHookType<TQuery>;
