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

const RelayCore = require('./RelayCore');
const RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');
const RelayPublishQueue = require('./RelayPublishQueue');

const deferrableFragmentKey = require('./deferrableFragmentKey');
const invariant = require('invariant');
const normalizePayload = require('./normalizePayload');
const normalizeRelayPayload = require('./normalizeRelayPayload');
const warning = require('warning');

const {getOperationVariables} = require('./RelayConcreteVariables');
const {createOperationSelector} = require('./RelayModernOperationSelector');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {
  ExecutePayload,
  Network,
  PayloadData,
  PayloadError,
  UploadableMap,
} from '../network/RelayNetworkTypes';
import type RelayObservable from '../network/RelayObservable';
import type {
  Environment,
  OperationSelector,
  OptimisticUpdate,
  Selector,
  SelectorStoreUpdater,
  Snapshot,
  Store,
  StoreUpdater,
  UnstableEnvironmentCore,
} from '../store/RelayStoreTypes';
import type {CacheConfig, Disposable} from '../util/RelayRuntimeTypes';

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
  configName: ?string;
  unstable_internal: UnstableEnvironmentCore;
  _deferrableSelections: Set<string> = new Set();

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

    // Register this Relay Environment with Relay DevTools if it exists.
    // Note: this must always be the last step in the constructor.
    const _global =
      typeof global !== 'undefined'
        ? global
        : typeof window !== 'undefined'
          ? window
          : undefined;
    const devToolsHook = _global && _global.__RELAY_DEVTOOLS_HOOK__;
    if (devToolsHook) {
      devToolsHook.registerEnvironment(this);
    }
  }

  getStore(): Store {
    return this._store;
  }

  getNetwork(): Network {
    return this._network;
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

  isSelectorLoading(selector: Selector): boolean {
    const key = deferrableFragmentKey(
      selector.dataID,
      selector.node.name,
      selector.variables,
    );
    return this._deferrableSelections.has(key);
  }
  /**
   * Returns an Observable of ExecutePayload resulting from executing the
   * provided Query or Subscription operation, each result of which is then
   * normalized and committed to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.execute({...}).subscribe({...}).
   */
  execute({
    operation,
    cacheConfig,
    updater,
  }: {
    operation: OperationSelector,
    cacheConfig?: ?CacheConfig,
    updater?: ?SelectorStoreUpdater,
  }): RelayObservable<ExecutePayload> {
    let optimisticResponse;
    return this._network
      .execute(operation.node, operation.variables, cacheConfig || {})
      .do({
        next: executePayload => {
          const responsePayload = normalizePayload(executePayload);
          const {source, fieldPayloads, deferrableSelections} = responsePayload;
          for (const selectionKey of deferrableSelections || new Set()) {
            this._deferrableSelections.add(selectionKey);
          }
          if (executePayload.isOptimistic) {
            invariant(
              optimisticResponse == null,
              'environment.execute: only support one optimistic respnose per ' +
                'execute.',
            );
            optimisticResponse = {
              source: source,
              fieldPayloads: fieldPayloads,
            };
            this._publishQueue.applyUpdate(optimisticResponse);
            this._publishQueue.run();
          } else {
            if (optimisticResponse) {
              this._publishQueue.revertUpdate(optimisticResponse);
              optimisticResponse = undefined;
            }
            const writeSelector = createOperationSelector(
              operation.node,
              executePayload.variables,
              executePayload.operation,
            );
            if (executePayload.operation.kind === 'DeferrableOperation') {
              const fragmentKey = deferrableFragmentKey(
                executePayload.variables[
                  executePayload.operation.rootFieldVariable
                ],
                executePayload.operation.fragmentName,
                getOperationVariables(
                  executePayload.operation,
                  executePayload.variables,
                ),
              );
              this._deferrableSelections.delete(fragmentKey);
            }
            this._publishQueue.commitPayload(
              writeSelector,
              responsePayload,
              updater,
            );
            this._publishQueue.run();
          }
        },
      })
      .finally(() => {
        if (optimisticResponse) {
          this._publishQueue.revertUpdate(optimisticResponse);
          optimisticResponse = undefined;
          this._publishQueue.run();
        }
      });
  }

  /**
   * Returns an Observable of ExecutePayload resulting from executing the
   * provided Mutation operation, the result of which is then normalized and
   * committed to the publish queue along with an optional optimistic response
   * or updater.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeMutation({...}).subscribe({...}).
   */
  executeMutation({
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
  |}): RelayObservable<ExecutePayload> {
    let optimisticUpdate;
    if (optimisticResponse || optimisticUpdater) {
      optimisticUpdate = {
        operation: operation,
        selectorStoreUpdater: optimisticUpdater,
        response: optimisticResponse || null,
      };
    }

    return this._network
      .execute(operation.node, operation.variables, {force: true}, uploadables)
      .do({
        start: () => {
          if (optimisticUpdate) {
            this._publishQueue.applyUpdate(optimisticUpdate);
            this._publishQueue.run();
          }
        },
        next: payload => {
          if (optimisticUpdate) {
            this._publishQueue.revertUpdate(optimisticUpdate);
            optimisticUpdate = undefined;
          }
          this._publishQueue.commitPayload(
            operation,
            normalizePayload(payload),
            updater,
          );
          this._publishQueue.run();
        },
        error: error => {
          if (optimisticUpdate) {
            this._publishQueue.revertUpdate(optimisticUpdate);
            optimisticUpdate = undefined;
            this._publishQueue.run();
          }
        },
        unsubscribe: () => {
          if (optimisticUpdate) {
            this._publishQueue.revertUpdate(optimisticUpdate);
            optimisticUpdate = undefined;
            this._publishQueue.run();
          }
        },
      });
  }

  /**
   * @deprecated Use Environment.execute().subscribe()
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
    onNext?: ?(payload: ExecutePayload) => void,
    operation: OperationSelector,
  }): Disposable {
    warning(
      false,
      'environment.sendQuery() is deprecated. Update to the latest ' +
        'version of react-relay, and use environment.execute().',
    );
    return this.execute({operation, cacheConfig}).subscribeLegacy({
      onNext,
      onError,
      onCompleted,
    });
  }

  /**
   * @deprecated Use Environment.execute().subscribe()
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
    onNext?: ?(payload: ExecutePayload) => void,
    operation: OperationSelector,
  }): Disposable {
    warning(
      false,
      'environment.streamQuery() is deprecated. Update to the latest ' +
        'version of react-relay, and use environment.execute().',
    );
    return this.execute({operation, cacheConfig}).subscribeLegacy({
      onNext,
      onError,
      onCompleted,
    });
  }

  /**
   * @deprecated Use Environment.executeMutation().subscribe()
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
    warning(
      false,
      'environment.sendMutation() is deprecated. Update to the latest ' +
        'version of react-relay, and use environment.executeMutation().',
    );
    return this.executeMutation({
      operation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      uploadables,
    }).subscribeLegacy({
      // NOTE: sendMutation has a non-standard use of onCompleted() by passing
      // it a value. When switching to use executeMutation(), the next()
      // Observer should be used to preserve behavior.
      onNext: payload => {
        onCompleted && onCompleted(payload.response.errors);
      },
      onError,
      onCompleted,
    });
  }

  /**
   * @deprecated Use Environment.execute().subscribe()
   */
  sendSubscription({
    onCompleted,
    onNext,
    onError,
    operation,
    updater,
  }: {
    onCompleted?: ?(errors: ?Array<PayloadError>) => void,
    onNext?: ?(payload: ExecutePayload) => void,
    onError?: ?(error: Error) => void,
    operation: OperationSelector,
    updater?: ?SelectorStoreUpdater,
  }): Disposable {
    warning(
      false,
      'environment.sendSubscription() is deprecated. Update to the latest ' +
        'version of react-relay, and use environment.execute().',
    );
    return this.execute({
      operation,
      updater,
      cacheConfig: {force: true},
    }).subscribeLegacy({onNext, onError, onCompleted});
  }
}

// Add a sigil for detection by `isRelayModernEnvironment()` to avoid a
// realm-specific instanceof check, and to aid in module tree-shaking to
// avoid requiring all of RelayRuntime just to detect its environment.
(RelayModernEnvironment: any).prototype['@@RelayModernEnvironment'] = true;

module.exports = RelayModernEnvironment;
