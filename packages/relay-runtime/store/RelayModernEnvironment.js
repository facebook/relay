/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+relay
 */

'use strict';

const DataChecker = require('./DataChecker');
const RelayCore = require('./RelayCore');
const RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');
const RelayDefaultMissingFieldHandlers = require('../handlers/RelayDefaultMissingFieldHandlers');
const RelayModernQueryExecutor = require('./RelayModernQueryExecutor');
const RelayObservable = require('../network/RelayObservable');
const RelayPublishQueue = require('./RelayPublishQueue');
const RelayRecordSource = require('./RelayRecordSource');

const defaultGetDataID = require('./defaultGetDataID');
const invariant = require('invariant');
const normalizeRelayPayload = require('./normalizeRelayPayload');
const warning = require('warning');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {
  GraphQLResponse,
  Network,
  PayloadData,
  PayloadError,
  UploadableMap,
} from '../network/RelayNetworkTypes';
import type {
  Environment,
  OperationLoader,
  MissingFieldHandler,
  OperationDescriptor,
  OptimisticUpdate,
  NormalizationSelector,
  ReaderSelector,
  SelectorStoreUpdater,
  Snapshot,
  Store,
  StoreUpdater,
  UnstableEnvironmentCore,
  PublishQueue,
} from '../store/RelayStoreTypes';
import type {CacheConfig, Disposable} from '../util/RelayRuntimeTypes';
import type {TaskScheduler} from './RelayModernQueryExecutor';
import type RelayOperationTracker from './RelayOperationTracker';
import type {GetDataID} from './RelayResponseNormalizer';

export type EnvironmentConfig = {|
  +configName?: string,
  +handlerProvider?: ?HandlerProvider,
  +operationLoader?: ?OperationLoader,
  +network: Network,
  +scheduler?: ?TaskScheduler,
  +store: Store,
  +missingFieldHandlers?: ?$ReadOnlyArray<MissingFieldHandler>,
  +publishQueue?: ?PublishQueue,
  +operationTracker?: ?RelayOperationTracker,
  /*
    This method is likely to change in future versions, use at your own risk.
    It can potentially break existing calls like store.get(<id>),
    because the internal ID might not be the `id` field on the node anymore
  */
  +UNSTABLE_DO_NOT_USE_getDataID?: ?GetDataID,
|};

class RelayModernEnvironment implements Environment {
  _operationLoader: ?OperationLoader;
  _network: Network;
  _publishQueue: PublishQueue;
  _scheduler: ?TaskScheduler;
  _store: Store;
  configName: ?string;
  unstable_internal: UnstableEnvironmentCore;
  _missingFieldHandlers: ?$ReadOnlyArray<MissingFieldHandler>;
  _operationTracker: ?RelayOperationTracker;
  _getDataID: GetDataID;

  constructor(config: EnvironmentConfig) {
    this.configName = config.configName;
    const handlerProvider = config.handlerProvider
      ? config.handlerProvider
      : RelayDefaultHandlerProvider;
    const operationLoader = config.operationLoader;
    if (__DEV__) {
      if (operationLoader != null) {
        invariant(
          typeof operationLoader === 'object' &&
            typeof operationLoader.get === 'function' &&
            typeof operationLoader.load === 'function',
          'RelayModernEnvironment: Expected `operationLoader` to be an object ' +
            'with get() and load() functions, got `%s`.',
          operationLoader,
        );
      }
    }
    this._operationLoader = operationLoader;
    this._network = config.network;
    this._getDataID = config.UNSTABLE_DO_NOT_USE_getDataID ?? defaultGetDataID;
    this._publishQueue =
      config.publishQueue ??
      new RelayPublishQueue(config.store, handlerProvider, this._getDataID);
    this._scheduler = config.scheduler ?? null;
    this._store = config.store;
    this.unstable_internal = {
      ...RelayCore,
      getOperationTracker: () => {
        return this._operationTracker;
      },
    };

    (this: any).__setNet = newNet => (this._network = newNet);

    if (__DEV__) {
      const {inspect} = require('./StoreInspector');
      (this: any).DEBUG_inspect = (dataID: ?string) => inspect(this, dataID);
    }

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
    this._missingFieldHandlers =
      config.missingFieldHandlers ?? RelayDefaultMissingFieldHandlers;

    if (config.operationTracker != null) {
      this._operationTracker = config.operationTracker;
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
    operation: OperationDescriptor,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: Object,
  }): Disposable {
    return this.applyUpdate({
      operation,
      selectorStoreUpdater: optimisticUpdater,
      response: optimisticResponse || null,
    });
  }

  check(readSelector: NormalizationSelector): boolean {
    if (this._missingFieldHandlers == null) {
      return this._store.check(readSelector);
    }
    return this._checkSelectorAndHandleMissingFields(
      readSelector,
      this._missingFieldHandlers,
    );
  }

  commitPayload(
    operationDescriptor: OperationDescriptor,
    payload: PayloadData,
  ): void {
    // Do not handle stripped nulls when committing a payload
    const relayPayload = normalizeRelayPayload(
      operationDescriptor.root,
      payload,
      null /* errors */,
      {getDataID: this._getDataID},
    );
    this._publishQueue.commitPayload(operationDescriptor, relayPayload);
    this._publishQueue.run();
  }

  commitUpdate(updater: StoreUpdater): void {
    this._publishQueue.commitUpdate(updater);
    this._publishQueue.run();
  }

  lookup(readSelector: ReaderSelector, owner: ?OperationDescriptor): Snapshot {
    return this._store.lookup(readSelector, owner);
  }

  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    return this._store.subscribe(snapshot, callback);
  }

  retain(selector: NormalizationSelector): Disposable {
    return this._store.retain(selector);
  }

  _checkSelectorAndHandleMissingFields(
    selector: NormalizationSelector,
    handlers: $ReadOnlyArray<MissingFieldHandler>,
  ): boolean {
    const target = RelayRecordSource.create();
    const result = DataChecker.check(
      this._store.getSource(),
      target,
      selector,
      handlers,
      this._operationLoader,
      this._getDataID,
    );
    if (target.size() > 0) {
      this._publishQueue.commitSource(target);
      this._publishQueue.run();
    }
    return result;
  }

  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
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
    operation: OperationDescriptor,
    cacheConfig?: ?CacheConfig,
    updater?: ?SelectorStoreUpdater,
  }): RelayObservable<GraphQLResponse> {
    return RelayObservable.create(sink => {
      const source = this._network.execute(
        operation.node.params,
        operation.variables,
        cacheConfig || {},
      );
      const executor = RelayModernQueryExecutor.execute({
        operation,
        operationLoader: this._operationLoader,
        optimisticUpdate: null,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        updater,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
      });
      return () => executor.cancel();
    });
  }

  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
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
    operation: OperationDescriptor,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: ?Object,
    updater?: ?SelectorStoreUpdater,
    uploadables?: ?UploadableMap,
  |}): RelayObservable<GraphQLResponse> {
    return RelayObservable.create(sink => {
      let optimisticUpdate;
      if (optimisticResponse || optimisticUpdater) {
        optimisticUpdate = {
          operation: operation,
          selectorStoreUpdater: optimisticUpdater,
          response: optimisticResponse ?? null,
        };
      }
      const source = this._network.execute(
        operation.node.params,
        operation.variables,
        {force: true},
        uploadables,
      );
      const executor = RelayModernQueryExecutor.execute({
        operation,
        operationLoader: this._operationLoader,
        optimisticUpdate,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        updater,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
      });
      return () => executor.cancel();
    });
  }

  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query or Subscription operation responses, the result of which is
   * then normalized and comitted to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeWithSource({...}).subscribe({...}).
   */
  executeWithSource({
    operation,
    source,
  }: {|
    operation: OperationDescriptor,
    source: RelayObservable<GraphQLResponse>,
  |}): RelayObservable<GraphQLResponse> {
    return RelayObservable.create(sink => {
      const executor = RelayModernQueryExecutor.execute({
        operation,
        operationLoader: this._operationLoader,
        optimisticUpdate: null,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        getDataID: this._getDataID,
      });
      return () => executor.cancel();
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
    onNext?: ?(payload: GraphQLResponse) => void,
    operation: OperationDescriptor,
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
    operation: OperationDescriptor,
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
        onCompleted && onCompleted(payload.errors);
      },
      onError,
      onCompleted,
    });
  }

  toJSON(): mixed {
    return `RelayModernEnvironment(${this.configName ?? ''})`;
  }
}

// Add a sigil for detection by `isRelayModernEnvironment()` to avoid a
// realm-specific instanceof check, and to aid in module tree-shaking to
// avoid requiring all of RelayRuntime just to detect its environment.
(RelayModernEnvironment: any).prototype['@@RelayModernEnvironment'] = true;

module.exports = RelayModernEnvironment;
