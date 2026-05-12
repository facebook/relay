/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {EntryPointComponent, PreloadedEntryPoint} from '../ReactRelayTypes';
import { ReactElement } from 'react';

type GetComponentFromPreloadedEntryPoint<T> = T extends PreloadedEntryPoint<infer C> ? C : never;
type GetRuntimePropsFromComponent<T> = T extends EntryPointComponent<any, any, infer R, any> ? R : never;

export function EntryPointContainer<TPreloadedEntryPoint extends PreloadedEntryPoint<any>>({
    entryPointReference,
    props,
}: Readonly<{
    entryPointReference: TPreloadedEntryPoint;
    props: GetRuntimePropsFromComponent<GetComponentFromPreloadedEntryPoint<TPreloadedEntryPoint>>;
}>): ReactElement;

export {};
