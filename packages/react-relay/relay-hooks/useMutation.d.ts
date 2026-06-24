/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DeclarativeMutationConfig,
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  MutationConfig,
  OperationType,
  PayloadError,
  SelectorStoreUpdater,
  UploadableMap,
  VariablesOf,
} from 'relay-runtime';

// `useMutation` is constrained to `OperationType` (`response: unknown`) rather
// than `MutationParameters` (`response: Record<string, unknown>`): the Flow
// source places no constraint on the response (`TData`), and the stricter bag
// rejects `@catch` mutations whose `response` is a `Result<…>` union / an
// interface-typed object that lacks an implicit index signature.
//
// Relay's `MutationConfig` (used for the optional `commitMutationFn` override)
// still requires `MutationParameters`, so the response/rawResponse are re-mapped
// into an index-signature-compatible shape only where it is referenced.
type IndexSignatureCompatible<T> = T extends unknown ? { [Key in keyof T]: T[Key] } : never;
type AsMutationParameters<TMutation extends OperationType> = {
    response: IndexSignatureCompatible<TMutation['response']>;
    variables: TMutation['variables'];
    rawResponse?: IndexSignatureCompatible<TMutation['rawResponse']>;
};

export interface UseMutationConfig<TMutation extends OperationType> {
    variables: VariablesOf<TMutation>;
    updater?: SelectorStoreUpdater<TMutation['response']> | null | undefined;
    uploadables?: UploadableMap | undefined;
    optimisticUpdater?: SelectorStoreUpdater<TMutation['response']> | null | undefined;
    optimisticResponse?: TMutation['rawResponse'] | undefined;
    configs?: DeclarativeMutationConfig[] | undefined;
    onError?: ((error: Error) => void | null) | undefined;
    onCompleted?: ((response: TMutation['response'], errors: PayloadError[] | null) => void | null) | undefined;
    onUnsubscribe?: (() => void | null) | undefined;
}

export function useMutation<TMutation extends OperationType>(
    mutation: GraphQLTaggedNode,
    commitMutationFn?: (environment: IEnvironment, config: MutationConfig<AsMutationParameters<TMutation>>) => Disposable,
): [(config: UseMutationConfig<TMutation>) => Disposable, boolean];
