/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayInMemoryRecordSource = require('./RelayInMemoryRecordSource');
const RelayModernRecord = require('./RelayModernRecord');
const RelayObservable = require('../network/RelayObservable');
const RelayPublishQueue = require('./RelayPublishQueue');
const RelayResponseNormalizer = require('./RelayResponseNormalizer');

const invariant = require('invariant');
const normalizePayload = require('./normalizePayload');

import type {GraphQLResponse} from '../network/RelayNetworkTypes';
import type {Sink, Subscription} from '../network/RelayObservable';
import type {
  MatchFieldPayload,
  OperationDescriptor,
  OptimisticUpdate,
  OperationLoader,
  RelayResponsePayload,
  SelectorStoreUpdater,
} from '../store/RelayStoreTypes';
import type {NormalizationSplitOperation} from '../util/NormalizationNode';

type ExecuteConfig = {|
  +operation: OperationDescriptor,
  +operationLoader: ?OperationLoader,
  +optimisticUpdate: ?OptimisticUpdate,
  +publishQueue: RelayPublishQueue,
  +sink: Sink<GraphQLResponse>,
  +source: RelayObservable<GraphQLResponse>,
  +updater?: ?SelectorStoreUpdater,
|};

function execute(config: ExecuteConfig): Executor {
  return new Executor(config);
}

/**
 * Coordinates the execution of a query, handling network callbacks
 * including optimistic payloads, standard payloads, resolution of match
 * dependencies, etc.
 */
class Executor {
  _nextSubscriptionId: number;
  _operation: OperationDescriptor;
  _operationLoader: ?OperationLoader;
  _optimisticUpdate: null | OptimisticUpdate;
  _publishQueue: RelayPublishQueue;
  _sink: Sink<GraphQLResponse>;
  _state: 'started' | 'loading' | 'completed';
  _updater: ?SelectorStoreUpdater;
  _subscriptions: Map<number, Subscription>;

  constructor({
    operation,
    operationLoader,
    optimisticUpdate,
    publishQueue,
    sink,
    source,
    updater,
  }: ExecuteConfig): void {
    this._nextSubscriptionId = 0;
    this._operation = operation;
    this._operationLoader = operationLoader;
    this._optimisticUpdate = optimisticUpdate ?? null;
    this._publishQueue = publishQueue;
    this._sink = sink;
    this._state = 'started';
    this._updater = updater;
    this._subscriptions = new Map();

    const id = this._nextSubscriptionId++;
    source.subscribe({
      complete: () => this._complete(id),
      error: error => this._error(id, error),
      next: response => this._next(id, response),
      start: subscription => this._start(id, subscription),
    });

    if (optimisticUpdate != null) {
      publishQueue.applyUpdate(optimisticUpdate);
      publishQueue.run();
    }
  }

  // Cancel any pending execution tasks and mark the executor as completed.
  cancel(): void {
    if (this._state === 'completed') {
      return;
    }
    this._state = 'completed';
    if (this._subscriptions.size !== 0) {
      this._subscriptions.forEach(sub => sub.unsubscribe());
      this._subscriptions.clear();
    }
    const optimisticResponse = this._optimisticUpdate;
    if (optimisticResponse !== null) {
      this._optimisticUpdate = null;
      this._publishQueue.revertUpdate(optimisticResponse);
      this._publishQueue.run();
    }
  }

  _complete(id: number): void {
    this._subscriptions.delete(id);
    if (this._subscriptions.size === 0) {
      this.cancel();
      this._sink.complete();
    }
  }

  _error(_id: number, error: Error): void {
    this.cancel();
    this._sink.error(error);
  }

  _start(id: number, subscription: Subscription): void {
    this._subscriptions.set(id, subscription);
  }

  // Handle a raw GraphQL response.
  _next(_id: number, response: GraphQLResponse): void {
    if (this._state === 'completed') {
      if (__DEV__) {
        console.warn(
          'RelayModernQueryExecutor: payload received after execution ' +
            `completed: '${JSON.stringify(response)}'`,
        );
      }
      return;
    }
    const payload = normalizePayload(this._operation, response);
    const isOptimistic = response.extensions?.isOptimistic === true;
    if (isOptimistic && this._state !== 'started') {
      invariant(
        false,
        'RelayModernQueryExecutor: optimistic payload received after server payload.',
      );
    }
    this._state = 'loading';
    this._processPayloadFollowups(payload);
    if (isOptimistic) {
      invariant(
        this._optimisticUpdate === null,
        'environment.execute: only support one optimistic response per ' +
          'execute.',
      );
      this._optimisticUpdate = {
        source: payload.source,
        fieldPayloads: payload.fieldPayloads,
      };
      this._publishQueue.applyUpdate(this._optimisticUpdate);
      this._publishQueue.run();
    } else {
      if (this._optimisticUpdate !== null) {
        this._publishQueue.revertUpdate(this._optimisticUpdate);
        this._optimisticUpdate = null;
      }
      this._publishQueue.commitPayload(this._operation, payload, this._updater);
      this._publishQueue.run();
    }
    this._sink.next(response);
  }

  /**
   * Handles any follow-up actions for a Relay payload. At present this is only
   * @match payloads, in the future this will also handle incremental data
   * delivery (@defer/@stream).
   */
  _processPayloadFollowups(payload: RelayResponsePayload): void {
    const {matchPayloads} = payload;
    if (matchPayloads && matchPayloads.length) {
      const operationLoader = this._operationLoader;
      invariant(
        operationLoader,
        'RelayModernEnvironment: Expected an operationLoader to be ' +
          'configured when using `@match`.',
      );
      matchPayloads.forEach(matchPayload => {
        this._processMatchPayload(matchPayload, operationLoader);
      });
    }
  }

  /**
   * Processes a MatchFieldPayload, asynchronously resolving the normalization
   * AST and using it to normalize the field data into a RelayResponsePayload.
   * The resulting payload may contain other incremental payloads (match,
   * defer, stream, etc); these are handled by calling
   * `_processPayloadFollowups()`.
   */
  _processMatchPayload(
    matchPayload: MatchFieldPayload,
    operationLoader: OperationLoader,
  ): void {
    const id = this._nextSubscriptionId++;
    // Observable.from(operationLoader.load()) wouldn't catch synchronous errors
    // thrown by the load function, which is user-defined. Guard against that
    // with Observable.from(new Promise(<work>)).
    RelayObservable.from(
      new Promise((resolve, reject) => {
        operationLoader
          .load(matchPayload.operationReference)
          .then(resolve, reject);
      }),
    )
      .map((operation: ?NormalizationSplitOperation) => {
        if (operation == null) {
          return;
        }
        const selector = {
          dataID: matchPayload.dataID,
          variables: matchPayload.variables,
          node: operation,
        };
        const source = new RelayInMemoryRecordSource();
        const matchRecord = RelayModernRecord.create(
          matchPayload.dataID,
          matchPayload.typeName,
        );
        source.set(matchPayload.dataID, matchRecord);
        const normalizeResult = RelayResponseNormalizer.normalize(
          source,
          selector,
          matchPayload.data,
          {path: matchPayload.path},
        );
        const relayPayload = {
          errors: null, // Errors are handled as part of the parent GraphQLResponse
          fieldPayloads: normalizeResult.fieldPayloads,
          matchPayloads: normalizeResult.matchPayloads,
          source: source,
        };
        this._processPayloadFollowups(relayPayload);
        this._publishQueue.commitRelayPayload(relayPayload);
        this._publishQueue.run();
      })
      .subscribe({
        complete: () => this._complete(id),
        error: error => this._error(id, error),
        start: subscription => this._start(id, subscription),
      });
  }
}

module.exports = {execute};
