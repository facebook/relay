/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
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
var RelayOSSNodeInterface = {
  ID: 'id',
  NODE: 'node',
  NODE_TYPE: 'Node',
  NODES: 'nodes',

  isNodeRootCall(rootCallName: string): boolean {
    return (
      rootCallName === RelayOSSNodeInterface.NODE ||
      rootCallName === RelayOSSNodeInterface.NODES
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
      Object.keys(payload).forEach(dataID => {
        var result = payload[dataID];
        if (typeof result === 'object' && result !== null) {
          invariant(
            result[RelayOSSNodeInterface.ID] === dataID,
            'RelayOSSNodeInterface.getResultsFromPayload(): Expected each batch ' +
            'response for query `%s()` to have an `id`.',
            query.getName()
          );
          results.push({dataID, result});
        }
      });
    } else {
      forEachRootCallArg(query, (rootCallArg, rootCallName) => {
        var payloadKey = getPayloadKey(payload, rootCallName, rootCallArg);
        if (payloadKey == null || !payload.hasOwnProperty(payloadKey)) {
          return;
        }
        var result = payload[payloadKey];
        var dataID = store.getRootCallID(rootCallName, rootCallArg);

        if (dataID == null) {
          var payloadID = typeof result === 'object' && result ?
            result[RelayOSSNodeInterface.ID] :
            null;
          if (payloadID != null) {
            // any root call where the response has an `id` field:
            // - `node(123)` with `{id: 123}`
            // - `username(joe)` with `{id: 123}`
            // - `me()` with `{id: 123}`
            dataID = payloadID;
          } else if (rootCallArg == null) {
            // argument-less root calls:
            // - `viewer()` without `id` in the response
            dataID = 'client:' + rootCallName;
          } else {
            // root calls with an argument:
            // - `foo(bar)` without `id` in the response
            dataID = generateClientID();
          }
          store.putRootCallID(rootCallName, rootCallArg, dataID);
        }
        results.push({dataID, result});
      });
    }

    return results;
  },
};

/**
 * Gets the key in `payload` that corresponds to results for the particular root
 * call argument supplied.
 */
function getPayloadKey(
  payload: {[key: string]: mixed},
  rootCallName: string,
  rootCallArg: ?string
): ?string {
  var payloadKey;
  var payloadKeys = Object.keys(payload);
  if (payloadKeys.length === 1) {
    payloadKey = payloadKeys[0];
  } else if (rootCallArg == null) {
    invariant(
      payloadKeys.length < 2,
      'writeRelayQueryPayload(): Expected payload to have at most 1 payload ' +
      'for root call `%s()`, called with %s payloads.',
      rootCallName,
      payloadKeys.length
    );
    payloadKey = payloadKeys[0];
  } else {
    payloadKey = rootCallArg;
  }
  return payloadKey;
}

module.exports = RelayOSSNodeInterface;
