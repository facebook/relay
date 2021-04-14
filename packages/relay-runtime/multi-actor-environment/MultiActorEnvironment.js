/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const ActorSpecificEnvironment = require('./ActorSpecificEnvironment');

import type {ActorIdentifier} from './ActorIdentifier';
import type {
  IActorEnvironment,
  IMultiActorEnvironment,
} from './MultiActorEnvironmentTypes';
import type {
  IEnvironment,
  Disposable,
  Observable as RelayObservable,
  OptimisticResponseConfig,
  OptimisticUpdateFunction,
  OperationDescriptor,
  OperationAvailability,
  Snapshot,
  PayloadData,
  INetwork,
  Store,
  SelectorStoreUpdater,
  GraphQLResponse,
  SingularReaderSelector,
  OperationTracker as RelayOperationTracker,
  StoreUpdater,
  RequiredFieldLogger,
  ExecuteMutationConfig,
  LogFunction,
} from 'relay-runtime';

function todo() {
  throw new Error('Not implementd');
}

export type MultiActorEnvironmentConfig = $ReadOnly<{
  network: INetwork,
  logFn: LogFunction,
  requiredFieldLogger: RequiredFieldLogger,
}>;

class MultiActorEnvironment implements IMultiActorEnvironment {
  +__logFn: LogFunction;
  +__requiredFieldLogger: RequiredFieldLogger;

  +_actorEnvironments: Map<ActorIdentifier, IEnvironment & IActorEnvironment>;

  constructor(config: MultiActorEnvironmentConfig) {
    this._actorEnvironments = new Map();
    this.__logFn = config.logFn;
    this.__requiredFieldLogger = config.requiredFieldLogger;
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
        logFn: this.__logFn,
        requiredFieldLogger: this.__requiredFieldLogger,
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
    return todo();
  }

  subscribe(
    actorIdentifier: ActorIdentifier,
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    return todo();
  }

  retain(
    actorIdentifier: ActorIdentifier,
    operation: OperationDescriptor,
  ): Disposable {
    return todo();
  }

  applyUpdate(
    actorIdentifier: ActorIdentifier,
    optimisticUpdate: OptimisticUpdateFunction,
  ): Disposable {
    return todo();
  }

  applyMutation(
    actorIdentifier: ActorIdentifier,
    optimisticConfig: OptimisticResponseConfig,
  ): Disposable {
    return todo();
  }

  commitUpdate(actorIdentifier: ActorIdentifier, updater: StoreUpdater): void {
    return todo();
  }

  commitPayload(
    actorIdentifier: ActorIdentifier,
    operationDescriptor: OperationDescriptor,
    payload: PayloadData,
  ): void {
    return todo();
  }

  getNetwork(actorIdentifier: ActorIdentifier): INetwork {
    return todo();
  }

  getStore(actorIdentifier: ActorIdentifier): Store {
    return todo();
  }

  getOperationTracker(actorIdentifier: ActorIdentifier): RelayOperationTracker {
    return todo();
  }

  lookup(
    actorIdentifier: ActorIdentifier,
    selector: SingularReaderSelector,
  ): Snapshot {
    return todo();
  }

  execute(
    actorIdentifier: ActorIdentifier,
    config: {
      operation: OperationDescriptor,
      updater?: ?SelectorStoreUpdater,
    },
  ): RelayObservable<GraphQLResponse> {
    return todo();
  }

  executeMutation(
    actorIdentifier: ActorIdentifier,
    config: ExecuteMutationConfig,
  ): RelayObservable<GraphQLResponse> {
    return todo();
  }

  executeWithSource(
    actorIdentifier: ActorIdentifier,
    config: {
      operation: OperationDescriptor,
      source: RelayObservable<GraphQLResponse>,
    },
  ): RelayObservable<GraphQLResponse> {
    return todo();
  }

  isRequestActive(
    actorIdentifier: ActorIdentifier,
    requestIdentifier: string,
  ): boolean {
    return todo();
  }
}

module.exports = MultiActorEnvironment;
