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
  ResolverNormalizationInfo,
} from '../../util/ReaderNode';
import type {DataID, Variables} from '../../util/RelayRuntimeTypes';
import type {NormalizationOptions} from '../RelayResponseNormalizer';
import type {
  DataIDSet,
  MutableRecordSource,
  Record,
  RecordSource,
  RelayResolverError,
  SingularReaderSelector,
  Snapshot,
} from '../RelayStoreTypes';
import type {
  EvaluationResult,
  GetDataForResolverFragmentFn,
  ResolverCache,
} from '../ResolverCache';
import type LiveResolverStore from './LiveResolverStore';
import type {LiveState} from './LiveResolverStore';

const recycleNodesInto = require('../../util/recycleNodesInto');
const {RELAY_LIVE_RESOLVER} = require('../../util/RelayConcreteNode');
const {generateClientID, generateClientObjectClientID} = require('../ClientID');
const RelayModernRecord = require('../RelayModernRecord');
const {createNormalizationSelector} = require('../RelayModernSelector');
const RelayRecordSource = require('../RelayRecordSource');
const {normalize} = require('../RelayResponseNormalizer');
const {
  RELAY_RESOLVER_ERROR_KEY,
  RELAY_RESOLVER_INVALIDATION_KEY,
  RELAY_RESOLVER_OUTPUT_TYPE_RECORD_IDS,
  RELAY_RESOLVER_SNAPSHOT_KEY,
  RELAY_RESOLVER_VALUE_KEY,
  getStorageKey,
} = require('../RelayStoreUtils');
const getOutputTypeRecordIDs = require('./getOutputTypeRecordIDs');
const isLiveStateValue = require('./isLiveStateValue');
const {isSuspenseSentinel} = require('./LiveResolverSuspenseSentinel');
const invariant = require('invariant');
const warning = require('warning');

// When this experiment gets promoted to stable, these keys will move into
// `RelayStoreUtils`.
const RELAY_RESOLVER_LIVE_STATE_SUBSCRIPTION_KEY =
  '__resolverLiveStateSubscription';
const RELAY_RESOLVER_LIVE_STATE_VALUE = '__resolverLiveStateValue';
const RELAY_RESOLVER_LIVE_STATE_DIRTY = '__resolverLiveStateDirty';
const RELAY_RESOLVER_RECORD_TYPENAME = '__RELAY_RESOLVER__';

/**
 * An experimental fork of store/ResolverCache.js intended to let us experiment
 * with Live Resolvers.
 */

type ResolverID = string;

export opaque type UpdatedRecords = DataIDSet;

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
  _handlingBatch: boolean; // Flag indicating that Live Resolver updates are being batched.
  _liveResolverBatchRecordSource: ?MutableRecordSource; // Lazily created record source for batched Live Resolver updates.

  constructor(
    getRecordSource: () => MutableRecordSource,
    store: LiveResolverStore,
  ) {
    this._resolverIDToRecordIDs = new Map();
    this._recordIDToResolverIDs = new Map();
    this._getRecordSource = getRecordSource;
    this._store = store;
    this._handlingBatch = false;
    this._liveResolverBatchRecordSource = null;
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
    ?RelayResolverError,
    ?Snapshot,
    ?DataID /* ID of record containing a suspended Live field */,
    ?DataIDSet /** Set of dirty records after read */,
  ] {
    const recordSource = this._getRecordSource();

    // NOTE: Be very careful with `record` in this scope. After `evaluate` has
    // been called, the `record` we have here may have been replaced in the
    // Relay store with a new record containing new information about nested
    // resolvers on this parent record.
    const record = expectRecord(recordSource, recordID);

    const storageKey = getStorageKey(field, variables);
    let linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    let linkedRecord = linkedID == null ? null : recordSource.get(linkedID);

    let updatedDataIDs;

    if (
      linkedRecord == null ||
      this._isInvalid(linkedRecord, getDataForResolverFragment)
    ) {
      // Cache miss; evaluate the selector and store the result in a new record:

      if (linkedRecord != null) {
        // Clean up any existing subscriptions before creating the new subscription
        // to avoid being double subscribed, or having a dangling subscription in
        // the event of an error during subscription.
        this._maybeUnsubscribeFromLiveState(linkedRecord);
      }
      linkedID = linkedID ?? generateClientID(recordID, storageKey);
      linkedRecord = RelayModernRecord.create(
        linkedID,
        RELAY_RESOLVER_RECORD_TYPENAME,
      );

      const evaluationResult = evaluate();

      if (field.kind === RELAY_LIVE_RESOLVER) {
        if (evaluationResult.resolverResult != undefined) {
          if (__DEV__) {
            invariant(
              isLiveStateValue(evaluationResult.resolverResult),
              'Expected the @live Relay Resolver backing the field "%s" to return a value ' +
                'that implements LiveState. Did you mean to remove the @live annotation on this resolver?',
              field.path,
            );
          }
          const liveState: LiveState<mixed> =
            // $FlowFixMe[incompatible-type] - casting mixed
            evaluationResult.resolverResult;
          updatedDataIDs = this._setLiveStateValue(
            linkedRecord,
            linkedID,
            liveState,
            field,
            variables,
          );
        } else {
          if (__DEV__) {
            invariant(
              evaluationResult.error != null ||
                evaluationResult.snapshot?.isMissingData,
              'Expected the @live Relay Resolver backing the field "%s" to return a value ' +
                'that implements LiveState interface. The result for this field is `%s`, we also did not detect any errors, ' +
                'or missing data during resolver execution. Did you mean to remove the @live annotation on this ' +
                'resolver, or was there unexpected early return in the function?',
              field.path,
              String(evaluationResult.resolverResult),
            );
          }
        }
      } else {
        if (__DEV__) {
          invariant(
            !isLiveStateValue(evaluationResult.resolverResult),
            'Unexpected LiveState value returned from the non-@live Relay Resolver backing the field "%s". Did you intend to add @live to this resolver?',
            field.path,
          );
        }
        updatedDataIDs = this._setResolverValue(
          linkedRecord,
          evaluationResult.resolverResult,
          field,
          variables,
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

      // Note: We get a fresh instance of the parent record from the record
      // source, because it may have been updated when we traversed into child
      // resolvers.
      const currentRecord = expectRecord(recordSource, recordID);
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

      if (!isLiveStateValue(liveState)) {
        invariant(
          false,
          'Unexpected LiveState value returned from Relay Resolver internal field `RELAY_RESOLVER_LIVE_STATE_VALUE`. ' +
            'It is likely a bug in Relay, or a corrupt state of the relay store state ' +
            'Field Path `%s`. Record `%s`.',
          field.path,
          JSON.stringify(linkedRecord),
        );
      }

      updatedDataIDs = this._setResolverValue(
        linkedRecord,
        liveState.read(),
        field,
        variables,
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
    const answer: T = this._getResolverValue(linkedRecord);

    // $FlowFixMe[incompatible-type] - casting mixed
    const snapshot: ?Snapshot = linkedRecord[RELAY_RESOLVER_SNAPSHOT_KEY];
    // $FlowFixMe[incompatible-type] - casting mixed
    const error: ?RelayResolverError = linkedRecord[RELAY_RESOLVER_ERROR_KEY];

    let suspenseID = null;

    if (isSuspenseSentinel(answer)) {
      suspenseID = linkedID ?? generateClientID(recordID, storageKey);
    }

    return [answer, linkedID, error, snapshot, suspenseID, updatedDataIDs];
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
      const unsubscribe: () => void = liveState.subscribe(() => {
        unsubscribe();
        resolve();
      });
    });
  }

  _maybeUnsubscribeFromLiveState(linkedRecord: Record) {
    // If there's an existing subscription, unsubscribe.
    // $FlowFixMe[incompatible-type] - casting mixed
    const previousUnsubscribe: () => void = RelayModernRecord.getValue(
      linkedRecord,
      RELAY_RESOLVER_LIVE_STATE_SUBSCRIPTION_KEY,
    );
    if (previousUnsubscribe != null) {
      previousUnsubscribe();
    }
  }

  // Register a new Live State object in the store, subscribing to future
  // updates.
  _setLiveStateValue(
    linkedRecord: Record,
    linkedID: DataID,
    liveState: LiveState<mixed>,
    field: ReaderRelayLiveResolver,
    variables: Variables,
  ): DataIDSet | null {
    // Subscribe to future values
    // Note: We subscribe before reading, since subscribing could potentially
    // trigger a synchronous update. By reading a second way we will always
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
    const updatedDataIDs = this._setResolverValue(
      linkedRecord,
      liveState.read(),
      field,
      variables,
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

    return updatedDataIDs;
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

      if (!(RELAY_RESOLVER_LIVE_STATE_VALUE in currentRecord)) {
        warning(
          false,
          'Unexpected callback for a incomplete live resolver record (__id: `%s`). The record has missing live state value. ' +
            'This is a no-op and indicates a memory leak, and possible bug in Relay Live Resolvers. ' +
            'Possible cause: The original record was GC-ed, or was created with the optimistic record source.' +
            ' Record details: `%s`.',
          linkedID,
          JSON.stringify(currentRecord),
        );
        return;
      }

      const nextRecord = RelayModernRecord.clone(currentRecord);

      // Mark the field as dirty. The next time it's read, we will call
      // `LiveState.read()`.
      RelayModernRecord.setValue(
        nextRecord,
        RELAY_RESOLVER_LIVE_STATE_DIRTY,
        true,
      );

      this._setLiveResolverUpdate(linkedID, nextRecord);
    };
  }

  _setLiveResolverUpdate(linkedId: DataID, record: Record) {
    if (this._handlingBatch) {
      // Lazily create the batched record source.
      if (this._liveResolverBatchRecordSource == null) {
        this._liveResolverBatchRecordSource = RelayRecordSource.create();
      }
      this._liveResolverBatchRecordSource.set(linkedId, record);
      // We will wait for the batch to complete before we publish/notify...
    } else {
      const nextSource = RelayRecordSource.create();
      nextSource.set(linkedId, record);

      // We are not within a batch, so we will immediately publish/notify.
      this._store.publish(nextSource);
      this._store.notify();
    }
  }

  batchLiveStateUpdates(callback: () => void) {
    invariant(
      !this._handlingBatch,
      'Unexpected nested call to batchLiveStateUpdates.',
    );
    this._handlingBatch = true;
    try {
      callback();
    } finally {
      // We lazily create the record source. If one has not been created, there
      // is nothing to publish.
      if (this._liveResolverBatchRecordSource != null) {
        this._store.publish(this._liveResolverBatchRecordSource);
        this._store.notify();
      }

      // Reset batched state.
      this._liveResolverBatchRecordSource = null;
      this._handlingBatch = false;
    }
  }

  _setResolverValue(
    resolverRecord: Record,
    value: mixed,
    field: ReaderRelayResolver | ReaderRelayLiveResolver,
    variables: Variables,
  ): DataIDSet | null {
    const normalizationInfo = field.normalizationInfo;
    let updatedDataIDs = null;
    if (value != null && normalizationInfo != null) {
      let resolverValue: DataID | Array<DataID>;

      const prevOutputTypeRecordIDs = getOutputTypeRecordIDs(resolverRecord);
      const nextOutputTypeRecordIDs: Set<DataID> = new Set();

      const currentSource = this._getRecordSource();
      if (normalizationInfo.plural) {
        invariant(
          Array.isArray(value),
          '_setResolverValue: Expected array value for plural @outputType resolver.',
        );

        // For plural resolvers we will be returning
        // the list of generated @outputType record `ID`s.
        resolverValue = [];

        const nextSource = RelayRecordSource.create();
        for (let ii = 0; ii < value.length; ii++) {
          const currentValue = value[ii];
          if (currentValue == null) {
            continue;
          }
          invariant(
            typeof currentValue == 'object',
            '_setResolverValue: Expected object value as the payload for the @outputType resolver.',
          );
          // The `id` of the nested object (@outputType resolver)
          // is localized to it's resolver record. To ensure that
          // there is only one path to the records created from the
          // @outputType payload.

          const typename = getConcreteTypename(normalizationInfo, currentValue);

          const outputTypeDataID = generateClientObjectClientID(
            typename,
            RelayModernRecord.getDataID(resolverRecord),
            ii,
          );
          const source = normalizeOutputTypeValue(
            outputTypeDataID,
            currentValue,
            variables,
            normalizationInfo,
            this._store.__getNormalizationOptions([field.path, String(ii)]),
            typename,
          );
          for (const recordID of source.getRecordIDs()) {
            // For plural case we'll keep adding the `item` records to the `nextSource`
            // so we can publish all of them at the same time: clean up all records,
            // and correctly collect all `dirty` records.
            nextSource.set(recordID, expectRecord(source, recordID));
            nextOutputTypeRecordIDs.add(recordID);
          }

          resolverValue.push(outputTypeDataID);
        }

        // Adding/removing/updating records in the `currentSource`.
        updatedDataIDs = updateCurrentSource(
          currentSource,
          nextSource,
          prevOutputTypeRecordIDs,
        );
      } else {
        invariant(
          typeof value == 'object',
          '_setResolverValue: Expected object value as the payload for the @outputType resolver.',
        );
        const typename = getConcreteTypename(normalizationInfo, value);

        const outputTypeDataID = generateClientObjectClientID(
          typename,
          RelayModernRecord.getDataID(resolverRecord),
        );
        const nextSource = normalizeOutputTypeValue(
          outputTypeDataID,
          value,
          variables,
          normalizationInfo,
          this._store.__getNormalizationOptions([field.path]),
          typename,
        );
        for (const recordID of nextSource.getRecordIDs()) {
          nextOutputTypeRecordIDs.add(recordID);
        }
        resolverValue = outputTypeDataID;

        updatedDataIDs = updateCurrentSource(
          currentSource,
          nextSource,
          prevOutputTypeRecordIDs,
        );
      }

      // Keep track of the created record IDs from this resolver
      // so we can properly clean them, if they are no longer used.
      RelayModernRecord.setValue(
        resolverRecord,
        RELAY_RESOLVER_OUTPUT_TYPE_RECORD_IDS,
        nextOutputTypeRecordIDs,
      );

      RelayModernRecord.setValue(
        resolverRecord,
        RELAY_RESOLVER_VALUE_KEY,
        resolverValue,
      );
    } else {
      // For "classic" resolvers (or if the value is nullish), we are just setting their
      // value as is.
      RelayModernRecord.setValue(
        resolverRecord,
        RELAY_RESOLVER_VALUE_KEY,
        value,
      );
    }

    return updatedDataIDs;
  }

  notifyUpdatedSubscribers(updatedDataIDs: DataIDSet): void {
    this._store.__notifyUpdatedSubscribers(updatedDataIDs);
  }

  _getResolverValue(resolverRecord: Record): mixed {
    return RelayModernRecord.getValue(resolverRecord, RELAY_RESOLVER_VALUE_KEY);
  }

  invalidateDataIDs(
    updatedDataIDs: DataIDSet, // Mutated in place
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

  unsubscribeFromLiveResolverRecords(invalidatedDataIDs: Set<DataID>): void {
    if (invalidatedDataIDs.size === 0) {
      return;
    }

    for (const dataID of invalidatedDataIDs) {
      const record = this._getRecordSource().get(dataID);
      if (
        record != null &&
        RelayModernRecord.getType(record) === RELAY_RESOLVER_RECORD_TYPENAME
      ) {
        this._maybeUnsubscribeFromLiveState(record);
      }
    }
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

// Returns a normalized version (RecordSource) of the @outputType,
// containing only "weak" records.
function normalizeOutputTypeValue(
  outputTypeDataID: DataID,
  value: {...},
  variables: Variables,
  resolverNormalizationInfo: ResolverNormalizationInfo,
  normalizationOptions: NormalizationOptions,
  typename: string,
): RecordSource {
  const source = RelayRecordSource.create();
  source.set(
    outputTypeDataID,
    RelayModernRecord.create(outputTypeDataID, typename),
  );
  const selector = createNormalizationSelector(
    resolverNormalizationInfo.normalizationNode,
    outputTypeDataID,
    variables,
  );

  // The resulted `source` is the normalized version of the
  // resolver's (@outputType) value.
  // All records in the `source` should have IDs that
  // is "prefix-ed" with the parent resolver record `ID`
  // and they don't expect to have a "strong" identifier.
  return normalize(source, selector, value, normalizationOptions).source;
}

// Update the `currentSource` with the set of new records from the
// resolver with @outputType.
// This method will return a set of `updatedDataIDs` IDs.
// The record is marked as `updated`, if
// - it is removed from the current source
// - it is updated in the current source
// A record is **not** marked as `updated` if it is only added to the current source.
function updateCurrentSource(
  currentSource: MutableRecordSource,
  nextSource: RecordSource,
  prevOutputTypeRecordIDs: ?$ReadOnlySet<DataID>,
): DataIDSet {
  const updatedDataIDs = new Set<DataID>();

  // First, we are removing records from the `currentSource`
  // that is no longer created from the resolver with @outputType
  // (these are new records in the `nextSource`).
  if (prevOutputTypeRecordIDs != null) {
    for (const recordID of prevOutputTypeRecordIDs) {
      if (!nextSource.has(recordID)) {
        updatedDataIDs.add(recordID);
        currentSource.remove(recordID);
      }
    }
  }

  // Next, we are updating records in the `currentSource` with the
  // new values from the `nextSource`. If the record has change we're adding its
  // `id` to the set of `updatedDataIDs`.
  // New records are just added to the `currentSource`, we do not add their
  // ids to the `updatedDataIDs` set, as there shouldn't be any subscribers
  // for these.
  for (const recordID of nextSource.getRecordIDs()) {
    const nextRecord = expectRecord(nextSource, recordID);
    if (currentSource.has(recordID)) {
      const currentRecord = expectRecord(currentSource, recordID);
      const updatedRecord = RelayModernRecord.update(currentRecord, nextRecord);
      if (updatedRecord !== currentRecord) {
        updatedDataIDs.add(recordID);
        currentSource.set(recordID, nextRecord);
      }
    } else {
      currentSource.set(recordID, nextRecord);
    }
  }

  return updatedDataIDs;
}

function expectRecord(source: RecordSource, recordID: DataID): Record {
  const record = source.get(recordID);
  invariant(
    record != null,
    'Expected a record with ID `%s` to exist in the record source.',
    recordID,
  );

  return record;
}

function getUpdatedDataIDs(updatedRecords: UpdatedRecords): DataIDSet {
  return updatedRecords;
}

function getConcreteTypename(
  normalizationInfo: ResolverNormalizationInfo,
  currentValue: {...},
): string {
  // If normalizationInfo does not have a concrete type (i.e. the return type of the resolver
  // is abstract), then the generated return type for the resolver will include a mandatory
  // __typename field.
  const typename =
    normalizationInfo.concreteType ??
    // $FlowFixMe[prop-missing]
    (currentValue.__typename: string);
  invariant(
    typename != null,
    'normalizationInfo.concreteType should not be null, or the value returned from the resolver should include a __typename field, ' +
      'or the resolver should have a flow error. If not, this indicates a bug in Relay.',
  );
  return typename;
}

module.exports = {
  LiveResolverCache,
  getUpdatedDataIDs,
};
