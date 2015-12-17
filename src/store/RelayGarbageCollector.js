/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayGarbageCollector
 * @flow
 * @typechecks
 */

'use strict';

const GraphQLRange = require('GraphQLRange');
const GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
import type {DataID} from 'RelayInternalTypes';
const RelayQueryPath = require('RelayQueryPath');
import type RelayStoreData from 'RelayStoreData';

const forEachObject = require('forEachObject');
const invariant = require('invariant');

export type GarbageCollectionHold = {release: () => void};
export type GarbageCollectionScheduler = (collect: () => boolean) => void;

/**
 * @internal
 *
 * Provides methods to track the number of references to registered records and
 * remove un-referenced records from Relay's cache.
 */
class RelayGarbageCollector {
  _activeHoldCount: number;
  _collectionQueue: Array<DataID>;
  _isCollecting: boolean;
  _refCounts: {[key: DataID]: number};
  _scheduler: GarbageCollectionScheduler;
  _storeData: RelayStoreData;

  constructor(
    storeData: RelayStoreData,
    scheduler: GarbageCollectionScheduler
  ) {
    this._activeHoldCount = 0;
    this._collectionQueue = [];
    this._isCollecting = false;
    this._refCounts = {};
    this._scheduler = scheduler;
    this._storeData = storeData;
  }

  register(dataID: DataID): void {
    if (!this._refCounts.hasOwnProperty(dataID)) {
      this._refCounts[dataID] = 0;
    }
  }

  incrementReferenceCount(dataID: DataID): void {
    invariant(
      this._refCounts.hasOwnProperty(dataID),
      'RelayGarbageCollector: must register `%s` before referencing.',
      dataID
    );
    this._refCounts[dataID]++;
  }

  decrementReferenceCount(dataID: DataID): void {
    invariant(
      this._refCounts.hasOwnProperty(dataID),
      'RelayGarbageCollector: must register `%s` before dereferencing.',
      dataID
    );
    invariant(
      this._refCounts[dataID] > 0,
      'RelayGarbageCollector: cannot decrease references below zero for `%s`.',
      dataID
    );
    this._refCounts[dataID]--;
  }

  /**
   * Notify the collector that GC should be put on hold/paused. The hold can be
   * released by calling the returned callback.
   *
   * Example use cases:
   * - In-flight queries may have been diffed against cached records that are
   *   unreferenced and eligible for GC. If these records were collected there
   *   would be insufficient data in the cache to render.
   * - There may be a gap between a query response being processed and rendering
   *   the component that initiated the fetch. If records were collected there
   *   would be insufficient data in the cache to render.
   */
  acquireHold(): GarbageCollectionHold {
    let isReleased = false;
    this._activeHoldCount++;
    return {
      release: () => {
        invariant(
          !isReleased,
          'RelayGarbageCollector: hold can only be released once.'
        );
        invariant(
          this._activeHoldCount > 0,
          'RelayGarbageCollector: cannot decrease hold count below zero.'
        );
        isReleased = true;
        this._activeHoldCount--;
        if (this._activeHoldCount === 0) {
          this._scheduleCollection();
        }
      },
    };
  }

  /**
   * Schedules a collection starting at the given record.
   */
  collectFromNode(dataID: DataID): void {
    if (this._refCounts[dataID] === 0) {
      this._collectionQueue.push(dataID);
      this._scheduleCollection();
    }
  }

  /**
   * Schedules a collection for any currently unreferenced records.
   */
  collect(): void {
    forEachObject(this._refCounts, (refCount, dataID) => {
      if (refCount === 0) {
        this._collectionQueue.push(dataID);
      }
    });
    this._scheduleCollection();
  }

  _scheduleCollection(): void {
    if (
      this._isCollecting ||
      this._activeHoldCount ||
      !this._collectionQueue.length
    ) {
      // already scheduled, active hold, or nothing to do
      return;
    }
    this._isCollecting = true;

    const cachedRecords = this._storeData.getCachedData();
    const freshRecords = this._storeData.getNodeData();
    this._scheduler(() => {
      // handle async scheduling
      if (this._activeHoldCount || !this._collectionQueue.length) {
        return this._isCollecting = false;
      }

      let dataID;
      let refCount;
      // find the next record to collect
      do {
        dataID = this._collectionQueue.shift();
        refCount = this._refCounts[dataID];
      } while (dataID && refCount === undefined || refCount > 0);
      const cachedRecord = cachedRecords[dataID];
      if (cachedRecord) {
        this._traverseRecord(cachedRecord);
      }
      const freshRecord = freshRecords[dataID];
      if (freshRecord) {
        this._traverseRecord(freshRecord);
      }
      this._collectRecord(dataID);

      // only allow new collections to be scheduled once the current one
      // is complete
      return this._isCollecting = !!this._collectionQueue.length;
    });
  }

  _traverseRecord(record: {[key: string]: mixed}): void {
    forEachObject(record, (value, storageKey) => {
      if (value instanceof RelayQueryPath) {
        return;
      } else if (value instanceof GraphQLRange) {
        value.getEdgeIDs().forEach(
          id => this._collectionQueue.push(id)
        );
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            const linkedID = GraphQLStoreDataHandler.getID(item);
            if (linkedID) {
              this._collectionQueue.push(linkedID);
            }
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        const linkedID = GraphQLStoreDataHandler.getID(value);
        if (linkedID) {
          this._collectionQueue.push(linkedID);
        }
      }
    });
  }

  _collectRecord(dataID: DataID): void {
    this._storeData.getQueryTracker().untrackNodesForID(dataID);
    this._storeData.getQueuedStore().removeRecord(dataID);
    this._storeData.getRangeData().removeRecord(dataID);
    delete this._refCounts[dataID];
  }
}

module.exports = RelayGarbageCollector;
