/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @flow
import type { Observable } from 'relay-runtime';

export type TestResolverContextType = {
    greeting: { myHello: string },
    counter: Observable<number>,
};
