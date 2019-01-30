/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {
  GraphQLResponse,
  PayloadError,
  UploadableMap,
} from '../network/RelayNetworkTypes';
import type {PayloadData} from '../network/RelayNetworkTypes';
import type RelayObservable from '../network/RelayObservable';
import type {GraphQLTaggedNode} from '../query/RelayModernGraphQLTag';
import type {
  NormalizationScalarField,
  NormalizationLinkedField,
  NormalizationSelectableNode,
  NormalizationSplitOperation,
} from '../util/NormalizationNode';
import type {ReaderFragment} from '../util/ReaderNode';
import type {ReaderSelectableNode} from '../util/ReaderNode';
import type {
  CEnvironment,
  CFragmentMap,
  CFragmentSpecResolver,
  COperationDescriptor,
  CRelayContext,
  CReaderSelector,
  CNormalizationSelector,
  CSnapshot,
  CUnstableEnvironmentCore,
  Record,
} from '../util/RelayCombinedEnvironmentTypes';
import type {ConcreteRequest} from '../util/RelayConcreteNode';
import type {DataID, Disposable, Variables} from '../util/RelayRuntimeTypes';
import type {RecordState} from './RelayRecordState';

export type {SelectorData} from '../util/RelayCombinedEnvironmentTypes';

export opaque type FragmentReference = empty;

type TEnvironment = Environment;
type TFragment = ReaderFragment;
type TGraphQLTaggedNode = GraphQLTaggedNode;
type TReaderNode = ReaderSelectableNode;
type TNormalizationNode = NormalizationSelectableNode;
type TPayload = GraphQLResponse;
type TRequest = ConcreteRequest;
type TReaderSelector = OwnedReaderSelector;

export type FragmentMap = CFragmentMap<TFragment>;

export type OperationDescriptor = COperationDescriptor<
  TReaderNode,
  TNormalizationNode,
  TRequest,
>;

export type RelayContext = CRelayContext<TEnvironment>;
export type ReaderSelector = CReaderSelector<TReaderNode>;
export type OwnedReaderSelector = {|
  owner: OperationDescriptor | null,
  selector: ReaderSelector,
|};
export type NormalizationSelector = CNormalizationSelector<TNormalizationNode>;
export type Snapshot = CSnapshot<TReaderNode, OperationDescriptor>;
export type UnstableEnvironmentCore = CUnstableEnvironmentCore<
  TEnvironment,
  TFragment,
  TGraphQLTaggedNode,
  TReaderNode,
  TNormalizationNode,
  TRequest,
  TReaderSelector,
>;

export interface FragmentSpecResolver extends CFragmentSpecResolver<TRequest> {}

/**
 * A read-only interface for accessing cached graph data.
 */
export interface RecordSource {
  get(dataID: DataID): ?Record;
  getRecordIDs(): Array<DataID>;
  getStatus(dataID: DataID): RecordState;
  has(dataID: DataID): boolean;
  load(
    dataID: DataID,
    callback: (error: ?Error, record: ?Record) => void,
  ): void;
  size(): number;
}

/**
 * A read/write interface for accessing and updating graph data.
 */
export interface MutableRecordSource extends RecordSource {
  clear(): void;
  delete(dataID: DataID): void;
  remove(dataID: DataID): void;
  set(dataID: DataID, record: Record): void;
}

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
   * Determine if the selector can be resolved with data in the store (i.e. no
   * fields are missing).
   */
  check(selector: NormalizationSelector): boolean;

  /**
   * Read the results of a selector from in-memory records in the store.
   * Optionally takes an owner, corresponding to the operation that
   * owns this selector (fragment).
   */
  lookup(selector: ReaderSelector, owner?: ?OperationDescriptor): Snapshot;

  /**
   * Notify subscribers (see `subscribe`) of any data that was published
   * (`publish()`) since the last time `notify` was called.
   */
  notify(): void;

  /**
   * Publish new information (e.g. from the network) to the store, updating its
   * internal record source. Subscribers are not immediately notified - this
   * occurs when `notify()` is called.
   */
  publish(source: RecordSource): void;

  /**
   * Ensure that all the records necessary to fulfill the given selector are
   * retained in-memory. The records will not be eligible for garbage collection
   * until the returned reference is disposed.
   */
  retain(selector: NormalizationSelector): Disposable;

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
}

/**
 * A type that accepts a callback and schedules it to run at some future time.
 * By convention, implementations should not execute the callback immediately.
 */
export type Scheduler = (() => void) => void;

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
  setLinkedRecord(
    record: RecordProxy,
    name: string,
    args?: ?Variables,
  ): RecordProxy;
  setLinkedRecords(
    records: Array<?RecordProxy>,
    name: string,
    args?: ?Variables,
  ): RecordProxy;
  setValue(value: mixed, name: string, args?: ?Variables): RecordProxy;
}

export interface ReadOnlyRecordProxy {
  getDataID(): DataID;
  getLinkedRecord(name: string, args?: ?Variables): ?RecordProxy;
  getLinkedRecords(name: string, args?: ?Variables): ?Array<?RecordProxy>;
  getType(): string;
  getValue(name: string, args?: ?Variables): mixed;
}

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
}

export interface ReadOnlyRecordSourceProxy {
  get(dataID: DataID): ?ReadOnlyRecordProxy;
  getRoot(): ReadOnlyRecordProxy;
}

/**
 * Extends the RecordSourceProxy interface with methods for accessing the root
 * fields of a Selector.
 */
export interface RecordSourceSelectorProxy {
  create(dataID: DataID, typeName: string): RecordProxy;
  delete(dataID: DataID): void;
  get(dataID: DataID): ?RecordProxy;
  getRoot(): RecordProxy;
  getRootField(fieldName: string): ?RecordProxy;
  getPluralRootField(fieldName: string): ?Array<?RecordProxy>;
}

/**
 * The public API of Relay core. Represents an encapsulated environment with its
 * own in-memory cache.
 */
export interface Environment
  extends CEnvironment<
    TEnvironment,
    TFragment,
    TGraphQLTaggedNode,
    TReaderNode,
    TNormalizationNode,
    TRequest,
    TPayload,
    TReaderSelector,
  > {
  /**
   * Apply an optimistic update to the environment. The mutation can be reverted
   * by calling `dispose()` on the returned value.
   */
  applyUpdate(optimisticUpdate: OptimisticUpdate): Disposable;

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
   * Get the environment's internal Store.
   */
  getStore(): Store;

  /**
   * Read the results of a selector from in-memory records in the store.
   * Optionally takes an owner, corresponding to the operation that
   * owns this selector (fragment).
   */
  lookup(
    selector: ReaderSelector,
    owner?: ?OperationDescriptor,
  ): CSnapshot<TReaderNode, OperationDescriptor>;

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
  executeMutation({|
    operation: OperationDescriptor,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: ?Object,
    updater?: ?SelectorStoreUpdater,
    uploadables?: ?UploadableMap,
  |}): RelayObservable<GraphQLResponse>;
}

/**
 * The results of reading data for a fragment. This is similar to a `Selector`,
 * but references the (fragment) node by name rather than by value.
 */
export type FragmentPointer = {
  __id: DataID,
  __fragments: {[fragmentName: string]: Variables},
  __fragmentOwner: OperationDescriptor | null,
};

/**
 * The results of reading a field that was marked with a @match directive
 */
export type MatchPointer = {|
  __id: DataID,
  __fragments: {[fragmentName: string]: Variables},
  __fragmentOwner: OperationDescriptor | null,
  __fragmentPropName: string,
  __module: mixed,
|};

/**
 * A callback for resolving a Selector from a source.
 */
export type AsyncLoadCallback = (loadingState: LoadingState) => void;
export type LoadingState = $Exact<{
  status: 'aborted' | 'complete' | 'error' | 'missing',
  error?: Error,
}>;

/**
 * A map of records affected by an update operation.
 */
export type UpdatedRecords = {[dataID: DataID]: boolean};

/**
 * A function that updates a store (via a proxy) given the results of a "handle"
 * field payload.
 */
export type Handler = {
  update: (store: RecordSourceProxy, fieldPayload: HandleFieldPayload) => void,
};

/**
 * A payload that is used to initialize or update a "handle" field with
 * information from the server.
 */
export type HandleFieldPayload = {|
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
|};

/**
 * A payload that represents data necessary to process the results of a `@match`
 * directive:
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
 */
export type MatchFieldPayload = {|
  +data: PayloadData,
  +dataID: DataID,
  +operationReference: mixed,
  +path: $ReadOnlyArray<string>,
  +typeName: string,
  +variables: Variables,
|};

/**
 * Data emitted after processing a Defer or Stream node during normalization
 * that describes how to process the corresponding response chunk when it
 * arrives.
 */
export type DeferPlaceholder = {|
  +kind: 'defer',
  +label: string,
  +path: $ReadOnlyArray<string>,
  +selector: NormalizationSelector,
  +typeName: string,
|};
export type StreamPlaceholder = {|
  +kind: 'stream',
  +label: string,
  +path: $ReadOnlyArray<string>,
  +selector: NormalizationSelector,
  +typeName: string,
|};
export type IncrementalDataPlaceholder = DeferPlaceholder | StreamPlaceholder;

/**
 * A user-supplied object to load a generated operation (SplitOperation) AST
 * by a module reference. The exact format of a module reference is left to
 * the application, but it must be a plain JavaScript value (string, number,
 * or object/array of same).
 */
export type OperationLoader = {|
  /**
   * Synchronously load an operation, returning either the node or null if it
   * cannot be resolved synchronously.
   */
  get(reference: mixed): ?NormalizationSplitOperation,

  /**
   * Asynchronously load an operation.
   */
  load(reference: mixed): Promise<?NormalizationSplitOperation>,
|};

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
export type SelectorStoreUpdater = (
  store: RecordSourceSelectorProxy,
  // Actually RelayCombinedEnvironmentTypes#SelectorData, but mixed is
  // inconvenient to access deeply in product code.
  data: $FlowFixMe,
) => void;

/**
 * A set of configs that can be used to apply an optimistic update into the
 * store.
 * TODO: we should probably only expose `storeUpdater` and `source` to the
 * publish queue.
 */
export type OptimisticUpdate =
  | {|
      storeUpdater: StoreUpdater,
    |}
  | {|
      selectorStoreUpdater: ?SelectorStoreUpdater,
      operation: OperationDescriptor,
      response: ?Object,
    |}
  | {|
      source: RecordSource,
      fieldPayloads?: ?Array<HandleFieldPayload>,
    |};

/**
 * A set of handlers that can be used to provide substitute data for missing
 * fields when reading a selector from a source.
 */
export type MissingFieldHandler =
  | {
      kind: 'scalar',
      handle: (
        field: NormalizationScalarField,
        record: ?Record,
        args: Variables,
        store: ReadOnlyRecordSourceProxy,
      ) => mixed,
    }
  | {
      kind: 'linked',
      handle: (
        field: NormalizationLinkedField,
        record: ?Record,
        args: Variables,
        store: ReadOnlyRecordSourceProxy,
      ) => ?DataID,
    }
  | {
      kind: 'pluralLinked',
      handle: (
        field: NormalizationLinkedField,
        record: ?Record,
        args: Variables,
        store: ReadOnlyRecordSourceProxy,
      ) => ?Array<?DataID>,
    };

/**
 * The results of normalizing a query.
 */
export type RelayResponsePayload = {|
  incrementalPlaceholders: ?Array<IncrementalDataPlaceholder>,
  fieldPayloads: ?Array<HandleFieldPayload>,
  matchPayloads: ?Array<MatchFieldPayload>,
  source: MutableRecordSource,
  errors: ?Array<PayloadError>,
|};
