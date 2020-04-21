/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');
const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const RelayModernQueryExecutor = require('./RelayModernQueryExecutor');
const RelayObservable = require('../network/RelayObservable');
const RelayOperationTracker = require('../store/RelayOperationTracker');
const RelayPublishQueue = require('./RelayPublishQueue');
const RelayRecordSource = require('./RelayRecordSource');

const defaultGetDataID = require('./defaultGetDataID');
const generateID = require('../util/generateID');
const invariant = require('invariant');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {
  GraphQLResponse,
  INetwork,
  LogRequestInfoFunction,
  PayloadData,
  UploadableMap,
} from '../network/RelayNetworkTypes';
import type {Observer} from '../network/RelayObservable';
import type {RequestParameters} from '../util/RelayConcreteNode';
import type {
  CacheConfig,
  Disposable,
  RenderPolicy,
  Variables,
} from '../util/RelayRuntimeTypes';
import type {ActiveState} from './RelayModernQueryExecutor';
import type {TaskScheduler} from './RelayModernQueryExecutor';
import type {GetDataID} from './RelayResponseNormalizer';
import type {
  IEnvironment,
  LogFunction,
  MissingFieldHandler,
  OperationAvailability,
  OperationDescriptor,
  OperationLoader,
  OperationTracker,
  OptimisticResponseConfig,
  OptimisticUpdateFunction,
  PublishQueue,
  SelectorStoreUpdater,
  SingularReaderSelector,
  Snapshot,
  Store,
  StoreUpdater,
} from './RelayStoreTypes';

export type EnvironmentConfig = {|
  +configName?: string,
  +handlerProvider?: ?HandlerProvider,
  +treatMissingFieldsAsNull?: boolean,
  +log?: ?LogFunction,
  +operationLoader?: ?OperationLoader,
  +network: INetwork,
  +scheduler?: ?TaskScheduler,
  +store: Store,
  +missingFieldHandlers?: ?$ReadOnlyArray<MissingFieldHandler>,
  +operationTracker?: ?OperationTracker,
  /**
   * This method is likely to change in future versions, use at your own risk.
   * It can potentially break existing calls like store.get(<id>),
   * because the internal ID might not be the `id` field on the node anymore
   */
  +UNSTABLE_DO_NOT_USE_getDataID?: ?GetDataID,
  +UNSTABLE_defaultRenderPolicy?: ?RenderPolicy,
  +options?: mixed,
  +isServer?: boolean,
|};

class RelayModernEnvironment implements IEnvironment {
  __log: LogFunction;
  +_defaultRenderPolicy: RenderPolicy;
  _operationLoader: ?OperationLoader;
  _network: INetwork;
  _publishQueue: PublishQueue;
  _scheduler: ?TaskScheduler;
  _store: Store;
  configName: ?string;
  _missingFieldHandlers: ?$ReadOnlyArray<MissingFieldHandler>;
  _operationTracker: OperationTracker;
  _getDataID: GetDataID;
  _treatMissingFieldsAsNull: boolean;
  _operationExecutions: Map<string, ActiveState>;
  +options: mixed;
  +_isServer: boolean;

  constructor(config: EnvironmentConfig) {
    this.configName = config.configName;
    const handlerProvider = config.handlerProvider
      ? config.handlerProvider
      : RelayDefaultHandlerProvider;
    this._treatMissingFieldsAsNull = config.treatMissingFieldsAsNull === true;
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
    this.__log = config.log ?? emptyFunction;
    this._defaultRenderPolicy =
      config.UNSTABLE_defaultRenderPolicy ??
      RelayFeatureFlags.ENABLE_PARTIAL_RENDERING_DEFAULT === true
        ? 'partial'
        : 'full';
    this._operationLoader = operationLoader;
    this._operationExecutions = new Map();
    this._network = config.network;
    this._getDataID = config.UNSTABLE_DO_NOT_USE_getDataID ?? defaultGetDataID;
    this._publishQueue = new RelayPublishQueue(
      config.store,
      handlerProvider,
      this._getDataID,
    );
    this._scheduler = config.scheduler ?? null;
    this._store = config.store;
    this.options = config.options;
    this._isServer = config.isServer ?? false;

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
    this._missingFieldHandlers = config.missingFieldHandlers;
    this._operationTracker =
      config.operationTracker ?? new RelayOperationTracker();
  }

  getStore(): Store {
    return this._store;
  }

  getNetwork(): INetwork {
    return this._network;
  }

  getOperationTracker(): RelayOperationTracker {
    return this._operationTracker;
  }

  isRequestActive(requestIdentifier: string): boolean {
    const activeState = this._operationExecutions.get(requestIdentifier);
    return activeState === 'active';
  }

  UNSTABLE_getDefaultRenderPolicy(): RenderPolicy {
    return this._defaultRenderPolicy;
  }

  applyUpdate(optimisticUpdate: OptimisticUpdateFunction): Disposable {
    const dispose = () => {
      this._publishQueue.revertUpdate(optimisticUpdate);
      this._publishQueue.run();
    };
    this._publishQueue.applyUpdate(optimisticUpdate);
    this._publishQueue.run();
    return {dispose};
  }

  revertUpdate(update: OptimisticUpdateFunction): void {
    this._publishQueue.revertUpdate(update);
    this._publishQueue.run();
  }

  replaceUpdate(
    update: OptimisticUpdateFunction,
    newUpdate: OptimisticUpdateFunction,
  ): void {
    this._publishQueue.revertUpdate(update);
    this._publishQueue.applyUpdate(newUpdate);
    this._publishQueue.run();
  }

  applyMutation(optimisticConfig: OptimisticResponseConfig): Disposable {
    const subscription = RelayObservable.create(sink => {
      const source = RelayObservable.create(_sink => {});
      const executor = RelayModernQueryExecutor.execute({
        operation: optimisticConfig.operation,
        operationExecutions: this._operationExecutions,
        operationLoader: this._operationLoader,
        optimisticConfig,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        store: this._store,
        updater: null,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
        treatMissingFieldsAsNull: this._treatMissingFieldsAsNull,
      });
      return () => executor.cancel();
    }).subscribe({});
    return {
      dispose: () => subscription.unsubscribe(),
    };
  }

  check(operation: OperationDescriptor): OperationAvailability {
    if (
      this._missingFieldHandlers == null ||
      this._missingFieldHandlers.length === 0
    ) {
      return this._store.check(operation);
    }
    return this._checkSelectorAndHandleMissingFields(
      operation,
      this._missingFieldHandlers,
    );
  }

  commitPayload(operation: OperationDescriptor, payload: PayloadData): void {
    RelayObservable.create(sink => {
      const executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationExecutions: this._operationExecutions,
        operationLoader: this._operationLoader,
        optimisticConfig: null,
        publishQueue: this._publishQueue,
        scheduler: null, // make sure the first payload is sync
        sink,
        source: RelayObservable.from({
          data: payload,
        }),
        store: this._store,
        updater: null,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
        isClientPayload: true,
        treatMissingFieldsAsNull: this._treatMissingFieldsAsNull,
      });
      return () => executor.cancel();
    }).subscribe({});
  }

  commitUpdate(updater: StoreUpdater): void {
    this._publishQueue.commitUpdate(updater);
    this._publishQueue.run();
  }

  lookup(readSelector: SingularReaderSelector): Snapshot {
    return this._store.lookup(readSelector);
  }

  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    return this._store.subscribe(snapshot, callback);
  }

  retain(operation: OperationDescriptor): Disposable {
    return this._store.retain(operation);
  }

  isServer(): boolean {
    return this._isServer;
  }

  _checkSelectorAndHandleMissingFields(
    operation: OperationDescriptor,
    handlers: $ReadOnlyArray<MissingFieldHandler>,
  ): OperationAvailability {
    const target = RelayRecordSource.create();
    const result = this._store.check(operation, {target, handlers});
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
    ...
  }): RelayObservable<GraphQLResponse> {
    const [logObserver, logRequestInfo] = this.__createLogObserver(
      operation.request.node.params,
      operation.request.variables,
    );
    return RelayObservable.create(sink => {
      const source = this._network.execute(
        operation.request.node.params,
        operation.request.variables,
        cacheConfig || {},
        null,
        logRequestInfo,
      );
      const executor = RelayModernQueryExecutor.execute({
        operation,
        operationExecutions: this._operationExecutions,
        operationLoader: this._operationLoader,
        optimisticConfig: null,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        store: this._store,
        updater,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
        treatMissingFieldsAsNull: this._treatMissingFieldsAsNull,
      });
      return () => executor.cancel();
    }).do(logObserver);
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
    cacheConfig,
    operation,
    optimisticResponse,
    optimisticUpdater,
    updater,
    uploadables,
  }: {|
    cacheConfig?: ?CacheConfig,
    operation: OperationDescriptor,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: ?Object,
    updater?: ?SelectorStoreUpdater,
    uploadables?: ?UploadableMap,
  |}): RelayObservable<GraphQLResponse> {
    const [logObserver, logRequestInfo] = this.__createLogObserver(
      operation.request.node.params,
      operation.request.variables,
    );
    return RelayObservable.create(sink => {
      let optimisticConfig;
      if (optimisticResponse || optimisticUpdater) {
        optimisticConfig = {
          operation: operation,
          response: optimisticResponse,
          updater: optimisticUpdater,
        };
      }
      const source = this._network.execute(
        operation.request.node.params,
        operation.request.variables,
        {
          ...cacheConfig,
          force: true,
        },
        uploadables,
        logRequestInfo,
      );
      const executor = RelayModernQueryExecutor.execute({
        operation,
        operationExecutions: this._operationExecutions,
        operationLoader: this._operationLoader,
        optimisticConfig,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        store: this._store,
        updater,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
        treatMissingFieldsAsNull: this._treatMissingFieldsAsNull,
      });
      return () => executor.cancel();
    }).do(logObserver);
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
        operationExecutions: this._operationExecutions,
        operationLoader: this._operationLoader,
        operationTracker: this._operationTracker,
        optimisticConfig: null,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        store: this._store,
        getDataID: this._getDataID,
        treatMissingFieldsAsNull: this._treatMissingFieldsAsNull,
      });
      return () => executor.cancel();
    });
  }

  toJSON(): mixed {
    return `RelayModernEnvironment(${this.configName ?? ''})`;
  }

  __createLogObserver(
    params: RequestParameters,
    variables: Variables,
  ): [Observer<GraphQLResponse>, LogRequestInfoFunction] {
    const transactionID = generateID();
    const log = this.__log;
    const logObserver = {
      start: subscription => {
        log({
          name: 'execute.start',
          transactionID,
          params,
          variables,
        });
      },
      next: response => {
        log({
          name: 'execute.next',
          transactionID,
          response,
        });
      },
      error: error => {
        log({
          name: 'execute.error',
          transactionID,
          error,
        });
      },
      complete: () => {
        log({
          name: 'execute.complete',
          transactionID,
        });
      },
      unsubscribe: () => {
        log({
          name: 'execute.unsubscribe',
          transactionID,
        });
      },
    };
    const logRequestInfo = info => {
      log({
        name: 'execute.info',
        transactionID,
        info,
      });
    };
    return [logObserver, logRequestInfo];
  }
}

// Add a sigil for detection by `isRelayModernEnvironment()` to avoid a
// realm-specific instanceof check, and to aid in module tree-shaking to
// avoid requiring all of RelayRuntime just to detect its environment.
(RelayModernEnvironment: any).prototype['@@RelayModernEnvironment'] = true;

function emptyFunction() {}

module.exports = RelayModernEnvironment;
