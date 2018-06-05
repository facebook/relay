/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayClassicRecordState = require('./RelayClassicRecordState');
const RelayNodeInterface = require('../interface/RelayNodeInterface');
const RelayQuery = require('../query/RelayQuery');
const RelayQueryPath = require('../query/RelayQueryPath');
const RelayQueryVisitor = require('../query/RelayQueryVisitor');
const RelayRecord = require('./RelayRecord');

const generateClientEdgeID = require('../legacy/store/generateClientEdgeID');
const generateClientID = require('../legacy/store/generateClientID');
const invariant = require('invariant');
const isCompatibleRelayFragmentType = require('../tools/isCompatibleRelayFragmentType');
const warning = require('warning');

const {ConnectionInterface} = require('RelayRuntime');

import type {QueryPath} from '../query/RelayQueryPath';
import type RelayChangeTracker from './RelayChangeTracker';
import type RelayQueryTracker from './RelayQueryTracker';
import type RelayRecordStore from './RelayRecordStore';
import type RelayRecordWriter from './RelayRecordWriter';
import type {DataID} from 'RelayRuntime';

type WriterOptions = {
  forceIndex?: ?number,
  isOptimisticUpdate?: boolean,
  updateTrackedQueries?: boolean,
};
type WriterState = {
  nodeID: ?DataID,
  path: QueryPath,
  recordID: DataID,
  responseData: ?mixed,
};

const {ANY_TYPE, ID, TYPENAME} = RelayNodeInterface;
const {EXISTENT} = RelayClassicRecordState;

/**
 * @internal
 *
 * Helper for writing the result of one or more queries/operations into the
 * store, updating tracked queries, and recording changed record IDs.
 */
class RelayQueryWriter extends RelayQueryVisitor<WriterState> {
  _changeTracker: RelayChangeTracker;
  _forceIndex: number;
  _isOptimisticUpdate: boolean;
  _store: RelayRecordStore;
  _queryTracker: ?RelayQueryTracker;
  _updateTrackedQueries: boolean;
  _writer: RelayRecordWriter;

  constructor(
    store: RelayRecordStore,
    writer: RelayRecordWriter,
    queryTracker: ?RelayQueryTracker,
    changeTracker: RelayChangeTracker,
    options?: WriterOptions,
  ) {
    super();
    this._changeTracker = changeTracker;
    this._forceIndex = options && options.forceIndex ? options.forceIndex : 0;
    this._isOptimisticUpdate = !!(options && options.isOptimisticUpdate);
    this._store = store;
    this._queryTracker = queryTracker;
    this._updateTrackedQueries = !!(options && options.updateTrackedQueries);
    this._writer = writer;
  }

  getRecordStore(): RelayRecordStore {
    return this._store;
  }

  getRecordWriter(): RelayRecordWriter {
    return this._writer;
  }

  getRecordTypeName(
    node: RelayQuery.Node,
    recordID: DataID,
    payload: Object,
  ): ?string {
    if (this._isOptimisticUpdate) {
      // Optimistic queries are inferred. Reuse existing type if available.
      return this._store.getType(recordID);
    }
    let typeName = payload[TYPENAME];
    if (typeName == null) {
      if (!node.isAbstract()) {
        typeName = node.getType();
      } else {
        typeName = this._store.getType(recordID);
      }
    }
    warning(
      typeName && typeName !== ANY_TYPE,
      'RelayQueryWriter: Could not find a type name for record `%s`.',
      recordID,
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
    path: QueryPath,
  ): void {
    const state = {
      nodeID: null,
      path,
      recordID,
      responseData,
    };

    if (node instanceof RelayQuery.Field && node.canHaveSubselections()) {
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
  recordCreate(recordID: DataID): void {
    this._changeTracker.createID(recordID);
  }

  /**
   * Records are "updated" if any field changes (including being set to null).
   * Updates are not recorded for newly created records.
   */
  recordUpdate(recordID: DataID): void {
    this._changeTracker.updateID(recordID);
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
    path: QueryPath,
    payload: ?Object,
  ): void {
    const recordState = this._store.getRecordState(recordID);
    const typeName = payload && this.getRecordTypeName(node, recordID, payload);
    this._writer.putRecord(recordID, typeName, path);
    if (recordState !== EXISTENT) {
      this.recordCreate(recordID);
    }
    if (
      this._queryTracker &&
      (this.isNewRecord(recordID) || this._updateTrackedQueries) &&
      (!RelayRecord.isClientID(recordID) || RelayQueryPath.isRootPath(path))
    ) {
      this._queryTracker.trackNodeForID(node, recordID);
    }
  }

  visitRoot(root: RelayQuery.Root, state: WriterState): void {
    const {path, recordID, responseData} = state;
    const recordState = this._store.getRecordState(recordID);

    // GraphQL should never return undefined for a field
    if (responseData == null) {
      invariant(
        responseData !== undefined,
        'RelayQueryWriter: Unexpectedly encountered `undefined` in payload. ' +
          'Cannot set root record `%s` to undefined.',
        recordID,
      );
      this._writer.deleteRecord(recordID);
      if (recordState === EXISTENT) {
        this.recordUpdate(recordID);
      }
      return;
    }
    invariant(
      typeof responseData === 'object' && responseData !== null,
      'RelayQueryWriter: Cannot update record `%s`, expected response to be ' +
        'an array or object.',
      recordID,
    );
    this.createRecordIfMissing(root, recordID, path, responseData);
    this.traverse(root, state);
  }

  visitFragment(fragment: RelayQuery.Fragment, state: WriterState): void {
    const {recordID} = state;
    if (fragment.isDeferred()) {
      const hash =
        fragment.getSourceCompositeHash() || fragment.getCompositeHash();

      this._writer.setHasDeferredFragmentData(recordID, hash);

      this.recordUpdate(recordID);
    }
    // Skip fragments that do not match the record's concrete type. Fragments
    // cannot be skipped for optimistic writes because optimistically created
    // records *may* have a default `Node` type.
    if (
      this._isOptimisticUpdate ||
      isCompatibleRelayFragmentType(fragment, this._store.getType(recordID))
    ) {
      if (!this._isOptimisticUpdate && fragment.isTrackingEnabled()) {
        this._writer.setHasFragmentData(recordID, fragment.getCompositeHash());
      }
      const path = RelayQueryPath.getPath(state.path, fragment, recordID);
      this.traverse(fragment, {
        ...state,
        path,
      });
    }
  }

  visitField(field: RelayQuery.Field, state: WriterState): void {
    const {recordID, responseData} = state;
    invariant(
      this._writer.getRecordState(recordID) === EXISTENT,
      'RelayQueryWriter: Cannot update a non-existent record, `%s`.',
      recordID,
    );
    invariant(
      typeof responseData === 'object' && responseData !== null,
      'RelayQueryWriter: Cannot update record `%s`, expected response to be ' +
        'an object.',
      recordID,
    );
    const serializationKey = field.getSerializationKey();

    const fieldData = responseData[serializationKey];
    // Queried fields that are `undefined` are stored as nulls.
    if (fieldData == null) {
      if (fieldData === undefined) {
        if (responseData.hasOwnProperty(serializationKey)) {
          warning(
            false,
            'RelayQueryWriter: Encountered an explicit `undefined` field `%s` ' +
              'on record `%s`, expected response to not contain `undefined`.',
            field.getDebugName(),
            recordID,
          );
          return;
        } else if (this._isOptimisticUpdate) {
          return;
        }
      }

      const storageKey = field.getStorageKey();
      const prevValue = this._store.getField(recordID, storageKey);
      // Always write to ensure data is stored in the correct recordStore.
      this._writer.deleteField(recordID, storageKey);
      if (prevValue !== null) {
        this.recordUpdate(recordID);
      }
      return;
    }

    if (!field.canHaveSubselections()) {
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
    nextValue: mixed,
  ): void {
    const storageKey = field.getStorageKey();
    const prevValue = this._store.getField(recordID, storageKey);

    // always update the store to ensure the value is present in the appropriate
    // data sink (records/queuedRecords), but only record an update if the value
    // changed.
    this._writer.putField(recordID, storageKey, nextValue);

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
    connectionData: mixed,
  ): void {
    const {EDGES} = ConnectionInterface.get();

    // Each unique combination of filter calls is stored in its own
    // generated record (ex: `field.orderby(x)` results are separate from
    // `field.orderby(y)` results).
    const storageKey = field.getStorageKey();
    const connectionID =
      this._store.getLinkedRecordID(recordID, storageKey) || generateClientID();

    const connectionRecordState = this._store.getRecordState(connectionID);
    const hasEdges = !!(
      field.getFieldByStorageKey(EDGES) ||
      (connectionData != null &&
        typeof connectionData === 'object' &&
        (connectionData: $FlowFixMe)[EDGES])
    );
    const path = RelayQueryPath.getPath(state.path, field, connectionID);
    // always update the store to ensure the value is present in the appropriate
    // data sink (records/queuedRecords), but only record an update if the value
    // changed.
    this._writer.putRecord(connectionID, null, path);
    this._writer.putLinkedRecordID(recordID, storageKey, connectionID);
    // record the create/update only if something changed
    if (connectionRecordState !== EXISTENT) {
      this.recordUpdate(recordID);
      this.recordCreate(connectionID);
    }

    if (hasEdges) {
      // Only create a range if `edges` field is present
      // Overwrite an existing range only if the new force index is greater
      if (
        !this._writer.hasRange(connectionID) ||
        (this._forceIndex &&
          this._forceIndex > this._store.getRangeForceIndex(connectionID))
      ) {
        this._writer.putRange(
          connectionID,
          field.getCallsWithValues(),
          this._forceIndex,
        );
      }
      // Update the connection record regardless of whether a range was written
      // to also handle cases like an empty edge range or updated page_info.
      this.recordUpdate(connectionID);
    }

    const connectionState = {
      nodeID: null,
      path,
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
    state: WriterState,
  ): void {
    const {EDGES, PAGE_INFO} = ConnectionInterface.get();

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
    state: WriterState,
  ): void {
    const {EDGES, NODE, PAGE_INFO} = ConnectionInterface.get();

    const {recordID: connectionID, responseData: connectionData} = state;
    invariant(
      typeof connectionData === 'object' && connectionData !== null,
      'RelayQueryWriter: Cannot write edges for malformed connection `%s` on ' +
        'record `%s`, expected the response to be an object.',
      connection.getDebugName(),
      connectionID,
    );
    const edgesData = connectionData[EDGES];

    // Validate response data.
    if (edgesData == null) {
      warning(
        false,
        'RelayQueryWriter: Cannot write edges for connection `%s` on record ' +
          '`%s`, expected a response for field `edges`.',
        connection.getDebugName(),
        connectionID,
      );
      return;
    }
    invariant(
      Array.isArray(edgesData),
      'RelayQueryWriter: Cannot write edges for connection `%s` on record ' +
        '`%s`, expected `edges` to be an array.',
      connection.getDebugName(),
      connectionID,
    );

    const rangeCalls = connection.getCallsWithValues();
    invariant(
      ConnectionInterface.hasRangeCalls(rangeCalls),
      'RelayQueryWriter: Cannot write edges for connection on record ' +
        '`%s` without `first`, `last`, or `find` argument.',
      connectionID,
    );
    const rangeInfo = this._store.getRangeMetadata(connectionID, rangeCalls);
    invariant(
      rangeInfo,
      'RelayQueryWriter: Expected a range to exist for connection field `%s` ' +
        'on record `%s`.',
      connection.getDebugName(),
      connectionID,
    );
    const fetchedEdgeIDs = [];
    const filteredEdges = rangeInfo.filteredEdges;
    let isUpdate = false;
    let nextIndex = 0;
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
        connection.getDebugName(),
        connectionID,
      );

      const nodeData = edgeData[NODE];
      if (nodeData == null) {
        return;
      }

      invariant(
        typeof nodeData === 'object',
        'RelayQueryWriter: Expected node to be an object for field `%s` on ' +
          'record `%s`.',
        connection.getDebugName(),
        connectionID,
      );

      // For consistency, edge IDs are calculated from the connection & node ID.
      // A node ID is only generated if the node does not have an id and
      // there is no existing edge.
      const prevEdge = filteredEdges[nextIndex++];
      const nodeID =
        (nodeData && nodeData[ID]) ||
        (prevEdge && this._store.getLinkedRecordID(prevEdge.edgeID, NODE)) ||
        generateClientID();
      // TODO: Flow: `nodeID` is `string`
      // $FlowFixMe(>=0.33.0)
      const edgeID = generateClientEdgeID(connectionID, nodeID);
      const path = RelayQueryPath.getPath(state.path, edges, edgeID);
      this.createRecordIfMissing(edges, edgeID, path, null);
      fetchedEdgeIDs.push(edgeID);

      // Write data for the edge, using `nodeID` as the id for direct descendant
      // `node` fields. This is necessary for `node`s that do not have an `id`,
      // which would cause the generated ID here to not match the ID generated
      // in `_writeLink`.
      this.traverse(edges, {
        /* $FlowFixMe(>=0.66.0) This comment suppresses an error found when Flow
         * v0.66 was deployed. To see the error delete this comment and
         * run Flow. */
        nodeID,
        path,
        recordID: edgeID,
        responseData: edgeData,
      });
      isUpdate = isUpdate || !prevEdge || edgeID !== prevEdge.edgeID;
    });

    const pageInfo =
      (connectionData[PAGE_INFO]: $FlowFixMe) ||
      ConnectionInterface.getDefaultPageInfo();
    this._writer.putRangeEdges(
      connectionID,
      rangeCalls,
      pageInfo,
      fetchedEdgeIDs,
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
    fieldData: mixed,
  ): void {
    const storageKey = field.getStorageKey();
    invariant(
      Array.isArray(fieldData),
      'RelayQueryWriter: Expected array data for field `%s` on record `%s`.',
      field.getDebugName(),
      recordID,
    );

    const prevLinkedIDs = this._store.getLinkedRecordIDs(recordID, storageKey);
    const nextLinkedIDs = [];
    const nextRecords = {};
    let isUpdate = false;
    let nextIndex = 0;
    fieldData.forEach(nextRecord => {
      // validate response data
      if (nextRecord == null) {
        return;
      }
      invariant(
        typeof nextRecord === 'object' && nextRecord,
        'RelayQueryWriter: Expected elements for plural field `%s` to be ' +
          'objects.',
        storageKey,
      );

      // Reuse existing generated IDs if the node does not have its own `id`.
      const prevLinkedID = prevLinkedIDs && prevLinkedIDs[nextIndex];
      const nextLinkedID = nextRecord[ID] || prevLinkedID || generateClientID();
      nextLinkedIDs.push(nextLinkedID);

      // $FlowFixMe(>=0.33.0)
      const path = RelayQueryPath.getPath(state.path, field, nextLinkedID);
      // $FlowFixMe(>=0.33.0)
      this.createRecordIfMissing(field, nextLinkedID, path, nextRecord);
      // $FlowFixMe(>=0.33.0)
      nextRecords[nextLinkedID] = {record: nextRecord, path};
      isUpdate = isUpdate || nextLinkedID !== prevLinkedID;
      nextIndex++;
    });
    // Write the linked records before traverse to prevent generating extraneous
    // client ids.
    /* $FlowFixMe(>=0.66.0) This comment suppresses an error found when Flow
     * v0.66 was deployed. To see the error delete this comment and run Flow. */
    this._writer.putLinkedRecordIDs(recordID, storageKey, nextLinkedIDs);
    nextLinkedIDs.forEach(nextLinkedID => {
      /* $FlowFixMe(>=0.54.0) This comment suppresses an
       * error found when Flow v0.54 was deployed. To see the error delete this
       * comment and run Flow. */
      const itemData = nextRecords[nextLinkedID];
      if (itemData) {
        this.traverse(field, {
          nodeID: null, // never propagate `nodeID` past the first linked field
          path: itemData.path,
          /* $FlowFixMe(>=0.66.0) This comment suppresses an error found when
           * Flow v0.66 was deployed. To see the error delete this comment and
           * run Flow. */
          recordID: nextLinkedID,
          responseData: itemData.record,
        });
      }
    });
    // Only broadcast a list-level change if a record was changed/added/removed
    if (
      isUpdate ||
      !prevLinkedIDs ||
      prevLinkedIDs.length !== nextLinkedIDs.length
    ) {
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
    fieldData: mixed,
  ): void {
    const {NODE} = ConnectionInterface.get();

    const {nodeID} = state;
    const storageKey = field.getStorageKey();
    invariant(
      typeof fieldData === 'object' && fieldData !== null,
      'RelayQueryWriter: Expected data for non-scalar field `%s` on record ' +
        '`%s` to be an object.',
      field.getDebugName(),
      recordID,
    );

    // Prefer the actual `id` if present, otherwise generate one (if an id
    // was already generated it is reused). `node`s within a connection are
    // a special case as the ID used here must match the one generated prior to
    // storing the parent `edge`.
    const prevLinkedID = this._store.getLinkedRecordID(recordID, storageKey);
    const nextLinkedID =
      (field.getSchemaName() === NODE && nodeID) ||
      fieldData[ID] ||
      prevLinkedID ||
      generateClientID();

    // $FlowFixMe(>=0.33.0)
    const path = RelayQueryPath.getPath(state.path, field, nextLinkedID);
    // $FlowFixMe(>=0.33.0)
    this.createRecordIfMissing(field, nextLinkedID, path, fieldData);
    // always update the store to ensure the value is present in the appropriate
    // data sink (record/queuedRecords), but only record an update if the value
    // changed.
    // $FlowFixMe(>=0.33.0)
    this._writer.putLinkedRecordID(recordID, storageKey, nextLinkedID);
    if (prevLinkedID !== nextLinkedID) {
      this.recordUpdate(recordID);
    }

    this.traverse(field, {
      nodeID: null,
      path,
      /* $FlowFixMe(>=0.66.0) This comment suppresses an error found when Flow
       * v0.66 was deployed. To see the error delete this comment and run Flow. */
      recordID: nextLinkedID,
      responseData: fieldData,
    });
  }
}

module.exports = RelayQueryWriter;
