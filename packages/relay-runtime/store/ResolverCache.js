/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {
  ReaderRelayLiveResolver,
  ReaderRelayResolver,
} from '../util/ReaderNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  MutableRecordSource,
  Record,
  RelayResolverError,
  SingularReaderSelector,
  Snapshot,
} from './RelayStoreTypes';

const recycleNodesInto = require('../util/recycleNodesInto');
const {RELAY_LIVE_RESOLVER} = require('../util/RelayConcreteNode');
const {generateClientID} = require('./ClientID');
const RelayModernRecord = require('./RelayModernRecord');
const {
  RELAY_RESOLVER_ERROR_KEY,
  RELAY_RESOLVER_INVALIDATION_KEY,
  RELAY_RESOLVER_SNAPSHOT_KEY,
  RELAY_RESOLVER_VALUE_KEY,
  getStorageKey,
} = require('./RelayStoreUtils');
const invariant = require('invariant');
const warning = require('warning');

type ResolverID = string;

export type EvaluationResult<T> = {|
  resolverResult: ?T,
  resolverID: ResolverID,
  snapshot: ?Snapshot,
  error: ?RelayResolverError,
|};

export type ResolverFragmentResult = {|
  data: mixed,
  isMissingData: boolean,
|};

export type GetDataForResolverFragmentFn =
  SingularReaderSelector => ResolverFragmentResult;

export interface ResolverCache {
  readFromCacheOrEvaluate<T>(
    record: Record,
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    variables: Variables,
    evaluate: () => EvaluationResult<T>,
    getDataForResolverFragment: GetDataForResolverFragmentFn,
  ): [
    ?T /* Answer */,
    ?DataID /* Seen record */,
    ?RelayResolverError,
    ?Snapshot,
    ?DataID /* ID of record containing a suspended Live field */,
  ];
  invalidateDataIDs(
    updatedDataIDs: Set<DataID>, // Mutated in place
  ): void;
  ensureClientRecord(id: string, typename: string): DataID;
}

// $FlowFixMe[unclear-type] - will always be empty
const emptySet: $ReadOnlySet<any> = new Set();

class NoopResolverCache implements ResolverCache {
  readFromCacheOrEvaluate<T>(
    record: Record,
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    variables: Variables,
    evaluate: () => EvaluationResult<T>,
    getDataForResolverFragment: GetDataForResolverFragmentFn,
  ): [
    ?T /* Answer */,
    ?DataID /* Seen record */,
    ?RelayResolverError,
    ?Snapshot,
    ?DataID /* ID of record containing a suspended Live field */,
  ] {
    invariant(
      field.kind !== RELAY_LIVE_RESOLVER,
      'This store does not support Live Resolvers',
    );
    const {resolverResult, snapshot, error} = evaluate();

    return [resolverResult, undefined, error, snapshot, undefined];
  }
  invalidateDataIDs(updatedDataIDs: Set<DataID>): void {}
  ensureClientRecord(id: string, typeName: string): DataID {
    invariant(
      false,
      'Client Edges to Client Objects are not supported in this version of Relay Store',
    );
  }
}

function addDependencyEdge(
  edges: Map<ResolverID, Set<DataID>> | Map<DataID, Set<ResolverID>>,
  from: ResolverID | DataID,
  to: ResolverID | DataID,
): void {
  let set = edges.get(from);
  if (!set) {
    set = new Set();
    edges.set(from, set);
  }
  set.add(to);
}

class RecordResolverCache implements ResolverCache {
  _resolverIDToRecordIDs: Map<ResolverID, Set<DataID>>;
  _recordIDToResolverIDs: Map<DataID, Set<ResolverID>>;

  _getRecordSource: () => MutableRecordSource;

  constructor(getRecordSource: () => MutableRecordSource) {
    this._resolverIDToRecordIDs = new Map();
    this._recordIDToResolverIDs = new Map();
    this._getRecordSource = getRecordSource;
  }

  readFromCacheOrEvaluate<T>(
    record: Record,
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    variables: Variables,
    evaluate: () => EvaluationResult<T>,
    getDataForResolverFragment: GetDataForResolverFragmentFn,
  ): [
    ?T /* Answer */,
    ?DataID /* Seen record */,
    ?RelayResolverError,
    ?Snapshot,
    ?DataID /* ID of record containing a suspended Live field */,
  ] {
    const recordSource = this._getRecordSource();
    const recordID = RelayModernRecord.getDataID(record);

    const storageKey = getStorageKey(field, variables);
    let linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    let linkedRecord = linkedID == null ? null : recordSource.get(linkedID);
    if (
      linkedRecord == null ||
      this._isInvalid(linkedRecord, getDataForResolverFragment)
    ) {
      // Cache miss; evaluate the selector and store the result in a new record:
      linkedID = linkedID ?? generateClientID(recordID, storageKey);
      linkedRecord = RelayModernRecord.create(linkedID, '__RELAY_RESOLVER__');

      const evaluationResult = evaluate();
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_VALUE_KEY,
        evaluationResult.resolverResult,
      );
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_SNAPSHOT_KEY,
        evaluationResult.snapshot,
      );
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_ERROR_KEY,
        evaluationResult.error,
      );
      recordSource.set(linkedID, linkedRecord);

      // Link the resolver value record to the resolver field of the record being read:
      const nextRecord = RelayModernRecord.clone(record);
      RelayModernRecord.setLinkedRecordID(nextRecord, storageKey, linkedID);
      recordSource.set(RelayModernRecord.getDataID(nextRecord), nextRecord);

      // Put records observed by the resolver into the dependency graph:
      const resolverID = evaluationResult.resolverID;
      addDependencyEdge(this._resolverIDToRecordIDs, resolverID, linkedID);
      addDependencyEdge(this._recordIDToResolverIDs, recordID, resolverID);
      const seenRecordIds = evaluationResult.snapshot?.seenRecords;
      if (seenRecordIds != null) {
        for (const seenRecordID of seenRecordIds) {
          addDependencyEdge(
            this._recordIDToResolverIDs,
            seenRecordID,
            resolverID,
          );
        }
      }
    }

    // $FlowFixMe[incompatible-type] - will always be empty
    const answer: T = linkedRecord[RELAY_RESOLVER_VALUE_KEY];
    // $FlowFixMe[incompatible-type] - casting mixed
    const snapshot: ?Snapshot = linkedRecord[RELAY_RESOLVER_SNAPSHOT_KEY];
    // $FlowFixMe[incompatible-type] - casting mixed
    const error: ?RelayResolverError = linkedRecord[RELAY_RESOLVER_ERROR_KEY];

    return [answer, linkedID, error, snapshot, undefined];
  }

  invalidateDataIDs(
    updatedDataIDs: Set<DataID>, // Mutated in place
  ): void {
    const recordSource = this._getRecordSource();
    const visited: Set<string> = new Set();
    const recordsToVisit = Array.from(updatedDataIDs);
    while (recordsToVisit.length) {
      const recordID = recordsToVisit.pop();
      updatedDataIDs.add(recordID);
      for (const fragment of this._recordIDToResolverIDs.get(recordID) ??
        emptySet) {
        if (!visited.has(fragment)) {
          for (const anotherRecordID of this._resolverIDToRecordIDs.get(
            fragment,
          ) ?? emptySet) {
            this._markInvalidatedResolverRecord(
              anotherRecordID,
              recordSource,
              updatedDataIDs,
            );
            if (!visited.has(anotherRecordID)) {
              recordsToVisit.push(anotherRecordID);
            }
          }
        }
      }
    }
  }

  _markInvalidatedResolverRecord(
    dataID: DataID,
    recordSource: MutableRecordSource, // Written to
    updatedDataIDs: Set<DataID>, // Mutated in place
  ) {
    const record = recordSource.get(dataID);
    if (!record) {
      warning(
        false,
        'Expected a resolver record with ID %s, but it was missing.',
        dataID,
      );
      return;
    }
    const nextRecord = RelayModernRecord.clone(record);
    RelayModernRecord.setValue(
      nextRecord,
      RELAY_RESOLVER_INVALIDATION_KEY,
      true,
    );
    recordSource.set(dataID, nextRecord);
  }

  _isInvalid(
    record: Record,
    getDataForResolverFragment: GetDataForResolverFragmentFn,
  ): boolean {
    if (!RelayModernRecord.getValue(record, RELAY_RESOLVER_INVALIDATION_KEY)) {
      return false;
    }
    // $FlowFixMe[incompatible-type] - storing values in records is not typed
    const snapshot: ?Snapshot = RelayModernRecord.getValue(
      record,
      RELAY_RESOLVER_SNAPSHOT_KEY,
    );
    const originalInputs = snapshot?.data;
    const readerSelector: ?SingularReaderSelector = snapshot?.selector;
    if (originalInputs == null || readerSelector == null) {
      warning(
        false,
        'Expected previous inputs and reader selector on resolver record with ID %s, but they were missing.',
        RelayModernRecord.getDataID(record),
      );
      return true;
    }

    const {data: latestValues} = getDataForResolverFragment(readerSelector);
    const recycled = recycleNodesInto(originalInputs, latestValues);
    if (recycled !== originalInputs) {
      return true;
    }
    return false;
  }

  ensureClientRecord(id: string, typename: string): DataID {
    invariant(
      false,
      'Client Edges to Client Objects are not supported in this version of Relay Store',
    );
  }
}

module.exports = {
  NoopResolverCache,
  RecordResolverCache,
};
