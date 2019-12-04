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

import type {RecordMap, UpdatedRecords} from './RelayStoreTypes';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOverlappingIDs(
  seenRecords: RecordMap,
  updatedRecordIDs: UpdatedRecords,
): boolean {
  for (const key in seenRecords) {
    if (
      hasOwnProperty.call(seenRecords, key) &&
      hasOwnProperty.call(updatedRecordIDs, key)
    ) {
      return true;
    }
  }
  return false;
}

module.exports = hasOverlappingIDs;
