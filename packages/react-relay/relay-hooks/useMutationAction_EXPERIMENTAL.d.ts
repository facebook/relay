/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {GraphQLTaggedNode, MutationParameters, VariablesOf} from 'relay-runtime';

export function useMutationAction_EXPERIMENTAL<TMutation extends MutationParameters>(
    mutation: GraphQLTaggedNode,
): (variables: VariablesOf<TMutation>) => Promise<TMutation['response']>;
