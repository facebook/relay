/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayRecordProxy
 * @flow
 * @format
 */

'use strict';

const generateRelayClientID = require('generateRelayClientID');
const invariant = require('invariant');

const {getStableStorageKey} = require('RelayStoreUtils');

import type RelayRecordSourceMutator from 'RelayRecordSourceMutator';
import type RelayRecordSourceProxy from 'RelayRecordSourceProxy';
import type {DataID} from 'RelayRuntime';
import type {RecordProxy} from 'RelayStoreTypes';
import type {Arguments} from 'RelayStoreUtils';

/**
 * @internal
 *
 * A helper class for manipulating a given record from a record source via an
 * imperative/OO-style API.
 */
class RelayRecordProxy implements RecordProxy {
  _dataID: DataID;
  _mutator: RelayRecordSourceMutator;
  _source: RelayRecordSourceProxy;

  constructor(
    source: RelayRecordSourceProxy,
    mutator: RelayRecordSourceMutator,
    dataID: DataID,
  ) {
    this._dataID = dataID;
    this._mutator = mutator;
    this._source = source;
  }

  copyFieldsFrom(source: RecordProxy): void {
    this._mutator.copyFields(source.getDataID(), this._dataID);
  }

  getDataID(): DataID {
    return this._dataID;
  }

  getType(): string {
    const type = this._mutator.getType(this._dataID);
    invariant(
      type != null,
      'RelayRecordProxy: Cannot get the type of deleted record `%s`.',
      this._dataID,
    );
    return type;
  }

  getValue(name: string, args?: ?Arguments): mixed {
    const storageKey = getStableStorageKey(name, args);
    return this._mutator.getValue(this._dataID, storageKey);
  }

  setValue(value: mixed, name: string, args?: ?Arguments): RecordProxy {
    invariant(
      isValidLeafValue(value),
      'RelayRecordProxy#setValue(): Expected a scalar or array of scalars, ' +
        'got `%s`.',
      JSON.stringify(value),
    );
    const storageKey = getStableStorageKey(name, args);
    this._mutator.setValue(this._dataID, storageKey, value);
    return this;
  }

  getLinkedRecord(name: string, args?: ?Arguments): ?RecordProxy {
    const storageKey = getStableStorageKey(name, args);
    const linkedID = this._mutator.getLinkedRecordID(this._dataID, storageKey);
    return linkedID != null ? this._source.get(linkedID) : linkedID;
  }

  setLinkedRecord(
    record: RecordProxy,
    name: string,
    args?: ?Arguments,
  ): RecordProxy {
    invariant(
      record instanceof RelayRecordProxy,
      'RelayRecordProxy#setLinkedRecord(): Expected a record, got `%s`.',
      record,
    );
    const storageKey = getStableStorageKey(name, args);
    const linkedID = record.getDataID();
    this._mutator.setLinkedRecordID(this._dataID, storageKey, linkedID);
    return this;
  }

  getOrCreateLinkedRecord(
    name: string,
    typeName: string,
    args?: ?Arguments,
  ): RecordProxy {
    let linkedRecord = this.getLinkedRecord(name, args);
    if (!linkedRecord) {
      const storageKey = getStableStorageKey(name, args);
      const clientID = generateRelayClientID(this.getDataID(), storageKey);
      linkedRecord = this._source.create(clientID, typeName);
      this.setLinkedRecord(linkedRecord, name, args);
    }
    return linkedRecord;
  }

  getLinkedRecords(name: string, args?: ?Arguments): ?Array<?RecordProxy> {
    const storageKey = getStableStorageKey(name, args);
    const linkedIDs = this._mutator.getLinkedRecordIDs(
      this._dataID,
      storageKey,
    );
    if (linkedIDs == null) {
      return linkedIDs;
    }
    return linkedIDs.map(linkedID => {
      return linkedID != null ? this._source.get(linkedID) : linkedID;
    });
  }

  setLinkedRecords(
    records: Array<?RecordProxy>,
    name: string,
    args?: ?Arguments,
  ): RecordProxy {
    invariant(
      Array.isArray(records),
      'RelayRecordProxy#setLinkedRecords(): Expected records to be an array, got `%s`.',
      records,
    );
    const storageKey = getStableStorageKey(name, args);
    const linkedIDs = records.map(record => record && record.getDataID());
    this._mutator.setLinkedRecordIDs(this._dataID, storageKey, linkedIDs);
    return this;
  }
}

function isValidLeafValue(value: mixed): boolean {
  return (
    value == null ||
    typeof value !== 'object' ||
    (Array.isArray(value) && value.every(isValidLeafValue))
  );
}

module.exports = RelayRecordProxy;
