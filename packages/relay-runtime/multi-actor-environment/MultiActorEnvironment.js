/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const ActorSpecificEnvironment = require('./ActorSpecificEnvironment');
const MultiActorOperationExecutor = require('./MultiActorOperationExecutor');
const RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');
const RelayModernStore = require('../store/RelayModernStore');
const RelayObservable = require('../network/RelayObservable');
const RelayRecordSource = require('../store/RelayRecordSource');

const defaultGetDataID = require('../store/defaultGetDataID');
const defaultRequiredFieldLogger = require('../store/defaultRequiredFieldLogger');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {GraphQLResponse, PayloadData} from '../network/RelayNetworkTypes';
import type {INetwork} from '../network/RelayNetworkTypes';
import type {ActiveState, TaskScheduler} from '../store/OperationExecutor';
import type {GetDataID} from '../store/RelayResponseNormalizer';
import type {
  IEnvironment,
  OptimisticResponseConfig,
  OptimisticUpdateFunction,
  OperationDescriptor,
  OperationAvailability,
  Snapshot,
  SelectorStoreUpdater,
  OperationLoader,
  ReactFlightPayloadDeserializer,
  ReactFlightServerErrorHandler,
  SingularReaderSelector,
  StoreUpdater,
  RequiredFieldLogger,
  ExecuteMutationConfig,
  LogFunction,
} from '../store/RelayStoreTypes';
import type {Disposable} from '../util/RelayRuntimeTypes';
import type {ActorIdentifier} from './ActorIdentifier';
import type {
  IActorEnvironment,
  IMultiActorEnvironment,
} from './MultiActorEnvironmentTypes';

function todo(what: string) {
  throw new Error(`Not implementd: ${what}`);
}

export type MultiActorEnvironmentConfig = $ReadOnly<{
  createNetworkForActor: (actorIdentifier: ActorIdentifier) => INetwork,
  getDataID?: GetDataID,
  handlerProvider?: HandlerProvider,
  logFn?: ?LogFunction,
  operationLoader?: ?OperationLoader,
  scheduler?: ?TaskScheduler,
  reactFlightPayloadDeserializer?: ?ReactFlightPayloadDeserializer,
  reactFlightServerErrorHandler?: ?ReactFlightServerErrorHandler,
  requiredFieldLogger?: ?RequiredFieldLogger,
  treatMissingFieldsAsNull?: boolean,
  shouldProcessClientComponents?: ?boolean,
}>;

class MultiActorEnvironment implements IMultiActorEnvironment {
  +_actorEnvironments: Map<ActorIdentifier, IActorEnvironment>;
  +_createNetworkForActor: (actorIdentifier: ActorIdentifier) => INetwork;
  +_getDataID: GetDataID;
  +_handlerProvider: HandlerProvider;
  +_logFn: LogFunction;
  +_operationExecutions: Map<string, ActiveState>;
  +_requiredFieldLogger: RequiredFieldLogger;
  +_operationLoader: ?OperationLoader;
  +_reactFlightPayloadDeserializer: ?ReactFlightPayloadDeserializer;
  +_scheduler: ?TaskScheduler;
  +_reactFlightServerErrorHandler: ?ReactFlightServerErrorHandler;
  +_shouldProcessClientComponents: ?boolean;
  +_treatMissingFieldsAsNull: boolean;

  constructor(config: MultiActorEnvironmentConfig) {
    this._actorEnvironments = new Map();
    this._operationLoader = config.operationLoader;
    this._createNetworkForActor = config.createNetworkForActor;
    this._scheduler = config.scheduler;
    this._getDataID = config.getDataID ?? defaultGetDataID;
    this._handlerProvider = config.handlerProvider
      ? config.handlerProvider
      : RelayDefaultHandlerProvider;
    this._logFn = config.logFn ?? emptyFunction;
    this._operationExecutions = new Map();
    this._requiredFieldLogger =
      config.requiredFieldLogger ?? defaultRequiredFieldLogger;
    this._shouldProcessClientComponents = config.shouldProcessClientComponents;
    this._treatMissingFieldsAsNull = config.treatMissingFieldsAsNull ?? false;
  }

  /**
   * This method will create an actor specfic environment. It will create a new instance
   * and store it in the internal maps. If will return a memozied version
   * of the environment if we already created one for actor.
   */
  forActor(actorIdentifier: ActorIdentifier): IActorEnvironment {
    const environment = this._actorEnvironments.get(actorIdentifier);
    if (environment == null) {
      const newEnvironment = new ActorSpecificEnvironment({
        actorIdentifier,
        multiActorEnvironment: this,
        logFn: this._logFn,
        requiredFieldLogger: this._requiredFieldLogger,
        store: new RelayModernStore(RelayRecordSource.create()),
        network: this._createNetworkForActor(actorIdentifier),
      });
      this._actorEnvironments.set(actorIdentifier, newEnvironment);
      return newEnvironment;
    } else {
      return environment;
    }
  }

  check(
    actorEnvironment: IActorEnvironment,
    operation: OperationDescriptor,
  ): OperationAvailability {
    return todo('check');
  }

  subscribe(
    actorEnvironment: IActorEnvironment,
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    // TODO: make actor aware
    return actorEnvironment.getStore().subscribe(snapshot, callback);
  }

  retain(
    actorEnvironment: IActorEnvironment,
    operation: OperationDescriptor,
  ): Disposable {
    return todo('retain');
  }

  applyUpdate(
    actorEnvironment: IActorEnvironment,
    optimisticUpdate: OptimisticUpdateFunction,
  ): Disposable {
    return todo('applyUpdate');
  }

  applyMutation(
    actorEnvironment: IActorEnvironment,
    optimisticConfig: OptimisticResponseConfig,
  ): Disposable {
    return todo('applyMutation');
  }

  commitUpdate(
    actorEnvironment: IActorEnvironment,
    updater: StoreUpdater,
  ): void {
    return todo('commitUpdate');
  }

  commitPayload(
    actorEnvironment: IActorEnvironment,
    operationDescriptor: OperationDescriptor,
    payload: PayloadData,
  ): void {
    return todo('commitPayload');
  }

  lookup(
    actorEnvironment: IActorEnvironment,
    selector: SingularReaderSelector,
  ): Snapshot {
    // TODO: make actor aware
    return actorEnvironment.getStore().lookup(selector);
  }

  execute(
    actorEnvironemnt: IActorEnvironment,
    {
      operation,
      updater,
    }: {
      operation: OperationDescriptor,
      updater?: ?SelectorStoreUpdater,
    },
  ): RelayObservable<GraphQLResponse> {
    return this._execute(actorEnvironemnt, {
      createSource: () =>
        actorEnvironemnt
          .getNetwork()
          .execute(
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

  executeMutation(
    actorEnvironemnt: IActorEnvironment,
    {
      operation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      uploadables,
    }: ExecuteMutationConfig,
  ): RelayObservable<GraphQLResponse> {
    let optimisticConfig;
    if (optimisticResponse || optimisticUpdater) {
      optimisticConfig = {
        operation: operation,
        response: optimisticResponse,
        updater: optimisticUpdater,
      };
    }
    return this._execute(actorEnvironemnt, {
      createSource: () =>
        actorEnvironemnt.getNetwork().execute(
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

  executeWithSource(
    actorEnvrionment: IActorEnvironment,
    config: {
      operation: OperationDescriptor,
      source: RelayObservable<GraphQLResponse>,
    },
  ): RelayObservable<GraphQLResponse> {
    return todo('executeWithSource');
  }

  isRequestActive(
    actorEnvrionment: IActorEnvironment,
    requestIdentifier: string,
  ): boolean {
    return todo('isRequestActive');
  }

  _execute(
    actorEnvironemnt: IActorEnvironment,
    {
      createSource,
      isClientPayload,
      operation,
      optimisticConfig,
      updater,
    }: {|
      createSource: () => RelayObservable<GraphQLResponse>,
      isClientPayload: boolean,
      operation: OperationDescriptor,
      optimisticConfig: ?OptimisticResponseConfig,
      updater: ?SelectorStoreUpdater,
    |},
  ): RelayObservable<GraphQLResponse> {
    return RelayObservable.create(sink => {
      const executor = MultiActorOperationExecutor.execute({
        getDataID: this._getDataID,
        isClientPayload,
        operation,
        operationExecutions: this._operationExecutions,
        operationLoader: this._operationLoader,
        operationTracker: actorEnvironemnt.getOperationTracker(),
        optimisticConfig,
        publishQueue: actorEnvironemnt.getPublishQueue(),
        reactFlightPayloadDeserializer: this._reactFlightPayloadDeserializer,
        reactFlightServerErrorHandler: this._reactFlightServerErrorHandler,
        scheduler: this._scheduler,
        shouldProcessClientComponents: this._shouldProcessClientComponents,
        sink,
        // NOTE: Some product tests expect `Network.execute` to be called only
        //       when the Observable is executed.
        source: createSource(),
        store: actorEnvironemnt.getStore(),
        treatMissingFieldsAsNull: this._treatMissingFieldsAsNull,
        updater,
      });
      return () => executor.cancel();
    });
  }
}

function emptyFunction() {}

module.exports = MultiActorEnvironment;
