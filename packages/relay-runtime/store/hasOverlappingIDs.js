/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {UpdatedRecords, Snapshot} from './RelayStoreTypes';

function hasOverlappingIDs(
  snapshot: Snapshot,
  updatedRecordIDs: UpdatedRecords,
): boolean {
  const keys = Object.keys(snapshot.seenRecords);
  for (let ii = 0; ii < keys.length; ii++) {
    if (updatedRecordIDs.hasOwnProperty(keys[ii])) {
      return true;
    }
  }
  return false;
}

module.exports = hasOverlappingIDs;
