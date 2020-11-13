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

const DataChecker = require('./DataChecker');
const RelayModernRecord = require('./RelayModernRecord');
const RelayOptimisticRecordSource = require('./RelayOptimisticRecordSource');
const RelayProfiler = require('../util/RelayProfiler');
const RelayReader = require('./RelayReader');
const RelayReferenceMarker = require('./RelayReferenceMarker');
const RelayStoreReactFlightUtils = require('./RelayStoreReactFlightUtils');
const RelayStoreUtils = require('./RelayStoreUtils');

const deepFreeze = require('../util/deepFreeze');
const defaultGetDataID = require('./defaultGetDataID');
const hasOverlappingIDs = require('./hasOverlappingIDs');
const invariant = require('invariant');
const isEmptyObject = require('../util/isEmptyObject');
const recycleNodesInto = require('../util/recycleNodesInto');
const resolveImmediate = require('../util/resolveImmediate');

const {ROOT_ID, ROOT_TYPE} = require('./RelayStoreUtils');

import type {DataID, Disposable} from '../util/RelayRuntimeTypes';
import type {Availability} from './DataChecker';
import type {GetDataID} from './RelayResponseNormalizer';
import type {
  CheckOptions,
  LogFunction,
  MutableRecordSource,
  OperationAvailability,
  OperationDescriptor,
  OperationLoader,
  RecordSource,
  RequestDescriptor,
  Scheduler,
  SingularReaderSelector,
  Snapshot,
  Store,
  UpdatedRecords,
} from './RelayStoreTypes';

export opaque type InvalidationState = {|
  dataIDs: $ReadOnlyArray<DataID>,
  invalidations: Map<DataID, ?number>,
|};

type Subscription = {|
  callback: (snapshot: Snapshot) => void,
  snapshot: Snapshot,
  stale: boolean,
  backup: ?Snapshot,
|};

type InvalidationSubscription = {|
  callback: () => void,
  invalidationState: InvalidationState,
|};

const DEFAULT_RELEASE_BUFFER_SIZE = 0;

/**
 * @public
 *
 * An implementation of the `Store` interface defined in `RelayStoreTypes`.
 *
 * Note that a Store takes ownership of all records provided to it: other
 * objects may continue to hold a reference to such records but may not mutate
 * them. The static Relay core is architected to avoid mutating records that may have been
 * passed to a store: operations that mutate records will either create fresh
 * records or clone existing records and modify the clones. Record immutability
 * is also enforced in development mode by freezing all records passed to a store.
 */
class RelayModernStore implements Store {
  _currentWriteEpoch: number;
  _gcHoldCounter: number;
  _gcReleaseBufferSize: number;
  _gcRun: ?Generator<void, void, void>;
  _gcScheduler: Scheduler;
  _getDataID: GetDataID;
  _globalInvalidationEpoch: ?number;
  _invalidationSubscriptions: Set<InvalidationSubscription>;
  _invalidatedRecordIDs: Set<DataID>;
  __log: ?LogFunction;
  _queryCacheExpirationTime: ?number;
  _operationLoader: ?OperationLoader;
  _optimisticSource: ?MutableRecordSource;
  _recordSource: MutableRecordSource;
  _releaseBuffer: Array<string>;
  _roots: Map<
    string,
    {|
      operation: OperationDescriptor,
      refCount: number,
      epoch: ?number,
      fetchTime: ?number,
    |},
  >;
  _shouldScheduleGC: boolean;
  _subscriptions: Set<Subscription>;
  _updatedRecordIDs: UpdatedRecords;

  constructor(
    source: MutableRecordSource,
    options?: {|
      gcScheduler?: ?Scheduler,
      log?: ?LogFunction,
      operationLoader?: ?OperationLoader,
      UNSTABLE_DO_NOT_USE_getDataID?: ?GetDataID,
      gcReleaseBufferSize?: ?number,
      queryCacheExpirationTime?: ?number,
    |},
  ) {
    // Prevent mutation of a record from outside the store.
    if (__DEV__) {
      const storeIDs = source.getRecordIDs();
      for (let ii = 0; ii < storeIDs.length; ii++) {
        const record = source.get(storeIDs[ii]);
        if (record) {
          RelayModernRecord.freeze(record);
        }
      }
    }
    this._currentWriteEpoch = 0;
    this._gcHoldCounter = 0;
    this._gcReleaseBufferSize =
      options?.gcReleaseBufferSize ?? DEFAULT_RELEASE_BUFFER_SIZE;
    this._gcRun = null;
    this._gcScheduler = options?.gcScheduler ?? resolveImmediate;
    this._getDataID =
      options?.UNSTABLE_DO_NOT_USE_getDataID ?? defaultGetDataID;
    this._globalInvalidationEpoch = null;
    this._invalidationSubscriptions = new Set();
    this._invalidatedRecordIDs = new Set();
    this.__log = options?.log ?? null;
    this._queryCacheExpirationTime = options?.queryCacheExpirationTime;
    this._operationLoader = options?.operationLoader ?? null;
    this._optimisticSource = null;
    this._recordSource = source;
    this._releaseBuffer = [];
    this._roots = new Map();
    this._shouldScheduleGC = false;
    this._subscriptions = new Set();
    this._updatedRecordIDs = {};

    initializeRecordSource(this._recordSource);
  }

  getSource(): RecordSource {
    return this._optimisticSource ?? this._recordSource;
  }

  check(
    operation: OperationDescriptor,
    options?: CheckOptions,
  ): OperationAvailability {
    const selector = operation.root;
    const source = this._optimisticSource ?? this._recordSource;
    const globalInvalidationEpoch = this._globalInvalidationEpoch;

    const rootEntry = this._roots.get(operation.request.identifier);
    const operationLastWrittenAt = rootEntry != null ? rootEntry.epoch : null;

    // Check if store has been globally invalidated
    if (globalInvalidationEpoch != null) {
      // If so, check if the operation we're checking was last written
      // before or after invalidation occured.
      if (
        operationLastWrittenAt == null ||
        operationLastWrittenAt <= globalInvalidationEpoch
      ) {
        // If the operation was written /before/ global invalidation occurred,
        // or if this operation has never been written to the store before,
        // we will consider the data for this operation to be stale
        // (i.e. not resolvable from the store).
        return {status: 'stale'};
      }
    }

    const target = options?.target ?? source;
    const handlers = options?.handlers ?? [];
    const operationAvailability = DataChecker.check(
      source,
      target,
      selector,
      handlers,
      this._operationLoader,
      this._getDataID,
    );

    return getAvailabilityStatus(
      operationAvailability,
      operationLastWrittenAt,
      rootEntry?.fetchTime,
      this._queryCacheExpirationTime,
    );
  }

  retain(operation: OperationDescriptor): Disposable {
    const id = operation.request.identifier;
    let disposed = false;
    const dispose = () => {
      // Ensure each retain can only dispose once
      if (disposed) {
        return;
      }
      disposed = true;
      // For Flow: guard against the entry somehow not existing
      const rootEntry = this._roots.get(id);
      if (rootEntry == null) {
        return;
      }
      // Decrement the ref count: if it becomes zero it is eligible
      // for release.
      rootEntry.refCount--;

      if (rootEntry.refCount === 0) {
        const {_queryCacheExpirationTime} = this;
        const rootEntryIsStale =
          rootEntry.fetchTime != null &&
          _queryCacheExpirationTime != null &&
          rootEntry.fetchTime <= Date.now() - _queryCacheExpirationTime;

        if (rootEntryIsStale) {
          this._roots.delete(id);
          this.scheduleGC();
        } else {
          this._releaseBuffer.push(id);

          // If the release buffer is now over-full, remove the least-recently
          // added entry and schedule a GC. Note that all items in the release
          // buffer have a refCount of 0.
          if (this._releaseBuffer.length > this._gcReleaseBufferSize) {
            const _id = this._releaseBuffer.shift();
            this._roots.delete(_id);
            this.scheduleGC();
          }
        }
      }
    };

    const rootEntry = this._roots.get(id);
    if (rootEntry != null) {
      if (rootEntry.refCount === 0) {
        // This entry should be in the release buffer, but it no longer belongs
        // there since it's retained. Remove it to maintain the invariant that
        // all release buffer entries have a refCount of 0.
        this._releaseBuffer = this._releaseBuffer.filter(_id => _id !== id);
      }
      // If we've previously retained this operation, increment the refCount
      rootEntry.refCount += 1;
    } else {
      // Otherwise create a new entry for the operation
      this._roots.set(id, {
        operation,
        refCount: 1,
        epoch: null,
        fetchTime: null,
      });
    }

    return {dispose};
  }

  lookup(selector: SingularReaderSelector): Snapshot {
    const source = this.getSource();
    const snapshot = RelayReader.read(source, selector);
    if (__DEV__) {
      deepFreeze(snapshot);
    }
    return snapshot;
  }

  // This method will return a list of updated owners from the subscriptions
  notify(
    sourceOperation?: OperationDescriptor,
    invalidateStore?: boolean,
  ): $ReadOnlyArray<RequestDescriptor> {
    const log = this.__log;
    if (log != null) {
      log({
        name: 'store.notify.start',
      });
    }

    // Increment the current write when notifying after executing
    // a set of changes to the store.
    this._currentWriteEpoch++;

    if (invalidateStore === true) {
      this._globalInvalidationEpoch = this._currentWriteEpoch;
    }

    const source = this.getSource();
    const updatedOwners = [];
    const hasUpdatedRecords = !isEmptyObject(this._updatedRecordIDs);
    this._subscriptions.forEach(subscription => {
      const owner = this._updateSubscription(
        source,
        subscription,
        hasUpdatedRecords,
      );
      if (owner != null) {
        updatedOwners.push(owner);
      }
    });
    this._invalidationSubscriptions.forEach(subscription => {
      this._updateInvalidationSubscription(
        subscription,
        invalidateStore === true,
      );
    });
    if (log != null) {
      log({
        name: 'store.notify.complete',
        updatedRecordIDs: this._updatedRecordIDs,
        invalidatedRecordIDs: this._invalidatedRecordIDs,
      });
    }

    this._updatedRecordIDs = {};
    this._invalidatedRecordIDs.clear();

    // If a source operation was provided (indicating the operation
    // that produced this update to the store), record the current epoch
    // at which this operation was written.
    if (sourceOperation != null) {
      // We only track the epoch at which the operation was written if
      // it was previously retained, to keep the size of our operation
      // epoch map bounded. If a query wasn't retained, we assume it can
      // may be deleted at any moment and thus is not relevant for us to track
      // for the purposes of invalidation.
      const id = sourceOperation.request.identifier;
      const rootEntry = this._roots.get(id);
      if (rootEntry != null) {
        rootEntry.epoch = this._currentWriteEpoch;
        rootEntry.fetchTime = Date.now();
      } else if (
        sourceOperation.request.node.params.operationKind === 'query' &&
        this._gcReleaseBufferSize > 0 &&
        this._releaseBuffer.length < this._gcReleaseBufferSize
      ) {
        // The operation isn't retained but there is space in the release buffer:
        // temporarily track this operation in case the data can be reused soon.
        const temporaryRootEntry = {
          operation: sourceOperation,
          refCount: 0,
          epoch: this._currentWriteEpoch,
          fetchTime: Date.now(),
        };
        this._releaseBuffer.push(id);
        this._roots.set(id, temporaryRootEntry);
      }
    }

    return updatedOwners;
  }

  publish(source: RecordSource, idsMarkedForInvalidation?: Set<DataID>): void {
    const target = this._optimisticSource ?? this._recordSource;
    updateTargetFromSource(
      target,
      source,
      // We increment the current epoch at the end of the set of updates,
      // in notify(). Here, we pass what will be the incremented value of
      // the epoch to use to write to invalidated records.
      this._currentWriteEpoch + 1,
      idsMarkedForInvalidation,
      this._updatedRecordIDs,
      this._invalidatedRecordIDs,
    );
    // NOTE: log *after* processing the source so that even if a bad log function
    // mutates the source, it doesn't affect Relay processing of it.
    const log = this.__log;
    if (log != null) {
      log({
        name: 'store.publish',
        source,
        optimistic: target === this._optimisticSource,
      });
    }
  }

  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    const subscription = {backup: null, callback, snapshot, stale: false};
    const dispose = () => {
      this._subscriptions.delete(subscription);
    };
    this._subscriptions.add(subscription);
    return {dispose};
  }

  holdGC(): Disposable {
    if (this._gcRun) {
      this._gcRun = null;
      this._shouldScheduleGC = true;
    }
    this._gcHoldCounter++;
    const dispose = () => {
      if (this._gcHoldCounter > 0) {
        this._gcHoldCounter--;
        if (this._gcHoldCounter === 0 && this._shouldScheduleGC) {
          this.scheduleGC();
          this._shouldScheduleGC = false;
        }
      }
    };
    return {dispose};
  }

  toJSON(): mixed {
    return 'RelayModernStore()';
  }

  // Internal API
  __getUpdatedRecordIDs(): UpdatedRecords {
    return this._updatedRecordIDs;
  }

  // Returns the owner (RequestDescriptor) if the subscription was affected by the
  // latest update, or null if it was not affected.
  _updateSubscription(
    source: RecordSource,
    subscription: Subscription,
    hasUpdatedRecords: boolean,
  ): ?RequestDescriptor {
    const {backup, callback, snapshot, stale} = subscription;
    const hasOverlappingUpdates =
      hasUpdatedRecords &&
      hasOverlappingIDs(snapshot.seenRecords, this._updatedRecordIDs);
    if (!stale && !hasOverlappingUpdates) {
      return;
    }
    let nextSnapshot: Snapshot =
      hasOverlappingUpdates || !backup
        ? RelayReader.read(source, snapshot.selector)
        : backup;
    const nextData = recycleNodesInto(snapshot.data, nextSnapshot.data);
    nextSnapshot = ({
      data: nextData,
      isMissingData: nextSnapshot.isMissingData,
      seenRecords: nextSnapshot.seenRecords,
      selector: nextSnapshot.selector,
      missingRequiredFields: nextSnapshot.missingRequiredFields,
    }: Snapshot);
    if (__DEV__) {
      deepFreeze(nextSnapshot);
    }
    subscription.snapshot = nextSnapshot;
    subscription.stale = false;
    if (nextSnapshot.data !== snapshot.data) {
      callback(nextSnapshot);
      return snapshot.selector.owner;
    }
  }

  lookupInvalidationState(dataIDs: $ReadOnlyArray<DataID>): InvalidationState {
    const invalidations = new Map();
    dataIDs.forEach(dataID => {
      const record = this.getSource().get(dataID);
      invalidations.set(
        dataID,
        RelayModernRecord.getInvalidationEpoch(record) ?? null,
      );
    });
    invalidations.set('global', this._globalInvalidationEpoch);
    return {
      dataIDs,
      invalidations,
    };
  }

  checkInvalidationState(prevInvalidationState: InvalidationState): boolean {
    const latestInvalidationState = this.lookupInvalidationState(
      prevInvalidationState.dataIDs,
    );
    const currentInvalidations = latestInvalidationState.invalidations;
    const prevInvalidations = prevInvalidationState.invalidations;

    // Check if global invalidation has changed
    if (
      currentInvalidations.get('global') !== prevInvalidations.get('global')
    ) {
      return true;
    }

    // Check if the invalidation state for any of the ids has changed.
    for (const dataID of prevInvalidationState.dataIDs) {
      if (currentInvalidations.get(dataID) !== prevInvalidations.get(dataID)) {
        return true;
      }
    }

    return false;
  }

  subscribeToInvalidationState(
    invalidationState: InvalidationState,
    callback: () => void,
  ): Disposable {
    const subscription = {callback, invalidationState};
    const dispose = () => {
      this._invalidationSubscriptions.delete(subscription);
    };
    this._invalidationSubscriptions.add(subscription);
    return {dispose};
  }

  _updateInvalidationSubscription(
    subscription: InvalidationSubscription,
    invalidatedStore: boolean,
  ) {
    const {callback, invalidationState} = subscription;
    const {dataIDs} = invalidationState;
    const isSubscribedToInvalidatedIDs =
      invalidatedStore ||
      dataIDs.some(dataID => this._invalidatedRecordIDs.has(dataID));
    if (!isSubscribedToInvalidatedIDs) {
      return;
    }
    callback();
  }

  snapshot(): void {
    invariant(
      this._optimisticSource == null,
      'RelayModernStore: Unexpected call to snapshot() while a previous ' +
        'snapshot exists.',
    );
    const log = this.__log;
    if (log != null) {
      log({
        name: 'store.snapshot',
      });
    }
    this._subscriptions.forEach(subscription => {
      // Backup occurs after writing a new "final" payload(s) and before (re)applying
      // optimistic changes. Each subscription's `snapshot` represents what was *last
      // published to the subscriber*, which notably may include previous optimistic
      // updates. Therefore a subscription can be in any of the following states:
      // - stale=true: This subscription was restored to a different value than
      //   `snapshot`. That means this subscription has changes relative to its base,
      //   but its base has changed (we just applied a final payload): recompute
      //   a backup so that we can later restore to the state the subscription
      //   should be in.
      // - stale=false: This subscription was restored to the same value than
      //   `snapshot`. That means this subscription does *not* have changes relative
      //   to its base, so the current `snapshot` is valid to use as a backup.
      if (!subscription.stale) {
        subscription.backup = subscription.snapshot;
        return;
      }
      const snapshot = subscription.snapshot;
      const backup = RelayReader.read(this.getSource(), snapshot.selector);
      const nextData = recycleNodesInto(snapshot.data, backup.data);
      (backup: $FlowFixMe).data = nextData; // backup owns the snapshot and can safely mutate
      subscription.backup = backup;
    });
    if (this._gcRun) {
      this._gcRun = null;
      this._shouldScheduleGC = true;
    }
    this._optimisticSource = RelayOptimisticRecordSource.create(
      this.getSource(),
    );
  }

  restore(): void {
    invariant(
      this._optimisticSource != null,
      'RelayModernStore: Unexpected call to restore(), expected a snapshot ' +
        'to exist (make sure to call snapshot()).',
    );
    const log = this.__log;
    if (log != null) {
      log({
        name: 'store.restore',
      });
    }
    this._optimisticSource = null;
    if (this._shouldScheduleGC) {
      this.scheduleGC();
    }
    this._subscriptions.forEach(subscription => {
      const backup = subscription.backup;
      subscription.backup = null;
      if (backup) {
        if (backup.data !== subscription.snapshot.data) {
          subscription.stale = true;
        }
        subscription.snapshot = {
          data: subscription.snapshot.data,
          isMissingData: backup.isMissingData,
          seenRecords: backup.seenRecords,
          selector: backup.selector,
          missingRequiredFields: backup.missingRequiredFields,
        };
      } else {
        subscription.stale = true;
      }
    });
  }

  scheduleGC() {
    if (this._gcHoldCounter > 0) {
      this._shouldScheduleGC = true;
      return;
    }
    if (this._gcRun) {
      return;
    }
    this._gcRun = this._collect();
    this._gcScheduler(this._gcStep);
  }

  /**
   * Run a full GC synchronously.
   */
  __gc(): void {
    // Don't run GC while there are optimistic updates applied
    if (this._optimisticSource != null) {
      return;
    }
    const gcRun = this._collect();
    while (!gcRun.next().done) {}
  }

  _gcStep = () => {
    if (this._gcRun) {
      if (this._gcRun.next().done) {
        this._gcRun = null;
      } else {
        this._gcScheduler(this._gcStep);
      }
    }
  };

  *_collect(): Generator<void, void, void> {
    /* eslint-disable no-labels */
    top: while (true) {
      const startEpoch = this._currentWriteEpoch;
      const references = new Set();

      // Mark all records that are traversable from a root
      for (const {operation} of this._roots.values()) {
        const selector = operation.root;
        RelayReferenceMarker.mark(
          this._recordSource,
          selector,
          references,
          this._operationLoader,
        );
        // Yield for other work after each operation
        yield;

        // If the store was updated, restart
        if (startEpoch !== this._currentWriteEpoch) {
          continue top;
        }
      }

      const log = this.__log;
      if (log != null) {
        log({
          name: 'store.gc',
          references,
        });
      }

      // Sweep records without references
      if (references.size === 0) {
        // Short-circuit if *nothing* is referenced
        this._recordSource.clear();
      } else {
        // Evict any unreferenced nodes
        const storeIDs = this._recordSource.getRecordIDs();
        for (let ii = 0; ii < storeIDs.length; ii++) {
          const dataID = storeIDs[ii];
          if (!references.has(dataID)) {
            this._recordSource.remove(dataID);
          }
        }
      }
      return;
    }
  }
}

function initializeRecordSource(target: MutableRecordSource) {
  if (!target.has(ROOT_ID)) {
    const rootRecord = RelayModernRecord.create(ROOT_ID, ROOT_TYPE);
    target.set(ROOT_ID, rootRecord);
  }
}

/**
 * Updates the target with information from source, also updating a mapping of
 * which records in the target were changed as a result.
 * Additionally, will mark records as invalidated at the current write epoch
 * given the set of record ids marked as stale in this update.
 */
function updateTargetFromSource(
  target: MutableRecordSource,
  source: RecordSource,
  currentWriteEpoch: number,
  idsMarkedForInvalidation: ?Set<DataID>,
  updatedRecordIDs: UpdatedRecords,
  invalidatedRecordIDs: Set<DataID>,
): void {
  // First, update any records that were marked for invalidation.
  // For each provided dataID that was invalidated, we write the
  // INVALIDATED_AT_KEY on the record, indicating
  // the epoch at which the record was invalidated.
  if (idsMarkedForInvalidation) {
    idsMarkedForInvalidation.forEach(dataID => {
      const targetRecord = target.get(dataID);
      const sourceRecord = source.get(dataID);

      // If record was deleted during the update (and also invalidated),
      // we don't need to count it as an invalidated id
      if (sourceRecord === null) {
        return;
      }

      let nextRecord;
      if (targetRecord != null) {
        // If the target record exists, use it to set the epoch
        // at which it was invalidated. This record will be updated with
        // any changes from source in the section below
        // where we update the target records based on the source.
        nextRecord = RelayModernRecord.clone(targetRecord);
      } else {
        // If the target record doesn't exist, it means that a new record
        // in the source was created (and also invalidated), so we use that
        // record to set the epoch at which it was invalidated. This record
        // will be updated with any changes from source in the section below
        // where we update the target records based on the source.
        nextRecord =
          sourceRecord != null ? RelayModernRecord.clone(sourceRecord) : null;
      }
      if (!nextRecord) {
        return;
      }
      RelayModernRecord.setValue(
        nextRecord,
        RelayStoreUtils.INVALIDATED_AT_KEY,
        currentWriteEpoch,
      );
      invalidatedRecordIDs.add(dataID);
      target.set(dataID, nextRecord);
    });
  }

  // Update the target based on the changes present in source
  const dataIDs = source.getRecordIDs();
  for (let ii = 0; ii < dataIDs.length; ii++) {
    const dataID = dataIDs[ii];
    const sourceRecord = source.get(dataID);
    const targetRecord = target.get(dataID);

    // Prevent mutation of a record from outside the store.
    if (__DEV__) {
      if (sourceRecord) {
        RelayModernRecord.freeze(sourceRecord);
      }
    }
    if (sourceRecord && targetRecord) {
      // ReactFlightClientResponses are lazy and only materialize when readRoot
      // is called when we read the field, so if the record is a Flight field
      // we always use the new record's data regardless of whether
      // it actually changed. Let React take care of reconciliation instead.
      const nextRecord =
        RelayModernRecord.getType(targetRecord) ===
        RelayStoreReactFlightUtils.REACT_FLIGHT_TYPE_NAME
          ? sourceRecord
          : RelayModernRecord.update(targetRecord, sourceRecord);
      if (nextRecord !== targetRecord) {
        // Prevent mutation of a record from outside the store.
        if (__DEV__) {
          RelayModernRecord.freeze(nextRecord);
        }
        updatedRecordIDs[dataID] = true;
        target.set(dataID, nextRecord);
      }
    } else if (sourceRecord === null) {
      target.delete(dataID);
      if (targetRecord !== null) {
        updatedRecordIDs[dataID] = true;
      }
    } else if (sourceRecord) {
      target.set(dataID, sourceRecord);
      updatedRecordIDs[dataID] = true;
    } // don't add explicit undefined
  }
}

/**
 * Returns an OperationAvailability given the Availability returned
 * by checking an operation, and when that operation was last written to the store.
 * Specifically, the provided Availability of an operation will contain the
 * value of when a record referenced by the operation was most recently
 * invalidated; given that value, and given when this operation was last
 * written to the store, this function will return the overall
 * OperationAvailability for the operation.
 */
function getAvailabilityStatus(
  operationAvailability: Availability,
  operationLastWrittenAt: ?number,
  operationFetchTime: ?number,
  queryCacheExpirationTime: ?number,
): OperationAvailability {
  const {mostRecentlyInvalidatedAt, status} = operationAvailability;
  if (typeof mostRecentlyInvalidatedAt === 'number') {
    // If some record referenced by this operation is stale, then the operation itself is stale
    // if either the operation itself was never written *or* the operation was last written
    // before the most recent invalidation of its reachable records.
    if (
      operationLastWrittenAt == null ||
      mostRecentlyInvalidatedAt > operationLastWrittenAt
    ) {
      return {status: 'stale'};
    }
  }

  if (status === 'missing') {
    return {status: 'missing'};
  }

  if (operationFetchTime != null && queryCacheExpirationTime != null) {
    const isStale = operationFetchTime <= Date.now() - queryCacheExpirationTime;
    if (isStale) {
      return {status: 'stale'};
    }
  }

  // There were no invalidations of any reachable records *or* the operation is known to have
  // been fetched after the most recent record invalidation.
  return {status: 'available', fetchTime: operationFetchTime ?? null};
}

RelayProfiler.instrumentMethods(RelayModernStore.prototype, {
  lookup: 'RelayModernStore.prototype.lookup',
});

module.exports = RelayModernStore;
