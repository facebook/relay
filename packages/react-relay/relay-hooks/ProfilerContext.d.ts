/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This contextual profiler can be used to wrap a react sub-tree. It will bind
// the RelayProfiler during the render phase of these components. Allows
// collecting metrics for a specific part of your application.

import { Context } from 'react';

export interface ProfilerContextType {
    wrapPrepareQueryResource: <T>(cb: () => T) => T;
}

export const ProfilerContext: Context<ProfilerContextType>;
