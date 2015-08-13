/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayGarbageCollection
 * @flow
 * @typechecks
 */

'use strict';

var RelayStoreData = require('RelayStoreData');

/**
 * Public API for controlling garbage collection of `RelayStoreData`.
 *
 * Provides methods to control the garbage collection of records in
 * `RelayStoreData`.
 */
var RelayGarbageCollection = {
  /**
   * Initializes garbage collection for `RelayStoreData`.
   *
   * Initializes garbage collection for the records in `RelayStoreData`, this
   * can only be done if no records are in the `RelayStoreData` (i.e. before
   * executing any queries).
   * Once garbage collection is initialized any data that enters the store will
   * be tracked and might be removed at a later point by scheduling a
   * collection.
   */
  initialize(): void {
    RelayStoreData
      .getDefaultInstance()
      .initializeGarbageCollector();
  },

  /**
   * Schedules a garbage collection cycle.
   *
   * Schedules a single garbage collection cycle using `RelayTaskScheduler`.
   * This will remove any record from the `RelayStoreData` that is eligible for
   * collection (i.e. has no subscription and was marked as collectible in a
   * previous collection cycle).
   * A collection cycle consist of several steps. In each step a maximum of
   * `stepLength` records will checked by the garbage collector. Once the
   * maximum is reached a new collection step is scheduled using
   * `RelayTaskScheduler` and control is returned to the event loop.
   *
   * @param {?number} stepLength A soft limit for the maximum length of a single
   * garbage collection step. This means if a record consists of nested records
   * the limit might be exceeded (i.e `stepLength` is 10, 8 records have been
   * removed and the next record has 4 linked records a total of 13 records will
   * be removed).
   */
  scheduleCollection(stepLength?: number): void {
    var garbageCollector =
      RelayStoreData.getDefaultInstance().getGarbageCollector();

    if (garbageCollector) {
      garbageCollector.scheduleCollection(stepLength);
    }
  },
};

module.exports = RelayGarbageCollection;
