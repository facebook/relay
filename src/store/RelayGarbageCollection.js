/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

import type {DataID} from 'RelayInternalTypes';
const RelayStore = require('RelayStore');

const invariant = require('invariant');
const warning = require('warning');

let _stepLength = -1; // collect in a single pass by default

/**
 * Public API for controlling garbage collection of `RelayStoreData`.
 *
 * Provides methods to control the garbage collection of records in
 * `RelayStoreData`.
 */
const RelayGarbageCollection = {
  /**
   * Initializes garbage collection: must be called before any records are
   * fetched. When records are collected after calls to `scheduleCollection` or
   * `scheduleCollectionFromNode`, records are collected in steps, with a
   * maximum of `stepLength` records traversed in a step. Steps are scheduled
   * via the `RelayStore` task queue (using the injected scheduler).
   */
  initialize(stepLength: number): void {
    invariant(
      stepLength > 0,
      'RelayGarbageCollection: step length must be greater than zero, got ' +
      '`%s`.',
      stepLength
    );
    _stepLength = stepLength;
    RelayStore.getStoreData().initializeGarbageCollector(scheduler);
  },

  /**
   * Collects any un-referenced records in the store.
   */
  scheduleCollection(): void {
    const garbageCollector = RelayStore.getStoreData().getGarbageCollector();

    if (garbageCollector) {
      garbageCollector.collect();
    }
  },

  /**
   * Collects any un-referenced records reachable from the given record via
   * graph traversal of fields.
   *
   * NOTE: If the given record is still referenced, no records are collected.
   */
  scheduleCollectionFromNode(dataID: DataID): void {
    const garbageCollector = RelayStore.getStoreData().getGarbageCollector();

    if (garbageCollector) {
      garbageCollector.collectFromNode(dataID);
    }
  },
};

function scheduler(run: () => boolean): void {
  const pendingQueryTracker =
      RelayStore.getStoreData().getPendingQueryTracker();
  const runIteration = () => {
    // TODO: #9366746: integrate RelayRenderer/Container with GC hold
    warning(
      !pendingQueryTracker.hasPendingQueries(),
      'RelayGarbageCollection: GC is executing during a fetch, but the ' +
      'pending query may rely on data that is collected.'
    );
    let iterations = 0;
    let hasNext = true;
    while (hasNext && (_stepLength < 0 || iterations < _stepLength)) {
      hasNext = run();
      iterations++;
    }
    // This is effectively a (possibly async) `while` loop
    if (hasNext) {
      enqueue(runIteration);
    }
  };
  enqueue(runIteration);
}

function enqueue(fn: () => void): void {
  RelayStore.getStoreData().getTaskQueue().enqueue(fn);
}

module.exports = RelayGarbageCollection;
