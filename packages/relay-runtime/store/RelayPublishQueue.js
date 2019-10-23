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

const ErrorUtils = require('ErrorUtils');
const RelayReader = require('./RelayReader');
const RelayRecordSource = require('./RelayRecordSource');
const RelayRecordSourceMutator = require('../mutations/RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('../mutations/RelayRecordSourceProxy');
const RelayRecordSourceSelectorProxy = require('../mutations/RelayRecordSourceSelectorProxy');

const invariant = require('invariant');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {Disposable} from '../util/RelayRuntimeTypes';
import type {GetDataID} from './RelayResponseNormalizer';
import type {
  MutableRecordSource,
  OperationDescriptor,
  OptimisticUpdate,
  PublishQueue,
  RecordSource,
  RelayResponsePayload,
  RequestDescriptor,
  SelectorData,
  SelectorStoreUpdater,
  SingularReaderSelector,
  Store,
  StoreUpdater,
} from './RelayStoreTypes';

type PendingCommit = PendingRelayPayload | PendingRecordSource | PendingUpdater;
type PendingRelayPayload = {|
  +kind: 'payload',
  +operation: OperationDescriptor,
  +payload: RelayResponsePayload,
  +updater: ?SelectorStoreUpdater,
|};
type PendingRecordSource = {|
  +kind: 'source',
  +source: RecordSource,
|};
type PendingUpdater = {|
  +kind: 'updater',
  +updater: StoreUpdater,
|};

/**
 * Coordinates the concurrent modification of a `Store` due to optimistic and
 * non-revertable client updates and server payloads:
 * - Applies optimistic updates.
 * - Reverts optimistic updates, rebasing any subsequent updates.
 * - Commits client updates (typically for client schema extensions).
 * - Commits server updates:
 *   - Normalizes query/mutation/subscription responses.
 *   - Executes handlers for "handle" fields.
 *   - Reverts and reapplies pending optimistic updates.
 */
class RelayPublishQueue implements PublishQueue {
  _store: Store;
  _handlerProvider: ?HandlerProvider;
  _getDataID: GetDataID;

  _hasStoreSnapshot: boolean;
  // True if the next `run()` should apply the backup and rerun all optimistic
  // updates performing a rebase.
  _pendingBackupRebase: boolean;
  // Payloads to apply or Sources to publish to the store with the next `run()`.
  _pendingData: Set<PendingCommit>;
  // Optimistic updaters to add with the next `run()`.
  _pendingOptimisticUpdates: Set<OptimisticUpdate>;
  // Optimistic updaters that are already added and might be rerun in order to
  // rebase them.
  _appliedOptimisticUpdates: Set<OptimisticUpdate>;
  // Garbage collection hold, should rerun gc on dispose
  _gcHold: ?Disposable;

  constructor(
    store: Store,
    handlerProvider?: ?HandlerProvider,
    getDataID: GetDataID,
  ) {
    this._hasStoreSnapshot = false;
    this._handlerProvider = handlerProvider || null;
    this._pendingBackupRebase = false;
    this._pendingData = new Set();
    this._pendingOptimisticUpdates = new Set();
    this._store = store;
    this._appliedOptimisticUpdates = new Set();
    this._gcHold = null;
    this._getDataID = getDataID;
  }

  /**
   * Schedule applying an optimistic updates on the next `run()`.
   */
  applyUpdate(updater: OptimisticUpdate): void {
    invariant(
      !this._appliedOptimisticUpdates.has(updater) &&
        !this._pendingOptimisticUpdates.has(updater),
      'RelayPublishQueue: Cannot apply the same update function more than ' +
        'once concurrently.',
    );
    this._pendingOptimisticUpdates.add(updater);
  }

  /**
   * Schedule reverting an optimistic updates on the next `run()`.
   */
  revertUpdate(updater: OptimisticUpdate): void {
    if (this._pendingOptimisticUpdates.has(updater)) {
      // Reverted before it was applied
      this._pendingOptimisticUpdates.delete(updater);
    } else if (this._appliedOptimisticUpdates.has(updater)) {
      this._pendingBackupRebase = true;
      this._appliedOptimisticUpdates.delete(updater);
    }
  }

  /**
   * Schedule a revert of all optimistic updates on the next `run()`.
   */
  revertAll(): void {
    this._pendingBackupRebase = true;
    this._pendingOptimisticUpdates.clear();
    this._appliedOptimisticUpdates.clear();
  }

  /**
   * Schedule applying a payload to the store on the next `run()`.
   */
  commitPayload(
    operation: OperationDescriptor,
    payload: RelayResponsePayload,
    updater?: ?SelectorStoreUpdater,
  ): void {
    this._pendingBackupRebase = true;
    this._pendingData.add({
      kind: 'payload',
      operation,
      payload,
      updater,
    });
  }

  /**
   * Schedule an updater to mutate the store on the next `run()` typically to
   * update client schema fields.
   */
  commitUpdate(updater: StoreUpdater): void {
    this._pendingBackupRebase = true;
    this._pendingData.add({
      kind: 'updater',
      updater,
    });
  }

  /**
   * Schedule a publish to the store from the provided source on the next
   * `run()`. As an example, to update the store with substituted fields that
   * are missing in the store.
   */
  commitSource(source: RecordSource): void {
    this._pendingBackupRebase = true;
    this._pendingData.add({kind: 'source', source});
  }

  /**
   * Execute all queued up operations from the other public methods.
   */
  run(): $ReadOnlyArray<RequestDescriptor> {
    if (this._pendingBackupRebase) {
      if (this._hasStoreSnapshot) {
        this._store.restore();
        this._hasStoreSnapshot = false;
      }
    }
    this._commitData();
    if (
      this._pendingOptimisticUpdates.size ||
      (this._pendingBackupRebase && this._appliedOptimisticUpdates.size)
    ) {
      if (!this._hasStoreSnapshot) {
        this._store.snapshot();
        this._hasStoreSnapshot = true;
      }
      this._applyUpdates();
    }
    this._pendingBackupRebase = false;
    if (this._appliedOptimisticUpdates.size > 0) {
      if (!this._gcHold) {
        this._gcHold = this._store.holdGC();
      }
    } else {
      if (this._gcHold) {
        this._gcHold.dispose();
        this._gcHold = null;
      }
    }
    return this._store.notify();
  }

  _publishSourceFromPayload(pendingPayload: PendingRelayPayload): void {
    const {payload, operation, updater} = pendingPayload;
    const {connectionEvents, source, fieldPayloads} = payload;
    const combinedConnectionEvents = connectionEvents
      ? connectionEvents.slice()
      : [];
    const mutator = new RelayRecordSourceMutator(
      this._store.getSource(),
      source,
      combinedConnectionEvents,
    );
    const store = new RelayRecordSourceProxy(mutator, this._getDataID);
    if (fieldPayloads && fieldPayloads.length) {
      fieldPayloads.forEach(fieldPayload => {
        const handler =
          this._handlerProvider && this._handlerProvider(fieldPayload.handle);
        invariant(
          handler,
          'RelayModernEnvironment: Expected a handler to be provided for ' +
            'handle `%s`.',
          fieldPayload.handle,
        );
        handler.update(store, fieldPayload);
      });
    }
    if (updater) {
      const selector = operation.fragment;
      invariant(
        selector != null,
        'RelayModernEnvironment: Expected a selector to be provided with updater function.',
      );
      const selectorStore = new RelayRecordSourceSelectorProxy(
        mutator,
        store,
        selector,
      );
      const selectorData = lookupSelector(source, selector);
      updater(selectorStore, selectorData);
    }
    this._store.publish(source);
    if (combinedConnectionEvents.length !== 0) {
      this._store.publishConnectionEvents_UNSTABLE(
        combinedConnectionEvents,
        true,
      );
    }
  }

  _commitData(): void {
    if (!this._pendingData.size) {
      return;
    }
    this._pendingData.forEach(data => {
      if (data.kind === 'payload') {
        this._publishSourceFromPayload(data);
      } else if (data.kind === 'source') {
        const source = data.source;
        this._store.publish(source);
      } else {
        const updater = data.updater;
        const sink = RelayRecordSource.create();
        const connectionEvents = [];
        const mutator = new RelayRecordSourceMutator(
          this._store.getSource(),
          sink,
          connectionEvents,
        );
        const store = new RelayRecordSourceProxy(mutator, this._getDataID);
        ErrorUtils.applyWithGuard(
          updater,
          null,
          [store],
          null,
          'RelayPublishQueue:commitData',
        );
        this._store.publish(sink);
        if (connectionEvents.length !== 0) {
          this._store.publishConnectionEvents_UNSTABLE(connectionEvents, true);
        }
      }
    });
    this._pendingData.clear();
  }

  _applyUpdates(): void {
    const sink = RelayRecordSource.create();
    const combinedConnectionEvents = [];
    const mutator = new RelayRecordSourceMutator(
      this._store.getSource(),
      sink,
      combinedConnectionEvents,
    );
    const store = new RelayRecordSourceProxy(
      mutator,
      this._getDataID,
      this._handlerProvider,
    );

    const processUpdate = optimisticUpdate => {
      if (optimisticUpdate.storeUpdater) {
        const {storeUpdater} = optimisticUpdate;
        ErrorUtils.applyWithGuard(
          storeUpdater,
          null,
          [store],
          null,
          'RelayPublishQueue:applyUpdates',
        );
      } else {
        const {operation, payload, updater} = optimisticUpdate;
        const {connectionEvents, source, fieldPayloads} = payload;
        const selectorStore = new RelayRecordSourceSelectorProxy(
          mutator,
          store,
          operation.fragment,
        );
        let selectorData;
        if (source) {
          store.publishSource(source, fieldPayloads);
          selectorData = lookupSelector(source, operation.fragment);
        }
        if (connectionEvents) {
          combinedConnectionEvents.push(...connectionEvents);
        }
        if (updater) {
          ErrorUtils.applyWithGuard(
            updater,
            null,
            [selectorStore, selectorData],
            null,
            'RelayPublishQueue:applyUpdates',
          );
        }
      }
    };

    // rerun all updaters in case we are running a rebase
    if (this._pendingBackupRebase && this._appliedOptimisticUpdates.size) {
      this._appliedOptimisticUpdates.forEach(processUpdate);
    }

    // apply any new updaters
    if (this._pendingOptimisticUpdates.size) {
      this._pendingOptimisticUpdates.forEach(optimisticUpdate => {
        processUpdate(optimisticUpdate);
        this._appliedOptimisticUpdates.add(optimisticUpdate);
      });
      this._pendingOptimisticUpdates.clear();
    }

    this._store.publish(sink);
    if (combinedConnectionEvents.length !== 0) {
      this._store.publishConnectionEvents_UNSTABLE(
        combinedConnectionEvents,
        false,
      );
    }
  }
}

function lookupSelector(
  source: RecordSource,
  selector: SingularReaderSelector,
): ?SelectorData {
  const selectorData = RelayReader.read(source, selector).data;
  if (__DEV__) {
    const deepFreeze = require('../util/deepFreeze');
    if (selectorData) {
      deepFreeze(selectorData);
    }
  }
  return selectorData;
}

module.exports = RelayPublishQueue;
