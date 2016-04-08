/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule writeRelayGraphModeResponse
 * @flow
 * @typechecks
 */

'use strict';

const Map = require('Map');
const RelayChangeTracker = require('RelayChangeTracker');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayGraphModeInterface = require('RelayGraphModeInterface');
import type {
  CacheKey,
  GraphModePayload,
  GraphRecord,
  GraphReference,
  GraphScalar,
  PutEdgesOperation,
  PutNodesOperation,
  PutRootOperation,
} from 'RelayGraphModeInterface';
import type {
  DataID,
} from 'RelayInternalTypes';
const RelayNodeInterface = require('RelayNodeInterface');
const RelayRecord = require('RelayRecord');
const RelayRecordState = require('RelayRecordState');
import type RelayRecordStore from 'RelayRecordStore';
import type RelayRecordWriter from 'RelayRecordWriter';

const forEachObject = require('forEachObject');
const generateClientEdgeID = require('generateClientEdgeID');
const generateClientID = require('generateClientID');
const invariant = require('invariant');
const stableStringify = require('stableStringify');

const {ID, NODE} = RelayConnectionInterface;
const {
  CACHE_KEY,
  FRAGMENTS,
  REF_KEY,
  PUT_EDGES,
  PUT_NODES,
  PUT_ROOT,
} = RelayGraphModeInterface;
const {TYPENAME} = RelayNodeInterface;
const {EXISTENT} = RelayRecordState;
const {PATH} = RelayRecord.MetadataKey;

/**
 * Writes a GraphMode payload into a Relay store.
 */
function writeRelayGraphModeResponse(
  store: RelayRecordStore,
  writer: RelayRecordWriter,
  payload: GraphModePayload,
  options?: {forceIndex?: ?number}
): RelayChangeTracker {
  var graphWriter = new RelayGraphModeWriter(
    store,
    writer,
    options
  );
  graphWriter.write(payload);
  return graphWriter.getChangeTracker();
}

class RelayGraphModeWriter {
  _cacheKeyMap: Map<CacheKey, DataID>;
  _changeTracker: RelayChangeTracker;
  _forceIndex: ?number;
  _store: RelayRecordStore;
  _writer: RelayRecordWriter;

  constructor(
    store: RelayRecordStore,
    writer: RelayRecordWriter,
    options?: {forceIndex?: ?number}
  ) {
    this._cacheKeyMap = new Map();
    this._changeTracker = new RelayChangeTracker();
    this._forceIndex = (options && options.forceIndex) || null;
    this._store = store;
    this._writer = writer;
  }

  getChangeTracker(): RelayChangeTracker {
    return this._changeTracker;
  }

  write(payload: GraphModePayload): void {
    payload.forEach(operation => {
      if (operation.op === PUT_ROOT) {
        this._writeRoot(operation);
      } else if (operation.op === PUT_NODES) {
        this._writeNodes(operation);
      } else if (operation.op === PUT_EDGES) {
        this._writeEdges(operation);
      } else {
        invariant(
          false,
          'writeRelayGraphModeResponse(): Invalid operation type `%s`, ' +
          'expected `root`, `nodes`, or `edges`.',
          operation.op
        );
      }
    });
  }

  _writeRoot(operation: PutRootOperation): void {
    const {field, identifier, root} = operation;
    const identifyingArgKey = getIdentifyingArgKey(identifier);
    const prevID = this._store.getDataID(field, identifyingArgKey);
    let nextID;
    if (root != null) {
      nextID = getID(root, prevID);
    } else {
      nextID = prevID || generateClientID();
    }
    if (root == null) {
      this._writeRecord(nextID, root);
    } else {
      const clientRecord = getGraphRecord(root);
      if (clientRecord) {
        this._writeRecord(nextID, clientRecord);
      }
    }
    this._writer.putDataID(field, identifyingArgKey, nextID);
  }

  _writeNodes(operation: PutNodesOperation): void {
    const {nodes} = operation;
    forEachObject(nodes, (record, dataID) => {
      this._writeRecord(dataID, record);
    });
  }

  _writeEdges(operation: PutEdgesOperation): void {
    const {range, args, edges, pageInfo} = operation;
    const rangeID = this._cacheKeyMap.get(range[CACHE_KEY]);
    invariant(
      rangeID,
      'writeRelayGraphModeResponse(): Cannot find a record for cache key ' +
      '`%s`.',
      range[CACHE_KEY]
    );
    invariant(
      RelayConnectionInterface.hasRangeCalls(args),
      'writeRelayGraphModeResponse(): Cannot write edges for connection on ' +
      'record `%s` without `first`, `last`, or `find` argument.',
      rangeID
    );
    if (!this._writer.hasRange(rangeID) ||
      (this._forceIndex != null &&
        this._forceIndex > this._store.getRangeForceIndex(rangeID))) {
      this._changeTracker.updateID(rangeID);
      this._writer.putRange(rangeID, args, this._forceIndex);
    }
    const rangeInfo = this._store.getRangeMetadata(rangeID, args);
    const filteredEdges = (rangeInfo && rangeInfo.filteredEdges) || [];
    const fetchedEdgeIDs = [];
    let isUpdate = false;
    let nextIndex = 0;
    edges.forEach(edgeData => {
      if (edgeData == null) {
        return;
      }
      const nodeData = edgeData[NODE];
      if (nodeData == null) {
        return;
      }
      invariant(
        typeof nodeData === 'object',
        'RelayQueryWriter: Expected node to be an object for `%s`.',
        edgeData
      );

      // For consistency, edge IDs are calculated from the connection & node ID.
      // A node ID is only generated if the node does not have an id and
      // there is no existing edge.
      const prevEdge = filteredEdges[nextIndex++];
      const prevNodeID =
        prevEdge && this._store.getLinkedRecordID(prevEdge.edgeID, NODE);
      const nextNodeID = getID(nodeData, prevNodeID);
      const edgeID = generateClientEdgeID(rangeID, nextNodeID);
      fetchedEdgeIDs.push(edgeID);

      this._writeRecord(edgeID, {
        ...edgeData,
        [NODE]: {[REF_KEY]: nextNodeID},
      });
      const clientRecord = getGraphRecord(nodeData);
      if (clientRecord) {
        this._writeRecord(nextNodeID, clientRecord);
      }
      if (nextNodeID !== prevNodeID) {
        this._changeTracker.updateID(edgeID);
      }
      isUpdate = isUpdate || !prevEdge || edgeID !== prevEdge.edgeID;
    });

    this._writer.putRangeEdges(
      rangeID,
      args,
      pageInfo || RelayConnectionInterface.getDefaultPageInfo(),
      fetchedEdgeIDs
    );

    if (isUpdate) {
      this._changeTracker.updateID(rangeID);
    }
  }

  _writeRecord(dataID: DataID, record: ?GraphRecord): void {
    const recordState = this._store.getRecordState(dataID);
    if (record === undefined) {
      return;
    } else if (record === null) {
      if (recordState === EXISTENT) {
        this._changeTracker.updateID(dataID);
      }
      this._writer.deleteRecord(dataID);
      return;
    }
    const cacheKey = getCacheKey(record);
    if (cacheKey) {
      this._cacheKeyMap.set(cacheKey, dataID);
    }
    if (recordState !== EXISTENT) {
      this._changeTracker.createID(dataID);
    }
    const path = record[PATH] || null;
    const typeName = record[TYPENAME] || null;
    // TODO #10481948: Construct paths lazily
    this._writer.putRecord(dataID, typeName, (path: any));

    forEachObject(record, (nextValue, storageKey) => {
      if (
        storageKey === CACHE_KEY ||
        storageKey === PATH ||
        storageKey === REF_KEY
      ) {
        return;
      } else if (storageKey === FRAGMENTS) {
        this._writeFragments(dataID, nextValue);
      } else if (nextValue === undefined) {
        return;
      } else if (nextValue === null) {
        this._writeScalar(dataID, storageKey, nextValue);
      } else if (Array.isArray(nextValue)) {
        this._writePlural(dataID, storageKey, nextValue);
      } else if (typeof nextValue === 'object') {
        this._writeLinkedRecord(dataID, storageKey, nextValue);
      } else {
        this._writeScalar(dataID, storageKey, nextValue);
      }
    });
  }

  _writeFragments(
    dataID: DataID,
    fragments: {[fragmentHash: string]: boolean}
  ): void {
    forEachObject(fragments, (_, fragmentHash) => {
      this._writer.setHasDeferredFragmentData(
        dataID,
        fragmentHash
      );
    });
    this._changeTracker.updateID(dataID);
  }

  _writeScalar(
    dataID: DataID,
    storageKey: string,
    nextValue: mixed
  ): void {
    const prevValue = this._store.getField(dataID, storageKey);
    if (prevValue !== nextValue) {
      this._changeTracker.updateID(dataID);
    }
    this._writer.putField(dataID, storageKey, nextValue);
  }

  _writePlural(
    dataID: DataID,
    storageKey: string,
    nextValue: Array<?GraphScalar>
  ): void {
    const prevValue = this._store.getField(dataID, storageKey);
    const prevArray = Array.isArray(prevValue) ? prevValue : null;
    let nextIDs = null;
    let nextScalars = null;
    let isUpdate = false;
    let nextIndex = 0;
    nextValue.forEach((nextItem: ?GraphScalar) => {
      if (nextItem == null) {
        return;
      } else if (typeof nextItem === 'object') {
        invariant(
          !nextScalars,
          'writeRelayGraphModeResponse(): Expected items for field `%s` to ' +
          'all be objects or all be scalars, got both.',
          storageKey
        );
        const prevItem = prevArray && prevArray[nextIndex++];
        const prevID = typeof prevItem === 'object' && prevItem != null ?
          RelayRecord.getDataIDForObject(prevItem) :
          null;
        const nextID = getID(nextItem, prevID);
        const clientRecord = getGraphRecord(nextItem);
        if (clientRecord) {
          this._writeRecord(nextID, clientRecord);
        }
        isUpdate = isUpdate || nextID !== prevID;
        nextIDs = nextIDs || [];
        nextIDs.push(nextID);
      } else {
        // array of scalars
        invariant(
          !nextIDs,
          'writeRelayGraphModeResponse(): Expected items for field `%s` to ' +
          'all be objects or all be scalars, got both.',
          storageKey
        );
        const prevItem = prevArray && prevArray[nextIndex++];
        isUpdate = isUpdate || nextItem !== prevItem;
        nextScalars = nextScalars || [];
        nextScalars.push(nextItem);
      }
    });
    nextScalars = nextScalars || [];
    const nextArray = nextIDs || nextScalars;
    if (
      isUpdate ||
      !prevArray ||
      nextArray.length !== prevArray.length
    ) {
      this._changeTracker.updateID(dataID);
    }
    if (nextIDs) {
      this._writer.putLinkedRecordIDs(dataID, storageKey, nextIDs);
    } else {
      this._writer.putField(dataID, storageKey, nextScalars || []);
    }
  }

  _writeLinkedRecord(
    dataID: DataID,
    storageKey: string,
    nextValue: GraphRecord | GraphReference
  ): void {
    const prevID = this._store.getLinkedRecordID(dataID, storageKey);
    const nextID = getID(nextValue, prevID);

    const clientRecord = getGraphRecord(nextValue);
    if (clientRecord) {
      this._writeRecord(nextID, clientRecord);
    }
    if (nextID !== prevID) {
      this._changeTracker.updateID(dataID);
    }
    this._writer.putLinkedRecordID(dataID, storageKey, nextID);
  }
}

function getCacheKey(record: GraphRecord): ?CacheKey {
  if (
    record.hasOwnProperty(CACHE_KEY) &&
    typeof record[CACHE_KEY] === 'string'
  ) {
    return record[CACHE_KEY];
  }
  return null;
}

function getID(
  record: GraphRecord | GraphReference,
  prevID: ?DataID
): DataID {
  if (
    record.hasOwnProperty(REF_KEY) &&
    typeof record[REF_KEY] === 'string'
  ) {
    return record[REF_KEY];
  } else if (record.hasOwnProperty(ID) && typeof record[ID] === 'string') {
    return record[ID];
  } else if (prevID != null) {
    return prevID;
  } else {
    return generateClientID();
  }
}

function getIdentifyingArgKey(value: mixed): ?string {
  if (value == null) {
    return null;
  } else {
    return typeof value === 'string' ? value : stableStringify(value);
  }
}

function getGraphRecord(record: GraphRecord | GraphReference): ?GraphRecord {
  if (!record.hasOwnProperty(REF_KEY)) {
    return (record: any);
  }
  return null;
}

module.exports = writeRelayGraphModeResponse;
