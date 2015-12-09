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

import type {DataID} from 'RelayInternalTypes';
const RelayContext = require('RelayContext');

/**
 * Public API for controlling garbage collection of `RelayStoreData`.
 *
 * Provides methods to control the garbage collection of records in
 * `RelayStoreData`.
 */
var RelayGarbageCollection = {
  /**
   * Initializes garbage collection: must be called before any records are
   * fetched. When records are collected after calls to `scheduleCollection` or
   * `scheduleCollectionFromNode`, records are collected in steps, with a
   * maximum of `stepLength` records traversed in a step. Steps are scheduled
   * via `RelayTaskScheduler`.
   */
  initialize(stepLength: number): void {
    RelayContext.getDefaultInstance().initializeGarbageCollection(stepLength);
  },

  /**
   * Collects any un-referenced records in the store.
   */
  scheduleCollection(): void {
    RelayContext.getDefaultInstance().scheduleGarbageCollection();
  },

  /**
   * Collects any un-referenced records reachable from the given record via
   * graph traversal of fields.
   *
   * NOTE: If the given record is still referenced, no records are collected.
   */
  scheduleCollectionFromNode(dataID: DataID): void {
    RelayContext.getDefaultInstance().scheduleGarbageCollectionFromNode(dataID);
  },
};

module.exports = RelayGarbageCollection;
