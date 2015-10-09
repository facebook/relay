/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayOSSNodeInterface
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
  TYPENAME: '__typename',

  isNodeRootCall(fieldName: string): boolean {
    return (
      fieldName === RelayOSSNodeInterface.NODE ||
      fieldName === RelayOSSNodeInterface.NODES
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
        var dataID = result[RelayOSSNodeInterface.ID];
        invariant(
          dataID != null,
          'RelayOSSNodeInterface.getResultsFromPayload(): Unable to write ' +
          'result with no `%s` field for query, `%s`.',
          RelayOSSNodeInterface.ID,
          query.getName()
        );
        results.push({dataID, result});
      });
    } else {
      var records = getPayloadRecords(query, payload);
      var ii = 0;
      forEachRootCallArg(query, (identifyingArgValue, fieldName) => {
        var result = records[ii++];
        var dataID = store.getDataID(fieldName, identifyingArgValue);
        if (dataID == null) {
          var payloadID = typeof result === 'object' && result ?
            result[RelayOSSNodeInterface.ID] :
            null;
          if (payloadID != null) {
            dataID = payloadID;
          } else if (identifyingArgValue == null) {
            dataID = 'client:' +  fieldName;
          } else {
            dataID = generateClientID();
          }
          store.putDataID(fieldName, identifyingArgValue, dataID);
        }
        results.push({dataID, result});
      });
    }

    return results;
  },
};

function getPayloadRecords(
  query: RelayQuery.Root,
  payload: {[key: string]: mixed}
): Array<mixed> {
  var fieldName = query.getFieldName();
  const identifyingArg = query.getIdentifyingArg();
  const identifyingArgValue = (identifyingArg && identifyingArg.value) || null;
  var records = payload[fieldName];
  if (!query.getBatchCall()) {
    if (Array.isArray(identifyingArgValue)) {
      invariant(
        Array.isArray(records),
        'RelayOSSNodeInterface: Expected payload for root field `%s` to be ' +
        'an array with %s results, instead received a single non-array result.',
        fieldName,
        identifyingArgValue.length
      );
      invariant(
        records.length === identifyingArgValue.length,
        'RelayOSSNodeInterface: Expected payload for root field `%s` to be ' +
        'an array with %s results, instead received an array with %s results.',
        fieldName,
        identifyingArgValue.length,
        records.length
      );
    } else if (Array.isArray(records)) {
      invariant(
        false,
        'RelayOSSNodeInterface: Expected payload for root field `%s` to be ' +
        'a single non-array result, instead received an array with %s results.',
        fieldName,
        records.length
      );
    }
  }
  return Array.isArray(records) ? records : [records];
}

module.exports = RelayOSSNodeInterface;
