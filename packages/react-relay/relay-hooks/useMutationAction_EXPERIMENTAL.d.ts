/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {GraphQLTaggedNode, OperationType, VariablesOf} from 'relay-runtime';

// Constrained to `OperationType` (response: unknown), not `MutationParameters`
// (response: Record<string, unknown>): the Flow source places no constraint on
// the response/`TData`, and the stricter bag rejects `@catch` mutations whose
// response is a `Result<…>` union. This also matches the other modern hooks.
export function useMutationAction_EXPERIMENTAL<TMutation extends OperationType>(
    mutation: GraphQLTaggedNode,
): (variables: VariablesOf<TMutation>) => Promise<TMutation['response']>;
