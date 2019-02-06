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

const RelayError = require('../util/RelayError');
const RelayInMemoryRecordSource = require('./RelayInMemoryRecordSource');
const RelayModernRecord = require('./RelayModernRecord');
const RelayObservable = require('../network/RelayObservable');
const RelayPublishQueue = require('./RelayPublishQueue');
const RelayResponseNormalizer = require('./RelayResponseNormalizer');

const invariant = require('invariant');

const {ROOT_TYPE} = require('./RelayStoreUtils');

import type {GraphQLResponse} from '../network/RelayNetworkTypes';
import type {Sink, Subscription} from '../network/RelayObservable';
import type {
  ModuleImportPayload,
  NormalizationSelector,
  OperationDescriptor,
  OptimisticUpdate,
  OperationLoader,
  RelayResponsePayload,
  SelectorStoreUpdater,
  IncrementalDataPlaceholder,
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
  _incrementalPlaceholders: Map<
    string,
    Map<string, IncrementalDataPlaceholder>,
  >;
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
    this._incrementalPlaceholders = new Map();
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
      next: response => {
        try {
          this._next(id, response);
        } catch (error) {
          sink.error(error);
        }
      },
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
    this._incrementalPlaceholders.clear();
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
    const isOptimistic = response.extensions?.isOptimistic === true;
    if (isOptimistic && this._state !== 'started') {
      invariant(
        false,
        'RelayModernQueryExecutor: optimistic payload received after server payload.',
      );
    }
    this._state = 'loading';
    if (isOptimistic) {
      this._processOptimisticResponse(response);
    } else {
      const {path, label} = response;
      if (path != null || label != null) {
        if (typeof label !== 'string' || !Array.isArray(path)) {
          invariant(
            false,
            'RelayModernQueryExecutor: invalid incremental payload, expected ' +
              '`path` and `label` to either both be null/undefined, or ' +
              '`path` to be an `Array<string | number>` and `label` to be a ' +
              '`string`.',
          );
        } else {
          this._processIncrementalResponse(label, path, response);
        }
      } else {
        this._processResponse(response);
      }
    }
    this._sink.next(response);
  }

  _processOptimisticResponse(response: GraphQLResponse): void {
    invariant(
      this._optimisticUpdate === null,
      'environment.execute: only support one optimistic response per ' +
        'execute.',
    );
    const payload = this._normalizeResponse(
      response,
      this._operation.root,
      ROOT_TYPE,
      [] /* path */,
    );
    const {incrementalPlaceholders, moduleImportPayloads} = payload;
    if (
      (incrementalPlaceholders != null &&
        incrementalPlaceholders.length !== 0) ||
      (moduleImportPayloads != null && moduleImportPayloads.length !== 0)
    ) {
      invariant(
        false,
        'RelayModernQueryExecutor: optimistic responses cannot be returned ' +
          'for operations that use incremental data delivery (@match, ' +
          '@defer, and @stream).',
      );
    }
    this._optimisticUpdate = {
      source: payload.source,
      fieldPayloads: payload.fieldPayloads,
    };
    this._publishQueue.applyUpdate(this._optimisticUpdate);
    this._publishQueue.run();
  }

  _processResponse(response: GraphQLResponse): void {
    if (this._optimisticUpdate !== null) {
      this._publishQueue.revertUpdate(this._optimisticUpdate);
      this._optimisticUpdate = null;
    }
    const payload = this._normalizeResponse(
      response,
      this._operation.root,
      ROOT_TYPE,
      [] /* path */,
    );
    this._processPayloadFollowups(payload);
    this._publishQueue.commitPayload(this._operation, payload, this._updater);
    this._publishQueue.run();
  }

  /**
   * Handles any follow-up actions for a Relay payload for @match, @defer,
   * and (in the future) @stream directives.
   */
  _processPayloadFollowups(payload: RelayResponsePayload): void {
    const {incrementalPlaceholders, moduleImportPayloads} = payload;
    if (moduleImportPayloads && moduleImportPayloads.length !== 0) {
      const operationLoader = this._operationLoader;
      invariant(
        operationLoader,
        'RelayModernEnvironment: Expected an operationLoader to be ' +
          'configured when using `@match`.',
      );
      moduleImportPayloads.forEach(moduleImportPayload => {
        this._processModuleImportPayload(moduleImportPayload, operationLoader);
      });
    }
    if (incrementalPlaceholders && incrementalPlaceholders.length !== 0) {
      incrementalPlaceholders.forEach(incrementalPlaceholder => {
        this._processIncrementalPlaceholder(incrementalPlaceholder);
      });
    }
  }

  /**
   * Processes a ModuleImportPayload, asynchronously resolving the normalization
   * AST and using it to normalize the field data into a RelayResponsePayload.
   * The resulting payload may contain other incremental payloads (match,
   * defer, stream, etc); these are handled by calling
   * `_processPayloadFollowups()`.
   */
  _processModuleImportPayload(
    moduleImportPayload: ModuleImportPayload,
    operationLoader: OperationLoader,
  ): void {
    const id = this._nextSubscriptionId++;
    // Observable.from(operationLoader.load()) wouldn't catch synchronous errors
    // thrown by the load function, which is user-defined. Guard against that
    // with Observable.from(new Promise(<work>)).
    RelayObservable.from(
      new Promise((resolve, reject) => {
        operationLoader
          .load(moduleImportPayload.operationReference)
          .then(resolve, reject);
      }),
    )
      .map((operation: ?NormalizationSplitOperation) => {
        if (operation == null) {
          return;
        }
        const selector = {
          dataID: moduleImportPayload.dataID,
          variables: moduleImportPayload.variables,
          node: operation,
        };
        const relayPayload = this._normalizeResponse(
          {data: moduleImportPayload.data},
          selector,
          moduleImportPayload.typeName,
          moduleImportPayload.path,
        );
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

  /**
   * Stores a mapping of label => path => placeholder; at this point the
   * executor knows *how* to process the incremental data and has to save
   * this until the data is available. The placeholder contains the
   * normalization selector, path (for nested defer/stream), and other metadata
   * used to normalize the incremental response.
   */
  _processIncrementalPlaceholder(payload: IncrementalDataPlaceholder): void {
    const {label, path} = payload;
    const pathKey = path.map(String).join('.');
    let dataForLabel = this._incrementalPlaceholders.get(label);
    if (dataForLabel == null) {
      dataForLabel = new Map();
      this._incrementalPlaceholders.set(label, dataForLabel);
    }
    dataForLabel.set(pathKey, payload);
  }

  /**
   * Lookup the placeholder the describes how to process an incremental
   * response, normalize/publish it, and process any nested defer/match/stream
   * metadata.
   */
  _processIncrementalResponse(
    label: string,
    path: $ReadOnlyArray<mixed>,
    response: GraphQLResponse,
  ): void {
    const pathKey = path.map(String).join('.');
    const dataForLabel = this._incrementalPlaceholders.get(label);
    if (dataForLabel == null) {
      invariant(
        false,
        `RelayModernEnvironment: Received response for unknown label '${label}'. Known labels: ${Array.from(
          this._incrementalPlaceholders.keys(),
        ).join(', ')}.`,
      );
    }
    const dataForPath = dataForLabel.get(pathKey);
    if (dataForPath == null) {
      invariant(
        false,
        `RelayModernEnvironment: Received response for unknown path '${pathKey}' for label '${label}'. Known paths: ${Array.from(
          dataForLabel.keys(),
        ).join(', ')}.`,
      );
    }
    const relayPayload = this._normalizeResponse(
      response,
      dataForPath.selector,
      dataForPath.typeName,
      dataForPath.path,
    );
    this._processPayloadFollowups(relayPayload);
    this._publishQueue.commitRelayPayload(relayPayload);
    this._publishQueue.run();
  }

  _normalizeResponse(
    response: GraphQLResponse,
    selector: NormalizationSelector,
    typeName: string,
    path: $ReadOnlyArray<string>,
  ): RelayResponsePayload {
    const {data, errors} = response;
    if (data == null) {
      const error = RelayError.create(
        'RelayNetwork',
        'No data returned for operation `%s`, got error(s):\n%s\n\nSee the error ' +
          '`source` property for more information.',
        this._operation.node.params.name,
        errors ? errors.map(({message}) => message).join('\n') : '(No errors)',
      );
      (error: $FlowFixMe).source = {
        errors,
        operation: selector.node,
        variables: selector.variables,
      };
      throw error;
    }
    const source = new RelayInMemoryRecordSource();
    const record = RelayModernRecord.create(selector.dataID, typeName);
    source.set(selector.dataID, record);
    const normalizeResult = RelayResponseNormalizer.normalize(
      source,
      selector,
      data,
      {handleStrippedNulls: true, path},
    );
    return {
      errors,
      incrementalPlaceholders: normalizeResult.incrementalPlaceholders,
      fieldPayloads: normalizeResult.fieldPayloads,
      moduleImportPayloads: normalizeResult.moduleImportPayloads,
      source,
    };
  }
}

module.exports = {execute};
