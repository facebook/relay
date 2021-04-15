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

const RelayOperationTracker = require('../store/RelayOperationTracker');

import type {GraphQLResponse, PayloadData} from '../network/RelayNetworkTypes';
import type {INetwork} from '../network/RelayNetworkTypes';
import type RelayObservable from '../network/RelayObservable';
import type {
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
  Store,
  OperationTracker,
} from '../store/RelayStoreTypes';
import type {Disposable, RenderPolicy} from '../util/RelayRuntimeTypes';
import type {ActorIdentifier} from './ActorIdentifier';
import type {
  IActorEnvironment,
  IMultiActorEnvironment,
} from './MultiActorEnvironmentTypes';

function todo() {
  throw new Error('Not implementd');
}

export type ActorSpecificEnvironmentConfig = $ReadOnly<{
  actorIdentifier: ActorIdentifier,
  logFn: LogFunction,
  multiActorEnvironment: IMultiActorEnvironment,
  network: INetwork,
  requiredFieldLogger: RequiredFieldLogger,
  store: Store,
}>;

class ActorSpecificEnvironment implements IActorEnvironment {
  +options: mixed;
  __log: LogFunction;
  requiredFieldLogger: RequiredFieldLogger;
  +_store: Store;
  +_network: INetwork;
  +_operationTracker: OperationTracker;

  // Actor specific properties
  +actorIdentifier: ActorIdentifier;
  +multiActorEnvironment: IMultiActorEnvironment;

  constructor(config: ActorSpecificEnvironmentConfig) {
    this.actorIdentifier = config.actorIdentifier;
    this.multiActorEnvironment = config.multiActorEnvironment;

    this.__log = config.logFn;
    this.requiredFieldLogger = config.requiredFieldLogger;
    this._operationTracker = new RelayOperationTracker();
    this._store = config.store;
    this._network = config.network;
  }

  UNSTABLE_getDefaultRenderPolicy(): RenderPolicy {
    return todo();
  }

  applyMutation(optimisticConfig: OptimisticResponseConfig): Disposable {
    return this.multiActorEnvironment.applyMutation(this, optimisticConfig);
  }

  applyUpdate(optimisticUpdate: OptimisticUpdateFunction): Disposable {
    return this.multiActorEnvironment.applyUpdate(this, optimisticUpdate);
  }

  check(operation: OperationDescriptor): OperationAvailability {
    return this.multiActorEnvironment.check(this, operation);
  }

  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    return this.multiActorEnvironment.subscribe(this, snapshot, callback);
  }

  retain(operation: OperationDescriptor): Disposable {
    return this.multiActorEnvironment.retain(this, operation);
  }

  commitUpdate(updater: StoreUpdater): void {
    return this.multiActorEnvironment.commitUpdate(this, updater);
  }

  /**
   * Commit a payload to the environment using the given operation selector.
   */
  commitPayload(
    operationDescriptor: OperationDescriptor,
    payload: PayloadData,
  ): void {
    return this.multiActorEnvironment.commitPayload(
      this,
      operationDescriptor,
      payload,
    );
  }

  getNetwork(): INetwork {
    return this._network;
  }

  getStore(): Store {
    return this._store;
  }

  getOperationTracker(): OperationTracker {
    return this._operationTracker;
  }

  lookup(selector: SingularReaderSelector): Snapshot {
    return this.multiActorEnvironment.lookup(this, selector);
  }

  execute(config: {
    operation: OperationDescriptor,
    updater?: ?SelectorStoreUpdater,
  }): RelayObservable<GraphQLResponse> {
    return this.multiActorEnvironment.execute(this, config);
  }

  executeMutation(
    options: ExecuteMutationConfig,
  ): RelayObservable<GraphQLResponse> {
    return this.multiActorEnvironment.executeMutation(this, options);
  }

  executeWithSource(options: {
    operation: OperationDescriptor,
    source: RelayObservable<GraphQLResponse>,
  }): RelayObservable<GraphQLResponse> {
    return this.multiActorEnvironment.executeWithSource(this, options);
  }

  isRequestActive(requestIdentifier: string): boolean {
    return this.multiActorEnvironment.isRequestActive(this, requestIdentifier);
  }

  isServer(): boolean {
    return todo();
  }
}

module.exports = ActorSpecificEnvironment;
