/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordProxyReader
 * @flow
 * @format
 */

'use strict';

import type {DataID} from 'RelayInternalTypes';
import type {RecordProxy} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

function getDataID(record: RecordProxy): DataID {
  return record.getDataID();
}

function getType(record: RecordProxy): string {
  return record.getType();
}

function getValue(record: RecordProxy, name: string, args?: ?Variables): mixed {
  return record.getValue(name, args);
}

function getLinkedRecordID(
  record: RecordProxy,
  name: string,
  args?: ?Variables,
): ?DataID {
  const linkedRecord = record.getLinkedRecord(name, args);
  return linkedRecord == null ? linkedRecord : linkedRecord.getDataID();
}

function getLinkedRecordIDs(
  record: RecordProxy,
  name: string,
  args?: ?Variables,
): ?Array<?DataID> {
  const linkedRecords = record.getLinkedRecords(name, args);
  return linkedRecords == null
    ? linkedRecords
    : linkedRecords.map(proxy => (proxy == null ? proxy : proxy.getDataID()));
}

module.exports = {
  getDataID,
  getType,
  getValue,
  getLinkedRecordID,
  getLinkedRecordIDs,
};
