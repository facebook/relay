/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNodeInterface
 * @flow
 * @format
 */

'use strict';

const forEachRootCallArg = require('forEachRootCallArg');
const invariant = require('invariant');

import type RelayQuery from 'RelayQuery';

export type PayloadResult = {
  result: mixed,
  rootCallInfo: RootCallInfo,
};
type RootCallInfo = {
  storageKey: string,
  identifyingArgKey: ?string,
  identifyingArgValue: mixed,
};

let getResultsFromPayloadImpl = getResultsFromPayload;

/**
 * @internal
 *
 * Defines logic relevant to the informal "Node" GraphQL interface.
 */
const RelayNodeInterface = {
  ANY_TYPE: '__any',
  ID: 'id',
  ID_TYPE: 'ID!',
  NODE: 'node',
  NODE_TYPE: 'Node',
  NODES: 'nodes',
  TYPENAME: '__typename',

  isNodeRootCall(fieldName: string): boolean {
    return (
      fieldName === RelayNodeInterface.NODE ||
      fieldName === RelayNodeInterface.NODES
    );
  },

  getResultsFromPayload(
    query: RelayQuery.Root,
    payload: {[key: string]: mixed},
  ): Array<PayloadResult> {
    return getResultsFromPayloadImpl(query, payload);
  },

  /**
   * Allow for injecting custom behavior for getResultsFromPayload.
   */
  injectGetResultsFromPayloadImpl(impl: typeof getResultsFromPayload): void {
    getResultsFromPayloadImpl = impl;
  },
};

function getResultsFromPayload(
  query: RelayQuery.Root,
  payload: {[key: string]: mixed},
): Array<PayloadResult> {
  const results = [];

  const rootBatchCall = query.getBatchCall();
  if (rootBatchCall) {
    getPayloadRecords(query, payload).forEach(result => {
      if (typeof result !== 'object' || !result) {
        return;
      }
      const dataID = result[RelayNodeInterface.ID];
      invariant(
        typeof dataID === 'string',
        'RelayNodeInterface.getResultsFromPayload(): Unable to write ' +
          'result with no `%s` field for query, `%s`.',
        RelayNodeInterface.ID,
        query.getName(),
      );
      results.push({
        result,
        rootCallInfo: {
          storageKey: RelayNodeInterface.NODE,
          identifyingArgKey: dataID,
          identifyingArgValue: dataID,
        },
      });
    });
  } else {
    const records = getPayloadRecords(query, payload);
    let ii = 0;
    const storageKey = query.getStorageKey();
    forEachRootCallArg(query, ({identifyingArgKey, identifyingArgValue}) => {
      const result = records[ii++];
      results.push({
        result,
        rootCallInfo: {storageKey, identifyingArgKey, identifyingArgValue},
      });
    });
  }

  return results;
}

function getPayloadRecords(
  query: RelayQuery.Root,
  payload: {[key: string]: mixed},
): Array<mixed> {
  const fieldName = query.getFieldName();
  const identifyingArg = query.getIdentifyingArg();
  const identifyingArgValue = (identifyingArg && identifyingArg.value) || null;
  const records = payload[fieldName];
  if (!query.getBatchCall()) {
    if (Array.isArray(identifyingArgValue)) {
      invariant(
        Array.isArray(records),
        'RelayNodeInterface: Expected payload for root field `%s` to be ' +
          'an array with %s results, instead received a single non-array result.',
        fieldName,
        identifyingArgValue.length,
      );
      invariant(
        records.length === identifyingArgValue.length,
        'RelayNodeInterface: Expected payload for root field `%s` to be ' +
          'an array with %s results, instead received an array with %s results.',
        fieldName,
        identifyingArgValue.length,
        records.length,
      );
    } else if (Array.isArray(records)) {
      invariant(
        false,
        'RelayNodeInterface: Expected payload for root field `%s` to be ' +
          'a single non-array result, instead received an array with %s results.',
        fieldName,
        records.length,
      );
    }
  }
  return Array.isArray(records) ? records : [records || null];
}

module.exports = RelayNodeInterface;
