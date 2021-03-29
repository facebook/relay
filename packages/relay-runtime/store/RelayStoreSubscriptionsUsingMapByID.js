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

const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const RelayReader = require('./RelayReader');

const deepFreeze = require('../util/deepFreeze');
const recycleNodesInto = require('../util/recycleNodesInto');

import type {DataID, Disposable} from '../util/RelayRuntimeTypes';
import type {
  LogFunction,
  OperationDescriptor,
  RecordSource,
  RequestDescriptor,
  Snapshot,
  StoreSubscriptions,
  DataIDSet,
} from './RelayStoreTypes';

type Subscription = {|
  backup: ?Snapshot,
  callback: (snapshot: Snapshot) => void,
  notifiedRevision: number,
  snapshot: Snapshot,
  snapshotRevision: number,
|};

class RelayStoreSubscriptionsUsingMapByID implements StoreSubscriptions {
  _notifiedRevision: number;
  _snapshotRevision: number;
  _subscriptionsByDataId: Map<DataID, Set<Subscription>>;
  _staleSubscriptions: Set<Subscription>;
  __log: ?LogFunction;

  constructor(log?: ?LogFunction) {
    this._notifiedRevision = 0;
    this._snapshotRevision = 0;
    this._subscriptionsByDataId = new Map();
    this._staleSubscriptions = new Set();
    this.__log = log;
  }

  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    const subscription = {
      backup: null,
      callback,
      notifiedRevision: this._notifiedRevision,
      snapshotRevision: this._snapshotRevision,
      snapshot,
    };
    const dispose = () => {
      for (const dataId of snapshot.seenRecords) {
        const subscriptionsForDataId = this._subscriptionsByDataId.get(dataId);
        if (subscriptionsForDataId != null) {
          subscriptionsForDataId.delete(subscription);
          if (subscriptionsForDataId.size === 0) {
            this._subscriptionsByDataId.delete(dataId);
          }
        }
      }
    };

    for (const dataId of snapshot.seenRecords) {
      const subscriptionsForDataId = this._subscriptionsByDataId.get(dataId);
      if (subscriptionsForDataId != null) {
        subscriptionsForDataId.add(subscription);
      } else {
        this._subscriptionsByDataId.set(dataId, new Set([subscription]));
      }
    }

    return {dispose};
  }

  snapshotSubscriptions(source: RecordSource) {
    this._snapshotRevision++;
    this._subscriptionsByDataId.forEach(subscriptions => {
      subscriptions.forEach(subscription => {
        if (subscription.snapshotRevision === this._snapshotRevision) {
          return;
        }
        subscription.snapshotRevision = this._snapshotRevision;

        // Backup occurs after writing a new "final" payload(s) and before (re)applying
        // optimistic changes. Each subscription's `snapshot` represents what was *last
        // published to the subscriber*, which notably may include previous optimistic
        // updates. Therefore a subscription can be in any of the following states:
        // - stale=true: This subscription was restored to a different value than
        //   `snapshot`. That means this subscription has changes relative to its base,
        //   but its base has changed (we just applied a final payload): recompute
        //   a backup so that we can later restore to the state the subscription
        //   should be in.
        // - stale=false: This subscription was restored to the same value than
        //   `snapshot`. That means this subscription does *not* have changes relative
        //   to its base, so the current `snapshot` is valid to use as a backup.
        if (!this._staleSubscriptions.has(subscription)) {
          subscription.backup = subscription.snapshot;
          return;
        }
        const snapshot = subscription.snapshot;
        const backup = RelayReader.read(source, snapshot.selector);
        const nextData = recycleNodesInto(snapshot.data, backup.data);
        (backup: $FlowFixMe).data = nextData; // backup owns the snapshot and can safely mutate
        subscription.backup = backup;
      });
    });
  }

  restoreSubscriptions() {
    this._snapshotRevision++;
    this._subscriptionsByDataId.forEach(subscriptions => {
      subscriptions.forEach(subscription => {
        if (subscription.snapshotRevision === this._snapshotRevision) {
          return;
        }
        subscription.snapshotRevision = this._snapshotRevision;

        const backup = subscription.backup;
        subscription.backup = null;
        if (backup) {
          if (backup.data !== subscription.snapshot.data) {
            this._staleSubscriptions.add(subscription);
          }
          const prevSeenRecords = subscription.snapshot.seenRecords;
          subscription.snapshot = {
            data: subscription.snapshot.data,
            isMissingData: backup.isMissingData,
            seenRecords: backup.seenRecords,
            selector: backup.selector,
            missingRequiredFields: backup.missingRequiredFields,
          };
          this._updateSubscriptionsMap(subscription, prevSeenRecords);
        } else {
          this._staleSubscriptions.add(subscription);
        }
      });
    });
  }

  updateSubscriptions(
    source: RecordSource,
    updatedRecordIDs: DataIDSet,
    updatedOwners: Array<RequestDescriptor>,
    sourceOperation?: OperationDescriptor,
  ) {
    this._notifiedRevision++;
    updatedRecordIDs.forEach(updatedRecordId => {
      const subcriptionsForDataId = this._subscriptionsByDataId.get(
        updatedRecordId,
      );
      if (subcriptionsForDataId == null) {
        return;
      }
      subcriptionsForDataId.forEach(subscription => {
        if (subscription.notifiedRevision === this._notifiedRevision) {
          return;
        }
        const owner = this._updateSubscription(
          source,
          subscription,
          false,
          sourceOperation,
        );
        if (owner != null) {
          updatedOwners.push(owner);
        }
      });
    });
    this._staleSubscriptions.forEach(subscription => {
      if (subscription.notifiedRevision === this._notifiedRevision) {
        return;
      }
      const owner = this._updateSubscription(
        source,
        subscription,
        true,
        sourceOperation,
      );
      if (owner != null) {
        updatedOwners.push(owner);
      }
    });
    this._staleSubscriptions.clear();
  }

  /**
   * Notifies the callback for the subscription if the data for the associated
   * snapshot has changed.
   * Additionally, updates the subscription snapshot with the latest snapshot,
   * amarks it as not stale, and updates the subscription tracking for any
   * any new ids observed in the latest data snapshot.
   * Returns the owner (RequestDescriptor) if the subscription was affected by the
   * latest update, or null if it was not affected.
   */
  _updateSubscription(
    source: RecordSource,
    subscription: Subscription,
    stale: boolean,
    sourceOperation?: OperationDescriptor,
  ): ?RequestDescriptor {
    const {backup, callback, snapshot} = subscription;
    let nextSnapshot: Snapshot =
      stale && backup != null
        ? backup
        : RelayReader.read(source, snapshot.selector);
    const nextData = recycleNodesInto(snapshot.data, nextSnapshot.data);
    nextSnapshot = ({
      data: nextData,
      isMissingData: nextSnapshot.isMissingData,
      seenRecords: nextSnapshot.seenRecords,
      selector: nextSnapshot.selector,
      missingRequiredFields: nextSnapshot.missingRequiredFields,
    }: Snapshot);
    if (__DEV__) {
      deepFreeze(nextSnapshot);
    }

    const prevSeenRecords = subscription.snapshot.seenRecords;
    subscription.snapshot = nextSnapshot;
    subscription.notifiedRevision = this._notifiedRevision;
    this._updateSubscriptionsMap(subscription, prevSeenRecords);

    if (nextSnapshot.data !== snapshot.data) {
      if (this.__log && RelayFeatureFlags.ENABLE_NOTIFY_SUBSCRIPTION) {
        this.__log({
          name: 'store.notify.subscription',
          sourceOperation,
          snapshot,
          nextSnapshot,
        });
      }
      callback(nextSnapshot);
      return snapshot.selector.owner;
    }
  }

  /**
   * Updates the Map that tracks subscriptions by id.
   * Given an updated subscription and the records that where seen
   * on the previous subscription snapshot, updates our tracking
   * to track the subscription for the newly and no longer seen ids.
   */
  _updateSubscriptionsMap(
    subscription: Subscription,
    prevSeenRecords: DataIDSet,
  ) {
    for (const dataId of prevSeenRecords) {
      const subscriptionsForDataId = this._subscriptionsByDataId.get(dataId);
      if (subscriptionsForDataId != null) {
        subscriptionsForDataId.delete(subscription);
        if (subscriptionsForDataId.size === 0) {
          this._subscriptionsByDataId.delete(dataId);
        }
      }
    }

    for (const dataId of subscription.snapshot.seenRecords) {
      const subscriptionsForDataId = this._subscriptionsByDataId.get(dataId);
      if (subscriptionsForDataId != null) {
        subscriptionsForDataId.add(subscription);
      } else {
        this._subscriptionsByDataId.set(dataId, new Set([subscription]));
      }
    }
  }
}

module.exports = RelayStoreSubscriptionsUsingMapByID;
