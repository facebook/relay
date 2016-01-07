/**
 * Copyright 2013-2015, Facebook, Inc.
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

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
import type GraphQLStoreRangeUtils from 'GraphQLStoreRangeUtils';
const RelayConnectionInterface = require('RelayConnectionInterface');
import type {DataID} from 'RelayInternalTypes';
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
const RelayQueryVisitor = require('RelayQueryVisitor');
const RelayRecordState = require('RelayRecordState');
import type RelayStoreData from 'RelayStoreData';
import type RelayRecordStore from 'RelayRecordStore';
import type {RangeInfo} from 'RelayRecordStore';
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
  parent: ?RelayQuery.Field;
  rangeInfo: ?RangeInfo;
  seenDataIDs: DataIDSet;
  storeDataID: DataID;
};

var {EDGES, PAGE_INFO} = RelayConnectionInterface;
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
  var reader = new RelayStoreReader(storeData, options);
  var data = reader.retrieveData(queryNode, dataID);

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
    var result = {
      data: (undefined: $FlowIssue),
      dataIDs: ({}: $FlowIssue),
    };
    var rangeData = this._rangeData.parseRangeClientID(dataID);
    var status = this._recordStore.getRecordState(
      rangeData ? rangeData.dataID : dataID
    );
    if (status === RelayRecordState.EXISTENT) {
      var state = {
        componentDataID: null,
        data: undefined,
        parent: null,
        rangeInfo: null,
        seenDataIDs: result.dataIDs,
        storeDataID: dataID,
      };
      this.visit(queryNode, state);
      result.data = state.data;
    } else if (status === RelayRecordState.NONEXISTENT) {
      result.data = null;
    }
    return result;
  }

  visitField(node: RelayQuery.Field, state: State): void {
    // Check for range client IDs (eg. `someID_first(25)`) and unpack if
    // present, overriding `state`.
    this._handleRangeInfo(node, state);

    if (!node.isScalar() || node.isGenerated()) {
      // Make sure we return at least the __dataID__.
      getDataObject(state);
    }

    if (node.isGenerated() && !this._traverseGeneratedFields) {
      return;
    }
    var rangeInfo = state.rangeInfo;
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
    } else if (node.isScalar()) {
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
      const fragmentPointer = new GraphQLFragmentPointer(
        node.isPlural() ? [dataID] : dataID,
        node
      );
      this._setDataValue(
        state,
        fragmentPointer.getFragment().getConcreteNodeHash(),
        fragmentPointer
      );
    } else if (isCompatibleRelayFragmentType(
      node,
      this._recordStore.getType(dataID)
    )) {
      this.traverse(node, state);
    }
  }

  _readScalar(node: RelayQuery.Field, state: State): void {
    var storageKey = node.getStorageKey();
    var field = this._recordStore.getField(state.storeDataID, storageKey);
    if (field === undefined) {
      return;
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
    var storageKey = node.getStorageKey();
    var dataIDs =
      this._recordStore.getLinkedRecordIDs(state.storeDataID, storageKey);
    if (dataIDs) {
      var applicationName = node.getApplicationName();
      var previousData = getDataValue(state, applicationName);
      var nextData = dataIDs.map((dataID, ii) => {
        var data;
        if (previousData instanceof Object) {
          data = previousData[ii];
        }
        var nextState = {
          componentDataID: null,
          data,
          parent: node,
          rangeInfo: null,
          seenDataIDs: state.seenDataIDs,
          storeDataID: dataID,
        };
        node.getChildren().forEach(child => this.visit(child, nextState));
        return nextState.data;
      });
      this._setDataValue(state, applicationName, nextData);
    }
  }

  _readConnection(node: RelayQuery.Field, state: State): void {
    var applicationName = node.getApplicationName();
    var storageKey = node.getStorageKey();
    var calls = node.getCallsWithValues();
    var dataID = this._recordStore.getLinkedRecordID(
      state.storeDataID,
      storageKey
    );
    if (!dataID) {
      return;
    }
    enforceRangeCalls(node);
    var metadata = this._recordStore.getRangeMetadata(dataID, calls);
    var nextState = {
      componentDataID: this._getConnectionClientID(node, dataID),
      data: getDataValue(state, applicationName),
      parent: node,
      rangeInfo: metadata && calls.length ? metadata : null,
      seenDataIDs: state.seenDataIDs,
      storeDataID: dataID,
    };
    this.traverse(node, nextState);
    this._setDataValue(state, applicationName, nextState.data);
  }

  _readEdges(node: RelayQuery.Field, rangeInfo: RangeInfo, state: State): void {
    var previousData = getDataValue(state, EDGES);
    var edges = rangeInfo.filteredEdges.map((edgeData, ii) => {
      var data;
      if (previousData instanceof Object) {
        data = previousData[ii];
      }
      var nextState = {
        componentDataID: null,
        data,
        parent: node,
        rangeInfo: null,
        seenDataIDs: state.seenDataIDs,
        storeDataID: edgeData.edgeID,
      };
      this.traverse(node, nextState);
      return nextState.data;
    });
    this._setDataValue(state, EDGES, edges);
  }

  _readPageInfo(
    node: RelayQuery.Field,
    rangeInfo: RangeInfo,
    state: State
  ): void {
    var {pageInfo} = rangeInfo;
    invariant(
      pageInfo,
      'readRelayQueryData(): Missing field, `%s`.',
      PAGE_INFO
    );
    var info = pageInfo; // for Flow
    var nextData;

    // Page info comes from the range metadata, so we do a custom traversal here
    // which is simpler than passing through page-info-related state as a hint
    // for the normal traversal.
    var read = child => {
      if (child instanceof RelayQuery.Fragment) {
        if (child.isContainerFragment() && !this._traverseFragmentReferences) {
          var fragmentPointer = new GraphQLFragmentPointer(
            getComponentDataID(state),
            child
          );
          nextData = nextData || {};
          var fragmentHash =
            fragmentPointer.getFragment().getConcreteNodeHash();
          nextData[fragmentHash] = fragmentPointer;
        } else {
          child.getChildren().forEach(read);
        }
      } else {
        var field: RelayQuery.Field = (child: any);
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
    var storageKey = node.getStorageKey();
    var applicationName = node.getApplicationName();
    var dataID = this._recordStore.getLinkedRecordID(
      state.storeDataID, storageKey
    );
    if (dataID == null) {
      this._setDataValue(state, applicationName, dataID);
      return;
    }
    var nextState = {
      componentDataID: null,
      data: getDataValue(state, applicationName),
      parent: node,
      rangeInfo: null,
      seenDataIDs: state.seenDataIDs,
      storeDataID: dataID,
    };
    var status = this._recordStore.getRecordState(dataID);
    if (status === RelayRecordState.EXISTENT) {
      // Make sure we return at least the __dataID__.
      getDataObject(nextState);
    }
    this.traverse(node, nextState);
    this._setDataValue(state, applicationName, nextState.data);
  }

  /**
   * Assigns `value` to the property of `state.data` identified by `key`.
   *
   * Pre-populates `state` with a suitable `data` object if needed, and copies
   * over any metadata fields, if present.
   */
  _setDataValue(state: State, key: string, value: mixed): void {
    var data = getDataObject(state); // ensure __dataID__
    if (value === undefined) {
      return;
    }
    data[key] = value;

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
    var calls = node.getCallsWithValues();
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
    var rangeData = this._rangeData.parseRangeClientID(
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
    var calls = parent.getCallsWithValues();
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
    var schemaName = node.getSchemaName();
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
  var data = state.data;
  if (!data) {
    var pointer = GraphQLStoreDataHandler.createPointerWithID(
      getComponentDataID(state)
    );
    data = state.data = pointer;
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
  var data = getDataObject(state);
  return data[key];
}

module.exports = RelayProfiler.instrument(
  'readRelayQueryData',
  readRelayQueryData
);
