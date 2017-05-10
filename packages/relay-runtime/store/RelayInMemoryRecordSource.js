/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayInMemoryRecordSource
 * @flow
 * @format
 */

'use strict';

const RelayRecordState = require('RelayRecordState');

import type {Record, RecordMap} from 'RelayCombinedEnvironmentTypes';
import type {DataID} from 'RelayInternalTypes';
import type {RecordState} from 'RelayRecordState';
import type {MutableRecordSource} from 'RelayStoreTypes';

const {EXISTENT, NONEXISTENT, UNKNOWN} = RelayRecordState;

/**
 * An implementation of the `MutableRecordSource` interface (defined in
 * `RelayStoreTypes`) that holds all records in memory.
 */
class RelayInMemoryRecordSource implements MutableRecordSource {
  _records: RecordMap<Record>;

  constructor(records?: RecordMap<Record>) {
    this._records = records || {};
  }

  clear(): void {
    this._records = {};
  }

  delete(dataID: DataID): void {
    this._records[dataID] = null;
  }

  get(dataID: DataID): ?Record {
    return this._records[dataID];
  }

  getRecordIDs(): Array<DataID> {
    return Object.keys(this._records);
  }

  getStatus(dataID: DataID): RecordState {
    if (!this._records.hasOwnProperty(dataID)) {
      return UNKNOWN;
    }
    return this._records[dataID] == null ? NONEXISTENT : EXISTENT;
  }

  has(dataID: DataID): boolean {
    return this._records.hasOwnProperty(dataID);
  }

  load(
    dataID: DataID,
    callback: (error: ?Error, record: ?Record) => void,
  ): void {
    callback(null, this.get(dataID));
  }

  remove(dataID: DataID): void {
    delete this._records[dataID];
  }

  set(dataID: DataID, record: Record): void {
    this._records[dataID] = record;
  }

  size(): number {
    return Object.keys(this._records).length;
  }

  toJSON(): Object {
    return this._records;
  }
}

module.exports = RelayInMemoryRecordSource;
