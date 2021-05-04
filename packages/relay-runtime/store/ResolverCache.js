/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayModernRecord = require('./RelayModernRecord');

const {generateClientID} = require('./ClientID');
const {MutableDependencyGraph} = require('./DependencyGraph');
const {RELAY_RESOLVER_VALUE_KEY, getStorageKey} = require('./RelayStoreUtils');

import type {ReaderRelayResolver} from '../util/ReaderNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {MutableRecordSource, Record} from './RelayStoreTypes';

export interface ResolverCache {
  readFromCacheOrEvaluate<T>(
    record: Record,
    field: ReaderRelayResolver,
    variables: Variables,
    evaluate: () => {|
      resolverResult: T,
      seenRecords: Set<DataID>,
    |},
  ): T;
  invalidateDataIDs(
    updatedDataIDs: Set<DataID>, // Mutated in place
  ): void;
}

class NoopResolverCache implements ResolverCache {
  readFromCacheOrEvaluate<T>(
    record: Record,
    field: ReaderRelayResolver,
    variables: Variables,
    evaluate: () => {|
      resolverResult: T,
      seenRecords: Set<DataID>,
    |},
  ): T {
    return evaluate().resolverResult;
  }
  invalidateDataIDs(updatedDataIDs: Set<DataID>): void {}
}

const recordStack: Array<DataID> = [];

class RecordResolverCache implements ResolverCache {
  _dependencyGraph: MutableDependencyGraph;
  _getRecordSource: () => MutableRecordSource;

  constructor(getRecordSource: () => MutableRecordSource) {
    this._dependencyGraph = new MutableDependencyGraph();
    this._getRecordSource = getRecordSource;
  }

  readFromCacheOrEvaluate<T>(
    record: Record,
    field: ReaderRelayResolver,
    variables: Variables,
    evaluate: () => {|
      resolverResult: T,
      seenRecords: Set<DataID>,
    |},
  ): ?T {
    const recordSource = this._getRecordSource();
    const recordID = RelayModernRecord.getDataID(record);

    const storageKey = getStorageKey(field, variables);
    let linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    if (linkedID == null || recordSource.get(linkedID) == null) {
      // Cache miss; evaluate the selector and store the result in a new record:
      linkedID = generateClientID(recordID, storageKey);
      const newValueRecord = RelayModernRecord.create(
        linkedID,
        '__RELAY_RESOLVER__',
      );
      recordStack.push(linkedID);
      let evaluationResult;
      try {
        evaluationResult = evaluate();
      } finally {
        recordStack.pop();
      }
      RelayModernRecord.setValue(
        newValueRecord,
        RELAY_RESOLVER_VALUE_KEY,
        evaluationResult.resolverResult,
      );
      recordSource.set(linkedID, newValueRecord);

      // Link the resolver value record to the resolver field of the record being read:
      const nextRecord = RelayModernRecord.clone(record);
      RelayModernRecord.setLinkedRecordID(nextRecord, storageKey, linkedID);
      recordSource.set(RelayModernRecord.getDataID(nextRecord), nextRecord);

      // Add the link to the dependency graph:
      const topRecordID = recordStack.length
        ? recordStack[recordStack.length - 1]
        : recordID;
      this._dependencyGraph.setDependency(
        topRecordID,
        recordID,
        storageKey,
        linkedID,
        evaluationResult.seenRecords,
      );
    }

    const resultRecord = recordSource.get(linkedID);
    if (resultRecord == null) {
      // FIXME log
      return null;
    }
    // $FlowFixMe[incompatible-return]
    return resultRecord[RELAY_RESOLVER_VALUE_KEY];
  }

  invalidateDataIDs(
    updatedDataIDs: Set<DataID>, // Mutated in place
  ): void {
    const recordSource = this._getRecordSource();
    const instructions = this._dependencyGraph.getInstructionsForUpdatedIDs(
      updatedDataIDs,
    );
    for (const instruction of instructions) {
      switch (instruction.kind) {
        case 'delete':
          recordSource.delete(instruction.dataID);
          updatedDataIDs.add(instruction.dataID);
          break;
        case 'unlink':
          const dataID = instruction.dataID;
          const downstreamRecord = recordSource.get(dataID);
          if (!downstreamRecord) {
            // FIXME log
            return;
          }
          const recordWithDeletedLink = RelayModernRecord.clone(
            downstreamRecord,
          );
          RelayModernRecord.setValue(
            recordWithDeletedLink,
            instruction.storageKey,
            null,
          );
          recordSource.set(dataID, recordWithDeletedLink);
          updatedDataIDs.add(dataID);
          break;
      }
    }
  }
}

module.exports = {
  NoopResolverCache,
  RecordResolverCache,
};
