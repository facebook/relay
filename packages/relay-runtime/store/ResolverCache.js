/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {
  ReaderRelayLiveResolver,
  ReaderRelayResolver,
} from '../util/ReaderNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  DataIDSet,
  MutableRecordSource,
  Record,
  SingularReaderSelector,
  Snapshot,
} from './RelayStoreTypes';

const recycleNodesInto = require('../util/recycleNodesInto');
const {RELAY_LIVE_RESOLVER} = require('../util/RelayConcreteNode');
const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const shallowFreeze = require('../util/shallowFreeze');
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

export type EvaluationResult<T> = {
  resolverResult: ?T,
  snapshot: ?Snapshot,
  error: ?Error,
};

export type ResolverFragmentResult = {
  data: mixed,
  isMissingData: boolean,
};

export type GetDataForResolverFragmentFn =
  SingularReaderSelector => ResolverFragmentResult;

export interface ResolverCache {
  readFromCacheOrEvaluate<T>(
    recordID: DataID,
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    variables: Variables,
    evaluate: () => EvaluationResult<T>,
    getDataForResolverFragment: GetDataForResolverFragmentFn,
  ): [
    ?T /* Answer */,
    ?DataID /* Seen record */,
    ?Error,
    ?Snapshot,
    ?DataID /* ID of record containing a suspended Live field */,
    ?DataIDSet /** Set of updated records after read. Then need to be consumed by `processFollowupUpdates` */,
  ];
  invalidateDataIDs(
    updatedDataIDs: DataIDSet, // Mutated in place
  ): void;
  ensureClientRecord(id: string, typename: string): DataID;
  notifyUpdatedSubscribers(updatedDataIDs: DataIDSet): void;
}

// $FlowFixMe[unclear-type] - will always be empty
const emptySet: $ReadOnlySet<any> = new Set();

class NoopResolverCache implements ResolverCache {
  readFromCacheOrEvaluate<T>(
    recordID: DataID,
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    variables: Variables,
    evaluate: () => EvaluationResult<T>,
    getDataForResolverFragment: GetDataForResolverFragmentFn,
  ): [
    ?T /* Answer */,
    ?DataID /* Seen record */,
    ?Error,
    ?Snapshot,
    ?DataID /* ID of record containing a suspended Live field */,
    ?DataIDSet /** Set of dirty records after read */,
  ] {
    invariant(
      field.kind !== RELAY_LIVE_RESOLVER,
      'This store does not support Live Resolvers',
    );
    const {resolverResult, snapshot, error} = evaluate();

    return [resolverResult, undefined, error, snapshot, undefined, undefined];
  }
  invalidateDataIDs(updatedDataIDs: DataIDSet): void {}
  ensureClientRecord(id: string, typeName: string): DataID {
    invariant(
      false,
      'Client Edges to Client Objects are not supported in this version of Relay Store',
    );
  }
  notifyUpdatedSubscribers(updatedDataIDs: DataIDSet): void {}
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
    recordID: DataID,
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    variables: Variables,
    evaluate: () => EvaluationResult<T>,
    getDataForResolverFragment: GetDataForResolverFragmentFn,
  ): [
    ?T /* Answer */,
    ?DataID /* Seen record */,
    ?Error,
    ?Snapshot,
    ?DataID /* ID of record containing a suspended Live field */,
    ?DataIDSet /** Set of dirty records after read */,
  ] {
    const recordSource = this._getRecordSource();

    // NOTE: Be very careful with `record` in this scope. After `evaluate` has
    // been called, the `record` we have here may have been replaced in the
    // Relay store with a new record containing new information about nested
    // resolvers on this parent record.
    const record = recordSource.get(recordID);
    invariant(record != null, 'We expect record to exist in the store.');

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
      shallowFreeze(evaluationResult.resolverResult);
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

      // Note: We get a fresh instance of the parent record from the record
      // source, because it may have been updated when we traversed into child
      // resolvers.
      const currentRecord = recordSource.get(recordID);
      invariant(
        currentRecord != null,
        'Expected the parent record to still be in the record source.',
      );
      const nextRecord = RelayModernRecord.clone(currentRecord);
      RelayModernRecord.setLinkedRecordID(nextRecord, storageKey, linkedID);
      recordSource.set(recordID, nextRecord);

      if (field.fragment != null) {
        // Put records observed by the resolver into the dependency graph:
        const fragmentStorageKey = getStorageKey(field.fragment, variables);
        const resolverID = generateClientID(recordID, fragmentStorageKey);
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
    }

    // $FlowFixMe[incompatible-type] - will always be empty
    const answer: T = RelayModernRecord.getValue(
      linkedRecord,
      RELAY_RESOLVER_VALUE_KEY,
    );

    // $FlowFixMe[incompatible-type] - casting mixed
    const snapshot: ?Snapshot = RelayModernRecord.getValue(
      linkedRecord,
      RELAY_RESOLVER_SNAPSHOT_KEY,
    );

    // $FlowFixMe[incompatible-type] - casting mixed
    const error: ?Error = RelayModernRecord.getValue(
      linkedRecord,
      RELAY_RESOLVER_ERROR_KEY,
    );

    return [answer, linkedID, error, snapshot, undefined, undefined];
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

    if (RelayFeatureFlags.MARK_RESOLVER_VALUES_AS_CLEAN_AFTER_FRAGMENT_REREAD) {
      // This record does not need to be recomputed, we can reuse the cached value.
      // For subsequent reads we can mark this record as "clean" so that they will
      // not need to re-read the fragment.
      const nextRecord = RelayModernRecord.clone(record);
      RelayModernRecord.setValue(
        nextRecord,
        RELAY_RESOLVER_INVALIDATION_KEY,
        false,
      );

      const recordSource = this._getRecordSource();
      recordSource.set(RelayModernRecord.getDataID(record), nextRecord);
    }

    return false;
  }

  ensureClientRecord(id: string, typename: string): DataID {
    invariant(
      false,
      'Client Edges to Client Objects are not supported in this version of Relay Store',
    );
  }

  notifyUpdatedSubscribers(updatedDataIDs: DataIDSet): void {
    invariant(
      false,
      'Processing @outputType records is not supported in this version of Relay Store',
    );
  }
}

module.exports = {
  NoopResolverCache,
  RecordResolverCache,
};
