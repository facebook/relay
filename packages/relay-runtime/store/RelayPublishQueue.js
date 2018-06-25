/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const ErrorUtils = require('ErrorUtils');
const RelayInMemoryRecordSource = require('./RelayInMemoryRecordSource');
const RelayReader = require('./RelayReader');
const RelayRecordSourceMutator = require('../mutations/RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('../mutations/RelayRecordSourceProxy');
const RelayRecordSourceSelectorProxy = require('../mutations/RelayRecordSourceSelectorProxy');

const invariant = require('invariant');
const normalizeRelayPayload = require('./normalizeRelayPayload');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {
  HandleFieldPayload,
  MutableRecordSource,
  OperationSelector,
  OptimisticUpdate,
  SelectorStoreUpdater,
  Store,
  StoreUpdater,
  RecordSource,
  RelayResponsePayload,
} from './RelayStoreTypes';
import type {SelectorData} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';

type Payload = {
  fieldPayloads: ?Array<HandleFieldPayload>,
  operation: OperationSelector,
  source: MutableRecordSource,
  updater: ?SelectorStoreUpdater,
};

type DataToCommit =
  | {
      kind: 'payload',
      payload: Payload,
    }
  | {
      kind: 'source',
      source: RecordSource,
    };

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
class RelayPublishQueue {
  _store: Store;
  _handlerProvider: ?HandlerProvider;

  // A "negative" of all applied updaters. It can be published to the store to
  // undo them in order to re-apply some of them for a rebase.
  _backup: MutableRecordSource;
  // True if the next `run()` should apply the backup and rerun all optimistic
  // updates performing a rebase.
  _pendingBackupRebase: boolean;
  // Payloads to apply or Sources to publish to the store with the next `run()`.
  _pendingData: Set<DataToCommit>;
  // Updaters to apply with the next `run()`. These mutate the store and should
  // typically only mutate client schema extensions.
  _pendingUpdaters: Set<StoreUpdater>;
  // Optimistic updaters to add with the next `run()`.
  _pendingOptimisticUpdates: Set<OptimisticUpdate>;
  // Optimistic updaters that are already added and might be rerun in order to
  // rebase them.
  _appliedOptimisticUpdates: Set<OptimisticUpdate>;

  constructor(store: Store, handlerProvider?: ?HandlerProvider) {
    this._backup = new RelayInMemoryRecordSource();
    this._handlerProvider = handlerProvider || null;
    this._pendingBackupRebase = false;
    this._pendingUpdaters = new Set();
    this._pendingData = new Set();
    this._pendingOptimisticUpdates = new Set();
    this._store = store;
    this._appliedOptimisticUpdates = new Set();
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
    operation: OperationSelector,
    {fieldPayloads, source}: RelayResponsePayload,
    updater?: ?SelectorStoreUpdater,
  ): void {
    this._pendingBackupRebase = true;
    this._pendingData.add({
      kind: 'payload',
      payload: {fieldPayloads, operation, source, updater},
    });
  }

  /**
   * Schedule an updater to mutate the store on the next `run()` typically to
   * update client schema fields.
   */
  commitUpdate(updater: StoreUpdater): void {
    this._pendingBackupRebase = true;
    this._pendingUpdaters.add(updater);
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
  run(): void {
    if (this._pendingBackupRebase && this._backup.size()) {
      this._store.publish(this._backup);
      this._backup = new RelayInMemoryRecordSource();
    }
    this._commitData();
    this._commitUpdaters();
    this._applyUpdates();
    this._pendingBackupRebase = false;
    this._store.notify();
  }

  _getSourceFromPayload(payload: Payload): RecordSource {
    const {fieldPayloads, operation, source, updater} = payload;
    const mutator = new RelayRecordSourceMutator(
      this._store.getSource(),
      source,
    );
    const store = new RelayRecordSourceProxy(mutator);
    const selectorStore = new RelayRecordSourceSelectorProxy(
      store,
      operation.fragment,
    );
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
      const selectorData = lookupSelector(source, operation.fragment);
      updater(selectorStore, selectorData);
    }
    return source;
  }

  _commitData(): void {
    if (!this._pendingData.size) {
      return;
    }
    this._pendingData.forEach(data => {
      let source;
      if (data.kind === 'payload') {
        source = this._getSourceFromPayload(data.payload);
      } else {
        source = data.source;
      }
      this._store.publish(source);
    });
    this._pendingData.clear();
  }

  _commitUpdaters(): void {
    if (!this._pendingUpdaters.size) {
      return;
    }
    const sink = new RelayInMemoryRecordSource();
    this._pendingUpdaters.forEach(updater => {
      const mutator = new RelayRecordSourceMutator(
        this._store.getSource(),
        sink,
      );
      const store = new RelayRecordSourceProxy(mutator);
      ErrorUtils.applyWithGuard(
        updater,
        null,
        [store],
        null,
        'RelayPublishQueue:commitUpdaters',
      );
    });
    this._store.publish(sink);
    this._pendingUpdaters.clear();
  }

  _applyUpdates(): void {
    if (
      this._pendingOptimisticUpdates.size ||
      (this._pendingBackupRebase && this._appliedOptimisticUpdates.size)
    ) {
      const sink = new RelayInMemoryRecordSource();
      const mutator = new RelayRecordSourceMutator(
        this._store.getSource(),
        sink,
        this._backup,
      );
      const store = new RelayRecordSourceProxy(mutator, this._handlerProvider);

      // rerun all updaters in case we are running a rebase
      if (this._pendingBackupRebase && this._appliedOptimisticUpdates.size) {
        this._appliedOptimisticUpdates.forEach(optimisticUpdate => {
          if (optimisticUpdate.operation) {
            const {
              selectorStoreUpdater,
              operation,
              response,
            } = optimisticUpdate;
            const selectorStore = store.commitPayload(operation, response);
            // TODO: Fix commitPayload so we don't have to run normalize twice
            let selectorData, source;
            if (response) {
              ({source} = normalizeRelayPayload(operation.root, response));
              selectorData = lookupSelector(source, operation.fragment);
            }
            selectorStoreUpdater &&
              ErrorUtils.applyWithGuard(
                selectorStoreUpdater,
                null,
                [selectorStore, selectorData],
                null,
                'RelayPublishQueue:applyUpdates',
              );
          } else if (optimisticUpdate.storeUpdater) {
            const {storeUpdater} = optimisticUpdate;
            ErrorUtils.applyWithGuard(
              storeUpdater,
              null,
              [store],
              null,
              'RelayPublishQueue:applyUpdates',
            );
          } else {
            const {source, fieldPayloads} = optimisticUpdate;
            store.publishSource(source, fieldPayloads);
          }
        });
      }

      // apply any new updaters
      if (this._pendingOptimisticUpdates.size) {
        this._pendingOptimisticUpdates.forEach(optimisticUpdate => {
          if (optimisticUpdate.operation) {
            const {
              selectorStoreUpdater,
              operation,
              response,
            } = optimisticUpdate;
            const selectorStore = store.commitPayload(operation, response);
            // TODO: Fix commitPayload so we don't have to run normalize twice
            let selectorData, source;
            if (response) {
              ({source} = normalizeRelayPayload(operation.root, response));
              selectorData = lookupSelector(source, operation.fragment);
            }
            selectorStoreUpdater &&
              ErrorUtils.applyWithGuard(
                selectorStoreUpdater,
                null,
                [selectorStore, selectorData],
                null,
                'RelayPublishQueue:applyUpdates',
              );
          } else if (optimisticUpdate.storeUpdater) {
            const {storeUpdater} = optimisticUpdate;
            ErrorUtils.applyWithGuard(
              storeUpdater,
              null,
              [store],
              null,
              'RelayPublishQueue:applyUpdates',
            );
          } else {
            const {source, fieldPayloads} = optimisticUpdate;
            store.publishSource(source, fieldPayloads);
          }
          this._appliedOptimisticUpdates.add(optimisticUpdate);
        });
        this._pendingOptimisticUpdates.clear();
      }

      this._store.publish(sink);
    }
  }
}

function lookupSelector(source, selector): ?SelectorData {
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
