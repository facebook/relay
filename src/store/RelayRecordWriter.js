/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordWriter
 * @flow
 */

'use strict';

const GraphQLMutatorConstants = require('GraphQLMutatorConstants');
const GraphQLRange = require('GraphQLRange');
const RelayConnectionInterface = require('RelayConnectionInterface');
import type {
  EdgeRecord,
  PageInfo,
} from 'RelayConnectionInterface';
import type {
  Call,
  ClientMutationID,
  DataID,
  FieldValue,
  NodeRangeMap,
  RootCallMap,
} from 'RelayInternalTypes';
const RelayNodeInterface = require('RelayNodeInterface');
import type {QueryPath} from 'RelayQueryPath';
const RelayRecord = require('RelayRecord');
import type {
  Record,
  RecordMap,
} from 'RelayRecord';
import type {RecordState} from 'RelayRecordState';
const RelayRecordStatusMap = require('RelayRecordStatusMap');
import type {CacheWriter} from 'RelayTypes';

const invariant = require('invariant');
const rangeOperationToMetadataKey = require('rangeOperationToMetadataKey');

const EMPTY = '';
const {APPEND, PREPEND, REMOVE} = GraphQLMutatorConstants;
const {CURSOR, NODE} = RelayConnectionInterface;
const {
  FILTER_CALLS,
  FORCE_INDEX,
  MUTATION_IDS,
  PATH,
  RANGE,
  RESOLVED_FRAGMENT_MAP,
  RESOLVED_FRAGMENT_MAP_GENERATION,
  STATUS,
} = RelayRecord.MetadataKey;

type RangeOperation = $Keys<GraphQLMutatorConstants.RANGE_OPERATIONS>;

/**
 * @internal
 *
 * `RelayRecordWriter` is the helper module to write data into RelayRecordStore.
 */
class RelayRecordWriter {
  _cacheWriter: ?CacheWriter;
  _clientMutationID: ?ClientMutationID;
  _isOptimisticWrite: boolean;
  _records: RecordMap;
  _nodeConnectionMap: NodeRangeMap;
  _rootCallMap: RootCallMap;

  constructor(
    records: RecordMap,
    rootCallMap: RootCallMap,
    isOptimistic: boolean,
    nodeConnectionMap?: ?NodeRangeMap,
    cacheWriter?: ?CacheWriter,
    clientMutationID?: ?ClientMutationID
  ) {
    this._cacheWriter = cacheWriter;
    this._clientMutationID = clientMutationID;
    this._isOptimisticWrite = isOptimistic;
    this._nodeConnectionMap = nodeConnectionMap || {};
    this._records = records;
    this._rootCallMap = rootCallMap;
  }

  /**
   * Get the data ID associated with a storage key (and optionally an
   * identifying argument value) for a root query.
   */
  getDataID(
    storageKey: string,
    identifyingArgValue: ?string
  ): ?DataID {
    if (RelayNodeInterface.isNodeRootCall(storageKey)) {
      invariant(
        identifyingArgValue != null,
        'RelayRecordWriter.getDataID(): Argument to `%s()` ' +
        'cannot be null or undefined.',
        storageKey
      );
      return identifyingArgValue;
    }
    if (identifyingArgValue == null) {
      identifyingArgValue = EMPTY;
    }
    if (this._rootCallMap.hasOwnProperty(storageKey) &&
        this._rootCallMap[storageKey].hasOwnProperty(identifyingArgValue)) {
      return this._rootCallMap[storageKey][identifyingArgValue];
    }
  }

  /**
   * Associate a data ID with a storage key (and optionally an identifying
   * argument value) for a root query.
   */
  putDataID(
    storageKey: string,
    identifyingArgValue: ?string,
    dataID: DataID
  ): void {
    if (RelayNodeInterface.isNodeRootCall(storageKey)) {
      invariant(
        identifyingArgValue != null,
        'RelayRecordWriter.putDataID(): Argument to `%s()` ' +
        'cannot be null or undefined.',
        storageKey
      );
      return;
    }
    if (identifyingArgValue == null) {
      identifyingArgValue = EMPTY;
    }
    this._rootCallMap[storageKey] = this._rootCallMap[storageKey] || {};
    this._rootCallMap[storageKey][identifyingArgValue] = dataID;
    if (this._cacheWriter) {
      this._cacheWriter.writeRootCall(storageKey, identifyingArgValue, dataID);
    }
  }

  /**
   * Returns the status of the record stored at `dataID`.
   */
  getRecordState(dataID: DataID): RecordState {
    const record = this._records[dataID];
    if (record === null) {
      return 'NONEXISTENT';
    } else if (record === undefined) {
      return 'UNKNOWN';
    }
    return 'EXISTENT';
  }

  /**
   * Create an empty record at `dataID` if a record does not already exist.
   */
  putRecord(
    dataID: DataID,
    typeName: ?string,
    path?: ?QueryPath
  ): void {
    const prevRecord = this._getRecordForWrite(dataID);
    if (prevRecord) {
      return;
    }
    const nextRecord = RelayRecord.createWithFields(dataID, {
      __typename: typeName,
    });
    if (this._isOptimisticWrite) {
      this._setClientMutationID(nextRecord);
    }
    if (RelayRecord.isClientID(dataID) && path) {
      nextRecord[PATH] = path;
    }
    this._records[dataID] = nextRecord;
    const cacheWriter = this._cacheWriter;
    if (!this._isOptimisticWrite && cacheWriter) {
      cacheWriter.writeField(dataID, '__dataID__', dataID, typeName);
    }
  }

  /**
   * Returns the path to a non-refetchable record.
   */
  getPathToRecord(
    dataID: DataID
  ): ?QueryPath {
    return (this._getField(dataID, PATH): any);
  }

  /**
   * Check whether a given record has received data for a deferred fragment.
   */
  hasFragmentData(dataID: DataID, fragmentID: string): boolean {
    const resolvedFragmentMap = this._getField(dataID, RESOLVED_FRAGMENT_MAP);
    invariant(
      typeof resolvedFragmentMap === 'object' || resolvedFragmentMap == null,
      'RelayRecordWriter.hasFragmentData(): Expected the map of ' +
      'resolved deferred fragments associated with record `%s` to be null or ' +
      'an object. Found a(n) `%s`.',
      dataID,
      typeof resolvedFragmentMap
    );
    return !!(resolvedFragmentMap && resolvedFragmentMap[fragmentID]);
  }

  /**
   * Mark a given record as having received data for a deferred fragment.
   */
  setHasDeferredFragmentData(
    dataID: DataID,
    fragmentID: string
  ): void {
    this._setHasFragmentData(dataID, fragmentID, true);
  }

  /**
   * Mark a given record as having received data for a fragment.
   */
  setHasFragmentData(
    dataID: DataID,
    fragmentID: string
  ): void {
    this._setHasFragmentData(dataID, fragmentID, false);
  }

  _setHasFragmentData(
    dataID: DataID,
    fragmentID: string,
    updateFragmentGeneration: boolean
  ): void {
    const record = this._getRecordForWrite(dataID);
    invariant(
      record,
      'RelayRecordWriter.setHasFragmentData(): Expected record `%s` ' +
      'to exist before marking it as having received data for the deferred ' +
      'fragment with id `%s`.',
      dataID,
      fragmentID
    );
    let resolvedFragmentMap = record[RESOLVED_FRAGMENT_MAP];
    if (typeof resolvedFragmentMap !== 'object' || !resolvedFragmentMap) {
      resolvedFragmentMap = {};
    }
    resolvedFragmentMap[fragmentID] = true;
    record[RESOLVED_FRAGMENT_MAP] = resolvedFragmentMap;
    if (updateFragmentGeneration) {
      if (typeof record[RESOLVED_FRAGMENT_MAP_GENERATION] === 'number') {
        record[RESOLVED_FRAGMENT_MAP_GENERATION]++;
      } else {
        record[RESOLVED_FRAGMENT_MAP_GENERATION] = 0;
      }
    }
  }

  /**
   * Delete the record at `dataID`, setting its value to `null`.
   */
  deleteRecord(
    dataID: DataID
  ): void {
    this._records[dataID] = null;

    // Remove any links for this record
    if (!this._isOptimisticWrite) {
      delete this._nodeConnectionMap[dataID];
      if (this._cacheWriter) {
        this._cacheWriter.writeNode(dataID, null);
      }
    }
  }

  getType(dataID: DataID): ?string {
    // `__typename` property is typed as `string`
    return (this._getField(dataID, '__typename'): any);
  }

  /**
   * Returns the value of the field for the given dataID.
   */
  getField(
    dataID: DataID,
    storageKey: string
  ): ?FieldValue {
    return this._getField(dataID, storageKey);
  }

  /**
   * Sets the value of a scalar field.
   */
  putField(
    dataID: DataID,
    storageKey: string,
    value: FieldValue
  ) {
    const record = this._getRecordForWrite(dataID);
    invariant(
      record,
      'RelayRecordWriter.putField(): Expected record `%s` to exist before ' +
      'writing field `%s`.',
      dataID,
      storageKey
    );
    record[storageKey] = value;
    if (!this._isOptimisticWrite && this._cacheWriter) {
      const typeName = record.__typename;
      this._cacheWriter.writeField(dataID, storageKey, value, typeName);
    }
  }

  /**
   * Clears the value of a field by setting it to null/undefined.
   */
  deleteField(
    dataID: DataID,
    storageKey: string
  ): void {
    const record = this._getRecordForWrite(dataID);
    invariant(
      record,
      'RelayRecordWriter.deleteField(): Expected record `%s` to exist before ' +
      'deleting field `%s`.',
      dataID,
      storageKey
    );
    record[storageKey] = null;
    if (!this._isOptimisticWrite && this._cacheWriter) {
      this._cacheWriter.writeField(dataID, storageKey, null);
    }
  }

  /**
   * Returns the Data ID of a linked record (eg the ID of the `address` record
   * in `actor{address}`).
   */
  getLinkedRecordID(
    dataID: DataID,
    storageKey: string
  ): ?DataID {
    const field = this._getField(dataID, storageKey);
    if (field == null) {
      return field;
    }
    const record = RelayRecord.getRecord(field);
    invariant(
      record,
      'RelayRecordWriter.getLinkedRecordID(): Expected field `%s` for record ' +
      '`%s` to have a linked record.',
      storageKey,
      dataID
    );
    return RelayRecord.getDataID(record);
  }

  /**
   * Creates/updates a link between two records via the given field.
   */
  putLinkedRecordID(
    parentID: DataID,
    storageKey: string,
    recordID: DataID
  ): void {
    const parent = this._getRecordForWrite(parentID);
    invariant(
      parent,
      'RelayRecordWriter.putLinkedRecordID(): Expected record `%s` to exist ' +
      'before linking to record `%s`.',
      parentID,
      recordID
    );
    const fieldValue = RelayRecord.create(recordID);
    parent[storageKey] = fieldValue;
    if (!this._isOptimisticWrite && this._cacheWriter) {
      this._cacheWriter.writeField(parentID, storageKey, fieldValue);
    }
  }

  /**
   * Returns an array of Data ID for a plural linked field (eg the actor IDs of
   * the `likers` in `story{likers}`).
   */
  getLinkedRecordIDs(
    dataID: DataID,
    storageKey: string
  ): ?Array<DataID> {
    const field = this._getField(dataID, storageKey);
    if (field == null) {
      return field;
    }
    invariant(
      Array.isArray(field),
      'RelayRecordWriter.getLinkedRecordIDs(): Expected field `%s` for ' +
      'record `%s` to have an array of linked records.',
      storageKey,
      dataID
    );
    return field.map((element, ii) => {
      const record = RelayRecord.getRecord(element);
      invariant(
        record,
        'RelayRecordWriter.getLinkedRecordIDs(): Expected element at index ' +
        '%s in field `%s` for record `%s` to be a linked record.',
        ii,
        storageKey,
        dataID
      );
      return RelayRecord.getDataID(record);
    });
  }

  /**
   * Creates/updates a one-to-many link between records via the given field.
   */
  putLinkedRecordIDs(
    parentID: DataID,
    storageKey: string,
    recordIDs: Array<DataID>
  ): void {
    const parent = this._getRecordForWrite(parentID);
    invariant(
      parent,
      'RelayRecordWriter.putLinkedRecordIDs(): Expected record `%s` to exist ' +
      'before linking records.',
      parentID
    );
    const records = recordIDs.map(recordID => {
      return RelayRecord.create(recordID);
    });
    parent[storageKey] = records;
    if (!this._isOptimisticWrite && this._cacheWriter) {
      this._cacheWriter.writeField(parentID, storageKey, records);
    }
  }

  /**
   * Get the force index associated with the range at `connectionID`.
   */
  getRangeForceIndex(
    connectionID: DataID
  ): number {
    const forceIndex: ?number =
      (this._getField(connectionID, FORCE_INDEX): any);
    if (forceIndex === null) {
      return -1;
    }
    return forceIndex || 0;
  }

  /**
   * Get the condition calls that were used to fetch the given connection.
   * Ex: for a field `photos.orderby(recent)`, this would be
   * [{name: 'orderby', value: 'recent'}]
   */
  getRangeFilterCalls(
    connectionID: DataID
  ): ?Array<Call> {
    return (this._getField(connectionID, FILTER_CALLS): any);
  }

  /**
   * Creates a range at `dataID` with an optional `forceIndex`.
   */
  putRange(
    connectionID: DataID,
    calls: Array<Call>,
    forceIndex?: ?number
  ): void {
    invariant(
      !this._isOptimisticWrite,
      'RelayRecordWriter.putRange(): Cannot create a queued range.'
    );
    const record = this._getRecordForWrite(connectionID);
    invariant(
      record,
      'RelayRecordWriter.putRange(): Expected record `%s` to exist before ' +
      'adding a range.',
      connectionID
    );
    const range = new GraphQLRange();
    const filterCalls = getFilterCalls(calls);
    forceIndex = forceIndex || 0;
    record[FILTER_CALLS] = filterCalls;
    record[FORCE_INDEX] = forceIndex;
    record[RANGE] = range;

    const cacheWriter = this._cacheWriter;
    if (!this._isOptimisticWrite && cacheWriter) {
      cacheWriter.writeField(connectionID, FILTER_CALLS, filterCalls);
      cacheWriter.writeField(connectionID, FORCE_INDEX, forceIndex);
      cacheWriter.writeField(connectionID, RANGE, range);
    }
  }

  /**
   * Returns whether there is a range at `connectionID`.
   */
  hasRange(connectionID: DataID): boolean {
    return !!this._getField(connectionID, RANGE);
  }

  /**
   * Adds newly fetched edges to a range.
   */
  putRangeEdges(
    connectionID: DataID,
    calls: Array<Call>,
    pageInfo: PageInfo,
    edges: Array<DataID>
  ): void {
    const range: ?GraphQLRange = (this._getField(connectionID, RANGE): any);
    invariant(
      range,
      'RelayRecordWriter.putRangeEdges(): Expected record `%s` to exist and ' +
      'have a range.',
      connectionID
    );
    const edgeRecords = [];
    edges.forEach(edgeID => {
      const edgeRecord = this._getRangeEdgeRecord(edgeID);
      edgeRecords.push(edgeRecord);
      const nodeID = RelayRecord.getDataID(edgeRecord.node);
      this._addConnectionForNode(connectionID, nodeID);
    });
    range.addItems(
      calls,
      edgeRecords,
      pageInfo
    );
    if (!this._isOptimisticWrite && this._cacheWriter) {
      this._cacheWriter.writeField(connectionID, RANGE, range);
    }
  }

  /**
   * Prepend, append, or delete edges to/from a range.
   */
  applyRangeUpdate(
    connectionID: DataID,
    edgeID: DataID,
    operation: RangeOperation,
  ): void {
    if (this._isOptimisticWrite) {
      this._applyOptimisticRangeUpdate(connectionID, edgeID, operation);
    } else {
      this._applyServerRangeUpdate(connectionID, edgeID, operation);
    }
  }


    /**
     * Prepend, append, or delete elements to/from a range.
     */
  applyRangeElementUpdate(
    parentID: DataID,
    mutatedFieldName: string,
    nodeID: DataID,
    operation: RangeOperation,
    existingRecords: Array<?Object>,
  ): void {
    if (this._isOptimisticWrite) {
      this._applyOptimisticRangeElementUpdate(parentID, mutatedFieldName, nodeID, operation, existingRecords);
    } else {
      this._applyServerRangeElementUpdate(parentID, mutatedFieldName, nodeID, operation);
    }
  }

  /**
   * Get edge data in a format compatibile with `GraphQLRange`.
   * TODO: change `GraphQLRange` to accept `(edgeID, cursor, nodeID)` tuple
   */
  _getRangeEdgeRecord(edgeID: DataID): EdgeRecord {
    const nodeID = this.getLinkedRecordID(edgeID, NODE);
    invariant(
      nodeID,
      'RelayRecordWriter: Expected edge `%s` to have a `node` record.',
      edgeID
    );
    return RelayRecord.createWithFields(edgeID, {
      cursor: this.getField(edgeID, CURSOR),
      node: RelayRecord.create(nodeID),
    });
  }

  _applyOptimisticRangeElementUpdate(
    parentID: DataID,
    mutatedFieldName: string,
    nodeID: DataID,
    operation: RangeOperation,
    existingRecords: Array<?Object>,
  ): void {
    let parentRecord: ?Record = this._getRecordForWrite(parentID);
    const fieldValue = RelayRecord.create(nodeID);

    if (!parentRecord) {
      parentRecord = RelayRecord.create(parentID);
      // copy existing records over
      parentRecord[mutatedFieldName] = existingRecords.slice();
      this._records[parentID] = parentRecord;
    }

    this._setClientMutationID(parentRecord);
    if (Array.isArray(parentRecord[mutatedFieldName])) {
      if (operation === PREPEND) {
        parentRecord[mutatedFieldName].unshift(fieldValue);
      } else {
        parentRecord[mutatedFieldName].push(fieldValue);
      }
    } else {
      console.warn('Expected ' + parentRecord[mutatedFieldName] + ' to be an array.'
        + 'Optimistic response will not be applied.');
    }
  }

  _applyOptimisticRangeUpdate(
    connectionID: DataID,
    edgeID: DataID,
    operation: RangeOperation,
  ): void {
    let record: ?Record = this._getRecordForWrite(connectionID);
    if (!record) {
      record = RelayRecord.create(connectionID);
      this._records[connectionID] = record;
    }
    this._setClientMutationID(record);
    const key = rangeOperationToMetadataKey[operation];
    let queue: ?Array<DataID> = record[key];
    if (!queue) {
      queue = [];
      record[key] = queue;
    }
    if (operation === PREPEND) {
      queue.unshift(edgeID);
    } else {
      queue.push(edgeID);
    }
  }

  _applyServerRangeUpdate(
    connectionID: DataID,
    edgeID: DataID,
    operation: RangeOperation
  ): void {
    const range: ?GraphQLRange = (this._getField(connectionID, RANGE): any);
    invariant(
      range,
      'RelayRecordWriter: Cannot apply `%s` update to non-existent record ' +
      '`%s`.',
      operation,
      connectionID
    );
    if (operation === REMOVE) {
      range.removeEdgeWithID(edgeID);
      const nodeID = this.getLinkedRecordID(edgeID, 'node');
      if (nodeID) {
        this._removeConnectionForNode(connectionID, nodeID);
      }
    } else {
      const edgeRecord = this._getRangeEdgeRecord(edgeID);
      const nodeID = RelayRecord.getDataID(edgeRecord.node);
      this._addConnectionForNode(connectionID, nodeID);
      if (operation === APPEND) {
        range.appendEdge(this._getRangeEdgeRecord(edgeID));
      } else {
        range.prependEdge(this._getRangeEdgeRecord(edgeID));
      }
    }
    if (this._cacheWriter) {
      this._cacheWriter.writeField(connectionID, RANGE, range);
    }
  }


  _applyServerRangeElementUpdate(
    parentID: DataID,
    mutatedFieldName: string,
    nodeID: DataID,
    operation: RangeOperation
  ): void {
    let list: ?Array<Record> = (this._getField(parentID, mutatedFieldName): any);

    invariant(
      list,
      'RelayRecordWriter: Cannot apply `%s` update to non-existent list ' +
      '`%s` with parent of ID: %s.',
      operation,
      mutatedFieldName,
      parentID
    );

    if (operation === REMOVE) {
      list = list.filter((node) => node.__dataID__ !== nodeID);
    } else {
      if (operation === APPEND) {
        list.push({__dataID__: nodeID});
      } else {
        list.unshift({__dataID__: nodeID});
      }
    }
    if (this._cacheWriter) {
      this._cacheWriter.writeField(parentID, mutatedFieldName, list);
    }
  }

  /**
   * Record that the node is contained in the connection.
   */
  _addConnectionForNode(
    connectionID: DataID,
    nodeID: DataID
  ): void {
    let connectionMap = this._nodeConnectionMap[nodeID];
    if (!connectionMap) {
      connectionMap = {};
      this._nodeConnectionMap[nodeID] = connectionMap;
    }
    connectionMap[connectionID] = true;
  }

  /**
   * Record that the given node is no longer part of the connection.
   */
  _removeConnectionForNode(
    connectionID: DataID,
    nodeID: DataID
  ): void {
    const connectionMap = this._nodeConnectionMap[nodeID];
    if (connectionMap) {
      delete connectionMap[connectionID];
      if (Object.keys(connectionMap).length === 0) {
        delete this._nodeConnectionMap[nodeID];
      }
    }
  }

  /**
   * If the record is in the store, gets a version of the record
   * in the store being used for writes.
   */
  _getRecordForWrite(dataID: DataID): ?Record {
    const record = this._records[dataID];
    if (!record) {
      return record;
    }
    if (this._isOptimisticWrite) {
      this._setClientMutationID(record);
    }
    return record;
  }

  /**
   * Get the value of the field from the first version of the record for which
   * the field is defined, returning `null` if the record has been deleted or
   * `undefined` if the record has not been fetched.
   */
  _getField(dataID: DataID, storageKey: string): ?FieldValue {
    const record = this._records[dataID];
    if (record === null) {
      return null;
    } else if (record && record.hasOwnProperty(storageKey)) {
      return record[storageKey];
    } else {
      return undefined;
    }
  }

  /**
   * Injects the client mutation id associated with the record store instance
   * into the given record.
   */
  _setClientMutationID(record: Record): void {
    const clientMutationID = this._clientMutationID;
    invariant(
      clientMutationID,
      'RelayRecordWriter: _clientMutationID cannot be null/undefined.'
    );
    const mutationIDs: Array<ClientMutationID> = record[MUTATION_IDS] || [];
    if (mutationIDs.indexOf(clientMutationID) === -1) {
      mutationIDs.push(clientMutationID);
      record[MUTATION_IDS] = mutationIDs;
    }
    record[STATUS] = RelayRecordStatusMap.setOptimisticStatus(
      0,
      true
    );
  }
}

/**
 * Filter calls to only those that specify conditions on the returned results
 * (ex: `orderby(TOP_STORIES)`), removing generic calls (ex: `first`, `find`).
 */
function getFilterCalls(calls: Array<Call>): Array<Call> {
  return calls.filter(call => !RelayConnectionInterface.isConnectionCall(call));
}

module.exports = RelayRecordWriter;
