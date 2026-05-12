/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {EnvironmentProviderOptions, GetEntryPointComponentFromEntryPoint, GetEntryPointParamsFromEntryPoint, IEnvironmentProvider, PreloadedEntryPoint} from '../ReactRelayTypes';

export function loadEntryPoint<TEntryPoint>(
    environmentProvider: IEnvironmentProvider<EnvironmentProviderOptions>,
    entryPoint: TEntryPoint,
    entryPointParams: GetEntryPointParamsFromEntryPoint<TEntryPoint>,
): PreloadedEntryPoint<GetEntryPointComponentFromEntryPoint<TEntryPoint>>;
