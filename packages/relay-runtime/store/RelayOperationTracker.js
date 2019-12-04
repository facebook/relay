/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const invariant = require('invariant');

import type {RequestDescriptor} from './RelayStoreTypes';

class RelayOperationTracker {
  _ownersToPendingOperations: Map<RequestDescriptor, Set<RequestDescriptor>>;
  _pendingOperationsToOwners: Map<RequestDescriptor, Set<RequestDescriptor>>;
  _ownersToPromise: Map<
    RequestDescriptor,
    {|promise: Promise<void>, resolve: () => void|},
  >;

  constructor() {
    this._ownersToPendingOperations = new Map();
    this._pendingOperationsToOwners = new Map();
    this._ownersToPromise = new Map();
  }

  /**
   * Update the map of current processing operations with the set of
   * affected owners and notify subscribers
   */
  update(
    pendingOperation: RequestDescriptor,
    affectedOwners: Set<RequestDescriptor>,
  ): void {
    if (affectedOwners.size === 0) {
      return;
    }
    const newlyAffectedOwners = new Set();
    for (const owner of affectedOwners) {
      const pendingOperationsAffectingOwner = this._ownersToPendingOperations.get(
        owner,
      );
      if (pendingOperationsAffectingOwner != null) {
        // In this case the `owner` already affected by some operations
        // We just need to detect, is it the same operation that we already
        // have in the list, or it's a new operation
        if (!pendingOperationsAffectingOwner.has(pendingOperation)) {
          pendingOperationsAffectingOwner.add(pendingOperation);
          newlyAffectedOwners.add(owner);
        }
      } else {
        // This is a new `owner` that is affected by the operation
        this._ownersToPendingOperations.set(owner, new Set([pendingOperation]));
        newlyAffectedOwners.add(owner);
      }
    }

    // No new owners were affected by this operation, we may stop here
    if (newlyAffectedOwners.size === 0) {
      return;
    }

    // But, if some owners were affected we need to add them to
    // the `_pendingOperationsToOwners` set
    const ownersAffectedByOperation =
      this._pendingOperationsToOwners.get(pendingOperation) || new Set();

    for (const owner of newlyAffectedOwners) {
      this._resolveOwnerResolvers(owner);
      ownersAffectedByOperation.add(owner);
    }
    this._pendingOperationsToOwners.set(
      pendingOperation,
      ownersAffectedByOperation,
    );
  }

  /**
   * Once pending operation is completed we need to remove it
   * from all tracking maps
   */
  complete(pendingOperation: RequestDescriptor): void {
    const affectedOwners = this._pendingOperationsToOwners.get(
      pendingOperation,
    );
    if (affectedOwners == null) {
      return;
    }
    // These were the owners affected only by `pendingOperation`
    const completedOwners = new Set();

    // These were the owners affected by `pendingOperation`
    // and some other operations
    const updatedOwners = new Set();
    for (const owner of affectedOwners) {
      const pendingOperationsAffectingOwner = this._ownersToPendingOperations.get(
        owner,
      );
      if (!pendingOperationsAffectingOwner) {
        continue;
      }
      pendingOperationsAffectingOwner.delete(pendingOperation);
      if (pendingOperationsAffectingOwner.size > 0) {
        updatedOwners.add(owner);
      } else {
        completedOwners.add(owner);
      }
    }

    // Complete subscriptions for all owners, affected by `pendingOperation`
    for (const owner of completedOwners) {
      this._resolveOwnerResolvers(owner);
      this._ownersToPendingOperations.delete(owner);
    }

    // Update all owner that were updated by `pendingOperation` but still
    // are affected by other operations
    for (const owner of updatedOwners) {
      this._resolveOwnerResolvers(owner);
    }

    // Finally, remove pending operation
    this._pendingOperationsToOwners.delete(pendingOperation);
  }

  _resolveOwnerResolvers(owner: RequestDescriptor): void {
    const promiseEntry = this._ownersToPromise.get(owner);
    if (promiseEntry != null) {
      promiseEntry.resolve();
    }
    this._ownersToPromise.delete(owner);
  }

  getPromiseForPendingOperationsAffectingOwner(
    owner: RequestDescriptor,
  ): Promise<void> | null {
    if (!this._ownersToPendingOperations.has(owner)) {
      return null;
    }
    const cachedPromiseEntry = this._ownersToPromise.get(owner);
    if (cachedPromiseEntry != null) {
      return cachedPromiseEntry.promise;
    }
    let resolve;
    const promise = new Promise(r => {
      resolve = r;
    });
    invariant(
      resolve != null,
      'RelayOperationTracker: Expected resolver to be defined. If you' +
        'are seeing this, it is likely a bug in Relay.',
    );
    this._ownersToPromise.set(owner, {promise, resolve});
    return promise;
  }
}

module.exports = RelayOperationTracker;
