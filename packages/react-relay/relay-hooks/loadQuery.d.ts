/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GraphQLTaggedNode, IEnvironment, OperationType, PreloadableConcreteRequest, VariablesOf } from "relay-runtime";
import { EnvironmentProviderOptions, LoadQueryOptions, PreloadedQuery } from "../ReactRelayTypes";

export function loadQuery<
    TQuery extends OperationType,
    TEnvironmentProviderOptions extends EnvironmentProviderOptions = {},
>(
    environment: IEnvironment,
    preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
    variables: VariablesOf<TQuery>,
    options?: LoadQueryOptions,
    environmentProviderOptions?: TEnvironmentProviderOptions,
): PreloadedQuery<TQuery, TEnvironmentProviderOptions>;
