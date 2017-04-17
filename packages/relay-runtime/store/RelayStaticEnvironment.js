/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStaticEnvironment
 * @flow
 */

'use strict';

const RelayCore = require('RelayCore');
const RelayDefaultHandlerProvider = require('RelayDefaultHandlerProvider');
const RelayPublishQueue = require('RelayPublishQueue');

const normalizeRelayPayload = require('normalizeRelayPayload');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {HandlerProvider} from 'RelayDefaultHandlerProvider';
import type {
  Network,
  PayloadData,
  PayloadError,
  RelayResponsePayload,
  UploadableMap,
} from 'RelayNetworkTypes';
import type {
  Environment,
  OperationSelector,
  Selector,
  SelectorStoreUpdater,
  Snapshot,
  Store,
  StoreUpdater,
  UnstableEnvironmentCore,
} from 'RelayStoreTypes';

export type EnvironmentConfig = {
  handlerProvider?: HandlerProvider,
  network: Network,
  store: Store,
};

class RelayStaticEnvironment implements Environment {
  _network: Network;
  _publishQueue: RelayPublishQueue;
  _store: Store;
  unstable_internal: UnstableEnvironmentCore;

  constructor(config: EnvironmentConfig) {
    const handlerProvider = config.handlerProvider ?
      config.handlerProvider :
      RelayDefaultHandlerProvider;
    this._network = config.network;
    this._publishQueue = new RelayPublishQueue(config.store, handlerProvider);
    this._store = config.store;
    this.unstable_internal = RelayCore;
  }

  getStore(): Store {
    return this._store;
  }

  applyUpdate(updater: StoreUpdater): Disposable {
    const dispose = () => {
      this._publishQueue.revertUpdate(updater);
      this._publishQueue.run();
    };
    this._publishQueue.applyUpdate(updater);
    this._publishQueue.run();
    return {dispose};
  }

  commitPayload(
    selector: Selector,
    payload: PayloadData,
  ): void {
    // Do not handle stripped nulls when commiting a payload
    const relayPayload = normalizeRelayPayload(selector, payload);
    this._publishQueue.commitPayload(selector, relayPayload);
    this._publishQueue.run();
  }

  commitUpdate(updater: StoreUpdater): void {
    this._publishQueue.commitUpdate(updater);
    this._publishQueue.run();
  }

  lookup(selector: Selector): Snapshot {
    return this._store.lookup(selector);
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
    let isDisposed = false;
    const dispose = () => {
      isDisposed = true;
    };
    this._network.request(operation.node, operation.variables, cacheConfig).then(payload => {
      if (isDisposed) {
        return;
      }
      this._publishQueue.commitPayload(operation.fragment, payload);
      this._publishQueue.run();
      onNext && onNext(payload);
      onCompleted && onCompleted();
    }).catch(error => {
      if (isDisposed) {
        return;
      }
      onError && onError(error);
    });
    return {dispose};
  }

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
    return this._network.requestStream(
      operation.node,
      operation.variables,
      cacheConfig,
      {
        onCompleted,
        onError,
        onNext: payload => {
          this._publishQueue.commitPayload(operation.fragment, payload);
          this._publishQueue.run();
          onNext && onNext(payload);
        },
      },
    );
  }

  sendMutation({
    onCompleted,
    onError,
    operation,
    optimisticUpdater,
    updater,
    uploadables,
  }: {
    onCompleted?: ?(errors: ?Array<PayloadError>) => void,
    onError?: ?(error: Error) => void,
    operation: OperationSelector,
    optimisticUpdater?: ?StoreUpdater,
    updater?: ?SelectorStoreUpdater,
    uploadables?: UploadableMap,
  }): Disposable {
    if (optimisticUpdater) {
      this._publishQueue.applyUpdate(optimisticUpdater);
      this._publishQueue.run();
    }
    let isDisposed = false;
    const dispose = () => {
      if (optimisticUpdater) {
        this._publishQueue.revertUpdate(optimisticUpdater);
        this._publishQueue.run();
        optimisticUpdater = null;
      }
      isDisposed = true;
    };
    this._network.request(
      operation.node,
      operation.variables,
      {force: true},
      uploadables,
    ).then(payload => {
      if (isDisposed) {
        return;
      }
      if (optimisticUpdater) {
        this._publishQueue.revertUpdate(optimisticUpdater);
      }
      this._publishQueue.commitPayload(operation.fragment, payload, updater);
      this._publishQueue.run();
      onCompleted && onCompleted(payload.errors);
    }).catch(error => {
      if (isDisposed) {
        return;
      }
      if (optimisticUpdater) {
        this._publishQueue.revertUpdate(optimisticUpdater);
      }
      this._publishQueue.run();
      onError && onError(error);
    });
    return {dispose};
  }

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
    return this._network.requestStream(
      operation.node,
      operation.variables,
      {force: true},
      {
        onCompleted,
        onError,
        onNext: payload => {
          this._publishQueue.commitPayload(operation.fragment, payload, updater);
          this._publishQueue.run();
          onNext && onNext(payload);
        },
      },
    );
  }
}

module.exports = RelayStaticEnvironment;
