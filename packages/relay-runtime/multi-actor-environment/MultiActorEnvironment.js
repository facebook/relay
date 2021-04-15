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
const OperationExecutor = require('../store/OperationExecutor');
const RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');
const RelayModernStore = require('../store/RelayModernStore');
const RelayObservable = require('../network/RelayObservable');
const RelayPublishQueue = require('../store/RelayPublishQueue');
const RelayRecordSource = require('../store/RelayRecordSource');

const defaultGetDataID = require('../store/defaultGetDataID');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {GraphQLResponse, PayloadData} from '../network/RelayNetworkTypes';
import type {INetwork} from '../network/RelayNetworkTypes';
import type {ActiveState} from '../store/OperationExecutor';
import type {GetDataID} from '../store/RelayResponseNormalizer';
import type {
  IEnvironment,
  OptimisticResponseConfig,
  OptimisticUpdateFunction,
  OperationDescriptor,
  OperationAvailability,
  Snapshot,
  SelectorStoreUpdater,
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
  logFn: LogFunction,
  requiredFieldLogger: RequiredFieldLogger,
  treatMissingFieldsAsNull?: boolean,
}>;

class MultiActorEnvironment implements IMultiActorEnvironment {
  +_actorEnvironments: Map<ActorIdentifier, IActorEnvironment>;
  +_createNetworkForActor: (actorIdentifier: ActorIdentifier) => INetwork;
  +_getDataID: GetDataID;
  +_handlerProvider: HandlerProvider;
  +_logFn: LogFunction;
  +_operationExecutions: Map<string, ActiveState>;
  +_requiredFieldLogger: RequiredFieldLogger;
  +_treatMissingFieldsAsNull: boolean;

  constructor(config: MultiActorEnvironmentConfig) {
    this._actorEnvironments = new Map();
    this._createNetworkForActor = config.createNetworkForActor;
    this._getDataID = config.getDataID ?? defaultGetDataID;
    this._handlerProvider = config.handlerProvider
      ? config.handlerProvider
      : RelayDefaultHandlerProvider;
    this._logFn = config.logFn;
    this._operationExecutions = new Map();
    this._requiredFieldLogger = config.requiredFieldLogger;
    this._treatMissingFieldsAsNull = config.treatMissingFieldsAsNull ?? false;
  }

  /**
   * This method will create an actor specfic environment. It will create a new instance
   * and store it in the internal maps. If will return a memozied version
   * of the environment if we already created one for actor.
   */
  forActor(actorIdentifier: ActorIdentifier): IEnvironment & IActorEnvironment {
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
    actorIdentifier: ActorIdentifier,
    operation: OperationDescriptor,
  ): OperationAvailability {
    return todo('check');
  }

  subscribe(
    actorIdentifier: ActorIdentifier,
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    return todo('subscribe');
  }

  retain(
    actorIdentifier: ActorIdentifier,
    operation: OperationDescriptor,
  ): Disposable {
    return todo('retain');
  }

  applyUpdate(
    actorIdentifier: ActorIdentifier,
    optimisticUpdate: OptimisticUpdateFunction,
  ): Disposable {
    return todo('applyUpdate');
  }

  applyMutation(
    actorIdentifier: ActorIdentifier,
    optimisticConfig: OptimisticResponseConfig,
  ): Disposable {
    return todo('applyMutation');
  }

  commitUpdate(actorIdentifier: ActorIdentifier, updater: StoreUpdater): void {
    return todo('commitUpdate');
  }

  commitPayload(
    actorIdentifier: ActorIdentifier,
    operationDescriptor: OperationDescriptor,
    payload: PayloadData,
  ): void {
    return todo('commitPayload');
  }

  lookup(
    actorIdentifier: ActorIdentifier,
    selector: SingularReaderSelector,
  ): Snapshot {
    return todo('lookup');
  }

  execute(
    actorIdentifier: ActorIdentifier,
    config: {
      operation: OperationDescriptor,
      updater?: ?SelectorStoreUpdater,
    },
  ): RelayObservable<GraphQLResponse> {
    const {operation, updater} = config;
    return RelayObservable.create(sink => {
      const actorEnvironemnt = this.forActor(actorIdentifier);
      const source = actorEnvironemnt
        .getNetwork()
        .execute(
          operation.request.node.params,
          operation.request.variables,
          operation.request.cacheConfig || {},
          null,
        );
      const executor = OperationExecutor.execute({
        operation,
        operationExecutions: this._operationExecutions,
        operationLoader: null,
        optimisticConfig: null,
        publishQueue: new RelayPublishQueue(
          actorEnvironemnt.getStore(),
          this._handlerProvider,
          this._getDataID,
        ),
        reactFlightPayloadDeserializer: null,
        reactFlightServerErrorHandler: null,
        scheduler: null,
        sink,
        source,
        store: actorEnvironemnt.getStore(),
        updater,
        operationTracker: actorEnvironemnt.getOperationTracker(),
        getDataID: this._getDataID,
        treatMissingFieldsAsNull: this._treatMissingFieldsAsNull,
        shouldProcessClientComponents: false,
      });
      return () => executor.cancel();
    });
  }

  executeMutation(
    actorIdentifier: ActorIdentifier,
    config: ExecuteMutationConfig,
  ): RelayObservable<GraphQLResponse> {
    return todo('executeMutation');
  }

  executeWithSource(
    actorIdentifier: ActorIdentifier,
    config: {
      operation: OperationDescriptor,
      source: RelayObservable<GraphQLResponse>,
    },
  ): RelayObservable<GraphQLResponse> {
    return todo('executeWithSource');
  }

  isRequestActive(
    actorIdentifier: ActorIdentifier,
    requestIdentifier: string,
  ): boolean {
    return todo('isRequestActive');
  }
}

module.exports = MultiActorEnvironment;
