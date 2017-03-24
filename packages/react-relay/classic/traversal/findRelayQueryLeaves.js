/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule findRelayQueryLeaves
 * @flow
 */

'use strict';

const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayProfiler = require('RelayProfiler');
const RelayQueryPath = require('RelayQueryPath');
const RelayQueryVisitor = require('RelayQueryVisitor');
const RelayRecordState = require('RelayRecordState');

const isCompatibleRelayFragmentType = require('isCompatibleRelayFragmentType');

import type {
  Call,
  DataID,
} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type {QueryPath} from 'RelayQueryPath';
import type {RecordMap} from 'RelayRecord';
import type RelayRecordStore from 'RelayRecordStore';
import type {RangeInfo} from 'RelayRecordStore';

type FinderState = {
  dataID: DataID,
  missingData: boolean,
  path: QueryPath,
  rangeCalls: ?Array<Call>,
  rangeInfo: ?RangeInfo,
};

export type FinderResult = {
  missingData: boolean,
  pendingNodeStates: Array<NodeState>,
};
export type NodeState = {
  dataID: ?DataID,
  node: RelayQuery.Node,
  path: QueryPath,
  rangeCalls: ?Array<Call>,
};

const {EDGES, PAGE_INFO} = RelayConnectionInterface;

/**
 * @internal
 *
 * Traverses a query and data in the record store to determine if there are
 * additional nodes that needs to be read from disk cache. If it  ncounters
 * a node that is not in `cachedRecords`, it will queued that node by adding it
 * into the `pendingNodeStates` list. If it encounters a node that was already read
 * but still missing data, then it will short circuit the evaluation since
 * there is no way for us to satisfy this query even with additional data from
 * disk cache and resturn
 */
function findRelayQueryLeaves(
  store: RelayRecordStore,
  cachedRecords: RecordMap,
  queryNode: RelayQuery.Node,
  dataID: DataID,
  path: QueryPath,
  rangeCalls: ?Array<Call>
): FinderResult {
  const finder = new RelayQueryLeavesFinder(store, cachedRecords);

  const state = {
    dataID,
    missingData: false,
    path,
    rangeCalls,
    rangeInfo: undefined,
  };
  finder.visit(queryNode, state);
  return {
    missingData: state.missingData,
    pendingNodeStates: finder.getPendingNodeStates(),
  };
}

class RelayQueryLeavesFinder extends RelayQueryVisitor<FinderState> {
  _cachedRecords: RecordMap;
  _pendingNodeStates: Array<NodeState>;
  _store: RelayRecordStore;

  constructor(store: RelayRecordStore, cachedRecords: RecordMap = {}) {
    super();
    this._store = store;
    this._cachedRecords = cachedRecords;
    this._pendingNodeStates = [];
  }

  getPendingNodeStates(): Array<NodeState> {
    return this._pendingNodeStates;
  }

  /**
   * Skip visiting children if missingData is already false.
   */
  traverse<Tn: RelayQuery.Node>(
    node: Tn,
    state: FinderState
  ): ?Tn {
    const children = node.getChildren();
    for (let ii = 0; ii < children.length; ii++) {
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
    const dataID = state.dataID;
    const recordState = this._store.getRecordState(dataID);
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
    const dataID = state.dataID;
    const recordState = this._store.getRecordState(dataID);
    if (recordState === RelayRecordState.UNKNOWN) {
      this._handleMissingData(field, state);
      return;
    } else if (recordState === RelayRecordState.NONEXISTENT) {
      return;
    }

    if (state.rangeCalls && !state.rangeInfo) {
      const metadata = this._store.getRangeMetadata(dataID, state.rangeCalls);
      if (metadata) {
        state.rangeInfo = metadata;
      }
    }
    const rangeInfo = state.rangeInfo;
    if (rangeInfo && field.getSchemaName() === EDGES) {
      this._visitEdges(field, state);
    } else if (rangeInfo && field.getSchemaName() === PAGE_INFO) {
      this._visitPageInfo(field, state);
    } else if (!field.canHaveSubselections()) {
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
    const fieldData = this._store.getField(state.dataID, field.getStorageKey());
    if (fieldData === undefined) {
      this._handleMissingData(field, state);
    }
  }

  _visitPlural(field: RelayQuery.Field, state: FinderState): void {
    const dataIDs = this._store.getLinkedRecordIDs(
      state.dataID,
      field.getStorageKey()
    );
    if (dataIDs === undefined) {
      this._handleMissingData(field, state);
      return;
    }
    if (dataIDs) {
      for (let ii = 0; ii < dataIDs.length; ii++) {
        if (state.missingData) {
          break;
        }
        const nextState = {
          dataID: dataIDs[ii],
          missingData: false,
          path: RelayQueryPath.getPath(state.path, field, dataIDs[ii]),
          rangeCalls: undefined,
          rangeInfo: undefined,
        };
        this.traverse(field, nextState);
        state.missingData = nextState.missingData;
      }
    }
  }

  _visitConnection(field: RelayQuery.Field, state: FinderState): void {
    const calls = field.getCallsWithValues();
    const dataID = this._store.getLinkedRecordID(
      state.dataID,
      field.getStorageKey()
    );
    if (dataID === undefined) {
      this._handleMissingData(field, state);
      return;
    }
    if (dataID) {
      const nextState: FinderState = {
        dataID,
        missingData: false,
        path: RelayQueryPath.getPath(state.path, field, dataID),
        rangeCalls: calls,
        rangeInfo: null,
      };
      const metadata = this._store.getRangeMetadata(dataID, calls);
      if (metadata) {
        nextState.rangeInfo = metadata;
      }
      this.traverse(field, nextState);
      state.missingData = state.missingData || nextState.missingData;
    }
  }

  _visitEdges(field: RelayQuery.Field, state: FinderState): void {
    const rangeInfo = state.rangeInfo;
    // Doesn't have  `__range__` loaded
    if (!rangeInfo) {
      this._handleMissingData(field, state);
      return;
    }
    if (rangeInfo.diffCalls.length) {
      state.missingData = true;
      return;
    }
    const edgeIDs = rangeInfo.requestedEdgeIDs;
    for (let ii = 0; ii < edgeIDs.length; ii++) {
      if (state.missingData) {
        break;
      }
      const nextState = {
        dataID: edgeIDs[ii],
        missingData: false,
        path: RelayQueryPath.getPath(state.path, field, edgeIDs[ii]),
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
    const dataID =
      this._store.getLinkedRecordID(state.dataID, field.getStorageKey());
    if (dataID === undefined) {
      this._handleMissingData(field, state);
      return;
    }
    if (dataID) {
      const nextState = {
        dataID,
        missingData: false,
        path: RelayQueryPath.getPath(state.path, field, dataID),
        rangeCalls: undefined,
        rangeInfo: undefined,
      };
      this.traverse(field, nextState);
      state.missingData = state.missingData || nextState.missingData;
    }
  }

  _handleMissingData(node: RelayQuery.Node, state: FinderState): void {
    const dataID = state.dataID;
    if (this._cachedRecords.hasOwnProperty(dataID)) {
      // We have read data for this `dataID` from disk, but
      // we still don't have data for the relevant field.
      state.missingData = true;
    } else {
      // Store node in `pendingNodeStates` because we have not read data for
      // this `dataID` from disk.
      this._pendingNodeStates.push({
        dataID,
        node,
        path: state.path,
        rangeCalls: state.rangeCalls,
      });
    }
  }
}

module.exports = RelayProfiler.instrument(
  'findRelayQueryLeaves',
  findRelayQueryLeaves
);
