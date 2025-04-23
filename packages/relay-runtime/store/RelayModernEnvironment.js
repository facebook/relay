/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {ActorIdentifier} from '../multi-actor-environment/ActorIdentifier';
import type {
  GraphQLResponse,
  INetwork,
  PayloadData,
} from '../network/RelayNetworkTypes';
import type {Sink} from '../network/RelayObservable';
import type {Disposable, RenderPolicy} from '../util/RelayRuntimeTypes';
import type {ActiveState} from './OperationExecutor';
import type {GetDataID} from './RelayResponseNormalizer';
import type {
  ExecuteMutationConfig,
  IEnvironment,
  LogFunction,
  MissingFieldHandler,
  MutationParameters,
  NormalizeResponseFunction,
  OperationAvailability,
  OperationDescriptor,
  OperationLoader,
  OperationTracker,
  OptimisticResponseConfig,
  OptimisticUpdateFunction,
  PublishQueue,
  RelayFieldLogger,
  SelectorStoreUpdater,
  SingularReaderSelector,
  Snapshot,
  Store,
  StoreUpdater,
  TaskScheduler,
} from './RelayStoreTypes';

const RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');
const {
  INTERNAL_ACTOR_IDENTIFIER_DO_NOT_USE,
  assertInternalActorIdentifier,
} = require('../multi-actor-environment/ActorIdentifier');
const RelayObservable = require('../network/RelayObservable');
const wrapNetworkWithLogObserver = require('../network/wrapNetworkWithLogObserver');
const RelayOperationTracker = require('../store/RelayOperationTracker');
const registerEnvironmentWithDevTools = require('../util/registerEnvironmentWithDevTools');
const defaultGetDataID = require('./defaultGetDataID');
const defaultRelayFieldLogger = require('./defaultRelayFieldLogger');
const normalizeResponse = require('./normalizeResponse');
const OperationExecutor = require('./OperationExecutor');
const RelayModernStore = require('./RelayModernStore');
const RelayPublishQueue = require('./RelayPublishQueue');
const RelayRecordSource = require('./RelayRecordSource');
const invariant = require('invariant');

export type EnvironmentConfig = {
  +configName?: string,
  +handlerProvider?: ?HandlerProvider,
  +treatMissingFieldsAsNull?: boolean,
  +log?: ?LogFunction,
  +operationLoader?: ?OperationLoader,
  +network: INetwork,
  +normalizeResponse?: ?NormalizeResponseFunction,
  +scheduler?: ?TaskScheduler,
  +store?: Store,
  +missingFieldHandlers?: ?$ReadOnlyArray<MissingFieldHandler>,
  +operationTracker?: ?OperationTracker,
  +getDataID?: ?GetDataID,
  +UNSTABLE_defaultRenderPolicy?: ?RenderPolicy,
  +options?: mixed,
  +isServer?: boolean,
  +relayFieldLogger?: ?RelayFieldLogger,
  +shouldProcessClientComponents?: ?boolean,
};

class RelayModernEnvironment implements IEnvironment {
  __log: LogFunction;
  +_defaultRenderPolicy: RenderPolicy;
  _operationLoader: ?OperationLoader;
  _shouldProcessClientComponents: ?boolean;
  _network: INetwork;
  _publishQueue: PublishQueue;
  _scheduler: ?TaskScheduler;
  _store: Store;
  configName: ?string;
  _missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>;
  _operationTracker: OperationTracker;
  _getDataID: GetDataID;
  _treatMissingFieldsAsNull: boolean;
  _operationExecutions: Map<string, ActiveState>;
  +options: mixed;
  +_isServer: boolean;
  relayFieldLogger: RelayFieldLogger;
  _normalizeResponse: NormalizeResponseFunction;

  constructor(config: EnvironmentConfig) {
    this.configName = config.configName;
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
    const store =
      config.store ??
      new RelayModernStore(new RelayRecordSource(), {
        log: config.log,
        operationLoader: config.operationLoader,
        getDataID: config.getDataID,
        shouldProcessClientComponents: config.shouldProcessClientComponents,
      });

    this.__log = config.log ?? emptyFunction;
    this.relayFieldLogger = config.relayFieldLogger ?? defaultRelayFieldLogger;
    this._defaultRenderPolicy =
      config.UNSTABLE_defaultRenderPolicy ?? 'partial';
    this._operationLoader = operationLoader;
    this._operationExecutions = new Map();
    this._network = wrapNetworkWithLogObserver(this, config.network);
    this._getDataID = config.getDataID ?? defaultGetDataID;
    this._missingFieldHandlers = config.missingFieldHandlers ?? [];
    this._publishQueue = new RelayPublishQueue(
      store,
      config.handlerProvider ?? RelayDefaultHandlerProvider,
      this._getDataID,
      this._missingFieldHandlers,
      this.__log,
    );
    this._scheduler = config.scheduler ?? null;
    this._store = store;
    this.options = config.options;
    this._isServer = config.isServer ?? false;
    this._normalizeResponse = config.normalizeResponse ?? normalizeResponse;

    (this: any).__setNet = newNet =>
      (this._network = wrapNetworkWithLogObserver(this, newNet));

    if (__DEV__) {
      const {inspect} = require('./StoreInspector');
      (this: any).DEBUG_inspect = (dataID: ?string) => inspect(this, dataID);
    }

    this._operationTracker =
      config.operationTracker ?? new RelayOperationTracker();
    this._shouldProcessClientComponents = config.shouldProcessClientComponents;

    // Register this Relay Environment with Relay DevTools if it exists.
    // Note: this must always be the last step in the constructor.
    registerEnvironmentWithDevTools(this);
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

  getScheduler(): ?TaskScheduler {
    return this._scheduler;
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
      this._scheduleUpdates(() => {
        this._publishQueue.revertUpdate(optimisticUpdate);
        this._publishQueue.run();
      });
    };
    this._scheduleUpdates(() => {
      this._publishQueue.applyUpdate(optimisticUpdate);
      this._publishQueue.run();
    });
    return {dispose};
  }

  revertUpdate(update: OptimisticUpdateFunction): void {
    this._scheduleUpdates(() => {
      this._publishQueue.revertUpdate(update);
      this._publishQueue.run();
    });
  }

  replaceUpdate(
    update: OptimisticUpdateFunction,
    newUpdate: OptimisticUpdateFunction,
  ): void {
    this._scheduleUpdates(() => {
      this._publishQueue.revertUpdate(update);
      this._publishQueue.applyUpdate(newUpdate);
      this._publishQueue.run();
    });
  }

  applyMutation<TMutation: MutationParameters>(
    optimisticConfig: OptimisticResponseConfig<TMutation>,
  ): Disposable {
    const subscription = this._execute({
      createSource: () => RelayObservable.create(_sink => {}),
      isClientPayload: false,
      operation: optimisticConfig.operation,
      optimisticConfig,
      updater: null,
    }).subscribe({});
    return {
      dispose: () => subscription.unsubscribe(),
    };
  }

  check(operation: OperationDescriptor): OperationAvailability {
    if (
      this._missingFieldHandlers.length === 0 &&
      !operationHasClientAbstractTypes(operation)
    ) {
      return this._store.check(operation);
    }
    return this._checkSelectorAndHandleMissingFields(
      operation,
      this._missingFieldHandlers,
    );
  }

  commitPayload(operation: OperationDescriptor, payload: PayloadData): void {
    this._execute({
      createSource: () => RelayObservable.from({data: payload}),
      isClientPayload: true,
      operation: operation,
      optimisticConfig: null,
      updater: null,
    }).subscribe({});
  }

  commitUpdate(updater: StoreUpdater): void {
    this._scheduleUpdates(() => {
      this._publishQueue.commitUpdate(updater);
      this._publishQueue.run();
    });
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
    const source = this._store.getSource();
    const result = this._store.check(operation, {
      handlers,
      defaultActorIdentifier: INTERNAL_ACTOR_IDENTIFIER_DO_NOT_USE,
      getSourceForActor(actorIdentifier: ActorIdentifier) {
        assertInternalActorIdentifier(actorIdentifier);
        return source;
      },
      getTargetForActor(actorIdentifier: ActorIdentifier) {
        assertInternalActorIdentifier(actorIdentifier);
        return target;
      },
    });
    if (target.size() > 0) {
      this._scheduleUpdates(() => {
        this._publishQueue.commitSource(target);
        this._publishQueue.run();
      });
    }
    return result;
  }

  _scheduleUpdates(task: () => void) {
    const scheduler = this._scheduler;
    if (scheduler != null) {
      scheduler.schedule(task);
    } else {
      task();
    }
  }

  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query operation, each result of which is then
   * normalized and committed to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.execute({...}).subscribe({...}).
   */
  execute({
    operation,
  }: {
    operation: OperationDescriptor,
  }): RelayObservable<GraphQLResponse> {
    return this._execute({
      createSource: () => {
        return this.getNetwork().execute(
          operation.request.node.params,
          operation.request.variables,
          operation.request.cacheConfig || {},
          null,
          undefined,
          undefined,
          undefined,
          () => this.check(operation),
        );
      },
      isClientPayload: false,
      operation,
      optimisticConfig: null,
      updater: null,
    });
  }

  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Subscription operation, each result of which is then
   * normalized and committed to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.execute({...}).subscribe({...}).
   */
  executeSubscription<TMutation: MutationParameters>({
    operation,
    updater,
  }: {
    operation: OperationDescriptor,
    updater?: ?SelectorStoreUpdater<TMutation['response']>,
  }): RelayObservable<GraphQLResponse> {
    return this._execute({
      createSource: () =>
        this.getNetwork().execute(
          operation.request.node.params,
          operation.request.variables,
          operation.request.cacheConfig || {},
          null,
        ),
      isClientPayload: false,
      operation,
      optimisticConfig: null,
      updater,
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
  executeMutation<TMutation: MutationParameters>({
    operation,
    optimisticResponse,
    optimisticUpdater,
    updater,
    uploadables,
  }: ExecuteMutationConfig<TMutation>): RelayObservable<GraphQLResponse> {
    let optimisticConfig;
    if (optimisticResponse || optimisticUpdater) {
      optimisticConfig = {
        operation: operation,
        response: optimisticResponse,
        updater: optimisticUpdater,
      };
    }
    return this._execute({
      createSource: () =>
        this.getNetwork().execute(
          operation.request.node.params,
          operation.request.variables,
          {
            ...operation.request.cacheConfig,
            force: true,
          },
          uploadables,
        ),
      isClientPayload: false,
      operation,
      optimisticConfig,
      updater,
    });
  }

  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query or Subscription operation responses, the result of which is
   * then normalized and committed to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeWithSource({...}).subscribe({...}).
   */
  executeWithSource({
    operation,
    source,
  }: {
    operation: OperationDescriptor,
    source: RelayObservable<GraphQLResponse>,
  }): RelayObservable<GraphQLResponse> {
    return this._execute({
      createSource: () => source,
      isClientPayload: false,
      operation,
      optimisticConfig: null,
      updater: null,
    });
  }

  toJSON(): mixed {
    return `RelayModernEnvironment(${this.configName ?? ''})`;
  }

  _execute<TMutation: MutationParameters>({
    createSource,
    isClientPayload,
    operation,
    optimisticConfig,
    updater,
  }: {
    createSource: () => RelayObservable<GraphQLResponse>,
    isClientPayload: boolean,
    operation: OperationDescriptor,
    optimisticConfig: ?OptimisticResponseConfig<TMutation>,
    updater: ?SelectorStoreUpdater<TMutation['response']>,
  }): RelayObservable<GraphQLResponse> {
    const publishQueue = this._publishQueue;
    const store = this._store;
    return RelayObservable.create((sink: Sink<GraphQLResponse>) => {
      const executor = OperationExecutor.execute<$FlowFixMe>({
        actorIdentifier: INTERNAL_ACTOR_IDENTIFIER_DO_NOT_USE,
        getDataID: this._getDataID,
        isClientPayload,
        log: this.__log,
        operation,
        operationExecutions: this._operationExecutions,
        operationLoader: this._operationLoader,
        operationTracker: this._operationTracker,
        optimisticConfig,
        getPublishQueue(actorIdentifier: ActorIdentifier) {
          assertInternalActorIdentifier(actorIdentifier);
          return publishQueue;
        },
        scheduler: this._scheduler,
        shouldProcessClientComponents: this._shouldProcessClientComponents,
        sink,
        // NOTE: Some product tests expect `Network.execute` to be called only
        //       when the Observable is executed.
        source: createSource(),
        getStore(actorIdentifier: ActorIdentifier) {
          assertInternalActorIdentifier(actorIdentifier);
          return store;
        },
        treatMissingFieldsAsNull: this._treatMissingFieldsAsNull,
        updater,
        normalizeResponse: this._normalizeResponse,
      });
      return () => executor.cancel();
    });
  }
}

function operationHasClientAbstractTypes(
  operation: OperationDescriptor,
): boolean {
  return (
    operation.root.node.kind === 'Operation' &&
    operation.root.node.clientAbstractTypes != null
  );
}

// Add a sigil for detection by `isRelayModernEnvironment()` to avoid a
// realm-specific instanceof check, and to aid in module tree-shaking to
// avoid requiring all of RelayRuntime just to detect its environment.
(RelayModernEnvironment: any).prototype['@@RelayModernEnvironment'] = true;

function emptyFunction() {}

module.exports = RelayModernEnvironment;
