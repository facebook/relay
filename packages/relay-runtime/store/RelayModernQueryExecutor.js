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

const RelayConnectionInterface = require('../handlers/connection/RelayConnectionInterface');
const RelayError = require('../util/RelayError');
const RelayModernRecord = require('./RelayModernRecord');
const RelayObservable = require('../network/RelayObservable');
const RelayRecordSource = require('./RelayRecordSource');
const RelayResponseNormalizer = require('./RelayResponseNormalizer');

const invariant = require('invariant');
const stableCopy = require('../util/stableCopy');
const warning = require('warning');

const {generateClientID} = require('./ClientID');
const {createNormalizationSelector} = require('./RelayModernSelector');
const {ROOT_TYPE, TYPENAME_KEY, getStorageKey} = require('./RelayStoreUtils');

import type {
  GraphQLResponse,
  GraphQLResponseWithData,
} from '../network/RelayNetworkTypes';
import type {Sink, Subscription} from '../network/RelayObservable';
import type {
  ConnectionEdgePlaceholder,
  ConnectionPageInfoPlaceholder,
  DeferPlaceholder,
  RequestDescriptor,
  HandleFieldPayload,
  IncrementalDataPlaceholder,
  ModuleImportPayload,
  NormalizationSelector,
  OperationDescriptor,
  OperationLoader,
  OperationTracker,
  OptimisticResponseConfig,
  OptimisticUpdate,
  PublishQueue,
  Record,
  RelayResponsePayload,
  SelectorStoreUpdater,
  StreamPlaceholder,
} from '../store/RelayStoreTypes';
import type {
  NormalizationLinkedField,
  NormalizationSplitOperation,
  NormalizationSelectableNode,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {GetDataID} from './RelayResponseNormalizer';
import type {NormalizationOptions} from './RelayResponseNormalizer';

export type ExecuteConfig = {|
  +getDataID: GetDataID,
  +operation: OperationDescriptor,
  +operationLoader: ?OperationLoader,
  +operationTracker?: ?OperationTracker,
  +optimisticConfig: ?OptimisticResponseConfig,
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

type Label = string;
type PathKey = string;
type IncrementalResults =
  | {|
      +kind: 'placeholder',
      +placeholder: IncrementalDataPlaceholder,
    |}
  | {|
      +kind: 'response',
      +responses: Array<IncrementalGraphQLResponse>,
    |};

type IncrementalGraphQLResponse = {|
  label: string,
  path: $ReadOnlyArray<mixed>,
  response: GraphQLResponseWithData,
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
  _incrementalResults: Map<Label, Map<PathKey, IncrementalResults>>;
  _nextSubscriptionId: number;
  _operation: OperationDescriptor;
  _operationLoader: ?OperationLoader;
  _optimisticUpdates: null | Array<OptimisticUpdate>;
  _publishQueue: PublishQueue;
  _scheduler: ?TaskScheduler;
  _sink: Sink<GraphQLResponse>;
  _source: Map<
    string,
    {|+record: Record, +fieldPayloads: Array<HandleFieldPayload>|},
  >;
  _state: 'started' | 'loading_incremental' | 'loading_final' | 'completed';
  _updater: ?SelectorStoreUpdater;
  _subscriptions: Map<number, Subscription>;
  _operationTracker: ?OperationTracker;
  _getDataID: GetDataID;
  _incrementalPayloadsPending: boolean;
  _pendingModulePayloadsCount: number;

  constructor({
    operation,
    operationLoader,
    optimisticConfig,
    publishQueue,
    scheduler,
    sink,
    source,
    updater,
    operationTracker,
    getDataID,
  }: ExecuteConfig): void {
    this._incrementalResults = new Map();
    this._nextSubscriptionId = 0;
    this._operation = operation;
    this._operationLoader = operationLoader;
    this._optimisticUpdates = null;
    this._publishQueue = publishQueue;
    this._scheduler = scheduler;
    this._sink = sink;
    this._source = new Map();
    this._state = 'started';
    this._updater = updater;
    this._subscriptions = new Map();
    this._operationTracker = operationTracker;
    this._getDataID = getDataID;
    this._incrementalPayloadsPending = false;
    this._pendingModulePayloadsCount = 0;

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

    if (optimisticConfig != null) {
      this._processOptimisticResponse(
        optimisticConfig.response != null
          ? {data: optimisticConfig.response}
          : null,
        optimisticConfig.updater,
      );
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
    const optimisticUpdates = this._optimisticUpdates;
    if (optimisticUpdates !== null) {
      this._optimisticUpdates = null;
      optimisticUpdates.forEach(update =>
        this._publishQueue.revertUpdate(update),
      );
      this._publishQueue.run();
    }
    this._incrementalResults.clear();
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
      this._maybeCompleteSubscriptionOperationTracking();
    });
  }

  _handleNext(response: GraphQLResponse): void {
    if (this._state === 'completed') {
      return;
    }
    if (response.data == null) {
      const {errors} = response;
      const messages = errors
        ? errors.map(({message}) => message).join('\n')
        : '(No errors)';
      const error = RelayError.create(
        'RelayNetwork',
        'No data returned for operation `' +
          this._operation.request.node.params.name +
          '`, got error(s):\n' +
          messages +
          '\n\nSee the error `source` property for more information.',
      );
      (error: $FlowFixMe).source = {
        errors,
        operation: this._operation.request.node,
        variables: this._operation.request.variables,
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
    const isFinal = response.extensions?.is_final === true;
    this._state = isFinal ? 'loading_final' : 'loading_incremental';
    if (isFinal) {
      this._incrementalPayloadsPending = false;
    }

    if (isOptimistic) {
      this._processOptimisticResponse(responseWithData, null);
    } else {
      const {path, label} = response;
      if (path != null || label != null) {
        if (typeof label === 'string' && Array.isArray(path)) {
          this._processIncrementalResponse({
            path,
            label,
            response: responseWithData,
          });
        } else {
          invariant(
            false,
            'RelayModernQueryExecutor: invalid incremental payload, expected ' +
              '`path` and `label` to either both be null/undefined, or ' +
              '`path` to be an `Array<string | number>` and `label` to be a ' +
              '`string`.',
          );
        }
      } else {
        this._processResponse(responseWithData);
      }
    }
    this._sink.next(response);
  }

  _processOptimisticResponse(
    response: ?GraphQLResponseWithData,
    updater: ?SelectorStoreUpdater,
  ): void {
    invariant(
      this._optimisticUpdates === null,
      'environment.execute: only support one optimistic response per ' +
        'execute.',
    );
    if (response == null && updater == null) {
      return;
    }
    const optimisticUpdates: Array<OptimisticUpdate> = [];
    if (response) {
      const payload = normalizeResponse(
        response,
        this._operation.root,
        ROOT_TYPE,
        {
          getDataID: this._getDataID,
          path: [],
          request: this._operation.request,
        },
      );
      validateOptimisticResponsePayload(payload);
      optimisticUpdates.push({
        operation: this._operation,
        payload,
        updater,
      });
      this._processOptimisticFollowups(payload, optimisticUpdates);
    } else if (updater) {
      optimisticUpdates.push({
        operation: this._operation,
        payload: {
          connectionEvents: null,
          errors: null,
          fieldPayloads: null,
          incrementalPlaceholders: null,
          moduleImportPayloads: null,
          source: RelayRecordSource.create(),
        },
        updater: updater,
      });
    }
    this._optimisticUpdates = optimisticUpdates;
    optimisticUpdates.forEach(update => this._publishQueue.applyUpdate(update));
    this._publishQueue.run();
  }

  _processOptimisticFollowups(
    payload: RelayResponsePayload,
    optimisticUpdates: Array<OptimisticUpdate>,
  ): void {
    if (payload.moduleImportPayloads && payload.moduleImportPayloads.length) {
      const moduleImportPayloads = payload.moduleImportPayloads;
      const operationLoader = this._operationLoader;
      invariant(
        operationLoader,
        'RelayModernEnvironment: Expected an operationLoader to be ' +
          'configured when using `@match`.',
      );
      for (const moduleImportPayload of moduleImportPayloads) {
        const operation = operationLoader.get(
          moduleImportPayload.operationReference,
        );
        if (operation == null) {
          this._processAsyncOptimisticModuleImport(
            operationLoader,
            moduleImportPayload,
          );
        } else {
          const moduleImportOptimisitcUpdates = this._processOptimisticModuleImport(
            operation,
            moduleImportPayload,
          );
          optimisticUpdates.push(...moduleImportOptimisitcUpdates);
        }
      }
    }
  }

  _normalizeModuleImport(
    moduleImportPayload: ModuleImportPayload,
    operation: NormalizationSelectableNode,
  ) {
    const selector = createNormalizationSelector(
      operation,
      moduleImportPayload.dataID,
      moduleImportPayload.variables,
    );
    return normalizeResponse(
      {data: moduleImportPayload.data},
      selector,
      moduleImportPayload.typeName,
      {
        getDataID: this._getDataID,
        path: moduleImportPayload.path,
        request: this._operation.request,
      },
    );
  }

  _processOptimisticModuleImport(
    operation: NormalizationSplitOperation,
    moduleImportPayload: ModuleImportPayload,
  ): $ReadOnlyArray<OptimisticUpdate> {
    const optimisticUpdates = [];
    const modulePayload = this._normalizeModuleImport(
      moduleImportPayload,
      operation,
    );
    validateOptimisticResponsePayload(modulePayload);
    optimisticUpdates.push({
      operation: this._operation,
      payload: modulePayload,
      updater: null,
    });
    this._processOptimisticFollowups(modulePayload, optimisticUpdates);
    return optimisticUpdates;
  }

  _processAsyncOptimisticModuleImport(
    operationLoader: OperationLoader,
    moduleImportPayload: ModuleImportPayload,
  ): void {
    operationLoader
      .load(moduleImportPayload.operationReference)
      .then(operation => {
        if (operation == null || this._state !== 'started') {
          return;
        }
        const moduleImportOptimisitcUpdates = this._processOptimisticModuleImport(
          operation,
          moduleImportPayload,
        );
        moduleImportOptimisitcUpdates.forEach(update =>
          this._publishQueue.applyUpdate(update),
        );
        if (this._optimisticUpdates == null) {
          warning(
            false,
            'RelayModernQueryExecutor: Unexpected ModuleImport optimisitc ' +
              'update in operation %s.' +
              this._operation.request.node.params.name,
          );
        } else {
          this._optimisticUpdates.push(...moduleImportOptimisitcUpdates);
          this._publishQueue.run();
        }
      });
  }

  _processResponse(response: GraphQLResponseWithData): void {
    if (this._optimisticUpdates !== null) {
      this._optimisticUpdates.forEach(update =>
        this._publishQueue.revertUpdate(update),
      );
      this._optimisticUpdates = null;
    }
    const payload = normalizeResponse(
      response,
      this._operation.root,
      ROOT_TYPE,
      {getDataID: this._getDataID, path: [], request: this._operation.request},
    );
    this._incrementalPayloadsPending = false;
    this._incrementalResults.clear();
    this._source.clear();
    this._publishQueue.commitPayload(this._operation, payload, this._updater);
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
    this._processPayloadFollowups(payload);
  }

  /**
   * Handles any follow-up actions for a Relay payload for @match, @defer,
   * and @stream directives.
   */
  _processPayloadFollowups(payload: RelayResponsePayload): void {
    if (this._state === 'completed') {
      return;
    }
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
      this._incrementalPayloadsPending = this._state !== 'loading_final';
      incrementalPlaceholders.forEach(incrementalPlaceholder => {
        this._processIncrementalPlaceholder(payload, incrementalPlaceholder);
      });

      if (this._state === 'loading_final') {
        // The query has defer/stream selections that are enabled, but the
        // server indicated that this is a "final" payload: no incremental
        // payloads will be delivered. Warn that the query was (likely) executed
        // on the server in non-streaming mode, with incremental delivery
        // disabled.
        warning(
          false,
          'RelayModernEnvironment: Operation `%s` contains @defer/@stream ' +
            'directives but was executed in non-streaming mode. See ' +
            'https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
          this._operation.request.node.params.name,
        );
        // But eagerly process any deferred payloads
        incrementalPlaceholders.forEach(placeholder => {
          if (placeholder.kind === 'defer') {
            this._processDeferResponse(
              placeholder.label,
              placeholder.path,
              placeholder,
              {data: placeholder.data},
            );
          }
        });
      }
    }
  }

  _maybeCompleteSubscriptionOperationTracking() {
    const isSubscriptionOperation =
      this._operation.request.node.params.operationKind === 'subscription';
    if (!isSubscriptionOperation) {
      return;
    }
    if (
      this._pendingModulePayloadsCount === 0 &&
      this._incrementalPayloadsPending === false
    ) {
      this._completeOperationTracker();
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
      // data synchronously.
      this._schedule(() => {
        this._handleModuleImportPayload(moduleImportPayload, syncOperation);
        this._maybeCompleteSubscriptionOperationTracking();
      });
    } else {
      // Otherwise load the operation module and schedule a task to normalize
      // the data when the module is available.
      const id = this._nextSubscriptionId++;
      this._pendingModulePayloadsCount++;

      const decrementPendingCount = () => {
        this._pendingModulePayloadsCount--;
        this._maybeCompleteSubscriptionOperationTracking();
      };

      // Observable.from(operationLoader.load()) wouldn't catch synchronous
      // errors thrown by the load function, which is user-defined. Guard
      // against that with Observable.from(new Promise(<work>)).
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
          complete: () => {
            this._complete(id);
            decrementPendingCount();
          },
          error: error => {
            this._error(error);
            decrementPendingCount();
          },
          start: subscription => this._start(id, subscription),
        });
    }
  }

  _handleModuleImportPayload(
    moduleImportPayload: ModuleImportPayload,
    operation: NormalizationSplitOperation,
  ): void {
    const relayPayload = this._normalizeModuleImport(
      moduleImportPayload,
      operation,
    );
    this._publishQueue.commitPayload(this._operation, relayPayload);
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
    this._processPayloadFollowups(relayPayload);
  }

  /**
   * The executor now knows that GraphQL responses are expected for a given
   * label/path:
   * - Store the placeholder in order to process any future responses that may
   *   arrive.
   * - Then process any responses that had already arrived.
   *
   * The placeholder contains the normalization selector, path (for nested
   * defer/stream), and other metadata used to normalize the incremental
   * response(s).
   */
  _processIncrementalPlaceholder(
    relayPayload: RelayResponsePayload,
    placeholder: IncrementalDataPlaceholder,
  ): void {
    // Update the label => path => placeholder map
    const {label, path} = placeholder;
    const pathKey = path.map(String).join('.');
    let resultForLabel = this._incrementalResults.get(label);
    if (resultForLabel == null) {
      resultForLabel = new Map();
      this._incrementalResults.set(label, resultForLabel);
    }
    const resultForPath = resultForLabel.get(pathKey);
    const pendingResponses =
      resultForPath != null && resultForPath.kind === 'response'
        ? resultForPath.responses
        : null;
    resultForLabel.set(pathKey, {kind: 'placeholder', placeholder});

    // Store references to the parent node to allow detecting concurrent
    // modifications to the parent before items arrive and to replay
    // handle field payloads to account for new information on source records.
    let parentID;
    if (
      placeholder.kind === 'stream' ||
      placeholder.kind === 'connection_edge'
    ) {
      parentID = placeholder.parentID;
    } else if (
      placeholder.kind === 'defer' ||
      placeholder.kind === 'connection_page_info'
    ) {
      parentID = placeholder.selector.dataID;
    } else {
      (placeholder: empty);
      invariant(
        false,
        'Unsupported incremental placeholder kind `%s`.',
        placeholder.kind,
      );
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
    // If there were any queued responses, process them now that placeholders
    // are in place
    if (pendingResponses != null) {
      pendingResponses.forEach(incrementalResponse => {
        this._schedule(() => {
          this._processIncrementalResponse(incrementalResponse);
        });
      });
    }
  }

  /**
   * Lookup the placeholder the describes how to process an incremental
   * response, normalize/publish it, and process any nested defer/match/stream
   * metadata.
   */
  _processIncrementalResponse(
    incrementalResponse: IncrementalGraphQLResponse,
  ): void {
    const {label, path, response} = incrementalResponse;
    let resultForLabel = this._incrementalResults.get(label);
    if (resultForLabel == null) {
      resultForLabel = new Map();
      this._incrementalResults.set(label, resultForLabel);
    }
    if (label.indexOf('$defer$') !== -1) {
      const pathKey = path.map(String).join('.');
      let resultForPath = resultForLabel.get(pathKey);
      if (resultForPath == null) {
        resultForPath = {kind: 'response', responses: [incrementalResponse]};
        resultForLabel.set(pathKey, resultForPath);
        return;
      } else if (resultForPath.kind === 'response') {
        resultForPath.responses.push(incrementalResponse);
        return;
      }
      const placeholder = resultForPath.placeholder;
      if (placeholder.kind === 'connection_page_info') {
        this._processConnectionPageInfoResponse(
          label,
          path,
          placeholder,
          response,
        );
      } else {
        invariant(
          placeholder.kind === 'defer',
          'RelayModernEnvironment: Expected data for path `%s` for label `%s` ' +
            'to be data for @defer, was `@%s`.',
          pathKey,
          label,
          placeholder.kind,
        );
        this._processDeferResponse(label, path, placeholder, response);
      }
    } else {
      // @stream payload path values end in the field name and item index,
      // but Relay records paths relative to the parent of the stream node:
      // therefore we strip the last two elements just to lookup the path
      // (the item index is used later to insert the element in the list)
      const pathKey = path
        .slice(0, -2)
        .map(String)
        .join('.');
      let resultForPath = resultForLabel.get(pathKey);
      if (resultForPath == null) {
        resultForPath = {kind: 'response', responses: [incrementalResponse]};
        resultForLabel.set(pathKey, resultForPath);
        return;
      } else if (resultForPath.kind === 'response') {
        resultForPath.responses.push(incrementalResponse);
        return;
      }
      const placeholder = resultForPath.placeholder;
      if (placeholder.kind === 'connection_edge') {
        this._processConnectionEdgeResponse(label, path, placeholder, response);
      } else {
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
  }

  _processConnectionPageInfoResponse(
    label: string,
    path: $ReadOnlyArray<mixed>,
    placeholder: ConnectionPageInfoPlaceholder,
    response: GraphQLResponseWithData,
  ): void {
    let relayPayload: RelayResponsePayload = normalizeResponse(
      response,
      placeholder.selector,
      placeholder.typeName,
      {
        getDataID: this._getDataID,
        path: placeholder.path,
        request: this._operation.request,
      },
    );
    const {
      END_CURSOR,
      HAS_NEXT_PAGE,
      HAS_PREV_PAGE,
      PAGE_INFO,
      START_CURSOR,
    } = RelayConnectionInterface.get();
    const pageRecord = relayPayload.source.get(placeholder.selector.dataID);
    const pageInfoID =
      pageRecord != null
        ? RelayModernRecord.getLinkedRecordID(pageRecord, PAGE_INFO)
        : null;
    const pageInfoRecord =
      pageInfoID != null ? relayPayload.source.get(pageInfoID) : null;
    let endCursor;
    let hasNextPage;
    let hasPrevPage;
    let startCursor;
    if (pageInfoRecord != null) {
      endCursor = RelayModernRecord.getValue(pageInfoRecord, END_CURSOR);
      hasNextPage = RelayModernRecord.getValue(pageInfoRecord, HAS_NEXT_PAGE);
      hasPrevPage = RelayModernRecord.getValue(pageInfoRecord, HAS_PREV_PAGE);
      startCursor = RelayModernRecord.getValue(pageInfoRecord, START_CURSOR);
    }

    relayPayload = {
      ...relayPayload,
      connectionEvents: (relayPayload.connectionEvents ?? []).concat({
        kind: 'stream.pageInfo',
        args: placeholder.args,
        connectionID: placeholder.connectionID,
        pageInfo: {
          endCursor: typeof endCursor === 'string' ? endCursor : null,
          startCursor: typeof startCursor === 'string' ? startCursor : null,
          hasNextPage: typeof hasNextPage === 'boolean' ? hasNextPage : null,
          hasPrevPage: typeof hasPrevPage === 'boolean' ? hasPrevPage : null,
        },
        request: this._operation.request,
      }),
    };
    this._publishQueue.commitPayload(this._operation, relayPayload);

    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
    this._processPayloadFollowups(relayPayload);
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
      {
        getDataID: this._getDataID,
        path: placeholder.path,
        request: this._operation.request,
      },
    );
    this._publishQueue.commitPayload(this._operation, relayPayload);

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
        connectionEvents: null,
        errors: null,
        fieldPayloads,
        incrementalPlaceholders: null,
        moduleImportPayloads: null,
        source: RelayRecordSource.create(),
      };
      this._publishQueue.commitPayload(
        this._operation,
        handleFieldsRelayPayload,
      );
    }
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
    this._processPayloadFollowups(relayPayload);
  }

  _processConnectionEdgeResponse(
    label: string,
    path: $ReadOnlyArray<mixed>,
    placeholder: ConnectionEdgePlaceholder,
    response: GraphQLResponseWithData,
  ): void {
    const {parentID, node, variables} = placeholder;
    let {relayPayload, itemID, itemIndex} = this._normalizeStreamItem(
      response,
      parentID,
      node,
      variables,
      path,
      placeholder.path,
    );
    relayPayload = {
      ...relayPayload,
      connectionEvents: (relayPayload.connectionEvents ?? []).concat({
        kind: 'stream.edge',
        args: placeholder.args,
        connectionID: placeholder.connectionID,
        edgeID: itemID,
        index: itemIndex,
        request: this._operation.request,
      }),
    };

    this._publishQueue.commitPayload(this._operation, relayPayload);
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
    this._processPayloadFollowups(relayPayload);
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
    // Find the LinkedField where @stream was applied
    const field = node.selections[0];
    invariant(
      field != null && field.kind === 'LinkedField' && field.plural === true,
      'RelayModernEnvironment: Expected @stream to be used on a plural field.',
    );
    const {
      fieldPayloads,
      itemID,
      itemIndex,
      prevIDs,
      relayPayload,
      storageKey,
    } = this._normalizeStreamItem(
      response,
      parentID,
      field,
      variables,
      path,
      placeholder.path,
    );
    // Publish the new item and update the parent record to set
    // field[index] = item *if* the parent record hasn't been concurrently
    // modified.
    this._publishQueue.commitPayload(this._operation, relayPayload, store => {
      const currentParentRecord = store.get(parentID);
      if (currentParentRecord == null) {
        // parent has since been deleted, stream data is stale
        return;
      }
      const currentItems = currentParentRecord.getLinkedRecords(storageKey);
      if (currentItems == null) {
        // field has since been deleted, stream data is stale
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
        connectionEvents: null,
        errors: null,
        fieldPayloads,
        incrementalPlaceholders: null,
        moduleImportPayloads: null,
        source: RelayRecordSource.create(),
      };
      this._publishQueue.commitPayload(
        this._operation,
        handleFieldsRelayPayload,
      );
    }
    const updatedOwners = this._publishQueue.run();
    this._updateOperationTracker(updatedOwners);
    this._processPayloadFollowups(relayPayload);
  }

  _normalizeStreamItem(
    response: GraphQLResponseWithData,
    parentID: DataID,
    field: NormalizationLinkedField,
    variables: Variables,
    path: $ReadOnlyArray<mixed>,
    normalizationPath: $ReadOnlyArray<string>,
  ): {|
    fieldPayloads: Array<HandleFieldPayload>,
    itemID: DataID,
    itemIndex: number,
    prevIDs: Array<?DataID>,
    relayPayload: RelayResponsePayload,
    storageKey: string,
  |} {
    const {data} = response;
    invariant(
      typeof data === 'object',
      'RelayModernEnvironment: Expected the GraphQL @stream payload `data` ' +
        'value to be an object.',
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

    const typeName = field.concreteType ?? data[TYPENAME_KEY];
    invariant(
      typeof typeName === 'string',
      'RelayModernEnvironment: Expected @stream field `%s` to have a ' +
        '__typename.',
      field.name,
    );

    // Determine the __id of the new item: this must equal the value that would
    // be assigned had the item not been streamed
    const itemID =
      // https://github.com/prettier/prettier/issues/6403
      // prettier-ignore
      (this._getDataID(data, typeName) ??
        (prevIDs && prevIDs[itemIndex])) || // Reuse previously generated client IDs
      generateClientID(parentID, storageKey, itemIndex);
    invariant(
      typeof itemID === 'string',
      'RelayModernEnvironment: Expected id of elements of field `%s` to ' +
        'be strings.',
      storageKey,
    );

    // Build a selector to normalize the item data with
    const selector = createNormalizationSelector(field, itemID, variables);

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
    const relayPayload = normalizeResponse(response, selector, typeName, {
      getDataID: this._getDataID,
      path: [...normalizationPath, responseKey, String(itemIndex)],
      request: this._operation.request,
    });
    return {
      fieldPayloads,
      itemID,
      itemIndex,
      prevIDs,
      relayPayload,
      storageKey,
    };
  }

  _updateOperationTracker(
    updatedOwners: ?$ReadOnlyArray<RequestDescriptor>,
  ): void {
    if (
      this._operationTracker != null &&
      updatedOwners != null &&
      updatedOwners.length > 0
    ) {
      this._operationTracker.update(
        this._operation.request,
        new Set(updatedOwners),
      );
    }
  }

  _completeOperationTracker() {
    if (this._operationTracker != null) {
      this._operationTracker.complete(this._operation.request);
    }
  }
}

function normalizeResponse(
  response: GraphQLResponseWithData,
  selector: NormalizationSelector,
  typeName: string,
  options: NormalizationOptions,
): RelayResponsePayload {
  const {data, errors} = response;
  const source = RelayRecordSource.create();
  const record = RelayModernRecord.create(selector.dataID, typeName);
  source.set(selector.dataID, record);
  const relayPayload = RelayResponseNormalizer.normalize(
    source,
    selector,
    data,
    options,
  );
  return {
    ...relayPayload,
    errors,
  };
}

function stableStringify(value: mixed): string {
  return JSON.stringify(stableCopy(value)) ?? ''; // null-check for flow
}

function validateOptimisticResponsePayload(
  payload: RelayResponsePayload,
): void {
  const {incrementalPlaceholders} = payload;
  if (incrementalPlaceholders != null && incrementalPlaceholders.length !== 0) {
    invariant(
      false,
      'RelayModernQueryExecutor: optimistic responses cannot be returned ' +
        'for operations that use incremental data delivery (@defer, ' +
        '@stream, and @stream_connection).',
    );
  }
}

module.exports = {execute};
