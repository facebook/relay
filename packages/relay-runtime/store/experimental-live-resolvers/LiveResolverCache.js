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
} from '../../util/ReaderNode';
import type {DataID, Variables} from '../../util/RelayRuntimeTypes';
import type {
  MutableRecordSource,
  Record,
  RelayResolverError,
  SingularReaderSelector,
  Snapshot,
} from '../RelayStoreTypes';
import type {
  EvaluationResult,
  GetDataForResolverFragmentFn,
  ResolverCache,
} from '../ResolverCache';
import type {LiveState} from './LiveResolverStore';

const recycleNodesInto = require('../../util/recycleNodesInto');
const {RELAY_LIVE_RESOLVER} = require('../../util/RelayConcreteNode');
const {generateClientID, generateClientObjectClientID} = require('../ClientID');
const RelayModernRecord = require('../RelayModernRecord');
const RelayRecordSource = require('../RelayRecordSource');
const {
  RELAY_RESOLVER_ERROR_KEY,
  RELAY_RESOLVER_INVALIDATION_KEY,
  RELAY_RESOLVER_SNAPSHOT_KEY,
  RELAY_RESOLVER_VALUE_KEY,
  getStorageKey,
} = require('../RelayStoreUtils');
const LiveResolverStore = require('./LiveResolverStore');
const {isSuspenseSentinel} = require('./LiveResolverSuspenseSentinel');
const invariant = require('invariant');
const warning = require('warning');

// When this experiment gets promoted to stable, these keys will move into
// `RelayStoreUtils`.
const RELAY_RESOLVER_LIVE_STATE_SUBSCRIPTION_KEY =
  '__resolverLieStateSubscription';
const RELAY_RESOLVER_LIVE_STATE_VALUE = '__resolverLiveStateValue';
const RELAY_RESOLVER_LIVE_STATE_DIRTY = '__resolverLiveStateDirty';
const RELAY_RESOLVER_RECORD_TYPENAME = '__RELAY_RESOLVER__';

/**
 * An experimental fork of store/ResolverCache.js intended to let us experiment
 * with Live Resolvers.
 */

type ResolverID = string;

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

class LiveResolverCache implements ResolverCache {
  _resolverIDToRecordIDs: Map<ResolverID, Set<DataID>>;
  _recordIDToResolverIDs: Map<DataID, Set<ResolverID>>;

  _getRecordSource: () => MutableRecordSource;
  _store: LiveResolverStore;

  constructor(
    getRecordSource: () => MutableRecordSource,
    store: LiveResolverStore,
  ) {
    this._resolverIDToRecordIDs = new Map();
    this._recordIDToResolverIDs = new Map();
    this._getRecordSource = getRecordSource;
    this._store = store;
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
      linkedRecord = RelayModernRecord.create(
        linkedID,
        RELAY_RESOLVER_RECORD_TYPENAME,
      );

      const evaluationResult = evaluate();

      if (field.kind === RELAY_LIVE_RESOLVER) {
        if (evaluationResult.resolverResult !== undefined) {
          if (__DEV__) {
            invariant(
              isLiveStateValue(evaluationResult.resolverResult),
              'Expected a @live Relay Resolver to return a value that implements LiveState.',
            );
          }
          const liveState: LiveState<mixed> =
            // $FlowFixMe[incompatible-type] - casting mixed
            evaluationResult.resolverResult;
          this._setLiveStateValue(linkedRecord, linkedID, liveState);
        }
      } else {
        RelayModernRecord.setValue(
          linkedRecord,
          RELAY_RESOLVER_VALUE_KEY,
          evaluationResult.resolverResult,
        );
      }
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
    } else if (
      field.kind === RELAY_LIVE_RESOLVER &&
      RelayModernRecord.getValue(linkedRecord, RELAY_RESOLVER_LIVE_STATE_DIRTY)
    ) {
      // If this is an Live Resolver, we might have a cache hit (the
      // fragment data hasn't changed since we last evaluated the resolver),
      // but it might still be "dirty" (the live state changed and we need
      // to call `.read()` again).
      linkedID = linkedID ?? generateClientID(recordID, storageKey);
      linkedRecord = RelayModernRecord.clone(linkedRecord);
      // $FlowFixMe[incompatible-type] - casting mixed
      const liveState: LiveState<mixed> = RelayModernRecord.getValue(
        linkedRecord,
        RELAY_RESOLVER_LIVE_STATE_VALUE,
      );

      // Set the new value for this and future reads.
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_VALUE_KEY,
        liveState.read(),
      );
      // Mark the resolver as clean again.
      RelayModernRecord.setValue(
        linkedRecord,
        RELAY_RESOLVER_LIVE_STATE_DIRTY,
        false,
      );
      recordSource.set(linkedID, linkedRecord);
    }

    // $FlowFixMe[incompatible-type] - will always be empty
    const answer: T = linkedRecord[RELAY_RESOLVER_VALUE_KEY];
    // $FlowFixMe[incompatible-type] - casting mixed
    const snapshot: ?Snapshot = linkedRecord[RELAY_RESOLVER_SNAPSHOT_KEY];
    // $FlowFixMe[incompatible-type] - casting mixed
    const error: ?RelayResolverError = linkedRecord[RELAY_RESOLVER_ERROR_KEY];

    let suspenseID = null;

    if (isSuspenseSentinel(answer)) {
      suspenseID = linkedID ?? generateClientID(recordID, storageKey);
    }

    return [answer, linkedID, error, snapshot, suspenseID];
  }

  getLiveResolverPromise(liveStateID: DataID): Promise<void> {
    const recordSource = this._getRecordSource();
    const liveStateRecord = recordSource.get(liveStateID);

    invariant(
      liveStateRecord != null,
      'Expected to find record for live resolver.',
    );

    // $FlowFixMe[incompatible-type] - casting mixed
    const liveState: LiveState<mixed> = RelayModernRecord.getValue(
      liveStateRecord,
      RELAY_RESOLVER_LIVE_STATE_VALUE,
    );

    return new Promise(resolve => {
      const unsubscribe = liveState.subscribe(() => {
        unsubscribe();
        resolve();
      });
    });
  }

  // Register a new Live State object in the store, subscribing to future
  // updates.
  _setLiveStateValue(
    linkedRecord: Record,
    linkedID: DataID,
    liveState: LiveState<mixed>,
  ) {
    // If there's an existing subscription, unsubscribe.
    // $FlowFixMe[incompatible-type] - casting mixed
    const previousUnsubscribe: () => void = RelayModernRecord.getValue(
      linkedRecord,
      RELAY_RESOLVER_LIVE_STATE_SUBSCRIPTION_KEY,
    );

    if (previousUnsubscribe != null) {
      previousUnsubscribe();
    }

    // Subscribe to future values
    // Note: We subscribe before reading, since subscribing could potentially
    // trigger a synchronous update. By reading second way we will always
    // observe the new value, without needing to double render.
    const handler = this._makeLiveStateHandler(linkedID);
    const unsubscribe = liveState.subscribe(handler);

    // Store the live state value for future re-reads.
    RelayModernRecord.setValue(
      linkedRecord,
      RELAY_RESOLVER_LIVE_STATE_VALUE,
      liveState,
    );

    // Store the current value, for this read, and future cached reads.
    RelayModernRecord.setValue(
      linkedRecord,
      RELAY_RESOLVER_VALUE_KEY,
      liveState.read(),
    );

    // Mark the field as clean.
    RelayModernRecord.setValue(
      linkedRecord,
      RELAY_RESOLVER_LIVE_STATE_DIRTY,
      false,
    );

    // Store our our unsubscribe function for future cleanup.
    RelayModernRecord.setValue(
      linkedRecord,
      RELAY_RESOLVER_LIVE_STATE_SUBSCRIPTION_KEY,
      unsubscribe,
    );
  }

  // Create a callback to handle notifications from the live source that the
  // value may have changed.
  _makeLiveStateHandler(linkedID: DataID): () => void {
    return () => {
      const currentSource = this._getRecordSource();
      const currentRecord = currentSource.get(linkedID);
      if (!currentRecord) {
        // If there is no record yet, it means the subscribe function fired an
        // update synchronously on subscribe (before we even created the record).
        // In this case we can safely ignore this update, since we will be
        // reading the new value when we create the record.
        return;
      }

      const nextSource = RelayRecordSource.create();
      const nextRecord = RelayModernRecord.clone(currentRecord);

      // Mark the field as dirty. The next time it's read, we will call
      // `LiveState.read()`.
      RelayModernRecord.setValue(
        nextRecord,
        RELAY_RESOLVER_LIVE_STATE_DIRTY,
        true,
      );

      nextSource.set(linkedID, nextRecord);
      this._store.publish(nextSource);

      // In the future, this notify might be defferred if we are within a
      // transaction.
      this._store.notify();
    };
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
      const fragmentSet = this._recordIDToResolverIDs.get(recordID);
      if (fragmentSet == null) {
        continue;
      }
      for (const fragment of fragmentSet) {
        if (!visited.has(fragment)) {
          const recordSet = this._resolverIDToRecordIDs.get(fragment);
          if (recordSet == null) {
            continue;
          }
          for (const anotherRecordID of recordSet) {
            this._markInvalidatedResolverRecord(anotherRecordID, recordSource);
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

  // If a given record does not exist, creates an empty record consisting of
  // just an `id` field, along with a namespaced `__id` field and insert it into
  // the store.
  ensureClientRecord(id: string, typeName: string): DataID {
    const key = generateClientObjectClientID(typeName, id);
    const recordSource = this._getRecordSource();
    if (!recordSource.has(key)) {
      const newRecord = RelayModernRecord.create(key, typeName);
      RelayModernRecord.setValue(newRecord, 'id', id);
      recordSource.set(key, newRecord);
    }
    return key;
  }

  // Given the set of possible invalidated DataID
  // (Example may be: records from the reverted optimistic update)
  // this method will remove resolver records from the store,
  // which will force a reader to re-evaluate the value of this field.
  invalidateResolverRecords(invalidatedDataIDs: Set<DataID>): void {
    if (invalidatedDataIDs.size === 0) {
      return;
    }

    for (const dataID of invalidatedDataIDs) {
      const record = this._getRecordSource().get(dataID);
      if (
        record != null &&
        RelayModernRecord.getType(record) === RELAY_RESOLVER_RECORD_TYPENAME
      ) {
        this._getRecordSource().delete(dataID);
      }
    }
  }
}

// Validate that a value is live state
function isLiveStateValue(v: mixed): boolean {
  return (
    v != null &&
    typeof v === 'object' &&
    typeof v.read === 'function' &&
    typeof v.subscribe === 'function'
  );
}

module.exports = {
  LiveResolverCache,
};
