/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule checkRelayQueryData
 * @flow
 */

'use strict';

const RelayClassicRecordState = require('RelayClassicRecordState');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayProfiler = require('RelayProfiler');
const RelayQueryVisitor = require('RelayQueryVisitor');

const forEachRootCallArg = require('forEachRootCallArg');
const isCompatibleRelayFragmentType = require('isCompatibleRelayFragmentType');

import type {DataID} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type RelayRecordStore from 'RelayRecordStore';
import type {RangeInfo} from 'RelayRecordStore';

type CheckerState = {
  dataID: ?DataID,
  rangeInfo: ?RangeInfo,
  result: boolean,
};

const {EDGES, PAGE_INFO} = RelayConnectionInterface;

/**
 * @internal
 *
 * Traverses a query and data in the record store to determine whether we have
 * enough data to satisfy the query.
 */
function checkRelayQueryData(
  store: RelayRecordStore,
  query: RelayQuery.Root
): boolean {

  const checker = new RelayQueryChecker(store);

  const state = {
    dataID: undefined,
    rangeInfo: undefined,
    result: true,
  };

  checker.visit(query, state);
  return state.result;
}

class RelayQueryChecker extends RelayQueryVisitor<CheckerState> {
  _store: RelayRecordStore;

  constructor(store: RelayRecordStore) {
    super();
    this._store = store;
  }

  /**
   * Skip visiting children if result is already false.
   */
  traverse<Tn: RelayQuery.Node>(
    node: Tn,
    state: CheckerState
  ): ?Tn {
    const children = node.getChildren();
    for (let ii = 0; ii < children.length; ii++) {
      if (!state.result) {
        return;
      }
      this.visit(children[ii], state);
    }
  }

  visitRoot(
    root: RelayQuery.Root,
    state: CheckerState
  ): void {
    const storageKey = root.getStorageKey();
    forEachRootCallArg(root, ({identifyingArgKey}) => {
      const dataID = this._store.getDataID(storageKey, identifyingArgKey);
      if (dataID == null) {
        state.result = false;
      } else {
        const nextState = {
          dataID,
          rangeInfo: undefined,
          result: true,
        };
        this.traverse(root, nextState);
        state.result = state.result && nextState.result;
      }
    });
  }

  visitFragment(
    fragment: RelayQuery.Fragment,
    state: CheckerState
  ): void {
    const dataID = state.dataID;
    // The dataID check is for Flow; it must be non-null to have gotten here.
    if (dataID && isCompatibleRelayFragmentType(
      fragment,
      this._store.getType(dataID)
    )) {
      this.traverse(fragment, state);
    }
  }

  visitField(
    field: RelayQuery.Field,
    state: CheckerState
  ): void {
    const dataID = state.dataID;
    const recordState = dataID && this._store.getRecordState(dataID);
    if (recordState === RelayClassicRecordState.UNKNOWN) {
      state.result = false;
      return;
    } else if (recordState === RelayClassicRecordState.NONEXISTENT) {
      return;
    }
    const rangeInfo = state.rangeInfo;
    if (rangeInfo && field.getSchemaName() === EDGES) {
      this._checkEdges(field, state);
    } else if (rangeInfo && field.getSchemaName() === PAGE_INFO) {
      this._checkPageInfo(field, state);
    } else if (!field.canHaveSubselections()) {
      this._checkScalar(field, state);
    } else if (field.isPlural()) {
      this._checkPlural(field, state);
    } else if (field.isConnection()) {
      this._checkConnection(field, state);
    } else {
      this._checkLinkedField(field, state);
    }
  }

  _checkScalar(field: RelayQuery.Field, state: CheckerState): void {
    const fieldData = state.dataID &&
      this._store.getField(state.dataID, field.getStorageKey());
    if (fieldData === undefined) {
      state.result = false;
    }
  }

  _checkPlural(field: RelayQuery.Field, state: CheckerState): void {
    const dataIDs = state.dataID &&
      this._store.getLinkedRecordIDs(state.dataID, field.getStorageKey());
    if (dataIDs === undefined) {
      state.result = false;
      return;
    }
    if (dataIDs) {
      for (let ii = 0; ii < dataIDs.length; ii++) {
        if (!state.result) {
          break;
        }
        const nextState = {
          dataID: dataIDs[ii],
          rangeInfo: undefined,
          result: true,
        };
        this.traverse(field, nextState);
        state.result = nextState.result;
      }
    }
  }

  _checkConnection(field: RelayQuery.Field, state: CheckerState): void {
    const calls = field.getCallsWithValues();
    const dataID = state.dataID &&
      this._store.getLinkedRecordID(state.dataID, field.getStorageKey());
    if (dataID === undefined) {
      state.result = false;
      return;
    }
    const nextState: CheckerState = {
      dataID,
      rangeInfo: null, // Flow rejects `undefined` here
      result: true,
    };
    const metadata = this._store.getRangeMetadata(dataID, calls);
    if (metadata) {
      nextState.rangeInfo = metadata;
    }
    this.traverse(field, nextState);
    state.result = state.result && nextState.result;
  }

  _checkEdges(field: RelayQuery.Field, state: CheckerState): void {
    const rangeInfo = state.rangeInfo;
    if (!rangeInfo) {
      state.result = false;
      return;
    }
    if (rangeInfo.diffCalls.length) {
      state.result = false;
      return;
    }
    const edges = rangeInfo.filteredEdges;
    for (let ii = 0; ii < edges.length; ii++) {
      if (!state.result) {
        break;
      }
      const nextState = {
        dataID: edges[ii].edgeID,
        rangeInfo: undefined,
        result: true,
      };
      this.traverse(field, nextState);
      state.result = nextState.result;
    }
  }

  _checkPageInfo(field: RelayQuery.Field, state: CheckerState): void {
    const rangeInfo = state.rangeInfo;
    if (!rangeInfo || !rangeInfo.pageInfo) {
      state.result = false;
      return;
    }
  }

  _checkLinkedField(field: RelayQuery.Field, state: CheckerState): void {
    const dataID = state.dataID &&
        this._store.getLinkedRecordID(state.dataID, field.getStorageKey());
    if (dataID === undefined) {
      state.result = false;
      return;
    }
    if (dataID) {
      const nextState = {
        dataID,
        rangeInfo: undefined,
        result: true,
      };
      this.traverse(field, nextState);
      state.result = state.result && nextState.result;
    }
  }
}

module.exports = RelayProfiler.instrument(
  'checkRelayQueryData',
  checkRelayQueryData
);
