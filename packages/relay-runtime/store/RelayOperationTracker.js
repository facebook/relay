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
  _ownersToPendingOperationsIdentifier: Map<string, Set<string>>;
  _pendingOperationsToOwnersIdentifier: Map<string, Set<string>>;
  _ownersIdentifierToPromise: Map<
    string,
    {|promise: Promise<void>, resolve: () => void|},
  >;

  constructor() {
    this._ownersToPendingOperationsIdentifier = new Map();
    this._pendingOperationsToOwnersIdentifier = new Map();
    this._ownersIdentifierToPromise = new Map();
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
    const pendingOperationIdentifier = pendingOperation.identifier;
    const newlyAffectedOwnersIdentifier = new Set();
    for (const owner of affectedOwners) {
      const ownerIdentifier = owner.identifier;
      const pendingOperationsAffectingOwner = this._ownersToPendingOperationsIdentifier.get(
        ownerIdentifier,
      );
      if (pendingOperationsAffectingOwner != null) {
        // In this case the `ownerIdentifier` already affected by some operations
        // We just need to detect, is it the same operation that we already
        // have in the list, or it's a new operation
        if (!pendingOperationsAffectingOwner.has(pendingOperationIdentifier)) {
          pendingOperationsAffectingOwner.add(pendingOperationIdentifier);
          newlyAffectedOwnersIdentifier.add(ownerIdentifier);
        }
      } else {
        // This is a new `ownerIdentifier` that is affected by the operation
        this._ownersToPendingOperationsIdentifier.set(
          ownerIdentifier,
          new Set([pendingOperationIdentifier]),
        );
        newlyAffectedOwnersIdentifier.add(ownerIdentifier);
      }
    }

    // No new owners were affected by this operation, we may stop here
    if (newlyAffectedOwnersIdentifier.size === 0) {
      return;
    }

    // But, if some owners were affected we need to add them to
    // the `_pendingOperationsToOwnersIdentifier` set
    const ownersAffectedByOperationIdentifier =
      this._pendingOperationsToOwnersIdentifier.get(
        pendingOperationIdentifier,
      ) || new Set();

    for (const ownerIdentifier of newlyAffectedOwnersIdentifier) {
      this._resolveOwnerResolvers(ownerIdentifier);
      ownersAffectedByOperationIdentifier.add(ownerIdentifier);
    }
    this._pendingOperationsToOwnersIdentifier.set(
      pendingOperationIdentifier,
      ownersAffectedByOperationIdentifier,
    );
  }

  /**
   * Once pending operation is completed we need to remove it
   * from all tracking maps
   */
  complete(pendingOperation: RequestDescriptor): void {
    const pendingOperationIdentifier = pendingOperation.identifier;
    const affectedOwnersIdentifier = this._pendingOperationsToOwnersIdentifier.get(
      pendingOperationIdentifier,
    );
    if (affectedOwnersIdentifier == null) {
      return;
    }
    // These were the owners affected only by `pendingOperationIdentifier`
    const completedOwnersIdentifier = new Set();

    // These were the owners affected by `pendingOperationIdentifier`
    // and some other operations
    const updatedOwnersIdentifier = new Set();
    for (const ownerIdentifier of affectedOwnersIdentifier) {
      const pendingOperationsAffectingOwner = this._ownersToPendingOperationsIdentifier.get(
        ownerIdentifier,
      );
      if (!pendingOperationsAffectingOwner) {
        continue;
      }
      pendingOperationsAffectingOwner.delete(pendingOperationIdentifier);
      if (pendingOperationsAffectingOwner.size > 0) {
        updatedOwnersIdentifier.add(ownerIdentifier);
      } else {
        completedOwnersIdentifier.add(ownerIdentifier);
      }
    }

    // Complete subscriptions for all owners, affected by `pendingOperationIdentifier`
    for (const ownerIdentifier of completedOwnersIdentifier) {
      this._resolveOwnerResolvers(ownerIdentifier);
      this._ownersToPendingOperationsIdentifier.delete(ownerIdentifier);
    }

    // Update all ownerIdentifier that were updated by `pendingOperationIdentifier` but still
    // are affected by other operations
    for (const ownerIdentifier of updatedOwnersIdentifier) {
      this._resolveOwnerResolvers(ownerIdentifier);
    }

    // Finally, remove pending operation identifier
    this._pendingOperationsToOwnersIdentifier.delete(
      pendingOperationIdentifier,
    );
  }

  _resolveOwnerResolvers(ownerIdentifier: string): void {
    const promiseEntry = this._ownersIdentifierToPromise.get(ownerIdentifier);
    if (promiseEntry != null) {
      promiseEntry.resolve();
    }
    this._ownersIdentifierToPromise.delete(ownerIdentifier);
  }

  getPromiseForPendingOperationsAffectingOwner(
    owner: RequestDescriptor,
  ): Promise<void> | null {
    const ownerIdentifier = owner.identifier;
    if (!this._ownersToPendingOperationsIdentifier.has(ownerIdentifier)) {
      return null;
    }
    const cachedPromiseEntry = this._ownersIdentifierToPromise.get(
      ownerIdentifier,
    );
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
    this._ownersIdentifierToPromise.set(ownerIdentifier, {promise, resolve});
    return promise;
  }
}

module.exports = RelayOperationTracker;
