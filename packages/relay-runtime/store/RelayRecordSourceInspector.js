/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordSourceInspector
 * @flow
 */

'use strict';

const RelayStaticRecord = require('RelayStaticRecord');

const forEachObject = require('forEachObject');
const formatStorageKey = require('formatStorageKey');
const getRelayStaticHandleKey = require('getRelayStaticHandleKey');
const invariant = require('invariant');
const simpleClone = require('simpleClone');

const {ROOT_ID, ROOT_TYPE} = require('RelayStoreUtils');
const {
  REF_KEY,
  REFS_KEY,
} = require('RelayStoreUtils');

import type {
  Record,
} from 'RelayCombinedEnvironmentTypes';
import type {DataID} from 'RelayInternalTypes';
import type {Environment, RecordSource} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

/**
 * A class intended for introspecting a RecordSource and its Records during
 * development.
 */
class RelayRecordSourceInspector {
  _proxies: {[dataID: DataID]: ?RecordInspector};
  _source: RecordSource;

  static getForEnvironment(environment: Environment): RelayRecordSourceInspector {
    return new RelayRecordSourceInspector(environment.getStore().getSource());
  }

  constructor(source: RecordSource) {
    this._proxies = {};
    this._source = source;
  }

  /**
   * Returns an inspector for the record with the given id, or null/undefined if
   * that record is deleted/unfetched.
   */
  get(dataID: DataID): ?RecordInspector {
    if (!this._proxies.hasOwnProperty(dataID)) {
      const record = this._source.get(dataID);
      if (record != null) {
        this._proxies[dataID] = new RecordInspector(this, record);
      } else {
        this._proxies[dataID] = record;
      }
    }
    return this._proxies[dataID];
  }

  /**
   * Returns a list of "<id>: <type>" for each record in the store that has an
   * `id`.
   */
  getNodes(): Array<RecordSummary> {
    const nodes = [];
    this._source.getRecordIDs().forEach(dataID => {
      if (dataID.startsWith('client:')) {
        return;
      }
      const record = this._source.get(dataID);
      nodes.push(RecordSummary.createFromRecord(dataID, record));
    });
    return nodes;
  }

  /**
   * Returns a list of "<id>: <type>" for all records in the store including
   * those that do not have an `id`.
   */
  getRecords(): Array<RecordSummary> {
    return this._source.getRecordIDs().map(dataID => {
      const record = this._source.get(dataID);
      return RecordSummary.createFromRecord(dataID, record);
    });
  }

  /**
   * Returns an inspector for the synthesized "root" object, allowing access to
   * e.g. the `viewer` object or the results of other fields on the "Query"
   * type.
   */
  getRoot(): RecordInspector {
    const root = this.get(ROOT_ID);
    invariant(
      root && root.getType() === ROOT_TYPE,
      'RelayRecordSourceProxy#getRoot(): Expected the source to contain a ' +
      'root record.'
    );
    // Make viewer more accessible: if a record is not present on the original
    // field name but is present on the viewer handle field, rewrite the getter
    // to make `root.viewer` work.
    if (root.viewer == null) {
      const viewerHandle = getRelayStaticHandleKey('viewer', null, 'viewer');
      const unsafeRoot = (root: any); // to access getter properties
      if (unsafeRoot[viewerHandle] != null) {
        Object.defineProperty(unsafeRoot, 'viewer', ({
          configurable: true,
          enumerable: true,
          get() {
            return unsafeRoot[viewerHandle];
          },
        }: $FlowIssue));
      }
    }
    return root;
  }
}

/**
 * Internal class for inspecting a single Record.
 */
class RecordInspector {
  _record: Record;
  _sourceInspector: RelayRecordSourceInspector;

  constructor(
    sourceInspector: RelayRecordSourceInspector,
    record: Record,
  ) {
    this._record = record;
    this._sourceInspector = sourceInspector;

    // Make it easier to inspect the record in a debugger console:
    // defined properties appear in autocomplete when typing "obj."
    forEachObject(record, (value, key) => {
      const identifier = key.replace(/[^_a-zA-Z0-9]/g, '_');
      if (typeof value === 'object' && value !== null) {
        if (value.hasOwnProperty(REF_KEY)) {
          Object.defineProperty(this, identifier, {
            configurable: true,
            enumerable: true,
            get() {
              return this.getLinkedRecord(key);
            },
          });
        } else if (value.hasOwnProperty(REFS_KEY)) {
          Object.defineProperty(this, identifier, {
            configurable: true,
            enumerable: true,
            get() {
              return this.getLinkedRecords(key);
            },
          });
        }
      } else {
        Object.defineProperty(this, identifier, {
          configurable: true,
          enumerable: true,
          get() {
            return this.getValue(key);
          },
        });
      }
    });
  }

  /**
   * Get the cache id of the given record. For types that implement the `Node`
   * interface (or that have an `id`) this will be `id`, for other types it will be
   * a synthesized identifier based on the field path from the nearest ancestor
   * record that does have an `id`.
   */
  getDataID(): DataID {
    return RelayStaticRecord.getDataID(this._record);
  }

  /**
   * Returns a list of the fields that have been fetched on the current record.
   */
  getFields(): Array<string> {
    return Object.keys(this._record).sort();
  }

  /**
   * Returns the type of the record.
   */
  getType(): string {
    return RelayStaticRecord.getType(this._record);
  }

  /**
   * Returns a copy of the internal representation of the record.
   */
  inspect(): mixed {
    return simpleClone(this._record);
  }

  /**
   * Returns the value of a scalar field. May throw if the given field is
   * present but not actually scalar.
   */
  getValue(name: string, args?: ?Variables): mixed {
    const storageKey = args ? formatStorageKey(name, args) : name;
    return RelayStaticRecord.getValue(this._record, storageKey);
  }

  /**
   * Returns an inspector for the given scalar "linked" field (a field whose
   * value is another Record instead of a scalar). May throw if the field is
   * present but not a scalar linked record.
   */
  getLinkedRecord(name: string, args?: ?Variables): ?RecordInspector {
    const storageKey = args ? formatStorageKey(name, args) : name;
    const linkedID = RelayStaticRecord.getLinkedRecordID(this._record, storageKey);
    return linkedID != null ?
      this._sourceInspector.get(linkedID) :
      linkedID;
  }

  /**
   * Returns an array of inspectors for the given plural "linked" field (a field
   * whose value is an array of Records instead of a scalar). May throw if the
   * field is  present but not a plural linked record.
   */
  getLinkedRecords(name: string, args?: ?Variables): ?Array<?RecordInspector> {
    const storageKey = args ? formatStorageKey(name, args) : name;
    const linkedIDs = RelayStaticRecord.getLinkedRecordIDs(this._record, storageKey);
    if (linkedIDs == null) {
      return linkedIDs;
    }
    return linkedIDs.map(linkedID => {
      return linkedID != null ?
        this._sourceInspector.get(linkedID) :
        linkedID;
    });
  }
}

/**
 * An internal class to provide a console-friendly string representation of a
 * Record.
 */
class RecordSummary {
  id: DataID;
  type: ?string;

  static createFromRecord(id: DataID, record: ?Record): RecordSummary {
    const type = record ?
      RelayStaticRecord.getType(record) :
      null;
    return new RecordSummary(id, type);
  }

  constructor(id: DataID, type: ?string) {
    this.id = id;
    this.type = type;
  }

  toString(): string {
    return this.type ?
      `${this.id}: ${this.type}` :
      this.id;
  }
}

module.exports = RelayRecordSourceInspector;
