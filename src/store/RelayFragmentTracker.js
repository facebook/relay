/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFragmentTracker
 * @flow
 */

'use strict';

import type {DataID} from 'RelayInternalTypes';

class RelayFragmentTracker {
  _dataIDToTrackedFragments: Map<DataID, Set<string>>;

  constructor() {
    this._dataIDToTrackedFragments = new Map();
  }

  track(dataID: DataID, fragmentHash: string): void {
    let set = this._dataIDToTrackedFragments.get(dataID);
    if (!set) {
      set = new Set();
      this._dataIDToTrackedFragments.set(dataID, set);
    }
    set.add(fragmentHash);
  }

  isTracked(dataID: DataID, fragmentHash: string): boolean {
    const set = this._dataIDToTrackedFragments.get(dataID);
    return !!set && set.has(fragmentHash);
  }

  untrack(dataID: DataID): void {
    this._dataIDToTrackedFragments.delete(dataID);
  }
}

module.exports = RelayFragmentTracker;
