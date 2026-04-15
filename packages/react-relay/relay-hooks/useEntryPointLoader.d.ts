/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DisposeFn } from "relay-runtime";
import { EnvironmentProviderOptions, GetEntryPointComponentFromEntryPoint, GetEntryPointParamsFromEntryPoint, IEnvironmentProvider, PreloadedEntryPoint } from "../ReactRelayTypes";

export type UseEntryPointLoaderHookType<TEntryPoint> = [
    PreloadedEntryPoint<GetEntryPointComponentFromEntryPoint<TEntryPoint>> | null | undefined,
    (entryPointParams: GetEntryPointParamsFromEntryPoint<TEntryPoint>) => void,
    DisposeFn,
];

export function useEntryPointLoader<TEntryPoint>(
    environmentProvider: IEnvironmentProvider<EnvironmentProviderOptions>,
    entryPoint: TEntryPoint,
    // Have opted to not include the TEST_ONLY__initialEntryPointData object here—as is FB internal
): UseEntryPointLoaderHookType<TEntryPoint>;
