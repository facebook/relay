/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';
import type {
  ActorIdentifier,
  IActorEnvironment,
} from '../multi-actor-environment';
import type {
  GraphQLResponse,
  GraphQLResponseWithData,
  INetwork,
  PayloadData,
  PayloadError,
  UploadableMap,
} from '../network/RelayNetworkTypes';
import type RelayObservable from '../network/RelayObservable';
import type {RequestIdentifier} from '../util/getRequestIdentifier';
import type {
  NormalizationArgument,
  NormalizationLinkedField,
  NormalizationRootNode,
  NormalizationScalarField,
  NormalizationSelectableNode,
} from '../util/NormalizationNode';
import type {
  ReaderClientEdgeToServerObject,
  ReaderFragment,
  ReaderLinkedField,
} from '../util/ReaderNode';
import type {
  ConcreteRequest,
  RequestParameters,
} from '../util/RelayConcreteNode';
import type {
  CacheConfig,
  DataID,
  Disposable,
  RenderPolicy,
  UpdatableFragment,
  UpdatableQuery,
  Variables,
} from '../util/RelayRuntimeTypes';
import type {TRelayFieldError} from './RelayErrorTrie';
import type {
  Record as RelayModernRecord,
  RecordJSON,
} from './RelayModernRecord';
import type {InvalidationState} from './RelayModernStore';
import type RelayOperationTracker from './RelayOperationTracker';
import type {RecordState} from './RelayRecordState';
import type {NormalizationOptions} from './RelayResponseNormalizer';

export opaque type FragmentType = empty;
export type OperationTracker = RelayOperationTracker;

export type Record = RelayModernRecord;

export type MutationParameters = {
  +response: {...},
  +variables: {...},
  +rawResponse?: {...},
};

export type FragmentMap = {[key: string]: ReaderFragment, ...};

/**
 * The results of a selector given a store/RecordSource.
 */
export type SelectorData = {[key: string]: mixed, ...};

export type SingularReaderSelector = {
  +kind: 'SingularReaderSelector',
  +dataID: DataID,
  +isWithinUnmatchedTypeRefinement: boolean,
  +clientEdgeTraversalPath: ClientEdgeTraversalPath | null,
  +node: ReaderFragment,
  +owner: RequestDescriptor,
  +variables: Variables,
};

export type ReaderSelector = SingularReaderSelector | PluralReaderSelector;

export type PluralReaderSelector = {
  +kind: 'PluralReaderSelector',
  +selectors: $ReadOnlyArray<SingularReaderSelector>,
};

export type FieldErrorType =
  | 'MISSING_DATA'
  | 'MISSING_REQUIRED'
  | 'PAYLOAD_ERROR';

export type RequestDescriptor = {
  +identifier: RequestIdentifier,
  +node: ConcreteRequest,
  +variables: Variables,
  +cacheConfig: ?CacheConfig,
};

/**
 * A selector defines the starting point for a traversal into the graph for the
 * purposes of targeting a subgraph.
 */
export type NormalizationSelector = {
  +dataID: DataID,
  +node: NormalizationSelectableNode,
  +variables: Variables,
};

export type FieldError =
  | RelayFieldPayloadErrorEvent
  | MissingExpectedDataLogEvent
  | MissingExpectedDataThrowEvent
  | RelayResolverErrorEvent
  | MissingRequiredFieldLogEvent
  | MissingRequiredFieldThrowEvent;

export type FieldErrors = Array<FieldError>;

export type ClientEdgeTraversalInfo = {
  +readerClientEdge: ReaderClientEdgeToServerObject,
  +clientEdgeDestinationID: DataID,
};

export type ClientEdgeTraversalPath =
  $ReadOnlyArray<ClientEdgeTraversalInfo | null>;

export type MissingClientEdgeRequestInfo = {
  +request: ConcreteRequest,
  +clientEdgeDestinationID: DataID,
};

/**
 * A representation of a selector and its results at a particular point in time.
 */
export type Snapshot = {
  +data: ?SelectorData,
  +isMissingData: boolean,
  +missingLiveResolverFields?: $ReadOnlyArray<DataID>,
  +missingClientEdges: null | $ReadOnlyArray<MissingClientEdgeRequestInfo>,
  +seenRecords: DataIDSet,
  +selector: SingularReaderSelector,
  +fieldErrors: ?FieldErrors,
};

/**
 * An operation selector describes a specific instance of a GraphQL operation
 * with variables applied.
 *
 * - `root`: a selector intended for processing server results or retaining
 *   response data in the store.
 * - `fragment`: a selector intended for use in reading or subscribing to
 *   the results of the the operation.
 */
export type OperationDescriptor = {
  +fragment: SingularReaderSelector,
  +request: RequestDescriptor,
  +root: NormalizationSelector,
};

/**
 * Arbitrary data e.g. received by a container as props.
 */
export type Props = {[key: string]: mixed, ...};

/**
 * The type of the `relay` property set on React context by the React/Relay
 * integration layer (e.g. QueryRenderer, FragmentContainer, etc).
 */
export type RelayContext = {
  environment: IEnvironment,
  getEnvironmentForActor?: ?(
    actorIdentifier: ActorIdentifier,
  ) => IActorEnvironment,
};

/**
 * The results of reading the results of a FragmentMap given some input
 * `Props`.
 */
export type FragmentSpecResults = {[key: string]: mixed, ...};

/**
 * A utility for resolving and subscribing to the results of a fragment spec
 * (key -> fragment mapping) given some "props" that determine the root ID
 * and variables to use when reading each fragment. When props are changed via
 * `setProps()`, the resolver will update its results and subscriptions
 * accordingly. Internally, the resolver:
 * - Converts the fragment map & props map into a map of `Selector`s.
 * - Removes any resolvers for any props that became null.
 * - Creates resolvers for any props that became non-null.
 * - Updates resolvers with the latest props.
 */
export interface FragmentSpecResolver {
  /**
   * Stop watching for changes to the results of the fragments.
   */
  dispose(): void;

  /**
   * Get the current results.
   */
  resolve(): FragmentSpecResults;

  /**
   * Update the resolver with new inputs. Call `resolve()` to get the updated
   * results.
   */
  setProps(props: Props): void;

  /**
   * Override the variables used to read the results of the fragments. Call
   * `resolve()` to get the updated results.
   */
  setVariables(variables: Variables, node: ConcreteRequest): void;

  /**
   * Subscribe to resolver updates.
   * Overrides existing callback (if one has been specified).
   */
  setCallback(props: Props, callback: () => void): void;
}

/**
 * A read-only interface for accessing cached graph data.
 */
export interface RecordSource {
  get(dataID: DataID): ?Record;
  getRecordIDs(): Array<DataID>;
  getStatus(dataID: DataID): RecordState;
  has(dataID: DataID): boolean;
  size(): number;
  toJSON(): RecordSourceJSON;
}

/**
 * A collection of records keyed by id.
 */
export type RecordSourceJSON = {[DataID]: ?RecordJSON};

/**
 * A read/write interface for accessing and updating graph data.
 */
export interface MutableRecordSource extends RecordSource {
  clear(): void;
  delete(dataID: DataID): void;
  remove(dataID: DataID): void;
  set(dataID: DataID, record: Record): void;
}

export type CheckOptions = {
  handlers: $ReadOnlyArray<MissingFieldHandler>,
  defaultActorIdentifier: ActorIdentifier,
  getTargetForActor: (actorIdentifier: ActorIdentifier) => MutableRecordSource,
  getSourceForActor: (actorIdentifier: ActorIdentifier) => RecordSource,
};

export type OperationAvailability =
  | {status: 'available', fetchTime: ?number}
  | {status: 'stale'}
  | {status: 'missing'};

export type {InvalidationState} from './RelayModernStore';

/**
 * An interface for keeping multiple views of data consistent across an
 * application.
 */
export interface Store {
  /**
   * Get a read-only view of the store's internal RecordSource.
   */
  getSource(): RecordSource;

  /**
   * Determine if the operation can be resolved with data in the store (i.e. no
   * fields are missing).
   */
  check(
    operation: OperationDescriptor,
    options?: CheckOptions,
  ): OperationAvailability;

  /**
   * Read the results of a selector from in-memory records in the store.
   */
  lookup(selector: SingularReaderSelector): Snapshot;

  /**
   * Notify subscribers (see `subscribe`) of any data that was published
   * (`publish()`) since the last time `notify` was called.
   * Optionally provide an OperationDescriptor indicating the source operation
   * that was being processed to produce this run.
   *
   * This method should return an array of the affected fragment owners.
   */
  notify(
    sourceOperation?: OperationDescriptor,
    invalidateStore?: boolean,
  ): $ReadOnlyArray<RequestDescriptor>;

  /**
   * Publish new information (e.g. from the network) to the store, updating its
   * internal record source. Subscribers are not immediately notified - this
   * occurs when `notify()` is called.
   */
  publish(source: RecordSource, idsMarkedForInvalidation?: DataIDSet): void;

  /**
   * Ensure that all the records necessary to fulfill the given selector are
   * retained in memory. The records will not be eligible for garbage collection
   * until the returned reference is disposed.
   */
  retain(operation: OperationDescriptor): Disposable;

  /**
   * Subscribe to changes to the results of a selector. The callback is called
   * when `notify()` is called *and* records have been published that affect the
   * selector results relative to the last `notify()`.
   */
  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable;

  /**
   * The method should disable garbage collection until
   * the returned reference is disposed.
   */
  holdGC(): Disposable;

  /**
   * Record a backup/snapshot of the current state of the store, including
   * records and derived data such as fragment subscriptions.
   * This state can be restored with restore().
   */
  snapshot(): void;

  /**
   * Reset the state of the store to the point that snapshot() was last called.
   */
  restore(): void;

  /**
   * Will return an opaque snapshot of the current invalidation state of
   * the data ids that were provided.
   */
  lookupInvalidationState(dataIDs: $ReadOnlyArray<DataID>): InvalidationState;

  /**
   * Given the previous invalidation state for those
   * ids, this function will return:
   *   - false, if the invalidation state for those ids is the same, meaning
   *     **it has not changed**
   *   - true, if the invalidation state for the given ids has changed
   */
  checkInvalidationState(previousInvalidationState: InvalidationState): boolean;

  /**
   * Will subscribe the provided callback to the invalidation state of the
   * given data ids. Whenever the invalidation state for any of the provided
   * ids changes, the callback will be called, and provide the latest
   * invalidation state.
   * Disposing of the returned disposable will remove the subscription.
   */
  subscribeToInvalidationState(
    invalidationState: InvalidationState,
    callback: () => void,
  ): Disposable;

  /**
   * Get the current write epoch
   */
  getEpoch(): number;

  /**
   * Get the current operation loader if it exists
   */
  getOperationLoader(): ?OperationLoader;
}

export interface StoreSubscriptions {
  /**
   * Subscribe to changes to the results of a selector. The callback is called
   * when `updateSubscriptions()` is called *and* records have been published that affect the
   * selector results relative to the last update.
   */
  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable;

  /**
   * Record a backup/snapshot of the current state of the subscriptions.
   * This state can be restored with restore().
   */
  snapshotSubscriptions(source: RecordSource): void;

  /**
   * Reset the state of the subscriptions to the point that snapshot() was last called.
   */
  restoreSubscriptions(): void;

  /**
   * Notifies each subscription if the snapshot for the subscription selector has changed.
   * Mutates the updatedOwners array with any owners (RequestDescriptors) associated
   * with the subscriptions that were notified; i.e. the owners affected by the changes.
   */
  updateSubscriptions(
    source: RecordSource,
    updatedRecordIDs: DataIDSet,
    updatedOwners: Array<RequestDescriptor>,
    sourceOperation?: OperationDescriptor,
  ): void;

  /**
   * returns the number of subscriptions
   */
  size(): number;
}

/**
 * A type that accepts a callback and schedules it to run at some future time.
 * By convention, implementations should not execute the callback immediately.
 */
export type Scheduler = (() => void) => void;

/**
 * A type that can schedule callbacks and also cancel them.
 */
export type TaskScheduler = {
  +cancel: (id: string) => void,
  +schedule: (fn: () => void, priority?: TaskPriority) => string,
};

export type TaskPriority = 'default' | 'low';

/**
 * An interface for imperatively getting/setting properties of a `Record`. This interface
 * is designed to allow the appearance of direct Record manipulation while
 * allowing different implementations that may e.g. create a changeset of
 * the modifications.
 */
export interface RecordProxy {
  copyFieldsFrom(source: RecordProxy): void;
  getDataID(): DataID;
  getLinkedRecord(name: string, args?: ?Variables): ?RecordProxy;
  getLinkedRecords(name: string, args?: ?Variables): ?Array<?RecordProxy>;
  getOrCreateLinkedRecord(
    name: string,
    typeName: string,
    args?: ?Variables,
  ): RecordProxy;
  getType(): string;
  getValue(name: string, args?: ?Variables): mixed;
  getErrors(name: string, args?: ?Variables): ?$ReadOnlyArray<TRelayFieldError>;
  setLinkedRecord(
    record: RecordProxy,
    name: string,
    args?: ?Variables,
  ): RecordProxy;
  setLinkedRecords(
    records: $ReadOnlyArray<?RecordProxy>,
    name: string,
    args?: ?Variables,
  ): RecordProxy;
  setValue(
    value: mixed,
    name: string,
    args?: ?Variables,
    errors?: ?$ReadOnlyArray<TRelayFieldError>,
  ): RecordProxy;
  invalidateRecord(): void;
}

export interface ReadOnlyRecordProxy {
  getDataID(): DataID;
  getLinkedRecord(name: string, args?: ?Variables): ?RecordProxy;
  getLinkedRecords(name: string, args?: ?Variables): ?Array<?RecordProxy>;
  getType(): string;
  getValue(name: string, args?: ?Variables): mixed;
}

/**
 * A linked field where an updatable fragment is spread has the type
 * HasUpdatableSpread.
 * This type is expected by store.readUpdatableFragment.
 */
export type HasUpdatableSpread<TFragmentType> = {
  +$updatableFragmentSpreads: TFragmentType,
  ...
};

/**
 * The return type of calls to readUpdatableQuery and
 * readUpdatableFragment.
 */
export type UpdatableData<TData> = {
  +updatableData: TData,
};

/**
 * An interface for imperatively getting/setting properties of a `RecordSource`. This interface
 * is designed to allow the appearance of direct RecordSource manipulation while
 * allowing different implementations that may e.g. create a changeset of
 * the modifications.
 */
export interface RecordSourceProxy {
  create(dataID: DataID, typeName: string): RecordProxy;
  delete(dataID: DataID): void;
  get(dataID: DataID): ?RecordProxy;
  getRoot(): RecordProxy;
  invalidateStore(): void;
  readUpdatableQuery<TVariables: Variables, TData>(
    query: UpdatableQuery<TVariables, TData>,
    variables: TVariables,
  ): UpdatableData<TData>;
  readUpdatableFragment<TFragmentType: FragmentType, TData>(
    fragment: UpdatableFragment<TFragmentType, TData>,
    fragmentReference: HasUpdatableSpread<TFragmentType>,
  ): UpdatableData<TData>;
}

export interface ReadOnlyRecordSourceProxy {
  get(dataID: DataID): ?ReadOnlyRecordProxy;
  getRoot(): ReadOnlyRecordProxy;
}

/**
 * Extends the RecordSourceProxy interface with methods for accessing the root
 * fields of a Selector.
 */
export interface RecordSourceSelectorProxy extends RecordSourceProxy {
  getRootField(fieldName: string): ?RecordProxy;
  getPluralRootField(fieldName: string): ?Array<?RecordProxy>;
  invalidateStore(): void;
}

export type SuspenseFragmentLogEvent = {
  +name: 'suspense.fragment',
  +data: mixed,
  +fragment: ReaderFragment,
  +isRelayHooks: boolean,
  +isMissingData: boolean,
  +isPromiseCached: boolean,
  +pendingOperations: $ReadOnlyArray<RequestDescriptor>,
};

export type SuspenseQueryLogEvent = {
  +name: 'suspense.query',
  +fetchPolicy: string,
  +isPromiseCached: boolean,
  +operation: OperationDescriptor,
  +queryAvailability: ?OperationAvailability,
  +renderPolicy: RenderPolicy,
};

export type QueryResourceFetchLogEvent = {
  +name: 'queryresource.fetch',
  // ID of this query resource request and will be the same
  // if there is an associated queryresource.retain event.
  +resourceID: number,
  +operation: OperationDescriptor,
  // value from ProfilerContext
  +profilerContext: mixed,
  // FetchPolicy from Relay Hooks
  +fetchPolicy: string,
  // RenderPolicy from Relay Hooks
  +renderPolicy: RenderPolicy,
  +queryAvailability: OperationAvailability,
  +shouldFetch: boolean,
};

export type QueryResourceRetainLogEvent = {
  +name: 'queryresource.retain',
  +resourceID: number,
  // value from ProfilerContext
  +profilerContext: mixed,
};

export type FragmentResourceMissingDataLogEvent = {
  // Indicates FragmentResource is going to return a result that is missing
  // data.
  +name: 'fragmentresource.missing_data',
  +data: mixed,
  +fragment: ReaderFragment,
  +isRelayHooks: boolean,
  // Are we reading this result from the fragment resource cache?
  +cached: boolean,
};

export type PendingOperationFoundLogEvent = {
  // Indicates getPendingOperationForFragment identified a pending operation.
  // Useful for measuring how frequently RelayOperationTracker identifies a
  // related operation on which to suspend.
  +name: 'pendingoperation.found',
  +fragment: ReaderFragment,
  +fragmentOwner: RequestDescriptor,
  +pendingOperations: $ReadOnlyArray<RequestDescriptor>,
};

export type NetworkInfoLogEvent = {
  +name: 'network.info',
  +networkRequestId: number,
  +info: mixed,
};

export type NetworkStartLogEvent = {
  +name: 'network.start',
  +networkRequestId: number,
  +params: RequestParameters,
  +variables: Variables,
  +cacheConfig: CacheConfig,
};

export type NetworkNextLogEvent = {
  +name: 'network.next',
  +networkRequestId: number,
  +response: GraphQLResponse,
};

export type NetworkErrorLogEvent = {
  +name: 'network.error',
  +networkRequestId: number,
  +error: Error,
};

export type NetworkCompleteLogEvent = {
  +name: 'network.complete',
  +networkRequestId: number,
};

export type NetworkUnsubscribeLogEvent = {
  +name: 'network.unsubscribe',
  +networkRequestId: number,
};

export type ExecuteStartLogEvent = {
  +name: 'execute.start',
  +executeId: number,
  +params: RequestParameters,
  +variables: Variables,
  +cacheConfig: CacheConfig,
};

export type ExecuteNextStartLogEvent = {
  +name: 'execute.next.start',
  +executeId: number,
  +response: GraphQLResponse,
  +operation: OperationDescriptor,
};

export type ExecuteNextEndLogEvent = {
  +name: 'execute.next.end',
  +executeId: number,
  +response: GraphQLResponse,
  +operation: OperationDescriptor,
};

export type ExecuteAsyncModuleLogEvent = {
  +name: 'execute.async.module',
  +executeId: number,
  +operationName: string,
  +duration: number,
};

export type ExecuteErrorLogEvent = {
  +name: 'execute.error',
  +executeId: number,
  +error: Error,
};

export type ExecuteCompleteLogEvent = {
  +name: 'execute.complete',
  +executeId: number,
};

export type ExecuteUnsubscribeLogEvent = {
  +name: 'execute.unsubscribe',
  +executeId: number,
};

export type ExecuteNormalizeStart = {
  +name: 'execute.normalize.start',
  +operation: OperationDescriptor,
};

export type ExecuteNormalizeEnd = {
  +name: 'execute.normalize.end',
  +operation: OperationDescriptor,
};

export type StoreDataCheckerStartEvent = {
  +name: 'store.datachecker.start',
  +selector: NormalizationSelector,
};

export type StoreDataCheckerEndEvent = {
  +name: 'store.datachecker.end',
  +selector: NormalizationSelector,
};

export type StorePublishLogEvent = {
  +name: 'store.publish',
  +source: RecordSource,
  +optimistic: boolean,
};

export type StoreSnapshotLogEvent = {
  +name: 'store.snapshot',
};

export type StoreLookupStartEvent = {
  +name: 'store.lookup.start',
  +selector: SingularReaderSelector,
};

export type StoreLookupEndEvent = {
  +name: 'store.lookup.end',
  +selector: SingularReaderSelector,
};

export type StoreRestoreLogEvent = {
  +name: 'store.restore',
};

export type StoreGcStartEvent = {
  +name: 'store.gc.start',
};

export type StoreGcInterruptedEvent = {
  +name: 'store.gc.interrupted',
};

export type StoreGcEndEvent = {
  +name: 'store.gc.end',
  +references: DataIDSet,
};

export type StoreNotifyStartLogEvent = {
  +name: 'store.notify.start',
  +sourceOperation: ?OperationDescriptor,
};

export type StoreNotifyCompleteLogEvent = {
  +name: 'store.notify.complete',
  +sourceOperation: ?OperationDescriptor,
  +updatedRecordIDs: DataIDSet,
  +invalidatedRecordIDs: DataIDSet,
  +subscriptionsSize: number,
  +updatedOwners: Array<RequestDescriptor>,
};

export type StoreNotifySubscriptionLogEvent = {
  +name: 'store.notify.subscription',
  +sourceOperation: ?OperationDescriptor,
  +snapshot: Snapshot,
  +nextSnapshot: Snapshot,
};

export type EntrypointRootConsumeLogEvent = {
  +name: 'entrypoint.root.consume',
  +profilerContext: mixed,
  +rootModuleID: string,
};

export type LiveResolverBatchStartLogEvent = {
  +name: 'liveresolver.batch.start',
};

export type LiveResolverBatchEndLogEvent = {
  +name: 'liveresolver.batch.end',
};

export type UseFragmentSubscriptionMissedUpdates = {
  +name: 'useFragment.subscription.missedUpdates',
  +hasDataChanges: boolean,
};

/**
 * This event is logged when two strong objects share the same id,
 * but have different types, resulting in an collision in the store.
 */
export type IdCollisionTypenameLogEvent = {
  +name: 'idCollision.typename',
  +previous_typename: string,
  +new_typename: string,
};

export type LogEvent =
  | SuspenseFragmentLogEvent
  | SuspenseQueryLogEvent
  | QueryResourceFetchLogEvent
  | QueryResourceRetainLogEvent
  | FragmentResourceMissingDataLogEvent
  | IdCollisionTypenameLogEvent
  | PendingOperationFoundLogEvent
  | NetworkInfoLogEvent
  | NetworkStartLogEvent
  | NetworkNextLogEvent
  | NetworkErrorLogEvent
  | NetworkCompleteLogEvent
  | NetworkUnsubscribeLogEvent
  | ExecuteStartLogEvent
  | ExecuteNextStartLogEvent
  | ExecuteNextEndLogEvent
  | ExecuteAsyncModuleLogEvent
  | ExecuteErrorLogEvent
  | ExecuteCompleteLogEvent
  | ExecuteUnsubscribeLogEvent
  | ExecuteNormalizeStart
  | ExecuteNormalizeEnd
  | StoreDataCheckerStartEvent
  | StoreDataCheckerEndEvent
  | StorePublishLogEvent
  | StoreSnapshotLogEvent
  | StoreLookupStartEvent
  | StoreLookupEndEvent
  | StoreRestoreLogEvent
  | StoreGcStartEvent
  | StoreGcInterruptedEvent
  | StoreGcEndEvent
  | StoreNotifyStartLogEvent
  | StoreNotifyCompleteLogEvent
  | StoreNotifySubscriptionLogEvent
  | EntrypointRootConsumeLogEvent
  | LiveResolverBatchStartLogEvent
  | LiveResolverBatchEndLogEvent
  | UseFragmentSubscriptionMissedUpdates;

export type LogFunction = LogEvent => void;
export type LogRequestInfoFunction = mixed => void;

/**
 * The public API of Relay core. Represents an encapsulated environment with its
 * own in-memory cache.
 */
export interface IEnvironment {
  /**
   * Extra information attached to the environment instance
   */
  +options: mixed;

  /**
   * **UNSTABLE** Event based logging API thats scoped to the environment.
   */
  __log: LogFunction;

  /**
   * Determine if the operation can be resolved with data in the store (i.e. no
   * fields are missing).
   *
   * Note that this operation effectively "executes" the selector against the
   * cache and therefore takes time proportional to the size/complexity of the
   * selector.
   */
  check(operation: OperationDescriptor): OperationAvailability;

  /**
   * Subscribe to changes to the results of a selector. The callback is called
   * when data has been committed to the store that would cause the results of
   * the snapshot's selector to change.
   */
  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable;

  /**
   * Ensure that all the records necessary to fulfill the given selector are
   * retained in-memory. The records will not be eligible for garbage collection
   * until the returned reference is disposed.
   */
  retain(operation: OperationDescriptor): Disposable;

  /**
   * Apply an optimistic update to the environment. The mutation can be reverted
   * by calling `dispose()` on the returned value.
   */
  applyUpdate(optimisticUpdate: OptimisticUpdateFunction): Disposable;

  /**
   * Revert updates for the `update` function.
   */
  revertUpdate(update: OptimisticUpdateFunction): void;

  /**
   * Revert updates for the `update` function, and apply the `replacement` update.
   */
  replaceUpdate(
    update: OptimisticUpdateFunction,
    replacement: OptimisticUpdateFunction,
  ): void;

  /**
   * Apply an optimistic mutation response and/or updater. The mutation can be
   * reverted by calling `dispose()` on the returned value.
   */
  applyMutation<TMutation: MutationParameters>(
    optimisticConfig: OptimisticResponseConfig<TMutation>,
  ): Disposable;

  /**
   * Commit an updater to the environment. This mutation cannot be reverted and
   * should therefore not be used for optimistic updates. This is mainly
   * intended for updating fields from client schema extensions.
   */
  commitUpdate(updater: StoreUpdater): void;

  /**
   * Commit a payload to the environment using the given operation selector.
   */
  commitPayload(
    operationDescriptor: OperationDescriptor,
    payload: PayloadData,
  ): void;

  /**
   * Returns the environment's Network.
   */
  getNetwork(): INetwork;

  /**
   * Returns the environment's Store.
   */
  getStore(): Store;

  /**
   * Returns the environment's OperationTracker.
   */
  getOperationTracker(): RelayOperationTracker;

  /**
   * Returns the environment's TaskScheduler if one has been configured.
   */
  getScheduler(): ?TaskScheduler;

  /**
   * EXPERIMENTAL
   * Returns the default render policy to use when rendering a query
   * that uses Relay Hooks.
   */
  UNSTABLE_getDefaultRenderPolicy(): RenderPolicy;

  /**
   * Read the results of a selector from in-memory records in the store.
   */
  lookup(selector: SingularReaderSelector): Snapshot;

  /**
   * Send a query to the server with Observer semantics: one or more
   * responses may be returned (via `next`) over time followed by either
   * the request completing (`completed`) or an error (`error`).
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.execute({...}).subscribe({...}).
   */
  execute(config: {
    operation: OperationDescriptor,
  }): RelayObservable<GraphQLResponse>;

  /**
   * Send a subscription to the server with Observer semantics: one or more
   * responses may be returned (via `next`) over time followed by either
   * the request completing (`completed`) or an error (`error`).
   *
   * Networks/servers that support subscriptions may choose to hold the
   * subscription open indefinitely such that `complete` is not called.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.executeSubscription({...}).subscribe({...}).
   */
  executeSubscription<TMutation: MutationParameters>(config: {
    operation: OperationDescriptor,
    updater?: ?SelectorStoreUpdater<TMutation['response']>,
  }): RelayObservable<GraphQLResponse>;

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
  executeMutation<TMutation: MutationParameters>(
    config: ExecuteMutationConfig<TMutation>,
  ): RelayObservable<GraphQLResponse>;

  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query or Subscription operation responses, the result of which is
   * then normalized and committed to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeWithSource({...}).subscribe({...}).
   */
  executeWithSource({
    operation: OperationDescriptor,
    source: RelayObservable<GraphQLResponse>,
  }): RelayObservable<GraphQLResponse>;

  /**
   * Returns true if a request is currently "active", meaning it's currently
   * actively receiving payloads or downloading modules, and has not received
   * a final payload yet. Note that a request might still be pending (or "in flight")
   * without actively receiving payload, for example a live query or an
   * active GraphQL subscription
   */
  isRequestActive(requestIdentifier: string): boolean;

  /**
   * Returns true if the environment is for use during server side rendering.
   * functions like getQueryResource key off of this in order to determine
   * whether we need to set up certain caches and timeout's.
   */
  isServer(): boolean;

  /**
   * Called by Relay when it encounters a missing field that has been annotated
   * with `@required(action: LOG)`.
   */
  relayFieldLogger: RelayFieldLogger;
}

/**
 * The partial shape of an object with a '...Fragment @module(name: "...")'
 * selection
 */
export type ModuleImportPointer = {
  +__fragmentPropName: ?string,
  +__module_component: mixed,
  +$fragmentSpreads: mixed,
  ...
};

/**
 * A set of DataIDs used to track which IDs a read() operation observed and which IDs
 * a publish operation updated.
 */
export type DataIDSet = Set<DataID>;

/**
 * A function that updates a store (via a proxy) given the results of a "handle"
 * field payload.
 */
export type Handler = $ReadOnly<{
  update: (store: RecordSourceProxy, fieldPayload: HandleFieldPayload) => void,
  ...
}>;

/**
 * A payload that is used to initialize or update a "handle" field with
 * information from the server.
 */
export type HandleFieldPayload = {
  // The arguments that were fetched.
  +args: Variables,
  // The __id of the record containing the source/handle field.
  +dataID: DataID,
  // The (storage) key at which the original server data was written.
  +fieldKey: string,
  // The name of the handle.
  +handle: string,
  // The (storage) key at which the handle's data should be written by the
  // handler.
  +handleKey: string,
  // The arguments applied to the handle
  +handleArgs: Variables,
};

/**
 * A payload that represents data necessary to process the results of an object
 * with a `@module` fragment spread:
 *
 * ## @module Fragment Spread
 * - args: Local arguments from the parent
 * - data: The GraphQL response value for the @match field.
 * - dataID: The ID of the store object linked to by the @match field.
 * - operationReference: A reference to a generated module containing the
 *   SplitOperation with which to normalize the field's `data`.
 * - variables: Query variables.
 * - typeName: the type that matched.
 *
 * The dataID, variables, and fragmentName can be used to create a Selector
 * which can in turn be used to normalize and publish the data. The dataID and
 * typeName can also be used to construct a root record for normalization.
 *
 */
export type ModuleImportPayload = {
  +kind: 'ModuleImportPayload',
  +args: ?$ReadOnlyArray<NormalizationArgument>,
  +data: PayloadData,
  +dataID: DataID,
  +operationReference: mixed,
  +path: $ReadOnlyArray<string>,
  +typeName: string,
  +variables: Variables,
  +actorIdentifier: ?ActorIdentifier,
};

/**
 * A payload that represents data necessary to process the results of an object
 * with experimental actor change directive.
 *
 * - data: The GraphQL response value for the actor change field.
 * - dataID: The ID of the store object linked to by the actor change field.
 * - node: NormalizationLinkedField, where the actor change directive is used
 * - path: to a field in the response
 * - variables: Query variables.
 * - typeName: the type that matched.
 *
 * The dataID, variables, and fragmentName can be used to create a Selector
 * which can in turn be used to normalize and publish the data. The dataID and
 * typeName can also be used to construct a root record for normalization.
 */
export type ActorPayload = {
  +kind: 'ActorPayload',
  +data: PayloadData,
  +dataID: DataID,
  +node: NormalizationLinkedField,
  +path: $ReadOnlyArray<string>,
  +typeName: string,
  +variables: Variables,
  +actorIdentifier: ActorIdentifier,
};

/**
 * Union type of possible payload followups we may handle during normalization.
 */
export type FollowupPayload = ModuleImportPayload | ActorPayload;

/**
 * Data emitted after processing a Defer or Stream node during normalization
 * that describes how to process the corresponding response chunk when it
 * arrives.
 */
export type DeferPlaceholder = {
  +kind: 'defer',
  +data: PayloadData,
  +label: string,
  +path: $ReadOnlyArray<string>,
  +selector: NormalizationSelector,
  +typeName: string,
  +actorIdentifier: ?ActorIdentifier,
};
export type StreamPlaceholder = {
  +kind: 'stream',
  +label: string,
  +path: $ReadOnlyArray<string>,
  +parentID: DataID,
  +node: NormalizationSelectableNode,
  +variables: Variables,
  +actorIdentifier: ?ActorIdentifier,
};
export type IncrementalDataPlaceholder = DeferPlaceholder | StreamPlaceholder;

export type NormalizeResponseFunction = (
  response: GraphQLResponseWithData,
  selector: NormalizationSelector,
  typeName: string,
  options: NormalizationOptions,
  useExecTimeResolvers: boolean,
) => RelayResponsePayload;

/**
 * A user-supplied object to load a generated operation (SplitOperation or
 * ConcreteRequest) AST by a module reference. The exact format of a module
 * reference is left to the application, but it must be a plain JavaScript value
 * (string, number, or object/array of same).
 */
export type OperationLoader = {
  /**
   * Synchronously load an operation, returning either the node or null if it
   * cannot be resolved synchronously.
   */
  get(reference: mixed): ?NormalizationRootNode,

  /**
   * Asynchronously load an operation.
   */
  load(reference: mixed): Promise<?NormalizationRootNode>,
};

/**
 * A function that receives a proxy over the store and may trigger side-effects
 * (indirectly) by calling `set*` methods on the store or its record proxies.
 */
export type StoreUpdater = (store: RecordSourceProxy) => void;

/**
 * Similar to StoreUpdater, but accepts a proxy tied to a specific selector in
 * order to easily access the root fields of a query/mutation as well as a
 * second argument of the response object of the mutation.
 */
export type SelectorStoreUpdater<-TMutationResponse> = (
  store: RecordSourceSelectorProxy,
  data: ?TMutationResponse,
) => void;

/**
 * A set of configs that can be used to apply an optimistic update into the
 * store.
 */
export type OptimisticUpdate<TMutation: MutationParameters> =
  | OptimisticUpdateFunction
  | OptimisticUpdateRelayPayload<TMutation>;

export type OptimisticUpdateFunction = {
  +storeUpdater: StoreUpdater,
};

export type OptimisticUpdateRelayPayload<TMutation: MutationParameters> = {
  +operation: OperationDescriptor,
  +payload: RelayResponsePayload,
  +updater: ?SelectorStoreUpdater<TMutation['response']>,
};

export type OptimisticResponseConfig<TMutation: MutationParameters> = {
  +operation: OperationDescriptor,
  +response: ?PayloadData,
  +updater: ?SelectorStoreUpdater<TMutation['response']>,
};

/**
 * A set of handlers that can be used to provide substitute data for missing
 * fields when reading a selector from a source.
 */
export type MissingFieldHandler =
  | {
      kind: 'scalar',
      handle: (
        field: NormalizationScalarField,
        parentRecord: ?ReadOnlyRecordProxy,
        args: Variables,
        store: ReadOnlyRecordSourceProxy,
      ) => mixed,
    }
  | {
      kind: 'linked',
      handle: (
        field: NormalizationLinkedField | ReaderLinkedField,
        parentRecord: ?ReadOnlyRecordProxy,
        args: Variables,
        store: ReadOnlyRecordSourceProxy,
      ) => ?DataID,
    }
  | {
      kind: 'pluralLinked',
      handle: (
        field: NormalizationLinkedField | ReaderLinkedField,
        parentRecord: ?ReadOnlyRecordProxy,
        args: Variables,
        store: ReadOnlyRecordSourceProxy,
      ) => ?Array<?DataID>,
    };

/**
 * Data which Relay expected to be in the store (because it was requested by
 * the parent query/mutation/subscription) was missing. This can happen due
 * to graph relationship changes observed by other queries/mutations, or
 * imperative updates that don't provide all needed data.
 *
 * https://relay.dev/docs/next/debugging/why-null/#graph-relationship-change
 *
 * In this case Relay will render with the referenced field as `undefined`.
 *
 * __NOTE__: This may break with the type contract of Relay's generated types.
 *
 * To turn this into a hard error for a given fragment/query, you can use
 * `@throwOnFieldError`.
 *
 * https://relay.dev/docs/next/guides/throw-on-field-error-directive/
 */
export type MissingExpectedDataLogEvent = {
  +kind: 'missing_expected_data.log',
  +owner: string,
  fieldPath: string, // Purposefully mutable to allow lazy construction in RelayReader
  // To populate this, you should pass the value to a ReactRelayLoggingContext
  +uiContext: mixed | void,
};

/**
 * Data which Relay expected to be in the store (because it was requested by
 * the parent query/mutation/subscription) was missing. This can happen due
 * to graph relationship changes observed by other queries/mutations, or
 * imperative updates that don't provide all needed data.
 *
 * https://relay.dev/docs/next/debugging/why-null/#graph-relationship-change
 *
 * This event is as `.throw` because the missing data was encountered in a
 * query/fragment/mutation with `@throwOnFieldError` `@throwOnFieldError`.
 *
 * https://relay.dev/docs/next/guides/throw-on-field-error-directive/
 *
 * Relay will throw immediately after logging this event. If you wish to
 * customize the error being thrown, you may throw your own error.
 *
 * *NOTE*: Only throw on this event if `handled` is false. Errors that have been
 * handled by a `@catch` directive or by making a resolver null will have
 * `handled: true` and should not trigger a throw.
 */
export type MissingExpectedDataThrowEvent = {
  +kind: 'missing_expected_data.throw',
  +owner: string,
  fieldPath: string, // Purposefully mutable to allow lazy construction in RelayReader
  +handled: boolean,
  // To populate this, you should pass the value to a ReactRelayLoggingContext
  +uiContext: mixed | void,
};

/**
 * A field was marked as @required(action: LOG) but was null or missing in the
 * store.
 */
export type MissingRequiredFieldLogEvent = {
  +kind: 'missing_required_field.log',
  +owner: string,
  fieldPath: string, // Purposefully mutable to allow lazy construction in RelayReader
  // To populate this, you should pass the value to a ReactRelayLoggingContext
  +uiContext: mixed | void,
};

/**
 * A field was marked as @required(action: THROW) but was null or missing in the
 * store.
 *
 * Relay will throw immediately after logging this event. If you wish to
 * customize the error being thrown, you may throw your own error.
 *
 * *NOTE*: Only throw on this event if `handled` is false. Errors that have been
 * handled by a `@catch` directive or by making a resolver null will have
 * `handled: true` and should not trigger a throw.
 */
export type MissingRequiredFieldThrowEvent = {
  +kind: 'missing_required_field.throw',
  +owner: string,
  fieldPath: string, // Purposefully mutable to allow lazy construction in RelayReader
  +handled: boolean,
  // To populate this, you should pass the value to a ReactRelayLoggingContext
  +uiContext: mixed | void,
};

/**
 * A Relay Resolver that is currently being read threw a JavaScript error when
 * it was last evaluated. By default, the value has been coerced to null and
 * passed to the product code.
 *
 * If `@throwOnFieldError` was used on the parent query/fragment/mutation, you
 * will also receive a TODO
 *
 * *NOTE*: Only throw on this event if `handled` is false. Errors that have been
 * handled by a `@catch` directive or by making a resolver null will have
 * `handled: true` and should not trigger a throw.
 */
export type RelayResolverErrorEvent = {
  +kind: 'relay_resolver.error',
  +owner: string,
  +fieldPath: string,
  +error: Error,
  +shouldThrow: boolean,
  +handled: boolean,
  // To populate this, you should pass the value to a ReactRelayLoggingContext
  +uiContext: mixed | void,
};

/**
 * A field being read by Relay was marked as being in an error state by the
 * GraphQL response.
 *
 * https://spec.graphql.org/October2021/#sec-Errors.Field-errors
 *
 * If the field's parent query/fragment/mutation was annotated with
 * `@throwOnFieldError` and no `@catch` directive was used to catch the error,
 * Relay will throw an error immediately after logging this event.
 *
 * https://relay.dev/docs/next/guides/catch-directive/
 * https://relay.dev/docs/next/guides/throw-on-field-error-directive/
 *
 * *NOTE*: Only throw on this event if `handled` is false. Errors that have been
 * handled by a `@catch` directive or by making a resolver null will have
 * `handled: true` and should not trigger a throw.
 */
export type RelayFieldPayloadErrorEvent = {
  +kind: 'relay_field_payload.error',
  +owner: string,
  +fieldPath: string,
  +error: TRelayFieldError,
  +shouldThrow: boolean,
  +handled: boolean,
  // To populate this, you should pass the value to a ReactRelayLoggingContext
  +uiContext: mixed | void,
};

/**
 * Union of all RelayFieldLoggerEvent types
 */
export type RelayFieldLoggerEvent =
  | MissingExpectedDataLogEvent
  | MissingExpectedDataThrowEvent
  | MissingRequiredFieldLogEvent
  | MissingRequiredFieldThrowEvent
  | RelayResolverErrorEvent
  | RelayFieldPayloadErrorEvent;

/**
 * A handler for events related to field errors.
 */
export type RelayFieldLogger = (event: RelayFieldLoggerEvent) => void;

/**
 * The results of normalizing a query.
 */
export type RelayResponsePayload = {
  +errors: ?Array<PayloadError>,
  +fieldPayloads: ?Array<HandleFieldPayload>,
  +incrementalPlaceholders: ?Array<IncrementalDataPlaceholder>,
  +followupPayloads: ?Array<FollowupPayload>,
  +source: MutableRecordSource,
  +isFinal: boolean,
};

/**
 * Configuration on the executeMutation(...).
 */
export type ExecuteMutationConfig<TMutation: MutationParameters> = {
  operation: OperationDescriptor,
  optimisticUpdater?: ?SelectorStoreUpdater<TMutation['response']>,
  optimisticResponse?: ?Object,
  updater?: ?SelectorStoreUpdater<TMutation['response']>,
  uploadables?: ?UploadableMap,
};

/**
 * Public interface for Publish Queue.
 */
export interface PublishQueue {
  /**
   * Schedule applying an optimistic updates on the next `run()`.
   */
  applyUpdate<TMutation: MutationParameters>(
    updater: OptimisticUpdate<TMutation>,
  ): void;

  /**
   * Schedule reverting an optimistic updates on the next `run()`.
   */
  revertUpdate<TMutation: MutationParameters>(
    updater: OptimisticUpdate<TMutation>,
  ): void;

  /**
   * Schedule a revert of all optimistic updates on the next `run()`.
   */
  revertAll(): void;

  /**
   * Schedule applying a payload to the store on the next `run()`.
   */
  commitPayload<TMutation: MutationParameters>(
    operation: OperationDescriptor,
    payload: RelayResponsePayload,
    updater?: ?SelectorStoreUpdater<TMutation['response']>,
  ): void;

  /**
   * Schedule an updater to mutate the store on the next `run()` typically to
   * update client schema fields.
   */
  commitUpdate(updater: StoreUpdater): void;

  /**
   * Schedule a publish to the store from the provided source on the next
   * `run()`. As an example, to update the store with substituted fields that
   * are missing in the store.
   */
  commitSource(source: RecordSource): void;

  /**
   * Execute all queued up operations from the other public methods.
   * Optionally provide an OperationDescriptor indicating the source operation
   * that was being processed to produce this run.
   */
  run(sourceOperation?: OperationDescriptor): $ReadOnlyArray<RequestDescriptor>;
}

/**
 * The return type of a client edge resolver pointing to a concrete type.
 * T can be overridden to be more specific than a DataID, e.g. if the IDs
 * can only come from a given set.
 */
export type ConcreteClientEdgeResolverReturnType<T = any> = {
  +id: T & DataID,
};

/**
 * The return type of a Live Resolver. Models an external value which can
 * be read lazily and which might change over time. The subscribe method
 * returns a callback which should be called when the value _may_ have changed.
 *
 * While over-notification (subscription notifications when the read value has
 * not actually changed) is supported, for performance reasons, it is recommended
 * that the provider of the LiveState value confirms that the value has indeed
 * change before notifying Relay of the change.
 */
export type LiveState<+T> = {
  /**
   * Returns the current value of the live state.
   */
  read(): T,
  /**
   * Subscribes to changes in the live state. The state provider should
   * call the callback when the value of the live state changes.
   */
  subscribe(cb: () => void): () => void,
};

/**
 * Context that will be provided to live resolvers if
 * `resolverContext` is set on the Relay Store.
 * This context will be passed as the third argument to the live resolver
 */
export type ResolverContext = mixed;
