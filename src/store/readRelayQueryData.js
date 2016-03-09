/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule readRelayQueryData
 * @flow
 * @typechecks
 */

'use strict';

const RelayFragmentPointer = require('RelayFragmentPointer');
import type GraphQLStoreRangeUtils from 'GraphQLStoreRangeUtils';
const RelayConnectionInterface = require('RelayConnectionInterface');
import type {DataID} from 'RelayInternalTypes';
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
const RelayQueryVisitor = require('RelayQueryVisitor');
const RelayRecord = require('RelayRecord');
const RelayRecordState = require('RelayRecordState');
const RelayRecordStatusMap = require('RelayRecordStatusMap');
import type RelayRecordStore from 'RelayRecordStore';
import type {RangeInfo} from 'RelayRecordStore';
import type RelayStoreData from 'RelayStoreData';
import type {
  StoreReaderData,
  StoreReaderOptions,
} from 'RelayTypes';

const callsFromGraphQL = require('callsFromGraphQL');
const callsToGraphQL = require('callsToGraphQL');
const invariant = require('invariant');
const isCompatibleRelayFragmentType = require('isCompatibleRelayFragmentType');
const validateRelayReadQuery = require('validateRelayReadQuery');

export type DataIDSet = {[key: string]: boolean};
export type StoreReaderResult = {
  data: ?StoreReaderData;
  dataIDs: DataIDSet;
};

type State = {
  componentDataID: ?DataID;
  data: mixed;
  isPartial: boolean;
  parent: ?RelayQuery.Field;
  rangeInfo: ?RangeInfo;
  seenDataIDs: DataIDSet;
  storeDataID: DataID;
};

const {EDGES, PAGE_INFO} = RelayConnectionInterface;
const METADATA_KEYS = [
  '__status__',
  '__resolvedFragmentMapGeneration__',
];

/**
 * @internal
 *
 * Retrieves data from the `RelayStore`.
 */
function readRelayQueryData(
  storeData: RelayStoreData,
  queryNode: RelayQuery.Node,
  dataID: DataID,
  options?: StoreReaderOptions
): StoreReaderResult {
  const reader = new RelayStoreReader(storeData, options);
  const data = reader.retrieveData(queryNode, dataID);

  // We validate only after retrieving the data, to give our `invariant`
  // checks below a chance to fail fast.
  validateRelayReadQuery(queryNode, options);

  return data;
}

class RelayStoreReader extends RelayQueryVisitor<State> {
  _rangeData: GraphQLStoreRangeUtils;
  _recordStore: RelayRecordStore;
  _storeData: RelayStoreData;
  _traverseFragmentReferences: boolean;
  _traverseGeneratedFields: boolean;

  constructor(
    storeData: RelayStoreData,
    options?: StoreReaderOptions
  ) {
    super();
    this._rangeData = storeData.getRangeData();
    this._recordStore = storeData.getQueuedStore();
    this._traverseFragmentReferences =
      (options && options.traverseFragmentReferences) || false;
    this._traverseGeneratedFields =
      (options && options.traverseGeneratedFields) || false;
  }

  /**
   * Runs `queryNode` against the data in `dataID` and returns the result.
   */
  retrieveData(
    queryNode: RelayQuery.Node,
    dataID: DataID
  ): StoreReaderResult {
    const result = {
      data: (undefined: $FlowIssue),
      dataIDs: {},
    };
    const rangeData = this._rangeData.parseRangeClientID(dataID);
    const status = this._recordStore.getRecordState(
      rangeData ? rangeData.dataID : dataID
    );
    if (status === RelayRecordState.EXISTENT) {
      const state = this._createState({
        componentDataID: null,
        data: undefined,
        isPartial: false,
        parent: null,
        rangeInfo: null,
        seenDataIDs: result.dataIDs,
        storeDataID: dataID,
      });
      this.visit(queryNode, state);
      result.data = state.data;
    } else if (status === RelayRecordState.NONEXISTENT) {
      result.data = null;
    }
    return result;
  }

  visit(node: RelayQuery.Node, state: State): ?RelayQuery.Node {
    const result = super.visit(node, state);
    this._updateMetadataFields(state);
    return result;
  }

  visitField(node: RelayQuery.Field, state: State): void {
    // Check for range client IDs (eg. `someID_first(25)`) and unpack if
    // present, overriding `state`.
    this._handleRangeInfo(node, state);

    if (node.canHaveSubselections() || node.isGenerated()) {
      // Make sure we return at least the __dataID__.
      getDataObject(state);
    }

    if (node.isGenerated() && !this._traverseGeneratedFields) {
      return;
    }
    const rangeInfo = state.rangeInfo;
    if (
      rangeInfo &&
      node.getSchemaName() === EDGES
    ) {
      this._readEdges(node, rangeInfo, state);
    } else if (
      rangeInfo &&
      node.getSchemaName() === PAGE_INFO
    ) {
      this._readPageInfo(node, rangeInfo, state);
    } else if (!node.canHaveSubselections()) {
      this._readScalar(node, state);
    } else if (node.isPlural()) {
      this._readPlural(node, state);
    } else if (node.isConnection()) {
      this._readConnection(node, state);
    } else {
      this._readLinkedField(node, state);
    }
    state.seenDataIDs[state.storeDataID] = true;
  }

  visitFragment(node: RelayQuery.Fragment, state: State): void {
    const dataID = getComponentDataID(state);
    if (node.isContainerFragment() && !this._traverseFragmentReferences) {
      state.seenDataIDs[dataID] = true;
      const data = getDataObject(state);
      RelayFragmentPointer.addFragment(data, node, dataID);
    } else if (isCompatibleRelayFragmentType(
      node,
      this._recordStore.getType(dataID)
    )) {
      this.traverse(node, state);
    }
  }

  _createState(state: State): State {
    // If we have a valid `dataID`, ensure that a record is created for it even
    // if we do not actually end up populating it with fields.
    const status = this._recordStore.getRecordState(state.storeDataID);
    if (status === RelayRecordState.EXISTENT) {
      getDataObject(state);
    }
    return state;
  }

  _readScalar(node: RelayQuery.Field, state: State): void {
    const storageKey = node.getStorageKey();
    const field = this._recordStore.getField(state.storeDataID, storageKey);
    if (field === undefined) {
      state.isPartial = true;
    } else if (field === null && !state.data) {
      state.data = null;
    } else {
      this._setDataValue(
        state,
        node.getApplicationName(),
        Array.isArray(field) ? field.slice() : field
      );
    }
  }

  _readPlural(node: RelayQuery.Field, state: State): void {
    const storageKey = node.getStorageKey();
    const dataIDs =
      this._recordStore.getLinkedRecordIDs(state.storeDataID, storageKey);
    if (dataIDs) {
      const applicationName = node.getApplicationName();
      const previousData = getDataValue(state, applicationName);
      const nextData = dataIDs.map((dataID, ii) => {
        let data;
        if (previousData instanceof Object) {
          data = previousData[ii];
        }
        const nextState = this._createState({
          componentDataID: null,
          data,
          isPartial: false,
          parent: node,
          rangeInfo: null,
          seenDataIDs: state.seenDataIDs,
          storeDataID: dataID,
        });
        node.getChildren().forEach(child => this.visit(child, nextState));
        if (nextState.isPartial) {
          state.isPartial = true;
        }
        return nextState.data;
      });
      this._setDataValue(state, applicationName, nextData);
    }
  }

  _readConnection(node: RelayQuery.Field, state: State): void {
    const applicationName = node.getApplicationName();
    const storageKey = node.getStorageKey();
    const calls = node.getCallsWithValues();
    const dataID = this._recordStore.getLinkedRecordID(
      state.storeDataID,
      storageKey
    );
    if (!dataID) {
      state.isPartial = true;
      return;
    }
    enforceRangeCalls(node);
    const metadata = this._recordStore.getRangeMetadata(dataID, calls);
    const nextState = this._createState({
      componentDataID: this._getConnectionClientID(node, dataID),
      data: getDataValue(state, applicationName),
      isPartial: false,
      parent: node,
      rangeInfo: metadata && calls.length ? metadata : null,
      seenDataIDs: state.seenDataIDs,
      storeDataID: dataID,
    });
    this.traverse(node, nextState);
    if (nextState.isPartial) {
      state.isPartial = true;
    }
    this._setDataValue(state, applicationName, nextState.data);
  }

  _readEdges(node: RelayQuery.Field, rangeInfo: RangeInfo, state: State): void {
    if (rangeInfo.diffCalls.length) {
      state.isPartial = true;
    }
    const previousData = getDataValue(state, EDGES);
    const edges = rangeInfo.filteredEdges.map((edgeData, ii) => {
      let data;
      if (previousData instanceof Object) {
        data = previousData[ii];
      }
      const nextState = this._createState({
        componentDataID: null,
        data,
        isPartial: false,
        parent: node,
        rangeInfo: null,
        seenDataIDs: state.seenDataIDs,
        storeDataID: edgeData.edgeID,
      });
      this.traverse(node, nextState);
      if (nextState.isPartial) {
        state.isPartial = true;
      }
      return nextState.data;
    });
    this._setDataValue(state, EDGES, edges);
  }

  _readPageInfo(
    node: RelayQuery.Field,
    rangeInfo: RangeInfo,
    state: State
  ): void {
    const {pageInfo} = rangeInfo;
    invariant(
      pageInfo,
      'readRelayQueryData(): Missing field, `%s`.',
      PAGE_INFO
    );
    if (rangeInfo.diffCalls.length) {
      state.isPartial = true;
    }
    const info = pageInfo; // for Flow
    let nextData;

    // Page info comes from the range metadata, so we do a custom traversal here
    // which is simpler than passing through page-info-related state as a hint
    // for the normal traversal.
    const read = child => {
      if (child instanceof RelayQuery.Fragment) {
        if (child.isContainerFragment() && !this._traverseFragmentReferences) {
          const dataID = getComponentDataID(state);
          nextData = nextData || {};
          RelayFragmentPointer.addFragment(
            nextData,
            child,
            dataID
          );
        } else {
          child.getChildren().forEach(read);
        }
      } else {
        const field: RelayQuery.Field = (child: any);
        if (!field.isGenerated() || this._traverseGeneratedFields) {
          nextData = nextData || {};
          nextData[field.getApplicationName()] = info[field.getStorageKey()];
        }
      }
    };
    node.getChildren().forEach(read);

    this._setDataValue(
      state,
      PAGE_INFO,
      nextData
    );
  }

  _readLinkedField(node: RelayQuery.Field, state: State): void {
    const storageKey = node.getStorageKey();
    const applicationName = node.getApplicationName();
    const dataID = this._recordStore.getLinkedRecordID(
      state.storeDataID, storageKey
    );
    if (dataID == null) {
      if (dataID === undefined) {
        state.isPartial = true;
      }
      this._setDataValue(state, applicationName, dataID);
      return;
    }
    const nextState = this._createState({
      componentDataID: null,
      data: getDataValue(state, applicationName),
      isPartial: false,
      parent: node,
      rangeInfo: null,
      seenDataIDs: state.seenDataIDs,
      storeDataID: dataID,
    });
    this.traverse(node, nextState);
    if (nextState.isPartial) {
      state.isPartial = true;
    }
    this._setDataValue(state, applicationName, nextState.data);
  }

  /**
   * Assigns `value` to the property of `state.data` identified by `key`.
   *
   * Pre-populates `state` with a suitable `data` object if needed, and copies
   * over any metadata fields, if present.
   */
  _setDataValue(state: State, key: string, value: mixed): void {
    const data = getDataObject(state); // ensure __dataID__
    if (value === undefined) {
      return;
    }
    data[key] = value;
  }

  _updateMetadataFields(state: State): void {
    const data = state.data;
    if (!(data instanceof Object)) {
      return;
    }
    // Copy metadata like `__resolvedFragmentMapGeneration__` and `__status__`.
    METADATA_KEYS.forEach(metadataKey => {
      const metadataValue = this._recordStore.getField(
        state.storeDataID,
        metadataKey
      );
      if (metadataValue != null) {
        data[metadataKey] = metadataValue;
      }
    });
    // Set the partial bit after metadata has been copied over.
    if (state.isPartial) {
      data.__status__ =
        RelayRecordStatusMap.setPartialStatus(data.__status__, true);
    }
  }

  /**
   * Obtains a client ID (eg. `someDataID_first(10)`) for the connection
   * identified by `connectionID`. If there are no range calls on the supplied
   * `node`, then a call-less connection ID (eg. `someDataID`) will be returned
   * instead.
   */
  _getConnectionClientID(
    node: RelayQuery.Field,
    connectionID: DataID
  ): DataID {
    const calls = node.getCallsWithValues();
    if (!RelayConnectionInterface.hasRangeCalls(calls)) {
      return connectionID;
    }
    return this._rangeData.getClientIDForRangeWithID(
      callsToGraphQL(calls),
      {},
      connectionID
    );
  }

  /**
   * Checks to see if we have a range client ID (eg. `someID_first(25)`), and if
   * so, unpacks the range metadata, stashing it into (and overriding) `state`.
   */
  _handleRangeInfo(node: RelayQuery.Field, state: State): void {
    const rangeData = this._rangeData.parseRangeClientID(
      state.storeDataID
    );
    if (rangeData != null) {
      state.componentDataID = state.storeDataID;
      state.storeDataID = rangeData.dataID;
      state.rangeInfo = this._recordStore.getRangeMetadata(
        state.storeDataID,
        callsFromGraphQL(rangeData.calls, rangeData.callValues)
      );
    }
  }
}

/**
 * Checks that `parent` either has range calls on it or does not contain either
 * `page_info` or `edges` fields. This enforcement intentionally transcends
 * traverseFragmentReferences boundaries.
 */
function enforceRangeCalls(parent: RelayQuery.Field): void {
  if (!parent.__hasValidatedConnectionCalls__) {
    const calls = parent.getCallsWithValues();
    if (!RelayConnectionInterface.hasRangeCalls(calls)) {
      rangeCallEnforcer.traverse(parent, parent);
    }
    parent.__hasValidatedConnectionCalls__ = true;
  }
}
class RelayRangeCallEnforcer extends RelayQueryVisitor<RelayQuery.Field> {
  visitField(
    node: RelayQuery.Field,
    parent: RelayQuery.Field
  ): void {
    const schemaName = node.getSchemaName();
    invariant(
      schemaName !== EDGES &&
      schemaName !== PAGE_INFO,
      'readRelayQueryData(): The field `%s` is a connection. Fields `%s` and ' +
      '`%s` cannot be fetched without a `first`, `last` or `find` argument.',
      parent.getApplicationName(),
      EDGES,
      PAGE_INFO
    );
  }
}
var rangeCallEnforcer = new RelayRangeCallEnforcer();

/**
 * Returns the component-specific DataID stored in `state`, falling back to the
 * generic "store" DataID.
 *
 * For most nodes, the generic "store" DataID can be used for both reading out
 * of the store and writing into the result object that will be passed back to
 * the component. For connections with range calls on them the "store" and
 * "component" ID will be different because the component needs a special
 * client-ID that encodes the range calls.
 */
function getComponentDataID(state: State): DataID {
  if (state.componentDataID != null) {
    return state.componentDataID;
  } else {
    return state.storeDataID;
  }
}

/**
 * Retrieves `state.data`, initializing it if necessary.
 */
function getDataObject(state: State): Object {
  let data = state.data;
  if (!data) {
    data = state.data = RelayRecord.create(getComponentDataID(state));
  }
  invariant(
    data instanceof Object,
    'readRelayQueryData(): Unable to read field on non-object.'
  );
  return data;
}

/**
 * Looks up the value identified by `key` in `state.data`.
 *
 * Pre-populates `state` with a suitable `data` objects if needed.
 */
function getDataValue(state: State, key: string): mixed {
  const data = getDataObject(state);
  return data[key];
}

module.exports = RelayProfiler.instrument(
  'readRelayQueryData',
  readRelayQueryData
);
