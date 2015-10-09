/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule checkRelayQueryData
 * @flow
 * @typechecks
 */

'use strict';

var RelayConnectionInterface = require('RelayConnectionInterface');
import type {DataID} from 'RelayInternalTypes';
var RelayProfiler = require('RelayProfiler');
import type RelayQuery from 'RelayQuery';
var RelayQueryVisitor = require('RelayQueryVisitor');
var RelayRecordState = require('RelayRecordState');
import type RelayRecordStore from 'RelayRecordStore';
import type {RangeInfo} from 'RelayRecordStore';

var forEachRootCallArg = require('forEachRootCallArg');

type CheckerState = {
  dataID: ?DataID;
  rangeInfo: ?RangeInfo;
  result: boolean;
};

var {EDGES, PAGE_INFO} = RelayConnectionInterface;

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

  var checker = new RelayQueryChecker(store);

  var state = {
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
    var children = node.getChildren();
    for (var ii = 0; ii < children.length; ii++) {
      if (!state.result) {
        return;
      }
      this.visit(children[ii], state);
    }
  }

  visitRoot(
    root: RelayQuery.Root,
    state: CheckerState
  ): ?RelayQuery.Node {
    var nextState;

    forEachRootCallArg(root, (identifyingArgValue, fieldName) => {
      var dataID = this._store.getDataID(fieldName, identifyingArgValue);
      if (dataID == null) {
        state.result = false;
      } else {
        nextState = {
          dataID,
          rangeInfo: undefined,
          result: true,
        };
        this.traverse(root, nextState);
        state.result = state.result && nextState.result;
      }
    });
  }

  visitField(
    field: RelayQuery.Field,
    state: CheckerState
  ): ?RelayQuery.Node {
    var dataID = state.dataID;
    var recordState = dataID && this._store.getRecordState(dataID);
    if (recordState === RelayRecordState.UNKNOWN) {
      state.result = false;
      return;
    } else if (recordState === RelayRecordState.NONEXISTENT) {
      return;
    }
    var rangeInfo = state.rangeInfo;
    if (rangeInfo && field.getSchemaName() === EDGES) {
      this._checkEdges(field, state);
    } else if (rangeInfo && field.getSchemaName() === PAGE_INFO) {
      this._checkPageInfo(field, state);
    } else if (field.isScalar()) {
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
    var fieldData = state.dataID &&
      this._store.getField(state.dataID, field.getStorageKey());
    if (fieldData === undefined) {
      state.result = false;
    }
  }

  _checkPlural(field: RelayQuery.Field, state: CheckerState): void {
    var dataIDs = state.dataID &&
      this._store.getLinkedRecordIDs(state.dataID, field.getStorageKey());
    if (dataIDs === undefined) {
      state.result = false;
      return;
    }
    if (dataIDs) {
      for (var ii = 0; ii < dataIDs.length; ii++) {
        if (!state.result) {
          break;
        }
        var nextState = {
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
    var calls = field.getCallsWithValues();
    var dataID = state.dataID &&
      this._store.getLinkedRecordID(state.dataID, field.getStorageKey());
    if (dataID === undefined) {
      state.result = false;
      return;
    }
    var nextState = {
      dataID,
      rangeInfo: null, // Flow rejects `undefined` here
      result: true,
    };
    var metadata = this._store.getRangeMetadata(dataID, calls);
    if (metadata) {
      nextState.rangeInfo = metadata;
    }
    this.traverse(field, nextState);
    state.result = state.result && nextState.result;
  }

  _checkEdges(field: RelayQuery.Field, state: CheckerState): void {
    var rangeInfo = state.rangeInfo;
    if (!rangeInfo) {
      state.result = false;
      return;
    }
    if (rangeInfo.diffCalls.length) {
      state.result = false;
      return;
    }
    var edges = rangeInfo.requestedEdges;
    for (var ii = 0; ii < edges.length; ii++) {
      if (!state.result) {
        break;
      }
      var nextState = {
        dataID: edges[ii].edgeID,
        rangeInfo: undefined,
        result: true,
      };
      this.traverse(field, nextState);
      state.result = nextState.result;
    }
  }

  _checkPageInfo(field: RelayQuery.Field, state: CheckerState): void {
    var rangeInfo = state.rangeInfo;
    if (!rangeInfo || !rangeInfo.pageInfo) {
      state.result = false;
      return;
    }
  }

  _checkLinkedField(field: RelayQuery.Field, state: CheckerState): void {
    var dataID = state.dataID &&
        this._store.getLinkedRecordID(state.dataID, field.getStorageKey());
    if (dataID === undefined) {
      state.result = false;
      return;
    }
    if (dataID) {
      var nextState = {
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
