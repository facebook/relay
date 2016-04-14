/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule transformPayloadToRelayGraphMode
 * @flow
 * @typechecks
 */

'use strict';

const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayGraphModeInterface = require('RelayGraphModeInterface');
import type {
  GraphModePayload,
  GraphRecord,
  GraphReference,
  PutEdgesOperation,
  PutNodesOperation,
  PutRootOperation,
} from 'RelayGraphModeInterface';
import type {DataID, QueryPayload} from 'RelayInternalTypes';
const RelayNodeInterface = require('RelayNodeInterface');
const RelayQuery = require('RelayQuery');
import type {QueryPath} from 'RelayQueryPath';
const RelayQueryPath = require('RelayQueryPath');
import type RelayQueryTracker from 'RelayQueryTracker';
const RelayQueryVisitor = require('RelayQueryVisitor');
const RelayRecord = require('RelayRecord');
import type RelayRecordStore from 'RelayRecordStore';

const base62 = require('base62');
const invariant = require('invariant');
const isCompatibleRelayFragmentType = require('isCompatibleRelayFragmentType');
const warning = require('warning');

const {EDGES, PAGE_INFO} = RelayConnectionInterface;
const {
  CACHE_KEY,
  DEFERRED_FRAGMENTS,
  FRAGMENTS,
  REF_KEY,
} = RelayGraphModeInterface;
const {ANY_TYPE, ID, TYPENAME} = RelayNodeInterface;
const {PATH} = RelayRecord.MetadataKey;

// $FlowIssue: disjoint unions don't seem to be working to import this type.
// Should be:
//   import type {GraphOperation} from 'RelayGraphModeInterface';
type GraphOperation =
  PutEdgesOperation |
  PutNodesOperation |
  PutRootOperation;

type PayloadState = {
  currentRecord: GraphRecord;
  path: QueryPath;
  payloadRecord: PayloadRecord;
};
type PayloadRecord = {[storageKey: string]: ?PayloadValue};
type PayloadScalar = (
  boolean |
  number |
  string |
  PayloadRecord
);
type PayloadValue = (
  PayloadScalar |
  Array<?PayloadScalar>
);
type TransformOptions = {
  updateTrackedQueries?: boolean;
};

/**
 * @internal
 *
 * Transforms a query and "tree" payload into a GraphMode payload.
 */
function transformPayloadToRelayGraphMode(
  store: RelayRecordStore,
  queryTracker: RelayQueryTracker,
  root: RelayQuery.Root,
  payload: QueryPayload,
  options: ?TransformOptions
): GraphModePayload {
  const transformer = new RelayPayloadTransformer(store, queryTracker, options);
  transformer.transform(root, payload);
  return transformer.getPayload();
}

class RelayPayloadTransformer extends RelayQueryVisitor<PayloadState> {
  _nextKey: number;
  _nodes: {[dataID: DataID]: GraphRecord};
  _operations: Array<GraphOperation>;
  _queryTracker: RelayQueryTracker;
  _store: RelayRecordStore;
  _updateTrackedQueries: boolean;

  constructor(
    store: RelayRecordStore,
    queryTracker: RelayQueryTracker,
    options: ?TransformOptions
  ) {
    super();
    this._nextKey = 0;
    this._nodes = {};
    this._operations = [];
    this._queryTracker = queryTracker;
    this._store = store;
    this._updateTrackedQueries = !!(options && options.updateTrackedQueries);
  }

  getPayload(): GraphModePayload {
    const nodes = this._nodes;
    if (!Object.keys(nodes).length) {
      return this._operations;
    }
    return [
      {op: 'putNodes', nodes},
      ...this._operations,
    ];
  }

  transform(
    root: RelayQuery.Root,
    payload: QueryPayload
  ) {
    RelayNodeInterface.getResultsFromPayload(root, payload)
      .forEach(({result, rootCallInfo}) => {
        if (!rootCallInfo) {
          return;
        }
        const {storageKey, identifyingArgValue} = rootCallInfo;
        const record = this._writeRecord(
          RelayQueryPath.create(root),
          root,
          result
        );
        this._operations.unshift({
          op: 'putRoot',
          field: storageKey,
          identifier: identifyingArgValue,
          root: record,
        });
      });
  }

  _writeRecord(
    parentPath: QueryPath,
    node: RelayQuery.Field | RelayQuery.Fragment | RelayQuery.Root,
    payloadRecord: ?PayloadRecord,
    clientRecord?: ?PayloadRecord // TODO: should be `?GraphRecord`
  ): ?(GraphRecord | GraphReference) {
    if (payloadRecord == null) {
      return payloadRecord;
    }
    const id = payloadRecord[ID];
    const path = node instanceof RelayQuery.Root ?
      RelayQueryPath.create(node) :
      RelayQueryPath.getPath(parentPath, node, id);
    if (id != null) {
      const currentRecord = this._getOrCreateRecord(id);
      const typeName = this._getRecordTypeName(node, id, payloadRecord);
      if (typeName != null) {
        currentRecord[TYPENAME] = typeName;
      }
      this._recordTrackedQueries(id, node);
      this.traverse(node, {
        currentRecord,
        path,
        payloadRecord,
      });
      return {[REF_KEY]: id};
    } else {
      const currentRecord: GraphRecord = ((clientRecord || {}): any);
      // TODO #10481948: Construct paths lazily
      (currentRecord: any)[PATH] = path;
      const typeName = this._getRecordTypeName(node, null, payloadRecord);
      if (typeName != null) {
        currentRecord[TYPENAME] = typeName;
      }
      this.traverse(node, {
        currentRecord,
        path,
        payloadRecord,
      });
      return currentRecord;
    }
  }

  _getOrCreateRecord(
    dataID: DataID
  ): GraphRecord {
    let record: ?GraphRecord = this._nodes[dataID];
    if (!record) {
      // $FlowIssue: This is a valid `GraphRecord` but is being type-checked as
      // a `GraphReference` for some reason.
      record = this._nodes[dataID] = ({
        [ID]: dataID,
      }: $FlowIssue);
    }
    return record;
  }

  _getRecordTypeName(
    node: RelayQuery.Node,
    dataID: ?DataID,
    payload: PayloadRecord
  ): ?string {
    let typeName = payload[TYPENAME];
    if (typeName == null) {
      if (!node.isAbstract()) {
        typeName = node.getType();
      } else if (dataID != null) {
        typeName = this._store.getType(dataID);
      }
    }
    warning(
      typeName && typeName !== ANY_TYPE,
      'transformPayloadToRelayGraphMode(): Could not find a type name for ' +
      'record `%s`.',
      dataID
    );
    return typeName;
  }

  _recordTrackedQueries(
    dataID: DataID,
    node: RelayQuery.Node
  ): void {
    if (
      this._updateTrackedQueries ||
      this._store.getRecordState(dataID) !== 'EXISTENT'
    ) {
      const path = node instanceof RelayQuery.Root ?
        RelayQueryPath.create(node) :
        null;
      this._queryTracker.trackNodeForID(node, dataID, path);
    }
  }


  _generateCacheKey(): string {
    return base62(this._nextKey++);
  }

  visitFragment(
    fragment: RelayQuery.Fragment,
    state: PayloadState
  ): void {
    const {currentRecord} = state;
    const typeName = currentRecord[TYPENAME];
    if (fragment.isDeferred()) {
      const fragments = (currentRecord: any)[DEFERRED_FRAGMENTS] =
        (currentRecord: any)[DEFERRED_FRAGMENTS] || {};
      fragments[fragment.getCompositeHash()] = true;
    }
    if (isCompatibleRelayFragmentType(fragment, typeName)) {
      if (fragment.isTrackingEnabled()) {
        const fragments = (currentRecord: any)[FRAGMENTS] =
          (currentRecord: any)[FRAGMENTS] || {};
        fragments[fragment.getCompositeHash()] = true;
      }
      this.traverse(fragment, {
        ...state,
        path: RelayQueryPath.getPath(
          state.path,
          fragment,
          currentRecord[ID]
        ),
      });
    }
  }

  visitField(
    field: RelayQuery.Field,
    state: PayloadState
  ): void {
    const {currentRecord, payloadRecord} = state;

    const fieldData = payloadRecord[field.getSerializationKey()];
    if (fieldData == null) {
      // Treat undefined as null
      currentRecord[field.getStorageKey()] = null;
    } else if (!field.canHaveSubselections()) {
      invariant(
        typeof fieldData !== 'object' || Array.isArray(fieldData),
        'transformPayloadToRelayGraphMode(): Expected a scalar for field ' +
        '`%s`, got `%s`.',
        field.getSchemaName(),
        fieldData
      );
      currentRecord[field.getStorageKey()] = fieldData;
    } else if (field.isConnection()) {
      invariant(
        typeof fieldData === 'object' && !Array.isArray(fieldData),
        'transformPayloadToRelayGraphMode(): Expected data for connection ' +
        '`%s` to be an object, got `%s`.',
        field.getSchemaName(),
        fieldData
      );
      this._transformConnection(field, state, fieldData);
    } else if (field.isPlural()) {
      invariant(
        Array.isArray(fieldData),
        'transformPayloadToRelayGraphMode(): Expected data for plural field ' +
        'to be an array, got `%s`.',
        field.getSchemaName(),
        fieldData
      );
      this._transformPluralLink(field, state, fieldData);
    } else {
      invariant(
        typeof fieldData === 'object' && !Array.isArray(fieldData),
        'transformPayloadToRelayGraphMode(): Expected data for field ' +
        '`%s` to be an object, got `%s`.',
        field.getSchemaName(),
        fieldData
      );
      this._transformLink(field, state, fieldData);
    }
  }

  _transformConnection(
    field: RelayQuery.Field,
    state: PayloadState,
    fieldData: PayloadRecord
  ): void {
    const {currentRecord} = state;
    const path = RelayQueryPath.getPath(
      state.path,
      field
    );
    const storageKey = field.getStorageKey();
    const clientRecord: GraphRecord = currentRecord[storageKey] =
      ((currentRecord[storageKey] || {}): any);
    (clientRecord: any)[PATH] = path;
    clientRecord[TYPENAME] =
      this._getRecordTypeName(field, null, fieldData);
    invariant(
      clientRecord == null ||
      (typeof clientRecord === 'object' && !Array.isArray(clientRecord)),
      'transformPayloadToRelayGraphMode(): Expected data for field ' +
      '`%s` to be an objects, got `%s`.',
      field.getSchemaName(),
      clientRecord
    );
    this._traverseConnection(field, field, {
      currentRecord: clientRecord,
      path,
      payloadRecord: fieldData,
    });
  }

  _traverseConnection(
    connectionField: RelayQuery.Field, // the parent connection
    parentNode: RelayQuery.Node, // the connection or an intermediary fragment
    state: PayloadRecord
  ): void {
    parentNode.getChildren().forEach(child => {
      if (child instanceof RelayQuery.Field) {
        if (child.getSchemaName() === EDGES) {
          this._transformEdges(connectionField, child, state);
        } else if (child.getSchemaName() !== PAGE_INFO) {
          // Page info is handled by the range
          // Otherwise, write metadata fields normally (ex: `count`)
          this.visit(child, state);
        }
      } else {
        // Fragment case, recurse keeping track of parent connection
        this._traverseConnection(connectionField, child, state);
      }
    });
  }

  _transformEdges(
    connectionField: RelayQuery.Field,
    edgesField: RelayQuery.Field,
    state: PayloadState
  ): void {
    const {currentRecord, payloadRecord} = state;
    const cacheKey = currentRecord[CACHE_KEY] =
      currentRecord[CACHE_KEY] || this._generateCacheKey();
    const edgesData = payloadRecord[EDGES];
    const pageInfo = payloadRecord[PAGE_INFO];

    invariant(
      typeof cacheKey === 'string',
      'transformPayloadToRelayGraphMode(): Expected cache key for connection ' +
      'field `%s` to be a string provided by GraphQL/Relay. Note that `%s` ' +
      'is a reserved word.',
      connectionField.getSchemaName(),
      CACHE_KEY
    );
    invariant(
      edgesData == null || Array.isArray(edgesData),
      'transformPayloadToRelayGraphMode(): Expected edges for field `%s` to ' +
      'be an array, got `%s`.',
      connectionField.getSchemaName(),
      edgesData
    );
    invariant(
      pageInfo == null ||
      (typeof pageInfo === 'object' && !Array.isArray(pageInfo)),
      'transformPayloadToRelayGraphMode(): Expected %s for field `%s` to be ' +
      'an object, got `%s`.',
      PAGE_INFO,
      connectionField.getSchemaName(),
      pageInfo
    );
    const edgeRecords = edgesData.map(edgeItem => this._writeRecord(
      state.path,
      edgesField,
      edgeItem
    ));
    // Inner ranges may reference cache keys defined in their parents. Using
    // `unshift` here ensures that parent edges are processed before children.
    this._operations.unshift({
      op: 'putEdges',
      args: connectionField.getCallsWithValues(),
      edges: edgeRecords,
      pageInfo,
      range: {
        [CACHE_KEY]: cacheKey,
      },
    });
  }

  _transformPluralLink(
    field: RelayQuery.Field,
    state: PayloadState,
    fieldData: Array<?PayloadScalar>
  ): void {
    const {currentRecord} = state;
    const storageKey = field.getStorageKey();

    const linkedRecords = currentRecord[storageKey];
    invariant(
      linkedRecords == null || Array.isArray(linkedRecords),
      'transformPayloadToRelayGraphMode(): Expected data for field `%s` to ' +
      'always have array data, got `%s`.',
      field.getSchemaName(),
      linkedRecords
    );
    const records = fieldData.map((fieldItem, ii) => {
      const clientRecord = linkedRecords && linkedRecords[ii];
      invariant(
        clientRecord == null || typeof clientRecord === 'object',
        'transformPayloadToRelayGraphMode(): Expected array items for field ' +
        '`%s` to be objects, got `%s` at index `%s`.',
        field.getSchemaName(),
        clientRecord,
        ii
      );
      invariant(
        fieldItem == null ||
        (typeof fieldItem === 'object' && !Array.isArray(fieldItem)),
        'transformPayloadToRelayGraphMode(): Expected array items for field ' +
        '`%s` to be objects, got `%s` at index `%s`.',
        field.getSchemaName(),
        fieldItem,
        ii
      );
      return this._writeRecord(
        state.path,
        field,
        fieldItem,
        clientRecord
      );
    });
    currentRecord[storageKey] = records;
  }

  _transformLink(
    field: RelayQuery.Field,
    state: PayloadState,
    fieldData: PayloadRecord
  ): void {
    const {currentRecord} = state;
    const storageKey = field.getStorageKey();
    const clientRecord = currentRecord[storageKey];
    invariant(
      clientRecord == null ||
      (typeof clientRecord === 'object' && !Array.isArray(clientRecord)),
      'transformPayloadToRelayGraphMode(): Expected data for field ' +
      '`%s` to be an objects, got `%s`.',
      field.getSchemaName(),
      clientRecord
    );
    const record = this._writeRecord(
      state.path,
      field,
      fieldData,
      clientRecord
    );
    currentRecord[storageKey] = record;
  }
}

module.exports = transformPayloadToRelayGraphMode;
