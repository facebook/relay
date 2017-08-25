/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayModernEnvironment
 * @flow
 * @format
 */

'use strict';

const RelayCore = require('RelayCore');
const RelayDataLoader = require('RelayDataLoader');
const RelayDefaultHandlerProvider = require('RelayDefaultHandlerProvider');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayPublishQueue = require('RelayPublishQueue');

const normalizePayload = require('normalizePayload');
const normalizeRelayPayload = require('normalizeRelayPayload');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {EnvironmentDebugger} from 'RelayDebugger';
import type {HandlerProvider} from 'RelayDefaultHandlerProvider';
import type {
  Network,
  PayloadData,
  PayloadError,
  RelayResponsePayload,
  UploadableMap,
} from 'RelayNetworkTypes';
import type RelayObservable from 'RelayObservable';
import type {
  Environment,
  MissingFieldHandler,
  OperationSelector,
  OptimisticUpdate,
  Selector,
  SelectorStoreUpdater,
  Snapshot,
  Store,
  StoreUpdater,
  UnstableEnvironmentCore,
} from 'RelayStoreTypes';

export type EnvironmentConfig = {
  configName?: string,
  handlerProvider?: HandlerProvider,
  network: Network,
  store: Store,
};

class RelayModernEnvironment implements Environment {
  _network: Network;
  _publishQueue: RelayPublishQueue;
  _store: Store;
  _debugger: ?EnvironmentDebugger;
  configName: ?string;
  unstable_internal: UnstableEnvironmentCore;

  constructor(config: EnvironmentConfig) {
    this.configName = config.configName;
    const handlerProvider = config.handlerProvider
      ? config.handlerProvider
      : RelayDefaultHandlerProvider;
    this._network = config.network;
    this._publishQueue = new RelayPublishQueue(config.store, handlerProvider);
    this._store = config.store;
    this.unstable_internal = RelayCore;

    (this: any).__setNet = newNet => (this._network = newNet);

    if (__DEV__) {
      const g = typeof global !== 'undefined' ? global : window;

      // Attach the debugger symbol to the global symbol so it can be accessed by
      // devtools extension.
      if (!g.__RELAY_DEBUGGER__) {
        const {RelayDebugger} = require('RelayDebugger');
        g.__RELAY_DEBUGGER__ = new RelayDebugger();
      }

      // Setup the runtime part for Native
      if (typeof g.registerDevtoolsPlugin === 'function') {
        g.registerDevtoolsPlugin(
          require('relay-debugger-react-native-runtime'),
        );
      }

      const envId = g.__RELAY_DEBUGGER__.registerEnvironment(this);
      this._debugger = g.__RELAY_DEBUGGER__.getEnvironmentDebugger(envId);
    } else {
      this._debugger = null;
    }
  }

  getStore(): Store {
    return this._store;
  }

  getDebugger(): ?EnvironmentDebugger {
    return this._debugger;
  }

  applyUpdate(optimisticUpdate: OptimisticUpdate): Disposable {
    const dispose = () => {
      this._publishQueue.revertUpdate(optimisticUpdate);
      this._publishQueue.run();
    };
    this._publishQueue.applyUpdate(optimisticUpdate);
    this._publishQueue.run();
    return {dispose};
  }

  revertUpdate(update: OptimisticUpdate): void {
    this._publishQueue.revertUpdate(update);
    this._publishQueue.run();
  }

  replaceUpdate(update: OptimisticUpdate, newUpdate: OptimisticUpdate): void {
    this._publishQueue.revertUpdate(update);
    this._publishQueue.applyUpdate(newUpdate);
    this._publishQueue.run();
  }

  applyMutation({
    operation,
    optimisticResponse,
    optimisticUpdater,
  }: {
    operation: OperationSelector,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: Object,
  }): Disposable {
    return this.applyUpdate({
      operation,
      selectorStoreUpdater: optimisticUpdater,
      response: optimisticResponse || null,
    });
  }

  check(readSelector: Selector): boolean {
    return this._store.check(readSelector);
  }

  commitPayload(
    operationSelector: OperationSelector,
    payload: PayloadData,
  ): void {
    // Do not handle stripped nulls when commiting a payload
    const relayPayload = normalizeRelayPayload(operationSelector.root, payload);
    this._publishQueue.commitPayload(operationSelector, relayPayload);
    this._publishQueue.run();
  }

  commitUpdate(updater: StoreUpdater): void {
    this._publishQueue.commitUpdate(updater);
    this._publishQueue.run();
  }

  lookup(readSelector: Selector): Snapshot {
    return this._store.lookup(readSelector);
  }

  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    return this._store.subscribe(snapshot, callback);
  }

  retain(selector: Selector): Disposable {
    return this._store.retain(selector);
  }

  /**
   * Returns an Observable of RelayResponsePayload resulting from the provided
   * Query or Subscription operation, each of which are normalized and committed
   * to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.observe({...}).subscribe({...}).
   */
  observe({
    operation,
    cacheConfig,
    updater,
  }: {
    operation: OperationSelector,
    cacheConfig?: ?CacheConfig,
    updater?: ?SelectorStoreUpdater,
  }): RelayObservable<RelayResponsePayload> {
    const {node, variables} = operation;
    return this._network
      .observe(node, variables, cacheConfig || {})
      .map(payload => normalizePayload(node, variables, payload))
      .do({
        next: payload => {
          this._publishQueue.commitPayload(operation, payload, updater);
          this._publishQueue.run();
        },
      });
  }

  /**
   * Returns an Observable of RelayResponsePayload resulting from the provided
   * Mutation operation, which are normalized and committed to the publish queue
   * along with an optional optimistic response or updater.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.observeMutation({...}).subscribe({...}).
   */
  observeMutation({
    operation,
    optimisticResponse,
    optimisticUpdater,
    updater,
    uploadables,
  }: {|
    operation: OperationSelector,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: ?Object,
    updater?: ?SelectorStoreUpdater,
    uploadables?: ?UploadableMap,
  |}): RelayObservable<RelayResponsePayload> {
    const {node, variables} = operation;
    const mutationUid = nextMutationUid();

    let optimisticUpdate;
    if (optimisticResponse || optimisticUpdater) {
      optimisticUpdate = {
        operation: operation,
        selectorStoreUpdater: optimisticUpdater,
        response: optimisticResponse || null,
      };
    }

    return this._network
      .observe(node, variables, {force: true}, uploadables)
      .map(payload => normalizePayload(node, variables, payload))
      .do({
        start: () => {
          if (optimisticUpdate) {
            this._recordDebuggerEvent({
              eventName: 'optimistic_update',
              mutationUid,
              operation,
              fn: () => {
                if (optimisticUpdate) {
                  this._publishQueue.applyUpdate(optimisticUpdate);
                }
                this._publishQueue.run();
              },
            });
          }
        },
        next: payload => {
          this._recordDebuggerEvent({
            eventName: 'request_commit',
            mutationUid,
            operation,
            payload,
            fn: () => {
              if (optimisticUpdate) {
                this._publishQueue.revertUpdate(optimisticUpdate);
                optimisticUpdate = undefined;
              }
              this._publishQueue.commitPayload(operation, payload, updater);
              this._publishQueue.run();
            },
          });
        },
        error: error => {
          this._recordDebuggerEvent({
            eventName: 'request_error',
            mutationUid,
            operation,
            payload: error,
            fn: () => {
              if (optimisticUpdate) {
                this._publishQueue.revertUpdate(optimisticUpdate);
              }
              this._publishQueue.run();
            },
          });
        },
        unsubscribe: () => {
          if (optimisticUpdate) {
            this._recordDebuggerEvent({
              eventName: 'optimistic_revert',
              mutationUid,
              operation,
              fn: () => {
                if (optimisticUpdate) {
                  this._publishQueue.revertUpdate(optimisticUpdate);
                }
                this._publishQueue.run();
              },
            });
          }
        },
      });
  }

  /**
   * @deprecated Use Environment.observe().subscribe()
   */
  sendQuery({
    cacheConfig,
    onCompleted,
    onError,
    onNext,
    operation,
  }: {
    cacheConfig?: ?CacheConfig,
    onCompleted?: ?() => void,
    onError?: ?(error: Error) => void,
    onNext?: ?(payload: RelayResponsePayload) => void,
    operation: OperationSelector,
  }): Disposable {
    return this.observe({operation, cacheConfig}).subscribeLegacy({
      onNext,
      onError,
      onCompleted,
    });
  }

  /**
   * @deprecated Use Environment.observe().subscribe()
   */
  streamQuery({
    cacheConfig,
    onCompleted,
    onError,
    onNext,
    operation,
  }: {
    cacheConfig?: ?CacheConfig,
    onCompleted?: ?() => void,
    onError?: ?(error: Error) => void,
    onNext?: ?(payload: RelayResponsePayload) => void,
    operation: OperationSelector,
  }): Disposable {
    return this.observe({operation, cacheConfig}).subscribeLegacy({
      onNext,
      onError,
      onCompleted,
    });
  }

  /**
   * @deprecated Use Environment.observeMutation().subscribe()
   */
  sendMutation({
    onCompleted,
    onError,
    operation,
    optimisticResponse,
    optimisticUpdater,
    updater,
    uploadables,
  }: {
    onCompleted?: ?(errors: ?Array<PayloadError>) => void,
    onError?: ?(error: Error) => void,
    operation: OperationSelector,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: Object,
    updater?: ?SelectorStoreUpdater,
    uploadables?: UploadableMap,
  }): Disposable {
    return this.observeMutation({
      operation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      uploadables,
    }).subscribeLegacy({
      // NOTE: sendMutation has a non-standard use of onCompleted() by passing
      // it a value. When switching to use observeMutation(), the next()
      // Observer should be used to preserve behavior.
      onNext: payload => {
        payload.errors && onCompleted && onCompleted(payload.errors);
      },
      onError,
      onCompleted,
    });
  }

  /**
   * @deprecated Use Environment.observe().subscribe()
   */
  sendSubscription({
    onCompleted,
    onNext,
    onError,
    operation,
    updater,
  }: {
    onCompleted?: ?(errors: ?Array<PayloadError>) => void,
    onNext?: ?(payload: RelayResponsePayload) => void,
    onError?: ?(error: Error) => void,
    operation: OperationSelector,
    updater?: ?SelectorStoreUpdater,
  }): Disposable {
    return this.observe({
      operation,
      updater,
      cacheConfig: {force: true},
    }).subscribeLegacy({onNext, onError, onCompleted});
  }

  _recordDebuggerEvent({
    eventName,
    mutationUid,
    operation,
    payload,
    fn,
  }: {
    eventName: string,
    mutationUid: string,
    operation: OperationSelector,
    payload?: any,
    fn: () => void,
  }) {
    if (this._debugger) {
      this._debugger.recordMutationEvent({
        eventName,
        payload,
        fn,
        mutation: operation,
        seriesId: mutationUid,
      });
    } else {
      fn();
    }
  }

  checkSelectorAndUpdateStore(
    selector: Selector,
    handlers: Array<MissingFieldHandler>,
  ): boolean {
    const target = new RelayInMemoryRecordSource();
    const result = RelayDataLoader.check(
      this._store.getSource(),
      target,
      selector,
      handlers,
    );
    if (target.size() > 0) {
      this._publishQueue.commitSource(target);
      this._publishQueue.run();
    }
    return result;
  }
}

let mutationUidCounter = 0;
const mutationUidPrefix = Math.random().toString();
function nextMutationUid() {
  return mutationUidPrefix + mutationUidCounter++;
}

// Add a sigil for detection by `isRelayModernEnvironment()` to avoid a
// realm-specific instanceof check, and to aid in module tree-shaking to
// avoid requiring all of RelayRuntime just to detect its environment.
(RelayModernEnvironment: any).prototype['@@RelayModernEnvironment'] = true;

module.exports = RelayModernEnvironment;
