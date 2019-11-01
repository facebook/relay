/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const DataChecker = require('./DataChecker');
const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const RelayModernRecord = require('./RelayModernRecord');
const RelayOptimisticRecordSource = require('./RelayOptimisticRecordSource');
const RelayProfiler = require('../util/RelayProfiler');
const RelayReader = require('./RelayReader');
const RelayReferenceMarker = require('./RelayReferenceMarker');

const deepFreeze = require('../util/deepFreeze');
const defaultGetDataID = require('./defaultGetDataID');
const hasOverlappingIDs = require('./hasOverlappingIDs');
const invariant = require('invariant');
const recycleNodesInto = require('../util/recycleNodesInto');
const resolveImmediate = require('../util/resolveImmediate');

const {createReaderSelector} = require('./RelayModernSelector');

import type {ReaderFragment} from '../util/ReaderNode';
import type {Disposable} from '../util/RelayRuntimeTypes';
import type {
  ConnectionID,
  ConnectionInternalEvent,
  ConnectionReference,
  ConnectionResolver,
  ConnectionSnapshot,
} from './RelayConnection';
import type {GetDataID} from './RelayResponseNormalizer';
import type {
  MutableRecordSource,
  NormalizationSelector,
  OperationLoader,
  RecordSource,
  RequestDescriptor,
  Scheduler,
  SingularReaderSelector,
  Snapshot,
  Store,
  UpdatedRecords,
} from './RelayStoreTypes';

type Subscription = {
  callback: (snapshot: Snapshot) => void,
  snapshot: Snapshot,
  stale: boolean,
  backup: ?Snapshot,
};

type UpdatedConnections = {[ConnectionID]: boolean};
type ConnectionEvents = {|
  final: Array<ConnectionInternalEvent>,
  optimistic: ?Array<ConnectionInternalEvent>,
|};
type ConnectionSubscription<TEdge, TState> = {|
  +callback: (snapshot: ConnectionSnapshot<TEdge, TState>) => void,
  +id: string,
  +resolver: ConnectionResolver<TEdge, TState>,
  snapshot: ConnectionSnapshot<TEdge, TState>,
  backup: ?ConnectionSnapshot<TEdge, TState>,
  stale: boolean,
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
  _connectionEvents: Map<ConnectionID, ConnectionEvents>;
  _connectionSubscriptions: Map<string, ConnectionSubscription<mixed, mixed>>;
  _gcHoldCounter: number;
  _gcReleaseBufferSize: number;
  _gcScheduler: Scheduler;
  _getDataID: GetDataID;
  _hasScheduledGC: boolean;
  _index: number;
  _operationLoader: ?OperationLoader;
  _optimisticSource: ?MutableRecordSource;
  _recordSource: MutableRecordSource;
  _releaseBuffer: Array<number>;
  _roots: Map<number, NormalizationSelector>;
  _shouldScheduleGC: boolean;
  _subscriptions: Set<Subscription>;
  _updatedConnectionIDs: UpdatedConnections;
  _updatedRecordIDs: UpdatedRecords;

  constructor(
    source: MutableRecordSource,
    options?: {|
      gcScheduler?: ?Scheduler,
      operationLoader?: ?OperationLoader,
      UNSTABLE_DO_NOT_USE_getDataID?: ?GetDataID,
      gcReleaseBufferSize?: ?number,
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
    this._connectionEvents = new Map();
    this._connectionSubscriptions = new Map();
    this._gcHoldCounter = 0;
    this._gcReleaseBufferSize =
      options?.gcReleaseBufferSize ?? DEFAULT_RELEASE_BUFFER_SIZE;
    this._gcScheduler = options?.gcScheduler ?? resolveImmediate;
    this._getDataID =
      options?.UNSTABLE_DO_NOT_USE_getDataID ?? defaultGetDataID;
    this._hasScheduledGC = false;
    this._index = 0;
    this._operationLoader = options?.operationLoader ?? null;
    this._optimisticSource = null;
    this._recordSource = source;
    this._releaseBuffer = [];
    this._roots = new Map();
    this._shouldScheduleGC = false;
    this._subscriptions = new Set();
    this._updatedConnectionIDs = {};
    this._updatedRecordIDs = {};
  }

  getSource(): RecordSource {
    return this._optimisticSource ?? this._recordSource;
  }

  getConnectionEvents_UNSTABLE(
    connectionID: ConnectionID,
  ): ?$ReadOnlyArray<ConnectionInternalEvent> {
    const events = this._connectionEvents.get(connectionID);
    if (events != null) {
      return events.optimistic ?? events.final;
    }
  }

  check(selector: NormalizationSelector): boolean {
    const source = this._optimisticSource ?? this._recordSource;
    return DataChecker.check(
      source,
      source,
      selector,
      [],
      this._operationLoader,
      this._getDataID,
      id => this.getConnectionEvents_UNSTABLE(id),
    );
  }

  retain(selector: NormalizationSelector): Disposable {
    const index = this._index++;
    const dispose = () => {
      // When disposing, move the selector onto the release buffer
      this._releaseBuffer.push(index);

      // Only when the release buffer is full do we actually
      // release the selector and run GC
      if (this._releaseBuffer.length > this._gcReleaseBufferSize) {
        const idx = this._releaseBuffer.shift();
        this._roots.delete(idx);
        this._scheduleGC();
      }
    };
    this._roots.set(index, selector);
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

  // This method will return a list of updated owners form the subscriptions
  notify(): $ReadOnlyArray<RequestDescriptor> {
    const source = this.getSource();
    const updatedOwners = [];
    this._subscriptions.forEach(subscription => {
      const owner = this._updateSubscription(source, subscription);
      if (owner != null) {
        updatedOwners.push(owner);
      }
    });
    this._connectionSubscriptions.forEach((subscription, id) => {
      if (subscription.stale) {
        subscription.stale = false;
        subscription.callback(subscription.snapshot);
      }
    });
    this._updatedConnectionIDs = {};
    this._updatedRecordIDs = {};
    return updatedOwners;
  }

  publish(source: RecordSource): void {
    const target = this._optimisticSource ?? this._recordSource;
    updateTargetFromSource(target, source, this._updatedRecordIDs);
    this._connectionSubscriptions.forEach((subscription, id) => {
      const hasStoreUpdates = hasOverlappingIDs(
        subscription.snapshot.seenRecords,
        this._updatedRecordIDs,
      );
      if (!hasStoreUpdates) {
        return;
      }
      const nextSnapshot = this._updateConnection_UNSTABLE(
        subscription.resolver,
        subscription.snapshot,
        source,
        null,
      );
      if (nextSnapshot) {
        subscription.snapshot = nextSnapshot;
        subscription.stale = true;
      }
    });
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
    this._gcHoldCounter++;
    const dispose = () => {
      if (this._gcHoldCounter > 0) {
        this._gcHoldCounter--;
        if (this._gcHoldCounter === 0 && this._shouldScheduleGC) {
          this._scheduleGC();
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
  ): ?RequestDescriptor {
    const {backup, callback, snapshot, stale} = subscription;
    const hasOverlappingUpdates = hasOverlappingIDs(
      snapshot.seenRecords,
      this._updatedRecordIDs,
    );
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

  lookupConnection_UNSTABLE<TEdge, TState>(
    connectionReference: ConnectionReference<TEdge>,
    resolver: ConnectionResolver<TEdge, TState>,
  ): ConnectionSnapshot<TEdge, TState> {
    invariant(
      RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS,
      'RelayModernStore: Connection resolvers are not yet supported.',
    );
    const {id} = connectionReference;
    const initialState: TState = resolver.initialize();
    const connectionEvents = this._connectionEvents.get(id);
    const events: ?$ReadOnlyArray<ConnectionInternalEvent> =
      connectionEvents != null
        ? connectionEvents.optimistic ?? connectionEvents.final
        : null;
    const initialSnapshot = {
      edgeSnapshots: {},
      id,
      reference: connectionReference,
      seenRecords: {},
      state: initialState,
    };
    if (events == null || events.length === 0) {
      return initialSnapshot;
    }
    return this._reduceConnection_UNSTABLE(
      resolver,
      connectionReference,
      initialSnapshot,
      events,
    );
  }

  subscribeConnection_UNSTABLE<TEdge, TState>(
    snapshot: ConnectionSnapshot<TEdge, TState>,
    resolver: ConnectionResolver<TEdge, TState>,
    callback: (ConnectionSnapshot<TEdge, TState>) => void,
  ): Disposable {
    invariant(
      RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS,
      'RelayModernStore: Connection resolvers are not yet supported.',
    );
    const id = String(this._index++);
    const subscription: ConnectionSubscription<TEdge, TState> = {
      backup: null,
      callback,
      id,
      resolver,
      snapshot,
      stale: false,
    };
    const dispose = () => {
      this._connectionSubscriptions.delete(id);
    };
    this._connectionSubscriptions.set(id, (subscription: $FlowFixMe));
    return {dispose};
  }

  publishConnectionEvents_UNSTABLE(
    events: Array<ConnectionInternalEvent>,
    final: boolean,
  ): void {
    if (events.length === 0) {
      return;
    }
    invariant(
      RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS,
      'RelayModernStore: Connection resolvers are not yet supported.',
    );
    const pendingConnectionEvents = new Map<
      ConnectionID,
      Array<ConnectionInternalEvent>,
    >();
    events.forEach(event => {
      const {connectionID} = event;
      let pendingEvents = pendingConnectionEvents.get(connectionID);
      if (pendingEvents == null) {
        pendingEvents = [];
        pendingConnectionEvents.set(connectionID, pendingEvents);
      }
      pendingEvents.push(event);
      let connectionEvents: ?ConnectionEvents = this._connectionEvents.get(
        connectionID,
      );
      if (connectionEvents == null) {
        connectionEvents = {
          final: [],
          optimistic: null,
        };
        this._connectionEvents.set(connectionID, connectionEvents);
      }
      if (final) {
        connectionEvents.final.push(event);
      } else {
        let optimisticEvents = connectionEvents.optimistic;
        if (optimisticEvents == null) {
          optimisticEvents = connectionEvents.final.slice();
          connectionEvents.optimistic = optimisticEvents;
        }
        optimisticEvents.push(event);
      }
    });
    this._connectionSubscriptions.forEach((subscription, id) => {
      const pendingEvents = pendingConnectionEvents.get(
        subscription.snapshot.reference.id,
      );
      if (pendingEvents == null) {
        return;
      }
      const nextSnapshot = this._updateConnection_UNSTABLE(
        subscription.resolver,
        subscription.snapshot,
        null,
        pendingEvents,
      );
      if (nextSnapshot) {
        subscription.snapshot = nextSnapshot;
        subscription.stale = true;
      }
    });
  }

  _updateConnection_UNSTABLE<TEdge, TState>(
    resolver: ConnectionResolver<TEdge, TState>,
    snapshot: ConnectionSnapshot<TEdge, TState>,
    source: ?RecordSource,
    pendingEvents: ?Array<ConnectionInternalEvent>,
  ): ?ConnectionSnapshot<TEdge, TState> {
    const nextSnapshot = this._reduceConnection_UNSTABLE(
      resolver,
      snapshot.reference,
      snapshot,
      pendingEvents ?? [],
      source,
    );
    const state = recycleNodesInto(snapshot.state, nextSnapshot.state);
    if (__DEV__) {
      deepFreeze(nextSnapshot);
    }
    if (state !== snapshot.state) {
      return {...nextSnapshot, state};
    }
  }

  _reduceConnection_UNSTABLE<TEdge, TState>(
    resolver: ConnectionResolver<TEdge, TState>,
    connectionReference: ConnectionReference<TEdge>,
    snapshot: ConnectionSnapshot<TEdge, TState>,
    events: $ReadOnlyArray<ConnectionInternalEvent>,
    source: ?RecordSource = null,
  ): ConnectionSnapshot<TEdge, TState> {
    const {edgesField, id, variables} = connectionReference;
    const fragment: ReaderFragment = {
      kind: 'Fragment',
      name: edgesField.name,
      type: edgesField.concreteType ?? '__Any',
      metadata: null,
      argumentDefinitions: [],
      selections: edgesField.selections,
    };
    const seenRecords = {};
    const edgeSnapshots = {...snapshot.edgeSnapshots};
    let initialState = snapshot.state;
    if (source) {
      const edgeData = {};
      Object.keys(edgeSnapshots).forEach(edgeID => {
        const prevSnapshot = edgeSnapshots[edgeID];
        let nextSnapshot = RelayReader.read(
          this.getSource(),
          createReaderSelector(
            fragment,
            edgeID,
            variables,
            prevSnapshot.selector.owner,
          ),
        );
        const data = recycleNodesInto(prevSnapshot.data, nextSnapshot.data);
        nextSnapshot = {
          data,
          isMissingData: nextSnapshot.isMissingData,
          seenRecords: nextSnapshot.seenRecords,
          selector: nextSnapshot.selector,
        };
        if (data !== prevSnapshot.data) {
          edgeData[edgeID] = data;
          /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
           * Flow v0.111.0 was deployed. To see the error, delete this comment
           * and run Flow. */
          edgeSnapshots[edgeID] = nextSnapshot;
        }
      });
      if (Object.keys(edgeData).length !== 0) {
        initialState = resolver.reduce(initialState, {
          kind: 'update',
          edgeData,
        });
      }
    }
    const state: TState = events.reduce(
      (prevState: TState, event: ConnectionInternalEvent) => {
        if (event.kind === 'fetch') {
          const edges = [];
          event.edgeIDs.forEach(edgeID => {
            if (edgeID == null) {
              edges.push(edgeID);
              return;
            }
            const edgeSnapshot = RelayReader.read(
              this.getSource(),
              createReaderSelector(fragment, edgeID, variables, event.request),
            );
            Object.assign(seenRecords, edgeSnapshot.seenRecords);
            const itemData = ((edgeSnapshot.data: $FlowFixMe): ?TEdge);
            /* $FlowFixMe(>=0.111.0) This comment suppresses an error found
             * when Flow v0.111.0 was deployed. To see the error, delete this
             * comment and run Flow. */
            edgeSnapshots[edgeID] = edgeSnapshot;
            edges.push(itemData);
          });
          return resolver.reduce(prevState, {
            kind: 'fetch',
            args: event.args,
            edges,
            pageInfo: event.pageInfo,
            stream: event.stream,
          });
        } else if (event.kind === 'insert') {
          const edgeSnapshot = RelayReader.read(
            this.getSource(),
            createReaderSelector(
              fragment,
              event.edgeID,
              variables,
              event.request,
            ),
          );
          Object.assign(seenRecords, edgeSnapshot.seenRecords);
          const itemData = ((edgeSnapshot.data: $FlowFixMe): ?TEdge);
          /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
           * Flow v0.111.0 was deployed. To see the error, delete this comment
           * and run Flow. */
          edgeSnapshots[event.edgeID] = edgeSnapshot;
          return resolver.reduce(prevState, {
            args: event.args,
            edge: itemData,
            kind: 'insert',
          });
        } else if (event.kind === 'stream.edge') {
          const edgeSnapshot = RelayReader.read(
            this.getSource(),
            createReaderSelector(
              fragment,
              event.edgeID,
              variables,
              event.request,
            ),
          );
          Object.assign(seenRecords, edgeSnapshot.seenRecords);
          const itemData = ((edgeSnapshot.data: $FlowFixMe): ?TEdge);
          /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
           * Flow v0.111.0 was deployed. To see the error, delete this comment
           * and run Flow. */
          edgeSnapshots[event.edgeID] = edgeSnapshot;
          return resolver.reduce(prevState, {
            args: event.args,
            edge: itemData,
            index: event.index,
            kind: 'stream.edge',
          });
        } else if (event.kind === 'stream.pageInfo') {
          return resolver.reduce(prevState, {
            args: event.args,
            kind: 'stream.pageInfo',
            pageInfo: event.pageInfo,
          });
        } else {
          (event.kind: empty);
          invariant(
            false,
            'RelayModernStore: Unexpected connection event kind `%s`.',
            event.kind,
          );
        }
      },
      initialState,
    );
    return {
      edgeSnapshots,
      id,
      reference: connectionReference,
      seenRecords,
      state,
    };
  }

  snapshot(): void {
    invariant(
      this._optimisticSource == null,
      'RelayModernStore: Unexpected call to snapshot() while a previous ' +
        'snapshot exists.',
    );
    this._connectionSubscriptions.forEach(subscription => {
      subscription.backup = subscription.snapshot;
    });
    this._subscriptions.forEach(subscription => {
      subscription.backup = subscription.snapshot;
    });
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
    this._optimisticSource = null;
    this._connectionEvents.forEach(events => {
      events.optimistic = null;
    });
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
        };
      } else {
        subscription.stale = true;
      }
    });
    this._connectionSubscriptions.forEach(subscription => {
      const backup = subscription.backup;
      subscription.backup = null;
      if (backup) {
        if (backup.state !== subscription.snapshot.state) {
          subscription.stale = true;
        }
        subscription.snapshot = backup;
      } else {
        // This subscription was established after the creation of the
        // connection snapshot so there's nothing to restore to. Recreate the
        // connection from scratch and check ifs value changes.
        const baseSnapshot = this.lookupConnection_UNSTABLE(
          subscription.snapshot.reference,
          subscription.resolver,
        );
        const nextState = recycleNodesInto(
          subscription.snapshot.state,
          baseSnapshot.state,
        );
        if (nextState !== subscription.snapshot.state) {
          subscription.stale = true;
        }
        subscription.snapshot = {...baseSnapshot, state: nextState};
      }
    });
  }

  _scheduleGC() {
    if (this._gcHoldCounter > 0) {
      this._shouldScheduleGC = true;
      return;
    }
    if (this._hasScheduledGC) {
      return;
    }
    this._hasScheduledGC = true;
    this._gcScheduler(() => {
      this.__gc();
      this._hasScheduledGC = false;
    });
  }

  __gc(): void {
    // Don't run GC while there are optimistic updates applied
    if (this._optimisticSource != null) {
      return;
    }
    const references = new Set();
    const connectionReferences = new Set();
    // Mark all records that are traversable from a root
    this._roots.forEach(selector => {
      RelayReferenceMarker.mark(
        this._recordSource,
        selector,
        references,
        connectionReferences,
        id => this.getConnectionEvents_UNSTABLE(id),
        this._operationLoader,
      );
    });
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
    if (connectionReferences.size === 0) {
      this._connectionEvents.clear();
    } else {
      // Evict any unreferenced connections
      for (const connectionID of this._connectionEvents.keys()) {
        if (!connectionReferences.has(connectionID)) {
          this._connectionEvents.delete(connectionID);
        }
      }
    }
  }
}

/**
 * Updates the target with information from source, also updating a mapping of
 * which records in the target were changed as a result.
 */
function updateTargetFromSource(
  target: MutableRecordSource,
  source: RecordSource,
  updatedRecordIDs: UpdatedRecords,
): void {
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
      const nextRecord = RelayModernRecord.update(targetRecord, sourceRecord);
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

RelayProfiler.instrumentMethods(RelayModernStore.prototype, {
  lookup: 'RelayModernStore.prototype.lookup',
  notify: 'RelayModernStore.prototype.notify',
  publish: 'RelayModernStore.prototype.publish',
  __gc: 'RelayModernStore.prototype.__gc',
});

module.exports = RelayModernStore;
