/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayPublishQueue
 * @format
 */

'use strict';

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayModernRecord = require('RelayModernRecord');
const RelayReader = require('RelayReader');
const RelayRecordSourceMutator = require('RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('RelayRecordSourceProxy');
const RelayRecordSourceSelectorProxy = require('RelayRecordSourceSelectorProxy');

const invariant = require('invariant');
const normalizeRelayPayload = require('normalizeRelayPayload');

import type {SelectorData} from 'RelayCombinedEnvironmentTypes';
import type {HandlerProvider} from 'RelayDefaultHandlerProvider';
import type {RelayResponsePayload} from 'RelayNetworkTypes';
import type {
  HandleFieldPayload,
  MutableRecordSource,
  OperationSelector,
  SelectorStoreUpdater,
  Store,
  StoreUpdater,
} from 'RelayStoreTypes';

type Payload = {
  fieldPayloads: ?Array<HandleFieldPayload>,
  operation: OperationSelector,
  source: MutableRecordSource,
  updater: ?SelectorStoreUpdater,
};

type OptimisticUpdate =
  | {|
      storeUpdater: StoreUpdater,
    |}
  | {|
      selectorStoreUpdater: ?SelectorStoreUpdater,
      operation: OperationSelector,
      response: ?Object,
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
class RelayPublishQueue {
  _store: Store;
  _handlerProvider: ?HandlerProvider;

  // A "negative" of all applied updaters. It can be published to the store to
  // undo them in order to re-apply some of them for a rebase.
  _backup: MutableRecordSource;
  // True if the next `run()` should apply the backup and rerun all optimistic
  // updates performing a rebase.
  _pendingBackupRebase: boolean;
  // Payloads to apply with the next `run()`.
  _pendingPayloads: Set<Payload>;
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
    this._pendingPayloads = new Set();
    this._pendingUpdaters = new Set();
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
    this._pendingPayloads.add({fieldPayloads, operation, source, updater});
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
   * Execute all queued up operations from the other public methods.
   */
  run(): void {
    if (this._pendingBackupRebase && this._backup.size()) {
      this._store.publish(this._backup);
      this._backup = new RelayInMemoryRecordSource();
    }
    this._commitPayloads();
    this._commitUpdaters();
    this._applyUpdates();
    this._pendingBackupRebase = false;
    this._store.notify();
  }

  _commitPayloads(): void {
    if (!this._pendingPayloads.size) {
      return;
    }
    this._pendingPayloads.forEach(
      ({fieldPayloads, operation, source, updater}) => {
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
              this._handlerProvider &&
              this._handlerProvider(fieldPayload.handle);
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
        // Publish the server data first so that it is reflected in the mutation
        // backup created during the rebase
        this._store.publish(source);
      },
    );
    this._pendingPayloads.clear();
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
      updater(store);
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
              selectorStoreUpdater(selectorStore, selectorData);
          } else {
            const {storeUpdater} = optimisticUpdate;
            storeUpdater(store);
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
              selectorStoreUpdater(selectorStore, selectorData);
          } else {
            const {storeUpdater} = optimisticUpdate;
            storeUpdater(store);
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
  const selectorData = RelayReader.read(source, selector, RelayModernRecord)
    .data;
  if (__DEV__) {
    const deepFreeze = require('deepFreeze');
    if (selectorData) {
      deepFreeze(selectorData);
    }
  }
  return selectorData;
}

module.exports = RelayPublishQueue;
