/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayTypes
 * @flow
 * @format
 */

'use strict';

/**
 * Types that Relay framework users may find useful.
 */
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
import type RelayFragmentReference from 'RelayFragmentReference';
import type {
  DataID,
  FieldValue,
  RangeBehaviors,
  QueryPayload,
} from 'RelayInternalTypes';
import type RelayMutation from 'RelayMutation';
import type RelayMutationRequest from 'RelayMutationRequest';
import type RelayMutationTransaction from 'RelayMutationTransaction';
import type {RelayConcreteNode} from 'RelayQL';
import type {RelayQueryConfigInterface} from 'RelayQueryConfig';
import type RelayQueryRequest from 'RelayQueryRequest';
import type {Record} from 'RelayRecord';
import type URI from 'URI';

type RelayContainerErrorEventType =
  | 'CACHE_RESTORE_FAILED'
  | 'NETWORK_QUERY_ERROR';
type RelayContainerLoadingEventType =
  | 'ABORT'
  | 'CACHE_RESTORED_REQUIRED'
  | 'CACHE_RESTORE_START'
  | 'NETWORK_QUERY_RECEIVED_ALL'
  | 'NETWORK_QUERY_RECEIVED_REQUIRED'
  | 'NETWORK_QUERY_START'
  | 'STORE_FOUND_ALL'
  | 'STORE_FOUND_REQUIRED';
type XHRErrorData = {
  errorCode: ?string,
  errorMsg: ?string,
  errorType: ?string,
};

// Utility
export type Abortable = {
  abort(): void,
};
// Disk Cache
export type CacheManager = {
  clear(): void,
  getMutationWriter(): CacheWriter,
  getQueryWriter(): CacheWriter,
  readNode(id: DataID, callback: (error: any, value: any) => void): void,
  readRootCall(
    callName: string,
    callValue: string,
    callback: (error: any, value: any) => void,
  ): void,
};
export type CacheProcessorCallbacks = {
  +onSuccess?: () => void,
  +onFailure?: (error: mixed) => void,
};
export type CacheWriter = {
  writeField(
    dataID: DataID,
    field: string,
    value: ?FieldValue,
    typeName: ?string,
  ): void,
  writeNode(dataID: DataID, record: ?Record): void,
  writeRootCall(
    storageKey: string,
    identifyingArgValue: string,
    dataID: DataID,
  ): void,
};
// Store Change Emitter
export type ChangeSubscription = {
  remove(): void,
};
export type ComponentFetchState = {
  done: boolean,
  stale: boolean,
};
// Ready State
export type ComponentReadyState = {
  aborted: boolean,
  done: boolean,
  error: ?Error,
  events: Array<ReadyStateEvent>,
  mounted: boolean,
  ready: boolean,
  stale: boolean,
};
export type ComponentReadyStateChangeCallback = (
  readyState: ComponentReadyState,
) => void;
export type MultiObservable<T> = {
  subscribe(callbacks: SubscriptionCallbacks<Array<T>>): Subscription,
  setDataIDs(dataIDs: Array<DataID>): void,
};
export type MutationResult = {
  response: QueryPayload,
};
// Network requests
export type NetworkLayer = {
  sendMutation(request: RelayMutationRequest): ?Promise<any>,
  sendQueries(requests: Array<RelayQueryRequest>): ?Promise<any>,
  supports(...options: Array<string>): boolean,
};
// Observable
export type Observable<T> = {
  subscribe(callbacks: SubscriptionCallbacks<T>): Subscription,
};
export type QueryResult = {
  error?: ?Error,
  ref_params?: ?{[name: string]: mixed},
  response: QueryPayload,
};
export type ReadyState = {
  aborted: boolean,
  done: boolean,
  error: ?Error,
  events: Array<ReadyStateEvent>,
  ready: boolean,
  stale: boolean,
};
export type ReadyStateChangeCallback = (readyState: ReadyState) => void;
export type ReadyStateEvent = {
  type: RelayContainerLoadingEventType | RelayContainerErrorEventType,
  error?: Error,
};
// Containers
export type RelayContainer = ReactClass<any>;
export type RelayMutationConfig =
  | {
      type: 'FIELDS_CHANGE',
      fieldIDs: {[fieldName: string]: DataID | Array<DataID>},
    }
  | {
      type: 'RANGE_ADD',
      parentName?: string,
      parentID?: string,
      connectionInfo?: Array<{
        key: string,
        filters?: Variables,
        rangeBehavior: string,
      }>,
      connectionName?: string,
      edgeName: string,
      rangeBehaviors?: RangeBehaviors,
    }
  | {
      type: 'NODE_DELETE',
      parentName?: string,
      parentID?: string,
      connectionName?: string,
      deletedIDFieldName: string,
    }
  | {
      type: 'RANGE_DELETE',
      parentName?: string,
      parentID?: string,
      connectionKeys?: Array<{
        key: string,
        filters?: Variables,
      }>,
      connectionName?: string,
      deletedIDFieldName: string | Array<string>,
      pathToConnection: Array<string>,
    }
  | {
      type: 'REQUIRED_CHILDREN',
      children: Array<RelayConcreteNode>,
    };
export type RelayMutationTransactionCommitCallbacks = {
  onFailure?: ?RelayMutationTransactionCommitFailureCallback,
  onSuccess?: ?RelayMutationTransactionCommitSuccessCallback,
};
// Mutations
export type RelayMutationTransactionCommitFailureCallback = (
  transaction: RelayMutationTransaction,
  preventAutoRollback: () => void,
) => void;
export type RelayMutationTransactionCommitSuccessCallback = (response: {
  [key: string]: Object,
}) => void;
export type RelayProp = {
  applyUpdate: (
    mutation: RelayMutation<any>,
    callbacks?: RelayMutationTransactionCommitCallbacks,
  ) => RelayMutationTransaction,
  commitUpdate: (
    mutation: RelayMutation<any>,
    callbacks?: RelayMutationTransactionCommitCallbacks,
  ) => RelayMutationTransaction,
  environment: RelayEnvironmentInterface,
  forceFetch: (
    partialVariables?: ?Variables,
    callback?: ?ComponentReadyStateChangeCallback,
  ) => void,
  getPendingTransactions(record: Object): ?Array<RelayMutationTransaction>,
  hasFragmentData: (
    fragmentReference: RelayFragmentReference,
    record: Object,
  ) => boolean,
  hasOptimisticUpdate: (record: Object) => boolean,
  hasPartialData: (record: Object) => boolean,
  pendingVariables: ?Variables,
  route: RelayQueryConfigInterface,
  setVariables: (
    partialVariables?: ?Variables,
    callback?: ?ComponentReadyStateChangeCallback,
  ) => void,
  variables: Variables,
};
export type RequestOptions = {
  data?: ?{[key: string]: mixed},
  errorHandler?: ?(error: XHRErrorData) => void,
  headers?: ?{[key: string]: string},
  method: string,
  rawData?: mixed,
  responseHandler?: ?(
    responseText: string,
    responseHeaders: ?string,
    isComplete: boolean,
  ) => void,
  timeout?: ?number,
  timeoutHandler?: ?() => void,
  transportBuilder?: any,
  uri: URI,
};
// Store
export type StoreReaderData = Object;
export type StoreReaderOptions = {
  traverseFragmentReferences?: boolean,
  traverseGeneratedFields?: boolean,
};
export type Subscription = {
  dispose(): void,
};
export type SubscriptionCallbacks<T> = {
  onNext(value: T): void,
  onError(error: Error): void,
  onCompleted(): void,
};
// Variables
export type Variables = {[name: string]: $FlowFixMe};
