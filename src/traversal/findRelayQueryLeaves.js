/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule findRelayQueryLeaves
 * @flow
 * @typechecks
 */

'use strict';

const RelayConnectionInterface = require('RelayConnectionInterface');
import type {Call, DataID, Records} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type RelayQueryPath from 'RelayQueryPath';
const RelayQueryVisitor = require('RelayQueryVisitor');
const RelayRecordState = require('RelayRecordState');
import type RelayRecordStore from 'RelayRecordStore';
import type {RangeInfo} from 'RelayRecordStore';

const isCompatibleRelayFragmentType = require('isCompatibleRelayFragmentType');

export type PendingItem = {
  node: RelayQuery.Node;
  path: RelayQueryPath;
  rangeCalls: ?Array<Call>;
};

export type PendingNodes = {[key: string]: Array<PendingItem>};
export type FinderResult = {
  missingData: boolean;
  pendingNodes: PendingNodes;
};

type FinderState = {
  dataID: DataID;
  missingData: boolean;
  path: RelayQueryPath;
  rangeCalls: ?Array<Call>;
  rangeInfo: ?RangeInfo;
};

const {EDGES, PAGE_INFO} = RelayConnectionInterface;

/**
 * @internal
 *
 * Traverses a query and data in the record store to determine if there are
 * additional nodes that needs to be read from disk cache. If it  ncounters
 * a node that is not in `cachedRecords`, it will queued that node by adding it
 * into the `pendingNodes` list. If it encounters a node that was already read
 * but still missing data, then it will short circuit the evaluation since
 * there is no way for us to satisfy this query even with additional data from
 * disk cache and resturn
 */
function findRelayQueryLeaves(
  store: RelayRecordStore,
  cachedRecords: Records,
  queryNode: RelayQuery.Node,
  dataID: DataID,
  path: RelayQueryPath,
  rangeCalls: ?Array<Call>
): FinderResult {
  var finder = new RelayQueryLeavesFinder(store, cachedRecords);

  var state = {
    dataID,
    missingData: false,
    path,
    rangeCalls,
    rangeInfo: undefined,
  };
  finder.visit(queryNode, state);
  return {
    missingData: state.missingData,
    pendingNodes: finder.getPendingNodes(),
  };
}

class RelayQueryLeavesFinder extends RelayQueryVisitor<FinderState> {
  _cachedRecords: Records;
  _pendingNodes: PendingNodes;
  _store: RelayRecordStore;

  constructor(store: RelayRecordStore, cachedRecords: Records = {}) {
    super();
    this._store = store;
    this._cachedRecords = cachedRecords;
    this._pendingNodes = {};
  }

  getPendingNodes(): PendingNodes {
    return this._pendingNodes;
  }

  /**
   * Skip visiting children if missingData is already false.
   */
  traverse<Tn: RelayQuery.Node>(
    node: Tn,
    state: FinderState
  ): ?Tn {
    var children = node.getChildren();
    for (var ii = 0; ii < children.length; ii++) {
      if (state.missingData) {
        return;
      }
      this.visit(children[ii], state);
    }
  }

  visitFragment(
    fragment: RelayQuery.Fragment,
    state: FinderState
  ): void {
    var dataID = state.dataID;
    var recordState = this._store.getRecordState(dataID);
    if (recordState === RelayRecordState.UNKNOWN) {
      this._handleMissingData(fragment, state);
      return;
    } else if (recordState === RelayRecordState.NONEXISTENT) {
      return;
    }

    if (isCompatibleRelayFragmentType(
      fragment,
      this._store.getType(dataID)
    )) {
      this.traverse(fragment, state);
    }
  }

  visitField(
    field: RelayQuery.Field,
    state: FinderState
  ): void {
    var dataID = state.dataID;
    var recordState = this._store.getRecordState(dataID);
    if (recordState === RelayRecordState.UNKNOWN) {
      this._handleMissingData(field, state);
      return;
    } else if (recordState === RelayRecordState.NONEXISTENT) {
      return;
    }

    if (state.rangeCalls && !state.rangeInfo) {
      var metadata = this._store.getRangeMetadata(dataID, state.rangeCalls);
      if (metadata) {
        state.rangeInfo = metadata;
      }
    }
    var rangeInfo = state.rangeInfo;
    if (rangeInfo && field.getSchemaName() === EDGES) {
      this._visitEdges(field, state);
    } else if (rangeInfo && field.getSchemaName() === PAGE_INFO) {
      this._visitPageInfo(field, state);
    } else if (field.isScalar()) {
      this._visitScalar(field, state);
    } else if (field.isPlural()) {
      this._visitPlural(field, state);
    } else if (field.isConnection()) {
      this._visitConnection(field, state);
    } else {
      this._visitLinkedField(field, state);
    }
  }

  _visitScalar(field: RelayQuery.Field, state: FinderState): void {
    var fieldData = this._store.getField(state.dataID, field.getStorageKey());
    if (fieldData === undefined) {
      this._handleMissingData(field, state);
    }
  }

  _visitPlural(field: RelayQuery.Field, state: FinderState): void {
    var dataIDs = this._store.getLinkedRecordIDs(
      state.dataID,
      field.getStorageKey()
    );
    if (dataIDs === undefined) {
      this._handleMissingData(field, state);
      return;
    }
    if (dataIDs) {
      for (var ii = 0; ii < dataIDs.length; ii++) {
        if (state.missingData) {
          break;
        }
        var nextState = {
          dataID: dataIDs[ii],
          missingData: false,
          path: state.path.getPath(field, dataIDs[ii]),
          rangeCalls: undefined,
          rangeInfo: undefined,
        };
        this.traverse(field, nextState);
        state.missingData = nextState.missingData;
      }
    }
  }

  _visitConnection(field: RelayQuery.Field, state: FinderState): void {
    var calls = field.getCallsWithValues();
    var dataID = this._store.getLinkedRecordID(
      state.dataID,
      field.getStorageKey()
    );
    if (dataID === undefined) {
      this._handleMissingData(field, state);
      return;
    }
    if (dataID) {
      var nextState: FinderState = {
        dataID,
        missingData: false,
        path: state.path.getPath(field, dataID),
        rangeCalls: calls,
        rangeInfo: null,
      };
      var metadata = this._store.getRangeMetadata(dataID, calls);
      if (metadata) {
        nextState.rangeInfo = metadata;
      }
      this.traverse(field, nextState);
      state.missingData = state.missingData || nextState.missingData;
    }
  }

  _visitEdges(field: RelayQuery.Field, state: FinderState): void {
    var rangeInfo = state.rangeInfo;
    // Doesn't have  `__range__` loaded
    if (!rangeInfo) {
      this._handleMissingData(field, state);
      return;
    }
    if (rangeInfo.diffCalls.length) {
      state.missingData = true;
      return;
    }
    var edgeIDs = rangeInfo.requestedEdgeIDs;
    for (var ii = 0; ii < edgeIDs.length; ii++) {
      if (state.missingData) {
        break;
      }
      var nextState = {
        dataID: edgeIDs[ii],
        missingData: false,
        path: state.path.getPath(field, edgeIDs[ii]),
        rangeCalls: undefined,
        rangeInfo: undefined,
      };
      this.traverse(field, nextState);
      state.missingData = state.missingData || nextState.missingData;
    }
  }

  _visitPageInfo(field: RelayQuery.Field, state: FinderState): void {
    const {rangeInfo} = state;
    if (!rangeInfo || !rangeInfo.pageInfo) {
      this._handleMissingData(field, state);
      return;
    }
  }

  _visitLinkedField(field: RelayQuery.Field, state: FinderState): void {
    var dataID =
      this._store.getLinkedRecordID(state.dataID, field.getStorageKey());
    if (dataID === undefined) {
      this._handleMissingData(field, state);
      return;
    }
    if (dataID) {
      var nextState = {
        dataID,
        missingData: false,
        path: state.path.getPath(field, dataID),
        rangeCalls: undefined,
        rangeInfo: undefined,
      };
      this.traverse(field, nextState);
      state.missingData = state.missingData || nextState.missingData;
    }
  }

  _handleMissingData(node: RelayQuery.Node, state: FinderState): void {
    var dataID = state.dataID;
    if (this._cachedRecords.hasOwnProperty(dataID)) {
      // We have read data for this `dataID` from disk, but
      // we still don't have data for the relevant field.
      state.missingData = true;
    } else {
      // Store node in `pendingNodes` because we have not read data for
      // this `dataID` from disk.
      this._pendingNodes[dataID] = this._pendingNodes[dataID] || [];
      this._pendingNodes[dataID].push({
        node,
        path: state.path,
        rangeCalls: state.rangeCalls,
      });
    }
  }
}

module.exports = findRelayQueryLeaves;
