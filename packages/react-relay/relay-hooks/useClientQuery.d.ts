/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {GraphQLTaggedNode, OperationType, RenderPolicy, VariablesOf} from 'relay-runtime';

export function useClientQuery<TQuery extends OperationType>(
    gqlQuery: GraphQLTaggedNode,
    variables: VariablesOf<TQuery>,
    options?: {
        UNSTABLE_renderPolicy?: RenderPolicy | undefined;
    },
): TQuery['response'];
