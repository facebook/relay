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

'use strict';

const DataChecker = require('./DataChecker');
const RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');
const RelayDefaultMissingFieldHandlers = require('../handlers/RelayDefaultMissingFieldHandlers');
const RelayModernQueryExecutor = require('./RelayModernQueryExecutor');
const RelayObservable = require('../network/RelayObservable');
const RelayOperationTracker = require('../store/RelayOperationTracker');
const RelayPublishQueue = require('./RelayPublishQueue');
const RelayRecordSource = require('./RelayRecordSource');

const defaultGetDataID = require('./defaultGetDataID');
const generateID = require('../util/generateID');
const invariant = require('invariant');
const normalizeRelayPayload = require('./normalizeRelayPayload');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {LoggerTransactionConfig} from '../network/RelayNetworkLoggerTransaction';
import type {
  GraphQLResponse,
  LogRequestInfoFunction,
  Network,
  PayloadData,
  UploadableMap,
} from '../network/RelayNetworkTypes';
import type {Observer} from '../network/RelayObservable';
import type {RequestParameters} from '../util/RelayConcreteNode';
import type {
  CacheConfig,
  Disposable,
  Variables,
} from '../util/RelayRuntimeTypes';
import type {TaskScheduler} from './RelayModernQueryExecutor';
import type {GetDataID} from './RelayResponseNormalizer';
import type {
  Environment,
  Logger,
  LogFunction,
  LoggerProvider,
  MissingFieldHandler,
  NormalizationSelector,
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
  +log?: ?LogFunction,
  +operationLoader?: ?OperationLoader,
  +network: Network,
  +scheduler?: ?TaskScheduler,
  +store: Store,
  +missingFieldHandlers?: ?$ReadOnlyArray<MissingFieldHandler>,
  +operationTracker?: ?OperationTracker,
  +loggerProvider?: ?LoggerProvider,
  /**
   * This method is likely to change in future versions, use at your own risk.
   * It can potentially break existing calls like store.get(<id>),
   * because the internal ID might not be the `id` field on the node anymore
   */
  +UNSTABLE_DO_NOT_USE_getDataID?: ?GetDataID,
|};

class RelayModernEnvironment implements Environment {
  _log: LogFunction;
  _loggerProvider: ?LoggerProvider;
  _operationLoader: ?OperationLoader;
  _network: Network;
  _publishQueue: PublishQueue;
  _scheduler: ?TaskScheduler;
  _store: Store;
  configName: ?string;
  _missingFieldHandlers: ?$ReadOnlyArray<MissingFieldHandler>;
  _operationTracker: OperationTracker;
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
    this._log = config.log ?? emptyFunction;
    this._loggerProvider = config.loggerProvider;
    this._operationLoader = operationLoader;
    this._network = config.network;
    this._getDataID = config.UNSTABLE_DO_NOT_USE_getDataID ?? defaultGetDataID;
    this._publishQueue = new RelayPublishQueue(
      config.store,
      handlerProvider,
      this._getDataID,
    );
    this._scheduler = config.scheduler ?? null;
    this._store = config.store;

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

    this._operationTracker =
      config.operationTracker ?? new RelayOperationTracker();
  }

  getStore(): Store {
    return this._store;
  }

  getNetwork(): Network {
    return this._network;
  }

  getOperationTracker(): RelayOperationTracker {
    return this._operationTracker;
  }

  getLogger(config: LoggerTransactionConfig): ?Logger {
    if (!this._loggerProvider) {
      return null;
    }
    return this._loggerProvider.getLogger(config);
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
        operationLoader: this._operationLoader,
        optimisticConfig,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        updater: null,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
      });
      return () => executor.cancel();
    }).subscribe({});
    return {
      dispose: () => subscription.unsubscribe(),
    };
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

  commitPayload(operation: OperationDescriptor, payload: PayloadData): void {
    // Do not handle stripped nulls when committing a payload
    const relayPayload = normalizeRelayPayload(
      operation.root,
      payload,
      null /* errors */,
      {getDataID: this._getDataID, request: operation.request},
    );
    this._publishQueue.commitPayload(operation, relayPayload);
    this._publishQueue.run();
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
      id => this._store.getConnectionEvents_UNSTABLE(id),
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
        operationLoader: this._operationLoader,
        optimisticConfig: null,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        updater,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
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
        {force: true},
        uploadables,
        logRequestInfo,
      );
      const executor = RelayModernQueryExecutor.execute({
        operation,
        operationLoader: this._operationLoader,
        optimisticConfig,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        updater,
        operationTracker: this._operationTracker,
        getDataID: this._getDataID,
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
        operationLoader: this._operationLoader,
        operationTracker: this._operationTracker,
        optimisticConfig: null,
        publishQueue: this._publishQueue,
        scheduler: this._scheduler,
        sink,
        source,
        getDataID: this._getDataID,
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
    const log = this._log;
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
