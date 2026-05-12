/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RequestDescriptor } from './RelayStoreTypes';

export class RelayOperationTracker {
    /**
     * Update the map of current processing operations with the set of
     * affected owners and notify subscribers
     */
    update(pendingOperation: RequestDescriptor, affectedOwners: Set<RequestDescriptor>): void;

    /**
     * Once pending operation is completed we need to remove it
     * from all tracking maps
     */
    complete(pendingOperation: RequestDescriptor): void;

    _resolveOwnerResolvers(owner: RequestDescriptor): void;

    getPendingOperationsAffectingOwner(owner: RequestDescriptor): {
        promise: Promise<void>;
        pendingOperations: readonly RequestDescriptor[];
    } | null;
}
