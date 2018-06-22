/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {
  ExecutePayload,
  PayloadError,
  UploadableMap,
} from '../network/RelayNetworkTypes';
import type {PayloadData} from '../network/RelayNetworkTypes';
import type RelayObservable from '../network/RelayObservable';
import type {GraphQLTaggedNode} from '../query/RelayModernGraphQLTag';
import type {
  ConcreteScalarField,
  ConcreteLinkedField,
  ConcreteFragment,
  ConcreteSelectableNode,
  RequestNode,
  ConcreteOperation,
} from '../util/RelayConcreteNode';
import type {DataID, Disposable, Variables} from '../util/RelayRuntimeTypes';
import type {RecordState} from './RelayRecordState';
import type {
  CEnvironment,
  CFragmentMap,
  COperationSelector,
  CRelayContext,
  CSelector,
  CSnapshot,
  CUnstableEnvironmentCore,
  Record,
} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';

// eslint-disable-next-line no-undef
export opaque type FragmentReference = empty;

type TEnvironment = Environment;
type TFragment = ConcreteFragment;
type TGraphQLTaggedNode = GraphQLTaggedNode;
type TNode = ConcreteSelectableNode;
type TPayload = ExecutePayload;
type TRequest = RequestNode;
type TOperation = ConcreteOperation;

export type FragmentMap = CFragmentMap<TFragment>;
export type OperationSelector = COperationSelector<TNode, TRequest>;
export type RelayContext = CRelayContext<TEnvironment>;
export type Selector = CSelector<TNode>;
export type Snapshot = CSnapshot<TNode>;
export type UnstableEnvironmentCore = CUnstableEnvironmentCore<
  TEnvironment,
  TFragment,
  TGraphQLTaggedNode,
  TNode,
  TRequest,
  TOperation,
>;

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
  check(selector: Selector): boolean;

  /**
   * Read the results of a selector from in-memory records in the store.
   */
  lookup(selector: Selector): Snapshot;

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
  retain(selector: Selector): Disposable;

  /**
   * Subscribe to changes to the results of a selector. The callback is called
   * when `notify()` is called *and* records have been published that affect the
   * selector results relative to the last `notify()`.
   */
  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable;
}

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
    TNode,
    TRequest,
    TPayload,
    TOperation,
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
    operationSelector: OperationSelector,
    payload: PayloadData,
  ): void;

  /**
   * Get the environment's internal Store.
   */
  getStore(): Store;

  /**
   * Returns an Observable of ExecutePayload resulting from executing the
   * provided Mutation operation, the result of which is then normalized and
   * committed to the publish queue along with an optional optimistic response
   * or updater.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeMutation({...}).subscribe({...}).
   */
  executeMutation({|
    operation: OperationSelector,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: ?Object,
    updater?: ?SelectorStoreUpdater,
    uploadables?: ?UploadableMap,
  |}): RelayObservable<ExecutePayload>;

  /**
   * Checks if the environment is waiting for a response from the network for
   * a deferred fragment.
   */
  isSelectorLoading(selector: Selector): boolean;
}

/**
 * The results of reading data for a fragment. This is similar to a `Selector`,
 * but references the (fragment) node by name rather than by value.
 */
export type FragmentPointer = {
  __id: DataID,
  __fragments: {[fragmentName: string]: Variables},
};

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
export type HandleFieldPayload = $Exact<{
  // The arguments that were fetched.
  args: Variables,
  // The __id of the record containing the source/handle field.
  dataID: DataID,
  // The (storage) key at which the original server data was written.
  fieldKey: string,
  // The name of the handle.
  handle: string,
  // The (storage) key at which the handle's data should be written by the
  // handler.
  handleKey: string,
}>;

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
      operation: OperationSelector,
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
        field: ConcreteScalarField,
        record: ?Record,
        args: Variables,
      ) => mixed,
    }
  | {
      kind: 'linked',
      handle: (
        field: ConcreteLinkedField,
        record: ?Record,
        args: Variables,
      ) => ?DataID,
    }
  | {
      kind: 'pluralLinked',
      handle: (
        field: ConcreteLinkedField,
        record: ?Record,
        args: Variables,
      ) => ?Array<?DataID>,
    };

/**
 * The shape of data that is returned by normalizePayload for a given query.
 */
export type RelayResponsePayload = {|
  fieldPayloads?: ?Array<HandleFieldPayload>,
  deferrableSelections?: ?DeferrableSelections,
  source: MutableRecordSource,
  errors: ?Array<PayloadError>,
|};

export type DeferrableSelections = Set<string>;
