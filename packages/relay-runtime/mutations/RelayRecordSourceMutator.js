/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordSourceMutator
 * @flow
 * @format
 */

'use strict';

const RelayModernRecord = require('RelayModernRecord');

const forEachObject = require('forEachObject');
const invariant = require('invariant');

const {EXISTENT} = require('RelayRecordState');
const {
  UNPUBLISH_FIELD_SENTINEL,
  UNPUBLISH_RECORD_SENTINEL,
} = require('RelayStoreUtils');

import type {Record} from 'RelayCombinedEnvironmentTypes';
import type {DataID} from 'RelayInternalTypes';
import type {RecordState} from 'RelayRecordState';
import type {MutableRecordSource, RecordSource} from 'RelayStoreTypes';

/**
 * @internal
 *
 * Wrapper API that is an amalgam of the `RelayModernRecord` API and
 * `MutableRecordSource` interface, implementing copy-on-write semantics for
 * records in a record source. If a `backup` is supplied, the mutator will
 * ensure that the backup contains sufficient information to revert all
 * modifications by publishing the backup.
 *
 * Modifications are applied to fresh copies of records with optional backups
 * created:
 * - Records in `base` are never modified.
 * - Modifications cause a fresh version of a record to be created in `sink`.
 *   These sink records contain only modified fields.
 * - If a `backup` is supplied, any modifications to a record will cause the
 *   sink version of the record to be added to the backup.
 * - Creation of a record causes a sentinel object to be added to the backup
 *   so that the new record can be removed from the store by publishing the
 *   backup.
 */
class RelayRecordSourceMutator {
  _backup: ?MutableRecordSource;
  _base: RecordSource;
  _sink: MutableRecordSource;
  __sources: Array<RecordSource>;

  constructor(
    base: RecordSource,
    sink: MutableRecordSource,
    backup?: ?MutableRecordSource,
  ) {
    this._backup = backup;
    this._base = base;
    this._sink = sink;
    this.__sources = [sink, base];
  }

  _createBackupRecord(dataID: DataID): void {
    const backup = this._backup;
    if (backup && !backup.has(dataID)) {
      const baseRecord = this._base.get(dataID);
      if (baseRecord != null) {
        backup.set(dataID, baseRecord);
      } else if (baseRecord === null) {
        backup.delete(dataID);
      }
    }
  }

  _setSentinelFieldsInBackupRecord(dataID: DataID, record: Record): void {
    const backup = this._backup;
    if (backup) {
      const backupRecord = backup.get(dataID);
      if (backupRecord && backupRecord !== UNPUBLISH_RECORD_SENTINEL) {
        let copy = null;
        forEachObject(record, (value, key) => {
          if (!(key in backupRecord)) {
            copy = copy || {...backupRecord};
            copy[key] = UNPUBLISH_FIELD_SENTINEL;
          }
        });
        backup.set(dataID, copy || backupRecord);
      }
    }
  }

  _setSentinelFieldInBackupRecord(dataID: DataID, storageKey: string): void {
    const backup = this._backup;
    if (backup) {
      const backupRecord = backup.get(dataID);
      if (
        backupRecord &&
        backupRecord !== UNPUBLISH_RECORD_SENTINEL &&
        !(storageKey in backupRecord)
      ) {
        const copy = {...backupRecord};
        RelayModernRecord.setValue(copy, storageKey, UNPUBLISH_FIELD_SENTINEL);
        backup.set(dataID, copy);
      }
    }
  }

  _getSinkRecord(dataID: DataID): Record {
    let sinkRecord = this._sink.get(dataID);
    if (!sinkRecord) {
      const baseRecord = this._base.get(dataID);
      invariant(
        baseRecord,
        'RelayRecordSourceMutator: Cannot modify non-existent record `%s`.',
        dataID,
      );
      sinkRecord = RelayModernRecord.create(
        dataID,
        RelayModernRecord.getType(baseRecord),
      );
      this._sink.set(dataID, sinkRecord);
    }
    return sinkRecord;
  }

  copyFields(sourceID: DataID, sinkID: DataID): void {
    const sinkSource = this._sink.get(sourceID);
    const baseSource = this._base.get(sourceID);
    invariant(
      sinkSource || baseSource,
      'RelayRecordSourceMutator#copyFields(): Cannot copy fields from ' +
        'non-existent record `%s`.',
      sourceID,
    );
    this._createBackupRecord(sinkID);
    const sink = this._getSinkRecord(sinkID);
    if (baseSource) {
      RelayModernRecord.copyFields(baseSource, sink);
    }
    if (sinkSource) {
      RelayModernRecord.copyFields(sinkSource, sink);
    }
    this._setSentinelFieldsInBackupRecord(sinkID, sink);
  }

  copyFieldsFromRecord(record: Record, sinkID: DataID): void {
    this.copyFields(RelayModernRecord.getDataID(record), sinkID);
    const sink = this._getSinkRecord(sinkID);
    RelayModernRecord.copyFields(record, sink);
    this._setSentinelFieldsInBackupRecord(sinkID, sink);
  }

  create(dataID: DataID, typeName: string): void {
    invariant(
      this._base.getStatus(dataID) !== EXISTENT &&
        this._sink.getStatus(dataID) !== EXISTENT,
      'RelayRecordSourceMutator#create(): Cannot create a record with id ' +
        '`%s`, this record already exists.',
      dataID,
    );
    if (this._backup) {
      this._backup.set(dataID, UNPUBLISH_RECORD_SENTINEL);
    }
    const record = RelayModernRecord.create(dataID, typeName);
    this._sink.set(dataID, record);
  }

  delete(dataID: DataID): void {
    this._createBackupRecord(dataID);
    this._sink.delete(dataID);
  }

  getStatus(dataID: DataID): RecordState {
    return this._sink.has(dataID)
      ? this._sink.getStatus(dataID)
      : this._base.getStatus(dataID);
  }

  getType(dataID: DataID): ?string {
    for (let ii = 0; ii < this.__sources.length; ii++) {
      const record = this.__sources[ii].get(dataID);
      if (record) {
        return RelayModernRecord.getType(record);
      } else if (record === null) {
        return null;
      }
    }
  }

  getValue(dataID: DataID, storageKey: string): mixed {
    for (let ii = 0; ii < this.__sources.length; ii++) {
      const record = this.__sources[ii].get(dataID);
      if (record) {
        const value = RelayModernRecord.getValue(record, storageKey);
        if (value !== undefined) {
          return value;
        }
      } else if (record === null) {
        return null;
      }
    }
  }

  setValue(dataID: DataID, storageKey: string, value: mixed): void {
    this._createBackupRecord(dataID);
    const sinkRecord = this._getSinkRecord(dataID);
    RelayModernRecord.setValue(sinkRecord, storageKey, value);
    this._setSentinelFieldInBackupRecord(dataID, storageKey);
  }

  getLinkedRecordID(dataID: DataID, storageKey: string): ?DataID {
    for (let ii = 0; ii < this.__sources.length; ii++) {
      const record = this.__sources[ii].get(dataID);
      if (record) {
        const linkedID = RelayModernRecord.getLinkedRecordID(
          record,
          storageKey,
        );
        if (linkedID !== undefined) {
          return linkedID;
        }
      } else if (record === null) {
        return null;
      }
    }
  }

  setLinkedRecordID(
    dataID: DataID,
    storageKey: string,
    linkedID: DataID,
  ): void {
    this._createBackupRecord(dataID);
    const sinkRecord = this._getSinkRecord(dataID);
    RelayModernRecord.setLinkedRecordID(sinkRecord, storageKey, linkedID);
    this._setSentinelFieldInBackupRecord(dataID, storageKey);
  }

  getLinkedRecordIDs(dataID: DataID, storageKey: string): ?Array<?DataID> {
    for (let ii = 0; ii < this.__sources.length; ii++) {
      const record = this.__sources[ii].get(dataID);
      if (record) {
        const linkedIDs = RelayModernRecord.getLinkedRecordIDs(
          record,
          storageKey,
        );
        if (linkedIDs !== undefined) {
          return linkedIDs;
        }
      } else if (record === null) {
        return null;
      }
    }
  }

  setLinkedRecordIDs(
    dataID: DataID,
    storageKey: string,
    linkedIDs: Array<?DataID>,
  ): void {
    this._createBackupRecord(dataID);
    const sinkRecord = this._getSinkRecord(dataID);
    RelayModernRecord.setLinkedRecordIDs(sinkRecord, storageKey, linkedIDs);
    this._setSentinelFieldInBackupRecord(dataID, storageKey);
  }
}

module.exports = RelayRecordSourceMutator;
