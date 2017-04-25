/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMarkSweepStore
 * @flow
 */

'use strict';

const RelayAsyncLoader = require('RelayAsyncLoader');
const RelayModernRecord = require('RelayModernRecord');
const RelayProfiler = require('RelayProfiler');
const RelayReader = require('RelayReader');
const RelayReferenceMarker = require('RelayReferenceMarker');

const deepFreeze = require('deepFreeze');
const hasOverlappingIDs = require('hasOverlappingIDs');
const recycleNodesInto = require('recycleNodesInto');
const resolveImmediate = require('resolveImmediate');

const {UNPUBLISH_RECORD_SENTINEL} = require('RelayStoreUtils');

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {
  AsyncLoadCallback,
  MutableRecordSource,
  RecordSource,
  Selector,
  Snapshot,
  Store,
  UpdatedRecords,
} from 'RelayStoreTypes';

type Subscription = {
  callback: (snapshot: Snapshot) => void,
  snapshot: Snapshot,
};

/**
 * @public
 *
 * An implementation of the `Store` interface defined in `RelayStoreTypes`.
 *
 * Note that a Store takes ownership of all records provided to it: other
 * objects may continue to hold a reference to such records but may not mutate
 * them. The static Relay core is architected to avoid mutating records that may have been
 * passed to a store: operations that mutate records will either create fresh
 * records or clone existing records and modify the clones. Record immutability
 * is also enforced in development mode by freezing all records passed to a store.
 */
class RelayMarkSweepStore implements Store {
  _hasScheduledGC: boolean;
  _index: number;
  _recordSource: MutableRecordSource;
  _roots: Map<number, Selector>;
  _subscriptions: Set<Subscription>;
  _updatedRecordIDs: UpdatedRecords;

  constructor(source: MutableRecordSource) {
    // Prevent mutation of a record from outside the store.
    if (__DEV__) {
      const storeIDs = source.getRecordIDs();
      for (let ii = 0; ii < storeIDs.length; ii++) {
        const record = source.get(storeIDs[ii]);
        if (record) {
          RelayModernRecord.freeze(record);
        }
      }
    }
    this._hasScheduledGC = false;
    this._index = 0;
    this._recordSource = source;
    this._roots = new Map();
    this._subscriptions = new Set();
    this._updatedRecordIDs = {};
  }

  getSource(): RecordSource {
    return this._recordSource;
  }

  check(selector: Selector): boolean {
    return RelayAsyncLoader.check(
      this._recordSource,
      this._recordSource,
      selector,
    );
  }

  retain(selector: Selector): Disposable {
    const index = this._index++;
    const dispose = () => {
      this._roots.delete(index);
      this._scheduleGC();
    };
    this._roots.set(index, selector);
    return {dispose};
  }

  lookup(selector: Selector): Snapshot {
    const snapshot = RelayReader.read(this._recordSource, selector);
    if (__DEV__) {
      deepFreeze(snapshot);
    }
    return snapshot;
  }

  notify(): void {
    this._subscriptions.forEach(subscription => {
      this._updateSubscription(subscription);
    });
    this._updatedRecordIDs = {};
  }

  publish(source: RecordSource): void {
    updateTargetFromSource(
      this._recordSource,
      source,
      this._updatedRecordIDs
    );
  }

  resolve(
    target: MutableRecordSource,
    selector: Selector,
    callback: AsyncLoadCallback
  ): void {
    RelayAsyncLoader.load(
      this._recordSource,
      target,
      selector,
      callback
    );
  }

  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void
  ): Disposable {
    const subscription = {callback, snapshot};
    const dispose = () => {
      this._subscriptions.delete(subscription);
    };
    this._subscriptions.add(subscription);
    return {dispose};
  }

  _updateSubscription(subscription: Subscription): void {
    const {callback, snapshot} = subscription;
    if (!hasOverlappingIDs(snapshot, this._updatedRecordIDs)) {
      return;
    }
    const {data, seenRecords} = RelayReader.read(this._recordSource, snapshot);
    const nextData = recycleNodesInto(snapshot.data, data);
    const nextSnapshot = {
      ...snapshot,
      data: nextData,
      seenRecords,
    };
    if (__DEV__) {
      deepFreeze(nextSnapshot);
    }
    subscription.snapshot = nextSnapshot;
    if (nextSnapshot.data !== snapshot.data) {
      callback(nextSnapshot);
    }
  }

  _scheduleGC() {
    if (this._hasScheduledGC) {
      return;
    }
    this._hasScheduledGC = true;
    resolveImmediate(() => {
      this._gc();
      this._hasScheduledGC = false;
    });
  }

  _gc(): void {
    const references = new Set();
    // Mark all records that are traversable from a root
    this._roots.forEach(selector => {
      RelayReferenceMarker.mark(
        this._recordSource,
        selector,
        references
      );
    });
    // Short-circuit if *nothing* is referenced
    if (!references.size) {
      this._recordSource.clear();
      return;
    }
    // Evict any unreferenced nodes
    const storeIDs = this._recordSource.getRecordIDs();
    for (let ii = 0; ii < storeIDs.length; ii++) {
      const dataID = storeIDs[ii];
      if (!references.has(dataID)) {
        this._recordSource.remove(dataID);
      }
    }
  }
}

/**
 * Updates the target with information from source, also updating a mapping of
 * which records in the target were changed as a result.
 */
function updateTargetFromSource(
  target: MutableRecordSource,
  source: RecordSource,
  updatedRecordIDs: UpdatedRecords,
): void {
  const dataIDs = source.getRecordIDs();
  for (let ii = 0; ii < dataIDs.length; ii++) {
    const dataID = dataIDs[ii];
    const sourceRecord = source.get(dataID);
    const targetRecord = target.get(dataID);
    // Prevent mutation of a record from outside the store.
    if (__DEV__) {
      if (sourceRecord) {
        RelayModernRecord.freeze(sourceRecord);
      }
    }
    if (sourceRecord === UNPUBLISH_RECORD_SENTINEL) {
      // Unpublish a record
      target.remove(dataID);
      updatedRecordIDs[dataID] = true;
    } else if (sourceRecord && targetRecord) {
      const nextRecord = RelayModernRecord.update(targetRecord, sourceRecord);
      if (nextRecord !== targetRecord) {
        // Prevent mutation of a record from outside the store.
        if (__DEV__) {
          RelayModernRecord.freeze(nextRecord);
        }
        updatedRecordIDs[dataID] = true;
        target.set(dataID, nextRecord);
      }
    } else if (sourceRecord === null) {
      target.delete(dataID);
      if (targetRecord !== null) {
        updatedRecordIDs[dataID] = true;
      }
    } else if (sourceRecord) {
      target.set(dataID, sourceRecord);
      updatedRecordIDs[dataID] = true;
    } // don't add explicit undefined
  }
}

RelayProfiler.instrumentMethods(RelayMarkSweepStore.prototype, {
  lookup: 'RelayMarkSweepStore.prototype.lookup',
  notify: 'RelayMarkSweepStore.prototype.notify',
  publish: 'RelayMarkSweepStore.prototype.publish',
  retain: 'RelayMarkSweepStore.prototype.retain',
  subscribe: 'RelayMarkSweepStore.prototype.subscribe',
});

module.exports = RelayMarkSweepStore;
