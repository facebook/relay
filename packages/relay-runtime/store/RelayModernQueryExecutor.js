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
const RelayResponseNormalizer = require('./RelayResponseNormalizer');

const invariant = require('invariant');
const stableCopy = require('../util/stableCopy');

const {generateClientID} = require('./ClientID');
const {ROOT_TYPE, TYPENAME_KEY, getStorageKey} = require('./RelayStoreUtils');

import type {
  GraphQLResponse,
  GraphQLResponseWithData,
} from '../network/RelayNetworkTypes';
import type {Sink, Subscription} from '../network/RelayObservable';
import type {
  HandleFieldPayload,
  ModuleImportPayload,
  NormalizationSelector,
  OperationDescriptor,
  OptimisticUpdate,
  OperationLoader,
  RelayResponsePayload,
  SelectorStoreUpdater,
  DeferPlaceholder,
  StreamPlaceholder,
  IncrementalDataPlaceholder,
  PublishQueue,
} from '../store/RelayStoreTypes';
import type {NormalizationSplitOperation} from '../util/NormalizationNode';
import type {Record} from '../util/RelayCombinedEnvironmentTypes';
import type RelayOperationTracker from './RelayOperationTracker';
import type {GetDataID} from './RelayResponseNormalizer';

export type ExecuteConfig = {|
  +getDataID: GetDataID,
  +operation: OperationDescriptor,
  +operationLoader: ?OperationLoader,
  +operationTracker?: ?RelayOperationTracker,
  +optimisticUpdate: ?OptimisticUpdate,
  +publishQueue: PublishQueue,
  +scheduler?: ?TaskScheduler,
  +sink: Sink<GraphQLResponse>,
  +source: RelayObservable<GraphQLResponse>,
  +updater?: ?SelectorStoreUpdater,
|};

export type TaskScheduler = {|
  +cancel: (id: string) => void,
  +schedule: (fn: () => void) => string,
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
    {|
      +kind: 'defer' | 'stream',
      +placeholdersByPath: Map<string, IncrementalDataPlaceholder>,
    |},
  >;
  _nextSubscriptionId: number;
  _operation: OperationDescriptor;
  _operationLoader: ?OperationLoader;
  _optimisticUpdate: null | OptimisticUpdate;
  _publishQueue: PublishQueue;
  _scheduler: ?TaskScheduler;
  _sink: Sink<GraphQLResponse>;
  _source: Map<
    string,
    {|+record: Record, +fieldPayloads: Array<HandleFieldPayload>|},
  >;
  _state: 'started' | 'loading' | 'completed';
  _updater: ?SelectorStoreUpdater;
  _subscriptions: Map<number, Subscription>;
  _operationTracker: ?RelayOperationTracker;
  _getDataID: GetDataID;

  constructor({
    operation,
    operationLoader,
    optimisticUpdate,
    publishQueue,
    scheduler,
    sink,
    source,
    updater,
    operationTracker,
    getDataID,
  }: ExecuteConfig): void {
    this._incrementalPlaceholders = new Map();
    this._nextSubscriptionId = 0;
    this._operation = operation;
    this._operationLoader = operationLoader;
    this._optimisticUpdate = optimisticUpdate ?? null;
    this._publishQueue = publishQueue;
    this._scheduler = scheduler;
    this._sink = sink;
    this._source = new Map();
    this._state = 'started';
    this._updater = updater;
    this._subscriptions = new Map();
    this._operationTracker = operationTracker;
    this._getDataID = getDataID;

    const id = this._nextSubscriptionId++;
    source.subscribe({
      complete: () => this._complete(id),
      error: error => this._error(error),
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
      const updatedOwners = this._publishQueue.run();
      this._updateOperationTracker(updatedOwners);
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
    this._completeOperationTracker();
  }

  _schedule(task: () => void): void {
    const scheduler = this._scheduler;
    if (scheduler != null) {
      const id = this._nextSubscriptionId++;
      RelayObservable.create(sink => {
        const cancellationToken = scheduler.schedule(() => {
          try {
            task();
            sink.complete();
          } catch (error) {
            sink.error(error);
          }
        });
        return () => scheduler.cancel(cancellationToken);
      }).subscribe({
        complete: () => this._complete(id),
        error: error => this._error(error),
        start: subscription => this._start(id, subscription),
      });
    } else {
      task();
    }
  }

  _complete(id: number): void {
    this._subscriptions.delete(id);
    if (this._subscriptions.size === 0) {
      this.cancel();
      this._sink.complete();
    }
  }

  _error(error: Error): void {
    this.cancel();
    this._sink.error(error);
  }

  _start(id: number, subscription: Subscription): void {
    this._subscriptions.set(id, subscription);
  }

  // Handle a raw GraphQL response.
  _next(_id: number, response: GraphQLResponse): void {
    this._schedule(() => {
      this._handleNext(response);
    });
  }

  _handleNext(response: GraphQLResponse): void {
    if (this._state === 'completed') {
      if (__DEV__) {
        console.warn(
          'RelayModernQueryExecutor: payload received after execution ' +
            `completed: '${JSON.stringify(response)}'`,
        );
      }
      return;
    }
    if (response.data == null) {
      const {errors} = response;
      const error = RelayError.create(
        'RelayNetwork',
        'No data returned for operation `%s`, got error(s):\n%s\n\nSee the error ' +
          '`source` property for more information.',
        this._operation.node.params.name,
        errors ? errors.map(({message}) => message).join('\n') : '(No errors)',
      );
      (error: $FlowFixMe).source = {
        errors,
        operation: this._operation.node,
        variables: this._operation.variables,
      };
      throw error;
    }
    // Above check ensures that response.data != null
    const responseWithData: GraphQLResponseWithData = (response: $FlowFixMe);
    const isOptimistic = response.extensions?.isOptimistic === true;
    if (isOptimistic && this._state !== 'started') {
      invariant(
        false,
        'RelayModernQueryExecutor: optimistic payload received after server payload.',
      );
    }
    this._state = 'loading';
    if (isOptimistic) {
      this._processOptimisticResponse(responseWithData);
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
          this._processIncrementalResponse(label, path, responseWithData);
        }
      } else {
        this._processResponse(responseWithData);
      }
    }
    this._sink.next(response);
  }

  _processOptimisticResponse(response: GraphQLResponseWithData): void {
    invariant(
      this._optimisticUpdate === null,
      'environment.execute: only support one optimistic response per ' +
        'execute.',
    );
    const payload = normalizeResponse(
      response,
      this._operation.root,
      ROOT_TYPE,
      [] /* path */,
      this._getDataID,
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
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
  }

  _processResponse(response: GraphQLResponseWithData): void {
    if (this._optimisticUpdate !== null) {
      this._publishQueue.revertUpdate(this._optimisticUpdate);
      this._optimisticUpdate = null;
    }
    const payload = normalizeResponse(
      response,
      this._operation.root,
      ROOT_TYPE,
      [] /* path */,
      this._getDataID,
    );
    this._incrementalPlaceholders.clear();
    this._source.clear();
    this._processPayloadFollowups(payload);
    this._publishQueue.commitPayload(this._operation, payload, this._updater);
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
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
        this._processIncrementalPlaceholder(payload, incrementalPlaceholder);
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
    const syncOperation = operationLoader.get(
      moduleImportPayload.operationReference,
    );
    if (syncOperation != null) {
      // If the operation module is available synchronously, normalize the
      // data syncrhonously.
      this._handleModuleImportPayload(moduleImportPayload, syncOperation);
    } else {
      // Otherwise load the operation module and schedule a task to normalize
      // the data when the module is available.
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
          if (operation != null) {
            this._schedule(() => {
              this._handleModuleImportPayload(moduleImportPayload, operation);
            });
          }
        })
        .subscribe({
          complete: () => this._complete(id),
          error: error => this._error(error),
          start: subscription => this._start(id, subscription),
        });
    }
  }

  _handleModuleImportPayload(
    moduleImportPayload: ModuleImportPayload,
    operation: NormalizationSplitOperation,
  ): void {
    const selector = {
      dataID: moduleImportPayload.dataID,
      variables: moduleImportPayload.variables,
      node: operation,
    };
    const relayPayload = normalizeResponse(
      {data: moduleImportPayload.data},
      selector,
      moduleImportPayload.typeName,
      moduleImportPayload.path,
      this._getDataID,
    );
    this._processPayloadFollowups(relayPayload);
    this._publishQueue.commitRelayPayload(relayPayload);
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
  }

  /**
   * Stores a mapping of label => path => placeholder; at this point the
   * executor knows *how* to process the incremental data and has to save
   * this until the data is available. The placeholder contains the
   * normalization selector, path (for nested defer/stream), and other metadata
   * used to normalize the incremental response.
   */
  _processIncrementalPlaceholder(
    relayPayload: RelayResponsePayload,
    placeholder: IncrementalDataPlaceholder,
  ): void {
    // Update the label => path => placeholder map
    const {kind, label, path} = placeholder;
    const pathKey = path.map(String).join('.');
    let dataForLabel = this._incrementalPlaceholders.get(label);
    if (dataForLabel == null) {
      dataForLabel = {
        kind,
        placeholdersByPath: new Map(),
      };
      this._incrementalPlaceholders.set(label, dataForLabel);
    } else if (dataForLabel.kind !== kind) {
      invariant(
        false,
        'RelayModernEnvironment: Received inconsistent data for label `%s`, ' +
          'expected `@%s` data but got `@%s` data.',
        label,
        dataForLabel.kind,
        kind,
      );
    }
    dataForLabel.placeholdersByPath.set(pathKey, placeholder);

    // Store references to the parent node to allow detecting concurrent
    // modifications to the parent before items arrive and to replay
    // handle field payloads to account for new information on source records.
    let parentID;
    if (placeholder.kind === 'stream') {
      parentID = placeholder.parentID;
    } else {
      parentID = placeholder.selector.dataID;
    }
    const parentRecord = relayPayload.source.get(parentID);
    const parentPayloads = (relayPayload.fieldPayloads ?? []).filter(
      fieldPayload => {
        const fieldID = generateClientID(
          fieldPayload.dataID,
          fieldPayload.fieldKey,
        );
        return (
          // handlers applied to the streamed field itself
          fieldPayload.dataID === parentID ||
          // handlers applied to a field on an ancestor object, where
          // ancestor.field links to the parent record (example: connections)
          fieldID === parentID
        );
      },
    );
    // If an incremental payload exists for some id that record should also
    // exist.
    invariant(
      parentRecord != null,
      'RelayModernEnvironment: Expected record `%s` to exist.',
      parentID,
    );
    let nextParentRecord;
    let nextParentPayloads;
    const previousParentEntry = this._source.get(parentID);
    if (previousParentEntry != null) {
      // If a previous entry exists, merge the previous/next records and
      // payloads together.
      nextParentRecord = RelayModernRecord.update(
        previousParentEntry.record,
        parentRecord,
      );
      const handlePayloads = new Map();
      const dedupePayload = payload => {
        const key = stableStringify(payload);
        handlePayloads.set(key, payload);
      };
      previousParentEntry.fieldPayloads.forEach(dedupePayload);
      parentPayloads.forEach(dedupePayload);
      nextParentPayloads = Array.from(handlePayloads.values());
    } else {
      nextParentRecord = parentRecord;
      nextParentPayloads = parentPayloads;
    }
    this._source.set(parentID, {
      record: nextParentRecord,
      fieldPayloads: nextParentPayloads,
    });
  }

  /**
   * Lookup the placeholder the describes how to process an incremental
   * response, normalize/publish it, and process any nested defer/match/stream
   * metadata.
   */
  _processIncrementalResponse(
    label: string,
    path: $ReadOnlyArray<mixed>,
    response: GraphQLResponseWithData,
  ): void {
    const dataForLabel = this._incrementalPlaceholders.get(label);
    invariant(
      dataForLabel != null,
      'RelayModernEnvironment: Received response for unknown label ' +
        `'${label}'. Known labels: ${Array.from(
          this._incrementalPlaceholders.keys(),
        ).join(', ')}.`,
    );
    if (dataForLabel.kind === 'defer') {
      const pathKey = path.map(String).join('.');
      const placeholder = dataForLabel.placeholdersByPath.get(pathKey);
      invariant(
        placeholder != null,
        'RelayModernEnvironment: Received response for unknown path `%s` ' +
          'for label `%s`. Known paths: %s.',
        pathKey,
        label,
        Array.from(dataForLabel.placeholdersByPath.keys()).join(', '),
      );
      invariant(
        placeholder.kind === 'defer',
        'RelayModernEnvironment: Expected data for path `%s` for label `%s` ' +
          'to be data for @defer, was `@%s`.',
        pathKey,
        label,
        placeholder.kind,
      );
      this._processDeferResponse(label, path, placeholder, response);
    } else {
      // @stream payload path values end in the field name and item index,
      // but Relay records paths relative to the parent of the stream node:
      // therefore we strip the last two elements just to lookup the path
      // (the item index is used later to insert the element in the list)
      const pathKey = path
        .slice(0, -2)
        .map(String)
        .join('.');
      const placeholder = dataForLabel.placeholdersByPath.get(pathKey);
      invariant(
        placeholder != null,
        'RelayModernEnvironment: Received response for unknown path `%s` ' +
          'for label `%s`. Known paths: %s.',
        pathKey,
        label,
        Array.from(dataForLabel.placeholdersByPath.keys()).join(', '),
      );
      invariant(
        placeholder.kind === 'stream',
        'RelayModernEnvironment: Expected data for path `%s` for label `%s` ' +
          'to be data for @stream, was `@%s`.',
        pathKey,
        label,
        placeholder.kind,
      );
      this._processStreamResponse(label, path, placeholder, response);
    }
  }

  _processDeferResponse(
    label: string,
    path: $ReadOnlyArray<mixed>,
    placeholder: DeferPlaceholder,
    response: GraphQLResponseWithData,
  ): void {
    const {dataID: parentID} = placeholder.selector;
    const relayPayload = normalizeResponse(
      response,
      placeholder.selector,
      placeholder.typeName,
      placeholder.path,
      this._getDataID,
    );
    this._processPayloadFollowups(relayPayload);
    this._publishQueue.commitRelayPayload(relayPayload);

    // Load the version of the parent record from which this incremental data
    // was derived
    const parentEntry = this._source.get(parentID);
    invariant(
      parentEntry != null,
      'RelayModernEnvironment: Expected the parent record `%s` for @defer ' +
        'data to exist.',
      parentID,
    );
    const {fieldPayloads} = parentEntry;
    if (fieldPayloads.length !== 0) {
      const handleFieldsRelayPayload = {
        errors: null,
        fieldPayloads,
        incrementalPlaceholders: null,
        moduleImportPayloads: null,
        source: new RelayInMemoryRecordSource(),
      };
      this._publishQueue.commitRelayPayload(handleFieldsRelayPayload);
    }
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
  }

  /**
   * Process the data for one item in a @stream field.
   */
  _processStreamResponse(
    label: string,
    path: $ReadOnlyArray<mixed>,
    placeholder: StreamPlaceholder,
    response: GraphQLResponseWithData,
  ): void {
    const {parentID, node, variables} = placeholder;
    const {data} = response;
    invariant(
      typeof data === 'object',
      'RelayModernEnvironment: Expected the GraphQL @stream payload `data` ' +
        'value to be an object.',
    );
    // Find the LinkedField where @stream was applied
    const field = node.selections[0];
    invariant(
      field != null && field.kind === 'LinkedField' && field.plural === true,
      'RelayModernEnvironment: Expected @stream to be used on a plural field.',
    );
    const responseKey = field.alias ?? field.name;
    const storageKey = getStorageKey(field, variables);

    // Load the version of the parent record from which this incremental data
    // was derived
    const parentEntry = this._source.get(parentID);
    invariant(
      parentEntry != null,
      'RelayModernEnvironment: Expected the parent record `%s` for @stream ' +
        'data to exist.',
      parentID,
    );
    const {record: parentRecord, fieldPayloads} = parentEntry;

    // Load the field value (items) that were created by *this* query executor
    // in order to check if there has been any concurrent modifications by some
    // other operation.
    const prevIDs = RelayModernRecord.getLinkedRecordIDs(
      parentRecord,
      storageKey,
    );
    invariant(
      prevIDs != null,
      'RelayModernEnvironment: Expected record `%s` to have fetched field ' +
        '`%s` with @stream.',
      parentID,
      field.name,
    );

    // Determine the index in the field of the new item
    const finalPathEntry = path[path.length - 1];
    const itemIndex = parseInt(finalPathEntry, 10);
    invariant(
      itemIndex === finalPathEntry && itemIndex >= 0,
      'RelayModernEnvironment: Expected path for @stream to end in a ' +
        'positive integer index, got `%s`',
      finalPathEntry,
    );

    // Determine the __id of the new item: this must equal the value that would
    // be assigned had the item not been streamed
    const itemID =
      data.id ??
      (prevIDs && prevIDs[itemIndex]) || // Reuse previously generated client IDs
      generateClientID(parentID, storageKey, itemIndex);
    invariant(
      typeof itemID === 'string',
      'RelayModernEnvironment: Expected id of elements of field `%s` to ' +
        'be strings.',
      storageKey,
    );

    // Build a selector to normalize the item data with
    const selector = {
      dataID: itemID,
      node: field,
      variables,
    };
    const typeName = field.concreteType ?? data[TYPENAME_KEY];
    invariant(
      typeof typeName === 'string',
      'RelayModernEnvironment: Expected @stream field `%s` to have a ' +
        '__typename.',
      field.name,
    );

    // Update the cached version of the parent record to reflect the new item:
    // this is used when subsequent stream payloads arrive to see if there
    // have been concurrent modifications to the list
    const nextParentRecord = RelayModernRecord.clone(parentRecord);
    const nextIDs = [...prevIDs];
    nextIDs[itemIndex] = itemID;
    RelayModernRecord.setLinkedRecordIDs(nextParentRecord, storageKey, nextIDs);
    this._source.set(parentID, {
      record: nextParentRecord,
      fieldPayloads,
    });

    // Publish the new item and update the parent record to set
    // field[index] = item *if* the parent record hasn't been concurrently
    // modified.
    const relayPayload = normalizeResponse(
      response,
      selector,
      typeName,
      [...placeholder.path, responseKey, String(itemIndex)],
      this._getDataID,
    );
    this._processPayloadFollowups(relayPayload);
    this._publishQueue.commitPayload(this._operation, relayPayload, store => {
      const currentParentRecord = store.get(parentID);
      if (currentParentRecord == null) {
        // parent has since been deleted, stream data is stale
        if (__DEV__) {
          console.warn(
            'RelayModernEnvironment: Received stale @stream payload, parent ' +
              `record '${parentID}' no longer exists.`,
          );
        }
        return;
      }
      const currentItems = currentParentRecord.getLinkedRecords(storageKey);
      if (currentItems == null) {
        // field has since been deleted, stream data is stale
        if (__DEV__) {
          console.warn(
            'RelayModernEnvironment: Received stale @stream payload, field ' +
              `'${
                field.name
              }' on parent record '${parentID}' no longer exists.`,
          );
        }
        return;
      }
      if (
        currentItems.length !== prevIDs.length ||
        currentItems.some(
          (currentItem, index) =>
            prevIDs[index] !== (currentItem && currentItem.getDataID()),
        )
      ) {
        // field has been modified by something other than this query,
        // stream data is stale
        if (__DEV__) {
          console.warn(
            'RelayModernEnvironment: Received stale @stream payload, items for ' +
              `field '${
                field.name
              }' on parent record '${parentID}' have changed.`,
          );
        }
        return;
      }
      // parent.field has not been concurrently modified:
      // update `parent.field[index] = item`
      const nextItems = [...currentItems];
      nextItems[itemIndex] = store.get(itemID);
      currentParentRecord.setLinkedRecords(nextItems, storageKey);
    });

    // Now that the parent record has been updated to include the new item,
    // also update any handle fields that are derived from the parent record.
    if (fieldPayloads.length !== 0) {
      const handleFieldsRelayPayload = {
        errors: null,
        fieldPayloads,
        incrementalPlaceholders: null,
        moduleImportPayloads: null,
        source: new RelayInMemoryRecordSource(),
      };
      this._publishQueue.commitRelayPayload(handleFieldsRelayPayload);
    }
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
  }

  _updateOperationTracker(
    updatedOwners: ?$ReadOnlyArray<OperationDescriptor>,
  ): void {
    if (
      this._operationTracker != null &&
      updatedOwners != null &&
      updatedOwners.length > 0
    ) {
      this._operationTracker.update(this._operation, new Set(updatedOwners));
    }
  }

  _completeOperationTracker() {
    if (this._operationTracker != null) {
      this._operationTracker.complete(this._operation);
    }
  }
}

function normalizeResponse(
  response: GraphQLResponseWithData,
  selector: NormalizationSelector,
  typeName: string,
  path: $ReadOnlyArray<string>,
  getDataID: GetDataID,
): RelayResponsePayload {
  const {data, errors} = response;
  const source = new RelayInMemoryRecordSource();
  const record = RelayModernRecord.create(selector.dataID, typeName);
  source.set(selector.dataID, record);
  const normalizeResult = RelayResponseNormalizer.normalize(
    source,
    selector,
    data,
    {handleStrippedNulls: true, path, getDataID},
  );
  return {
    errors,
    incrementalPlaceholders: normalizeResult.incrementalPlaceholders,
    fieldPayloads: normalizeResult.fieldPayloads,
    moduleImportPayloads: normalizeResult.moduleImportPayloads,
    source,
  };
}

function stableStringify(value: mixed): string {
  return JSON.stringify(stableCopy(value)) ?? ''; // null-check for flow
}

module.exports = {execute};
