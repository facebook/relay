/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryWriter
 * @flow
 * @typechecks
 */

'use strict';

var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var RelayQuery = require('RelayQuery');
import type RelayChangeTracker from 'RelayChangeTracker';
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayNodeInterface = require('RelayNodeInterface');
import type RelayQueryPath from 'RelayQueryPath';
import type RelayQueryTracker from 'RelayQueryTracker';
var RelayQueryVisitor = require('RelayQueryVisitor');
var RelayRecordState = require('RelayRecordState');
import type RelayRecordStore from 'RelayRecordStore';

var generateClientEdgeID = require('generateClientEdgeID');
var generateClientID = require('generateClientID');
var invariant = require('invariant');
var warning = require('warning');

import type {DataID} from 'RelayInternalTypes';

type WriterOptions = {
  forceIndex?: ?number;
  updateTrackedQueries?: boolean;
};
type WriterState = {
  recordID: DataID;
  responseData: ?mixed;
  nodeID: ?DataID;
  path: RelayQueryPath;
};

var {ID, TYPENAME} = RelayNodeInterface;
var {EDGES, NODE, PAGE_INFO} = RelayConnectionInterface;

/**
 * @internal
 *
 * Helper for writing the result of one or more queries/operations into the
 * store, updating tracked queries, and recording changed record IDs.
 */
class RelayQueryWriter extends RelayQueryVisitor<WriterState> {
  _changeTracker: RelayChangeTracker;
  _forceIndex: number;
  _store: RelayRecordStore;
  _queryTracker: RelayQueryTracker;
  _updateTrackedQueries: boolean;

  constructor(
    store: RelayRecordStore,
    queryTracker: RelayQueryTracker,
    changeTracker: RelayChangeTracker,
    options?: WriterOptions
  ) {
    super();
    this._changeTracker = changeTracker;
    this._forceIndex = options && options.forceIndex ? options.forceIndex : 0;
    this._store = store;
    this._queryTracker = queryTracker;
    this._updateTrackedQueries = !!(options && options.updateTrackedQueries);
  }

  getRecordStore(): RelayRecordStore {
    return this._store;
  }

  getRecordTypeName(
    field: RelayQuery.Node,
    recordID: DataID,
    payload: Object
  ): ?string {
    if (GraphQLStoreDataHandler.isClientID(recordID)) {
      return null;
    }
    var typeName = payload[TYPENAME];
    if (typeName == null) {
      var idField = field.getFieldByStorageKey(ID);
      if (idField) {
        typeName = idField.getParentType();
      }
    }
    warning(
      typeName,
      'RelayQueryWriter: Could not find a type name for record `%s`.',
      recordID
    );
    return typeName || null;
  }

  /**
   * Traverses a query and payload in parallel, writing the results into the
   * store.
   */
  writePayload(
    node: RelayQuery.Node,
    recordID: DataID,
    responseData: mixed,
    path: RelayQueryPath
  ): void {
    var state = {
      nodeID: null,
      recordID,
      responseData,
      path,
    };

    if (node instanceof RelayQuery.Field && !node.isScalar()) {
      // for non-scalar fields, the recordID is the parent
      node.getChildren().forEach(child => {
        this.visit(child, state);
      });
      return;
    }

    this.visit(node, state);
  }

  /**
   * Records are "created" whenever an entry did not previously exist for the
   * `recordID`, including cases when a `recordID` is created with a null value.
   */
  recordCreate(
    recordID: DataID
  ): void {
    this._changeTracker.createID(recordID);
  }

  /**
   * Records are "updated" if any field changes (including being set to null).
   * Updates are not recorded for newly created records.
   */
  recordUpdate(
    recordID: DataID
  ): void {
    this._changeTracker.updateID(recordID);
  }

  /**
   * Determine if the record was created or updated by this write operation.
   */
  hasChangeToRecord(recordID: DataID): boolean {
    return this._changeTracker.hasChange(recordID);
  }

  /**
   * Determine if the record was created by this write operation.
   */
  isNewRecord(recordID: DataID): boolean {
    return this._changeTracker.isNewRecord(recordID);
  }

  /**
   * Helper to create a record and the corresponding notification.
   */
  createRecordIfMissing(
    node: RelayQuery.Node,
    recordID: DataID,
    typeName: ?string,
    path: RelayQueryPath
  ): void {
    var recordState = this._store.getRecordState(recordID);
    if (recordState !== RelayRecordState.EXISTENT) {
      this._store.putRecord(recordID, typeName, path);
      this.recordCreate(recordID);
    }
    if (this.isNewRecord(recordID) || this._updateTrackedQueries) {
      this._queryTracker.trackNodeForID(node, recordID, path);
    }
  }

  visitRoot(
    root: RelayQuery.Root,
    state: WriterState
  ): ?RelayQuery.Node {
    var {path, recordID, responseData} = state;
    var recordState = this._store.getRecordState(recordID);

    // GraphQL should never return undefined for a field
    if (responseData == null) {
      invariant(
        responseData !== undefined,
        'RelayQueryWriter: Unexpectedly encountered `undefined` in payload. ' +
        'Cannot set root record `%s` to undefined.',
        recordID
      );
      this._store.deleteRecord(recordID);
      if (recordState === RelayRecordState.EXISTENT) {
        this.recordUpdate(recordID);
      }
      return;
    }
    invariant(
      typeof responseData === 'object' && responseData !== null,
      'RelayQueryWriter: Cannot update record `%s`, expected response to be ' +
      'an array or object.',
      recordID
    );
    if (recordState !== RelayRecordState.EXISTENT) {
      var typeName = this.getRecordTypeName(root, recordID, responseData);
      this._store.putRecord(recordID, typeName, path);
      this.recordCreate(recordID);
    }
    if (this.isNewRecord(recordID) || this._updateTrackedQueries) {
      this._queryTracker.trackNodeForID(root, recordID, path);
    }
    this.traverse(root, state);
  }

  visitField(
    field: RelayQuery.Field,
    state: WriterState
  ): ?RelayQuery.Node {
    var {
      recordID,
      responseData,
    } = state;
    invariant(
      this._store.getRecordState(recordID) === RelayRecordState.EXISTENT,
      'RelayQueryWriter: Cannot update a non-existent record, `%s`.',
      recordID
    );
    invariant(
      typeof responseData === 'object' && responseData !== null,
      'RelayQueryWriter: Cannot update record `%s`, expected response to be ' +
      'an object.',
      recordID
    );

    // handle missing data
    var fieldData = responseData[field.getSerializationKey()];
    if (fieldData === undefined) {
      return;
    }
    if (fieldData === null) {
      this._store.deleteField(recordID, field.getStorageKey());
      this.recordUpdate(recordID);
      return;
    }

    if (field.isScalar()) {
      this._writeScalar(field, state, recordID, fieldData);
    } else if (field.isConnection()) {
      this._writeConnection(field, state, recordID, fieldData);
    } else if (field.isPlural()) {
      this._writePluralLink(field, state, recordID, fieldData);
    } else {
      this._writeLink(field, state, recordID, fieldData);
    }
  }

  /**
   * Writes the value for a 'scalar' field such as `id` or `name`. The response
   * data is expected to be scalar values or arrays of scalar values.
   */
  _writeScalar(
    field: RelayQuery.Field,
    state: WriterState,
    recordID: DataID,
    nextValue: mixed
  ): void {
    var storageKey = field.getStorageKey();
    var prevValue = this._store.getField(recordID, storageKey);

    // always update the store to ensure the value is present in the appropriate
    // data sink (records/queuedRecords), but only record an update if the value
    // changed.
    this._store.putField(recordID, storageKey, nextValue);

    // TODO: Flow: `nextValue` is an array, array indexing should work
    if (
      Array.isArray(prevValue) &&
      Array.isArray(nextValue) &&
      prevValue.length === nextValue.length &&
      prevValue.every((prev, ii) => prev === (nextValue: any)[ii])
    ) {
      return;
    } else if (prevValue === nextValue) {
      return;
    }
    this.recordUpdate(recordID);
  }

  /**
   * Writes data for connection fields such as `news_feed` or `friends`. The
   * response data is expected to be array of edge objects.
   */
  _writeConnection(
    field: RelayQuery.Field,
    state: WriterState,
    recordID: DataID,
    connectionData: mixed
  ): void {
    // Each unique combination of filter calls is stored in its own
    // generated record (ex: `field.orderby(x)` results are separate from
    // `field.orderby(y)` results).
    var storageKey = field.getStorageKey();
    var connectionID = this._store.getLinkedRecordID(recordID, storageKey);
    if (!connectionID) {
      connectionID = generateClientID();
    }
    var connectionRecordState = this._store.getRecordState(connectionID);
    var hasEdges = !!(
      field.getFieldByStorageKey(EDGES) ||
      (
        connectionData != null &&
        typeof connectionData === 'object' &&
        (connectionData: $FixMe)[EDGES]
      )
    );
    var path = state.path.getPath(field, connectionID);
    // always update the store to ensure the value is present in the appropriate
    // data sink (records/queuedRecords), but only record an update if the value
    // changed.
    this._store.putRecord(connectionID, null, path);
    this._store.putLinkedRecordID(recordID, storageKey, connectionID);
    // record the create/update only if something changed
    if (connectionRecordState !== RelayRecordState.EXISTENT) {
      this.recordUpdate(recordID);
      this.recordCreate(connectionID);
    }
    if (this.isNewRecord(connectionID) || this._updateTrackedQueries) {
      this._queryTracker.trackNodeForID(field, connectionID, path);
    }

    // Only create a range if `edges` field is present
    // Overwrite an existing range only if the new force index is greater
    if (hasEdges &&
        (!this._store.hasRange(connectionID) ||
         (this._forceIndex &&
          this._forceIndex > this._store.getRangeForceIndex(connectionID)))) {
      this._store.putRange(
        connectionID,
        field.getCallsWithValues(),
        this._forceIndex
      );
      this.recordUpdate(connectionID);
    }

    var connectionState = {
      path,
      nodeID: null,
      recordID: connectionID,
      responseData: connectionData,
    };
    this._traverseConnection(field, field, connectionState);
  }

  /**
   * Recurse through connection subfields and write their results. This is
   * necessary because handling an `edges` field also requires information about
   * the parent connection field (see `_writeEdges`).
   */
  _traverseConnection(
    connection: RelayQuery.Field, // the parent connection
    node: RelayQuery.Node, // the parent connection or an intermediary fragment
    state: WriterState
  ): void {
    node.getChildren().forEach(child => {
      if (child instanceof RelayQuery.Field) {
        if (child.getSchemaName() === EDGES) {
          this._writeEdges(connection, child, state);
        } else if (child.getSchemaName() !== PAGE_INFO) {
          // Page info is handled by the range
          // Otherwise, write metadata fields normally (ex: `count`)
          this.visit(child, state);
        }
      } else {
        // Fragment case, recurse keeping track of parent connection
        this._traverseConnection(connection, child, state);
      }
    });
  }

  /**
   * Update a connection with newly fetched edges.
   */
  _writeEdges(
    connection: RelayQuery.Field,
    edges: RelayQuery.Field,
    state: WriterState
  ): void {
    var {
      recordID: connectionID,
      responseData: connectionData,
    } = state;
    var storageKey = connection.getStorageKey();
    invariant(
      typeof connectionData === 'object' && connectionData !== null,
      'RelayQueryWriter: Cannot write edges for malformed connection `%s` on ' +
      'record `%s`, expected the response to be an object.',
      storageKey,
      connectionID
    );
    var edgesData = connectionData[EDGES];

    // Validate response data.
    if (edgesData == null) {
      warning(
        false,
        'RelayQueryWriter: Cannot write edges for connection `%s` on record ' +
        '`%s`, expected a response for field `edges`.',
        storageKey,
        connectionID
      );
      return;
    }
    invariant(
      Array.isArray(edgesData),
      'RelayQueryWriter: Cannot write edges for connection `%s` on record ' +
      '`%s`, expected `edges` to be an array.',
      storageKey,
      connectionID
    );

    var rangeCalls = connection.getCallsWithValues();
    invariant(
      RelayConnectionInterface.hasRangeCalls(rangeCalls),
      'RelayQueryWriter: Cannot write edges for connection `%s` on record ' +
      '`%s` without `first`, `last`, or `find` argument.',
      storageKey,
      connectionID
    );
    var rangeInfo = this._store.getRangeMetadata(
      connectionID,
      rangeCalls
    );
    invariant(
      rangeInfo,
      'RelayQueryWriter: Expected a range to exist for connection field `%s` ' +
      'on record `%s`.',
      storageKey,
      connectionID
    );
    var fetchedEdgeIDs = [];
    var isUpdate = false;
    var nextIndex = 0;
    var requestedEdges = rangeInfo.requestedEdges;
    // Traverse connection edges, reusing existing edges if they exist
    edgesData.forEach(edgeData => {
      // validate response data
      if (edgeData == null) {
        return;
      }
      invariant(
        typeof edgeData === 'object' && edgeData,
        'RelayQueryWriter: Cannot write edge for connection field `%s` on ' +
        'record `%s`, expected an object.',
        storageKey,
        connectionID
      );

      var nodeData = edgeData[NODE];
      if (nodeData == null) {
        return;
      }

      invariant(
        typeof nodeData === 'object',
        'RelayQueryWriter: Expected node to be an object for field `%s` on ' +
        'record `%s`.',
        storageKey,
        connectionID
      );

      // For consistency, edge IDs are calculated from the connection & node ID.
      // A node ID is only generated if the node does not have an id and
      // there is no existing edge.
      var prevEdge = requestedEdges[nextIndex++];
      var nodeID = (
        (nodeData && nodeData[ID]) ||
        (prevEdge && this._store.getLinkedRecordID(prevEdge.edgeID, NODE)) ||
        generateClientID()
      );
      // TODO: Flow: `nodeID` is `string`
      var edgeID = generateClientEdgeID(connectionID, (nodeID: any));
      var path = state.path.getPath(edges, edgeID);
      this.createRecordIfMissing(edges, edgeID, null, path);
      fetchedEdgeIDs.push(edgeID);

      // Write data for the edge, using `nodeID` as the id for direct descendant
      // `node` fields. This is necessary for `node`s that do not have an `id`,
      // which would cause the generated ID here to not match the ID generated
      // in `_writeLink`.
      this.traverse(edges, {
        path,
        nodeID,
        recordID: edgeID,
        responseData: edgeData,
      });
      isUpdate = isUpdate || this.hasChangeToRecord(edgeID);
    });

    var pageInfo = connectionData[PAGE_INFO] ||
      RelayConnectionInterface.getDefaultPageInfo();
    this._store.putRangeEdges(
      connectionID,
      rangeCalls,
      pageInfo,
      fetchedEdgeIDs
    );

    // Only broadcast an update to the range if an edge was added/changed.
    // Node-level changes will broadcast at the node ID.
    if (isUpdate) {
      this.recordUpdate(connectionID);
    }
  }

  /**
   * Writes a plural linked field such as `actors`. The response data is
   * expected to be an array of item objects. These fields are similar to
   * connections, but do not support range calls such as `first` or `after`.
   */
  _writePluralLink(
    field: RelayQuery.Field,
    state: WriterState,
    recordID: DataID,
    fieldData: mixed
  ): void {
    var storageKey = field.getStorageKey();
    invariant(
      Array.isArray(fieldData),
      'RelayQueryWriter: Expected array data for field `%s` on record `%s`.',
      storageKey,
      recordID
    );

    var prevLinkedIDs =
      this._store.getLinkedRecordIDs(recordID, storageKey);
    var nextLinkedIDs = [];
    var isUpdate = !prevLinkedIDs;
    var nextIndex = 0;
    fieldData.forEach(nextRecord => {
      // validate response data
      if (nextRecord == null) {
        return;
      }
      invariant(
        typeof nextRecord === 'object' && nextRecord,
        'RelayQueryWriter: Expected elements for plural field `%s` to be ' +
        'objects.',
        storageKey
      );

      // Reuse existing generated IDs if the node does not have its own `id`.
      // TODO: Flow: `nextRecord` is asserted as typeof === 'object'
      var prevLinkedID = prevLinkedIDs && prevLinkedIDs[nextIndex];
      var nextLinkedID = (
        nextRecord[ID] ||
        prevLinkedID ||
        generateClientID()
      );
      nextLinkedIDs.push(nextLinkedID);

      var path = state.path.getPath(field, nextLinkedID);
      var typeName = this.getRecordTypeName(field, nextLinkedID, nextRecord);
      this.createRecordIfMissing(field, nextLinkedID, typeName, path);
      isUpdate = (
        isUpdate ||
        nextLinkedID !== prevLinkedID ||
        this.isNewRecord(nextLinkedID)
      );

      this.traverse(field, {
        path,
        nodeID: null, // never propagate `nodeID` past the first linked field
        recordID: nextLinkedID,
        responseData: nextRecord,
      });
      isUpdate = isUpdate || this.hasChangeToRecord(nextLinkedID);
      nextIndex++;
    });

    this._store.putLinkedRecordIDs(recordID, storageKey, nextLinkedIDs);

    // Check if length has changed
    isUpdate = (
      isUpdate ||
      !prevLinkedIDs ||
      prevLinkedIDs.length !== nextLinkedIDs.length
    );

    // Only broadcast a list-level change if a record was changed/added
    if (isUpdate) {
      this.recordUpdate(recordID);
    }
  }

  /**
   * Writes a link from one record to another, for example linking the `viewer`
   * record to the `actor` record in the query `viewer { actor }`. The `field`
   * variable is the field being linked (`actor` in the example).
   */
  _writeLink(
    field: RelayQuery.Field,
    state: WriterState,
    recordID: DataID,
    fieldData: mixed
  ): void {
    var {nodeID} = state;
    var storageKey = field.getStorageKey();
    invariant(
      typeof fieldData === 'object' && fieldData !== null,
      'RelayQueryWriter: Expected data for non-scalar field `%s` on record ' +
      '`%s` to be an object.',
      storageKey,
      recordID
    );

    // Prefer the actual `id` if present, otherwise generate one (if an id
    // was already generated it is reused). `node`s within a connection are
    // a special case as the ID used here must match the one generated prior to
    // storing the parent `edge`.
    // TODO: Flow: `fieldData` is asserted as typeof === 'object'
    var prevLinkedID = this._store.getLinkedRecordID(recordID, storageKey);
    var nextLinkedID = (
      (field.getSchemaName() === NODE && nodeID) ||
      (fieldData: any)[ID] ||
      prevLinkedID ||
      generateClientID()
    );

    var path = state.path.getPath(field, nextLinkedID);
    var typeName = this.getRecordTypeName(field, nextLinkedID, fieldData);
    this.createRecordIfMissing(field, nextLinkedID, typeName, path);
    // always update the store to ensure the value is present in the appropriate
    // data sink (record/queuedRecords), but only record an update if the value
    // changed.
    this._store.putLinkedRecordID(recordID, storageKey, nextLinkedID);
    if (prevLinkedID !== nextLinkedID || this.isNewRecord(nextLinkedID)) {
      this.recordUpdate(recordID);
    }

    this.traverse(field, {
      path,
      nodeID: null,
      recordID: nextLinkedID,
      responseData: fieldData,
    });
  }
}

module.exports = RelayQueryWriter;
