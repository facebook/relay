/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {RecordMap, UpdatedRecords} from './RelayStoreTypes';

function hasOverlappingIDs(
  seenRecords: RecordMap,
  updatedRecordIDs: UpdatedRecords,
): boolean {
  const keys = Object.keys(seenRecords);
  for (let ii = 0; ii < keys.length; ii++) {
    if (updatedRecordIDs.hasOwnProperty(keys[ii])) {
      return true;
    }
  }
  return false;
}

module.exports = hasOverlappingIDs;
