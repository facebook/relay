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
const {UNPUBLISH_RECORD_SENTINEL} = require('./RelayStoreUtils');

import type {ReaderFragment} from '../util/ReaderNode';
import type {Disposable} from '../util/RelayRuntimeTypes';
import type {
  ConnectionID,
  ConnectionInternalEvent,
  ConnectionReference,
  ConnectionSnapshot,
  ConnectionStoreSnapshot,
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
};

type UpdatedConnections = {[ConnectionID]: boolean};
type ConnectionSubscription<TEdge, TState> = {|
  +callback: (state: TState) => void,
  +id: string,
  snapshot: ConnectionSnapshot<TEdge, TState>,
  stale: boolean,
|};

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
  _connectionEvents: Map<ConnectionID, Array<ConnectionInternalEvent>>;
  _connectionSubscriptions: Map<string, ConnectionSubscription<mixed, mixed>>;
  _gcScheduler: Scheduler;
  _hasScheduledGC: boolean;
  _index: number;
  _operationLoader: ?OperationLoader;
  _recordSource: MutableRecordSource;
  _roots: Map<number, NormalizationSelector>;
  _subscriptions: Set<Subscription>;
  _updatedConnectionIDs: UpdatedConnections;
  _updatedRecordIDs: UpdatedRecords;
  _gcHoldCounter: number;
  _shouldScheduleGC: boolean;
  _getDataID: GetDataID;

  constructor(
    source: MutableRecordSource,
    gcScheduler: Scheduler = resolveImmediate,
    operationLoader: ?OperationLoader = null,
    UNSTABLE_DO_NOT_USE_getDataID?: ?GetDataID,
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
    this._gcScheduler = gcScheduler;
    this._hasScheduledGC = false;
    this._index = 0;
    this._operationLoader = operationLoader;
    this._recordSource = source;
    this._roots = new Map();
    this._subscriptions = new Set();
    this._updatedConnectionIDs = {};
    this._updatedRecordIDs = {};
    this._gcHoldCounter = 0;
    this._shouldScheduleGC = false;
    this._getDataID = UNSTABLE_DO_NOT_USE_getDataID ?? defaultGetDataID;
  }

  getSource(): RecordSource {
    return this._recordSource;
  }

  check(selector: NormalizationSelector): boolean {
    return DataChecker.check(
      this._recordSource,
      this._recordSource,
      selector,
      [],
      this._operationLoader,
      this._getDataID,
    );
  }

  retain(selector: NormalizationSelector): Disposable {
    const index = this._index++;
    const dispose = () => {
      this._roots.delete(index);
      this._scheduleGC();
    };
    this._roots.set(index, selector);
    return {dispose};
  }

  lookup(selector: SingularReaderSelector): Snapshot {
    const snapshot = RelayReader.read(this._recordSource, selector);
    if (__DEV__) {
      deepFreeze(snapshot);
    }
    return snapshot;
  }

  // This method will return a list of updated owners form the subscriptions
  notify(): $ReadOnlyArray<RequestDescriptor> {
    const updatedOwners = [];
    this._subscriptions.forEach(subscription => {
      const owner = this._updateSubscription(subscription);
      if (owner != null) {
        updatedOwners.push(owner);
      }
    });
    this._connectionSubscriptions.forEach((subscription, id) => {
      if (subscription.stale) {
        subscription.stale = false;
        subscription.callback(subscription.snapshot.state);
      }
    });
    this._updatedConnectionIDs = {};
    this._updatedRecordIDs = {};
    return updatedOwners;
  }

  publish(source: RecordSource): void {
    updateTargetFromSource(this._recordSource, source, this._updatedRecordIDs);
    this._connectionSubscriptions.forEach((subscription, id) => {
      const hasStoreUpdates = hasOverlappingIDs(
        subscription.snapshot.seenRecords,
        this._updatedRecordIDs,
      );
      if (!hasStoreUpdates) {
        return;
      }
      const nextSnapshot = this._updateConnection_UNSTABLE(
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
    const subscription = {callback, snapshot};
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

  // We are returning an instance of RequestDescriptor here if the snapshot
  // were updated. We will use this information in the RelayOperationTracker
  // in order to track which owner was affected by which operation.
  _updateSubscription(subscription: Subscription): ?RequestDescriptor {
    const {callback, snapshot} = subscription;
    if (!hasOverlappingIDs(snapshot.seenRecords, this._updatedRecordIDs)) {
      return;
    }
    let nextSnapshot = RelayReader.read(this._recordSource, snapshot.selector);
    const nextData = recycleNodesInto(snapshot.data, nextSnapshot.data);
    nextSnapshot = {
      ...nextSnapshot,
      data: nextData,
    };
    if (__DEV__) {
      deepFreeze(nextSnapshot);
    }
    subscription.snapshot = nextSnapshot;
    if (nextSnapshot.data !== snapshot.data) {
      callback(nextSnapshot);
      return snapshot.selector.owner;
    }
  }

  lookupConnection_UNSTABLE<TEdge, TState>(
    connectionReference: ConnectionReference<TEdge, TState>,
  ): ConnectionSnapshot<TEdge, TState> {
    invariant(
      RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS,
      'RelayModernStore: Connection resolvers are not yet supported.',
    );
    const {id, resolver} = connectionReference;
    const initialState: TState = resolver.initialize();
    const events: ?$ReadOnlyArray<ConnectionInternalEvent> = this._connectionEvents.get(
      id,
    );
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
      connectionReference,
      initialSnapshot,
      events,
    );
  }

  subscribeConnection_UNSTABLE<TEdge, TState>(
    snapshot: ConnectionSnapshot<TEdge, TState>,
    callback: TState => void,
  ): Disposable {
    invariant(
      RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS,
      'RelayModernStore: Connection resolvers are not yet supported.',
    );
    const id = String(this._index++);
    const subscription: ConnectionSubscription<TEdge, TState> = {
      callback,
      id,
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
      let connectionEvents = this._connectionEvents.get(connectionID);
      if (connectionEvents == null) {
        connectionEvents = [];
        this._connectionEvents.set(connectionID, pendingEvents);
      }
      connectionEvents.push(event);
    });
    this._connectionSubscriptions.forEach((subscription, id) => {
      const pendingEvents = pendingConnectionEvents.get(
        subscription.snapshot.reference.id,
      );
      if (pendingEvents == null) {
        return;
      }
      const nextSnapshot = this._updateConnection_UNSTABLE(
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
    snapshot: ConnectionSnapshot<TEdge, TState>,
    source: ?RecordSource,
    pendingEvents: ?Array<ConnectionInternalEvent>,
  ): ?ConnectionSnapshot<TEdge, TState> {
    const nextSnapshot = this._reduceConnection_UNSTABLE(
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
    connectionReference: ConnectionReference<TEdge, TState>,
    snapshot: ConnectionSnapshot<TEdge, TState>,
    events: $ReadOnlyArray<ConnectionInternalEvent>,
    source: ?RecordSource = null,
  ): ConnectionSnapshot<TEdge, TState> {
    const {edgeField, id, resolver, variables} = connectionReference;
    const fragment: ReaderFragment = {
      kind: 'Fragment',
      name: edgeField.name,
      type: edgeField.concreteType ?? '__Any',
      metadata: null,
      argumentDefinitions: [],
      selections: edgeField.selections,
    };
    const seenRecords = {};
    const edgeSnapshots = {...snapshot.edgeSnapshots};
    let initialState = snapshot.state;
    if (source) {
      const edgeData = {};
      Object.keys(edgeSnapshots).forEach(edgeID => {
        const prevSnapshot = edgeSnapshots[edgeID];
        let nextSnapshot = RelayReader.read(
          this._recordSource,
          createReaderSelector(
            fragment,
            edgeID,
            variables,
            prevSnapshot.selector.owner,
          ),
        );
        const data = recycleNodesInto(prevSnapshot.data, nextSnapshot.data);
        nextSnapshot = {
          ...nextSnapshot,
          data,
        };
        if (
          data !== prevSnapshot.data &&
          (data !== undefined ||
            source.get(edgeID) !== UNPUBLISH_RECORD_SENTINEL)
        ) {
          edgeData[edgeID] = data;
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
          const edgeData = {};
          event.edgeIDs.forEach(edgeID => {
            if (edgeID == null) {
              return edgeID;
            }
            const edgeSnapshot = RelayReader.read(
              this._recordSource,
              createReaderSelector(fragment, edgeID, variables, event.request),
            );
            Object.assign(seenRecords, edgeSnapshot.seenRecords);
            const itemData = ((edgeSnapshot.data: $FlowFixMe): ?TEdge);
            edgeSnapshots[edgeID] = edgeSnapshot;
            edgeData[edgeID] = itemData;
          });
          return resolver.reduce(prevState, {
            kind: 'fetch',
            args: event.args,
            edgeIDs: event.edgeIDs,
            edgeData,
            pageInfo: event.pageInfo,
          });
        } else if (event.kind === 'insert') {
          const edgeSnapshot = RelayReader.read(
            this._recordSource,
            createReaderSelector(
              fragment,
              event.edgeID,
              variables,
              event.request,
            ),
          );
          Object.assign(seenRecords, edgeSnapshot.seenRecords);
          const itemData = ((edgeSnapshot.data: $FlowFixMe): ?TEdge);
          edgeSnapshots[event.edgeID] = edgeSnapshot;
          return resolver.reduce(prevState, {
            args: event.args,
            edge: itemData,
            edgeID: event.edgeID,
            kind: 'insert',
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

  snapshotConnections_UNSTABLE(): ConnectionStoreSnapshot {
    const events = new Map(
      Array.from(
        this._connectionEvents.entries(),
        ([connectionID, connectionEvents]) => [
          connectionID,
          connectionEvents.slice(),
        ],
      ),
    );
    const subscriptions = new Map(
      Array.from(this._connectionSubscriptions.values(), subscription => [
        subscription.id,
        subscription.snapshot,
      ]),
    );
    return {events, subscriptions};
  }

  restoreConnections_UNSTABLE(snapshot: ConnectionStoreSnapshot): void {
    this._connectionEvents.clear();
    snapshot.events.forEach((connectionEvents, connectionID) => {
      this._connectionEvents.set(connectionID, connectionEvents);
    });
    this._connectionSubscriptions.forEach(subscription => {
      const backup = snapshot.subscriptions.get(subscription.id);
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
    const references = new Set();
    // Mark all records that are traversable from a root
    this._roots.forEach(selector => {
      RelayReferenceMarker.mark(
        this._recordSource,
        selector,
        references,
        this._operationLoader,
      );
    });
    // Short-circuit if *nothing* is referenced
    if (!references.size) {
      this._recordSource.clear();
      return;
    }
    // Evict any unreferenced nodes
    const storeIDs = this._recordSource.getRecordIDs();
    for (let ii = 0; ii < storeIDs.length; ii++) {
      const dataID = storeIDs[ii];
      if (!references.has(dataID)) {
        this._recordSource.remove(dataID);
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
    if (sourceRecord === UNPUBLISH_RECORD_SENTINEL) {
      // Unpublish a record
      target.remove(dataID);
      updatedRecordIDs[dataID] = true;
    } else if (sourceRecord && targetRecord) {
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
