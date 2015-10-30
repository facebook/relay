/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule dereferenceRelayQueryData
 * @flow
 * @typechecks
 */

'use strict';

const GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
const GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayQuery = require('RelayQuery');
const RelayQueryVisitor = require('RelayQueryVisitor');
import type RelayRecordStore from 'RelayRecordStore';
import type {StoreReaderData} from 'RelayTypes';

var {EDGES} = RelayConnectionInterface;

type Data = {[key: string]: mixed};

function dereferenceRelayQueryData(
  recordStore: RelayRecordStore,
  node: RelayQuery.Fragment | RelayQuery.Field,
  result: Data
): void {
  var dereferencer = new RelayStoreDereferencer(recordStore);
  dereferencer.visit(node, result);
}

class RelayStoreDereferencer extends RelayQueryVisitor<Data> {
  _recordStore: RelayRecordStore;

  constructor(recordStore: RelayRecordStore) {
    super();
    this._recordStore = recordStore;
  }

  visitField(
    node: RelayQuery.Field,
    result: Data
  ): ?RelayQuery.Node {
    var dataID = GraphQLStoreDataHandler.getID(result);
    if (!dataID) {
      // Note: `pageInfo` fields do not have an id.
      return;
    }
    var rangeData = GraphQLStoreRangeUtils.parseRangeClientID(dataID);

    // The list of `edges` are stored in the range, but edge nodes and their
    // fields are stored as normal records. All other fields can be decremented.
    if (!node.isGenerated()) {
      if (!rangeData || node.getSchemaName() !== EDGES) {
        this._recordStore.decrementReferenceCount(dataID, node.getStorageKey());
      }
    }

    var fieldResult = result[node.getApplicationName()];
    if (Array.isArray(fieldResult)) {
      fieldResult.forEach(item => {
        this.traverse(node, item);
      });
    } else if (typeof fieldResult === 'object' && fieldResult !== null) {
      this.traverse(node, fieldResult);
    }
  }
}

module.exports = dereferenceRelayQueryData;
