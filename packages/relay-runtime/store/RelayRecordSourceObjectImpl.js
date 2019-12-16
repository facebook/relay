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

const RelayRecordState = require('./RelayRecordState');

import type {DataID} from '../util/RelayRuntimeTypes';
import type {RecordState} from './RelayRecordState';
import type {MutableRecordSource, Record, RecordMap} from './RelayStoreTypes';

const {EXISTENT, NONEXISTENT, UNKNOWN} = RelayRecordState;

/**
 * An implementation of the `MutableRecordSource` interface (defined in
 * `RelayStoreTypes`) that holds all records in memory.
 */
class RelayRecordSourceObjectImpl implements MutableRecordSource {
  _records: RecordMap;

  constructor(records?: RecordMap) {
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

  remove(dataID: DataID): void {
    delete this._records[dataID];
  }

  set(dataID: DataID, record: Record): void {
    this._records[dataID] = record;
  }

  size(): number {
    return Object.keys(this._records).length;
  }

  toJSON(): RecordMap {
    return this._records;
  }
}

module.exports = RelayRecordSourceObjectImpl;
