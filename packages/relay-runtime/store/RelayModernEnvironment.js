/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayCore = require('./RelayCore');
const RelayDataLoader = require('./RelayDataLoader');
const RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');
const RelayInMemoryRecordSource = require('./RelayInMemoryRecordSource');
const RelayModernRecord = require('./RelayModernRecord');
const RelayObservable = require('../network/RelayObservable');
const RelayPublishQueue = require('./RelayPublishQueue');
const RelayResponseNormalizer = require('./RelayResponseNormalizer');

const invariant = require('invariant');
const normalizePayload = require('./normalizePayload');
const normalizeRelayPayload = require('./normalizeRelayPayload');
const warning = require('warning');

import type {HandlerProvider} from '../handlers/RelayDefaultHandlerProvider';
import type {
  GraphQLResponse,
  Network,
  PayloadData,
  PayloadError,
  UploadableMap,
} from '../network/RelayNetworkTypes';
import type {Subscription} from '../network/RelayObservable';
import type {
  Environment,
  OperationLoader,
  MatchFieldPayload,
  MissingFieldHandler,
  OperationSelector,
  OptimisticUpdate,
  RelayResponsePayload,
  Selector,
  SelectorStoreUpdater,
  Snapshot,
  Store,
  StoreUpdater,
  UnstableEnvironmentCore,
} from '../store/RelayStoreTypes';
import type {ConcreteSplitOperation} from '../util/RelayConcreteNode';
import type {CacheConfig, Disposable} from '../util/RelayRuntimeTypes';

export type EnvironmentConfig = {|
  +configName?: string,
  +handlerProvider?: HandlerProvider,
  +operationLoader?: OperationLoader,
  +network: Network,
  +store: Store,
  +missingFieldHandlers?: $ReadOnlyArray<MissingFieldHandler>,
|};

class RelayModernEnvironment implements Environment {
  _operationLoader: ?OperationLoader;
  _network: Network;
  _publishQueue: RelayPublishQueue;
  _store: Store;
  configName: ?string;
  unstable_internal: UnstableEnvironmentCore;
  _missingFieldHandlers: ?$ReadOnlyArray<MissingFieldHandler>;

  constructor(config: EnvironmentConfig) {
    this.configName = config.configName;
    const handlerProvider = config.handlerProvider
      ? config.handlerProvider
      : RelayDefaultHandlerProvider;
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
    this._operationLoader = operationLoader;
    this._network = config.network;
    this._publishQueue = new RelayPublishQueue(config.store, handlerProvider);
    this._store = config.store;
    this.unstable_internal = RelayCore;

    (this: any).__setNet = newNet => (this._network = newNet);

    // Register this Relay Environment with Relay DevTools if it exists.
    // Note: this must always be the last step in the constructor.
    const _global =
      typeof global !== 'undefined'
        ? global
        : typeof window !== 'undefined'
          ? window
          : undefined;
    const devToolsHook = _global && _global.__RELAY_DEVTOOLS_HOOK__;
    if (devToolsHook) {
      devToolsHook.registerEnvironment(this);
    }
    if (config.missingFieldHandlers != null) {
      this._missingFieldHandlers = config.missingFieldHandlers;
    }
  }

  getStore(): Store {
    return this._store;
  }

  getNetwork(): Network {
    return this._network;
  }

  applyUpdate(optimisticUpdate: OptimisticUpdate): Disposable {
    const dispose = () => {
      this._publishQueue.revertUpdate(optimisticUpdate);
      this._publishQueue.run();
    };
    this._publishQueue.applyUpdate(optimisticUpdate);
    this._publishQueue.run();
    return {dispose};
  }

  revertUpdate(update: OptimisticUpdate): void {
    this._publishQueue.revertUpdate(update);
    this._publishQueue.run();
  }

  replaceUpdate(update: OptimisticUpdate, newUpdate: OptimisticUpdate): void {
    this._publishQueue.revertUpdate(update);
    this._publishQueue.applyUpdate(newUpdate);
    this._publishQueue.run();
  }

  applyMutation({
    operation,
    optimisticResponse,
    optimisticUpdater,
  }: {
    operation: OperationSelector,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: Object,
  }): Disposable {
    return this.applyUpdate({
      operation,
      selectorStoreUpdater: optimisticUpdater,
      response: optimisticResponse || null,
    });
  }

  check(readSelector: Selector): boolean {
    if (this._missingFieldHandlers == null) {
      return this._store.check(readSelector);
    }
    return this._checkSelectorAndHandleMissingFields(
      readSelector,
      this._missingFieldHandlers,
    );
  }

  commitPayload(
    operationSelector: OperationSelector,
    payload: PayloadData,
  ): void {
    // Do not handle stripped nulls when commiting a payload
    const relayPayload = normalizeRelayPayload(operationSelector.root, payload);
    this._publishQueue.commitPayload(operationSelector, relayPayload);
    this._publishQueue.run();
  }

  commitUpdate(updater: StoreUpdater): void {
    this._publishQueue.commitUpdate(updater);
    this._publishQueue.run();
  }

  lookup(readSelector: Selector): Snapshot {
    return this._store.lookup(readSelector);
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

  _checkSelectorAndHandleMissingFields(
    selector: Selector,
    handlers: $ReadOnlyArray<MissingFieldHandler>,
  ): boolean {
    const target = new RelayInMemoryRecordSource();
    const result = RelayDataLoader.check(
      this._store.getSource(),
      target,
      selector,
      handlers,
    );
    if (target.size() > 0) {
      this._publishQueue.commitSource(target);
      this._publishQueue.run();
    }
    return result;
  }

  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query or Subscription operation, each result of which is then
   * normalized and committed to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.execute({...}).subscribe({...}).
   */
  execute({
    operation,
    cacheConfig,
    updater,
  }: {
    operation: OperationSelector,
    cacheConfig?: ?CacheConfig,
    updater?: ?SelectorStoreUpdater,
  }): RelayObservable<GraphQLResponse> {
    return RelayObservable.create(sink => {
      let optimisticResponse = null;
      const subscriptions: Set<Subscription> = new Set();

      function start(subscription): void {
        // NOTE: store the subscription object on the observer so that it
        // can be cleaned up in complete() or the dispose function.
        this._subscription = subscription;
        subscriptions.add(subscription);
      }

      function complete(): void {
        subscriptions.delete(this._subscription);
        if (subscriptions.size === 0) {
          sink.complete();
        }
      }

      // Convert each GraphQLResponse from the network to a RelayResponsePayload
      // and process it
      function next(response: GraphQLResponse): void {
        const payload = normalizePayload(operation, response);
        const isOptimistic = response.extensions?.isOptimistic === true;
        processRelayPayload(payload, operation, updater, isOptimistic);
        sink.next(response);
      }

      // Each RelayResponsePayload contains both data to publish to the store
      // immediately, but may also contain matchPayloads that need to be
      // asynchronously normalized into RelayResponsePayloads, which may
      // themselves have matchPayloads: this function is recursive and relies
      // on GraphQL queries *disallowing* recursion to ensure termination.
      const processRelayPayload = (
        payload: RelayResponsePayload,
        operationSelector: OperationSelector | null = null,
        payloadUpdater: SelectorStoreUpdater | null = null,
        isOptimistic: boolean = false,
      ): void => {
        const {matchPayloads} = payload;
        if (matchPayloads && matchPayloads.length) {
          const operationLoader = this._operationLoader;
          invariant(
            operationLoader,
            'RelayModernEnvironment: Expected an operationLoader to be ' +
              'configured when using `@match`.',
          );
          matchPayloads.forEach(matchPayload => {
            processMatchPayload(
              processRelayPayload,
              operationLoader,
              matchPayload,
            ).subscribe({
              complete,
              error: sink.error,
              start,
            });
          });
        }
        if (isOptimistic) {
          invariant(
            optimisticResponse === null,
            'environment.execute: only support one optimistic response per ' +
              'execute.',
          );
          optimisticResponse = {
            source: payload.source,
            fieldPayloads: payload.fieldPayloads,
          };
          this._publishQueue.applyUpdate(optimisticResponse);
          this._publishQueue.run();
        } else {
          if (optimisticResponse !== null) {
            this._publishQueue.revertUpdate(optimisticResponse);
            optimisticResponse = null;
          }
          if (operationSelector && payloadUpdater) {
            this._publishQueue.commitPayload(
              operationSelector,
              payload,
              payloadUpdater,
            );
          } else {
            this._publishQueue.commitRelayPayload(payload);
          }
          this._publishQueue.run();
        }
      };

      this._network
        .execute(operation.node, operation.variables, cacheConfig || {})
        .subscribe({
          complete,
          next,
          error: sink.error,
          start,
        });
      return () => {
        if (subscriptions.size !== 0) {
          subscriptions.forEach(sub => sub.unsubscribe());
          subscriptions.clear();
        }
        if (optimisticResponse !== null) {
          this._publishQueue.revertUpdate(optimisticResponse);
          optimisticResponse = null;
          this._publishQueue.run();
        }
      };
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
  executeMutation({
    operation,
    optimisticResponse,
    optimisticUpdater,
    updater,
    uploadables,
  }: {|
    operation: OperationSelector,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: ?Object,
    updater?: ?SelectorStoreUpdater,
    uploadables?: ?UploadableMap,
  |}): RelayObservable<GraphQLResponse> {
    let optimisticUpdate;
    if (optimisticResponse || optimisticUpdater) {
      optimisticUpdate = {
        operation: operation,
        selectorStoreUpdater: optimisticUpdater,
        response: optimisticResponse || null,
      };
    }

    return this._network
      .execute(operation.node, operation.variables, {force: true}, uploadables)
      .do({
        start: () => {
          if (optimisticUpdate) {
            this._publishQueue.applyUpdate(optimisticUpdate);
            this._publishQueue.run();
          }
        },
        next: payload => {
          if (optimisticUpdate) {
            this._publishQueue.revertUpdate(optimisticUpdate);
            optimisticUpdate = undefined;
          }
          this._publishQueue.commitPayload(
            operation,
            normalizePayload(operation, payload),
            updater,
          );
          this._publishQueue.run();
        },
        error: error => {
          if (optimisticUpdate) {
            this._publishQueue.revertUpdate(optimisticUpdate);
            optimisticUpdate = undefined;
            this._publishQueue.run();
          }
        },
        unsubscribe: () => {
          if (optimisticUpdate) {
            this._publishQueue.revertUpdate(optimisticUpdate);
            optimisticUpdate = undefined;
            this._publishQueue.run();
          }
        },
      });
  }

  /**
   * @deprecated Use Environment.execute().subscribe()
   */
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
    onNext?: ?(payload: GraphQLResponse) => void,
    operation: OperationSelector,
  }): Disposable {
    warning(
      false,
      'environment.sendQuery() is deprecated. Update to the latest ' +
        'version of react-relay, and use environment.execute().',
    );
    return this.execute({operation, cacheConfig}).subscribeLegacy({
      onNext,
      onError,
      onCompleted,
    });
  }

  /**
   * @deprecated Use Environment.executeMutation().subscribe()
   */
  sendMutation({
    onCompleted,
    onError,
    operation,
    optimisticResponse,
    optimisticUpdater,
    updater,
    uploadables,
  }: {
    onCompleted?: ?(errors: ?Array<PayloadError>) => void,
    onError?: ?(error: Error) => void,
    operation: OperationSelector,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: Object,
    updater?: ?SelectorStoreUpdater,
    uploadables?: UploadableMap,
  }): Disposable {
    warning(
      false,
      'environment.sendMutation() is deprecated. Update to the latest ' +
        'version of react-relay, and use environment.executeMutation().',
    );
    return this.executeMutation({
      operation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      uploadables,
    }).subscribeLegacy({
      // NOTE: sendMutation has a non-standard use of onCompleted() by passing
      // it a value. When switching to use executeMutation(), the next()
      // Observer should be used to preserve behavior.
      onNext: payload => {
        onCompleted && onCompleted(payload.errors);
      },
      onError,
      onCompleted,
    });
  }
}

/**
 * Processes a MatchFieldPayload, asynchronously resolving the fragment,
 * using it to normalize the field data into a RelayResponsePayload.
 * Because @match fields may contain other @match fields, the result of
 * normalizing `matchPayload` may contain *other* MatchFieldPayloads:
 * the processRelayPayload() callback is responsible for publishing
 * both the normalize payload's source as well as recursively calling
 * this function for any matchPayloads it contains.
 *
 * @private
 */
function processMatchPayload(
  processRelayPayload: RelayResponsePayload => void,
  operationLoader: OperationLoader,
  matchPayload: MatchFieldPayload,
): RelayObservable<void> {
  return RelayObservable.from(
    new Promise((resolve, reject) => {
      operationLoader
        .load(matchPayload.operationReference)
        .then(resolve, reject);
    }),
  ).map((operation: ?ConcreteSplitOperation) => {
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
    );
    const relayPayload = {
      errors: null, // Errors are handled as part of the parent GraphQLResponse
      fieldPayloads: normalizeResult.fieldPayloads,
      matchPayloads: normalizeResult.matchPayloads,
      source: source,
    };
    processRelayPayload(relayPayload);
  });
}

// Add a sigil for detection by `isRelayModernEnvironment()` to avoid a
// realm-specific instanceof check, and to aid in module tree-shaking to
// avoid requiring all of RelayRuntime just to detect its environment.
(RelayModernEnvironment: any).prototype['@@RelayModernEnvironment'] = true;

module.exports = RelayModernEnvironment;
