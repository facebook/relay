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
      var payloadResult = getBatchCallResult(query, payload);
      if (payloadResult) {
        results.push(payloadResult);
      }
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
            result[RelayNodeInterface.ID] :
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
  }
};

function getBatchCallResult(
  query: RelayQuery.Root,
  payload: {[key: string]: mixed}
): ?PayloadResult {
  var payloadKey = getPayloadKey(payload, query.getRootCall().name, null);
  if (payloadKey == null) {
    return null;
  }
  var result = payload[payloadKey];
  if (typeof result !== 'object' || !result) {
    return null;
  }
  var dataID = result[RelayNodeInterface.ID];
  invariant(
    dataID != null,
    'RelayNodeInterface.getResultsFromPayload(): Unable to write result ' +
    'with no `%s` field for query, `%s`.',
    RelayNodeInterface.ID,
    query.getName()
  );
  return {dataID, result};
}

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

module.exports = RelayNodeInterface;
