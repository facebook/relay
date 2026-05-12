/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Environment, RequestDescriptor} from '../store/RelayStoreTypes';
import type { ReaderFragment } from './ReaderNode';

export default function getPendingOperationsForFragment(
    environment: Environment,
    fragmentNode: ReaderFragment,
    fragmentOwner: RequestDescriptor,
): {
    promise: Promise<void>;
    pendingOperations: readonly RequestDescriptor[];
} | null;
