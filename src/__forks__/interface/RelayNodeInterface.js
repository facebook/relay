/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNodeInterface
 * @typechecks
 * @flow
 */

'use strict';

import type {DataID} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type RelayRecordStore from 'RelayRecordStore';

var forEachRootCallArg = require('forEachRootCallArg');
var generateClientID = require('generateClientID');
var invariant = require('invariant');

type PayloadResult = {
  dataID: DataID;
  result: mixed;
};

/**
 * @internal
 *
 * Defines logic relevant to the informal "Node" GraphQL interface.
 */
var RelayNodeInterface = {
  ID: 'id',
  NODE: 'node',
  NODE_TYPE: 'Node',
  NODES: 'nodes',

  isNodeRootCall(rootCallName: string): boolean {
    return (
      rootCallName === RelayNodeInterface.NODE ||
      rootCallName === RelayNodeInterface.NODES
    );
  },

  getResultsFromPayload(
    store: RelayRecordStore,
    query: RelayQuery.Root,
    payload: {[key: string]: mixed}
  ): Array<PayloadResult> {
    var results = [];

    var rootBatchCall = query.getBatchCall();
    if (rootBatchCall) {
      getPayloadRecords(query, payload).forEach(result => {
        if (typeof result !== 'object' || !result) {
          return;
        }
        var dataID = result[RelayNodeInterface.ID];
        invariant(
          dataID != null,
          'RelayNodeInterface.getResultsFromPayload(): Unable to write result ' +
          'with no `%s` field for query, `%s`.',
          RelayNodeInterface.ID,
          query.getName()
        );
        results.push({dataID, result});
      });
    } else {
      var records = getPayloadRecords(query, payload);
      var ii = 0;
      forEachRootCallArg(query, (rootCallArg, rootCallName) => {
        var result = records[ii++];
        if (result == null) {
          return;
        }
        var dataID = store.getRootCallID(rootCallName, rootCallArg);
        if (dataID == null) {
          var payloadID = typeof result === 'object' && result ?
            result[RelayNodeInterface.ID] :
            null;
          if (payloadID != null) {
            dataID = payloadID;
          } else if (rootCallArg == null) {
            dataID = 'client:' + rootCallName;
          } else {
            dataID = generateClientID();
          }
          store.putRootCallID(rootCallName, rootCallArg, dataID);
        }
        results.push({dataID, result});
      });
    }

    return results;
  }
};

function getPayloadRecords(
  query: RelayQuery.Root,
  payload: {[key: string]: mixed}
): Array<mixed> {
  var records = payload[query.getRootCall().name];
  return Array.isArray(records) ? records : [records];
}

module.exports = RelayNodeInterface;
