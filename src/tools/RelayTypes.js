/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayTypes
 * @flow
 * @typechecks
 */

'use strict';

/**
 * Types that Relay framework users may find useful.
 */
import type URI from 'URI';
import type {
  DataID,
  FieldValue,
  Record,
  Records,
  RootCallMap
} from 'RelayInternalTypes';
import type RelayFragmentReference from 'RelayFragmentReference';
import type RelayMetaRoute from 'RelayMetaRoute';
import type RelayMutationTransaction from 'RelayMutationTransaction';
import type {RelayConcreteNode} from 'RelayQL';

// Routes and variables
export type Variables = {[name: string]: mixed};

// Ready state
export type ComponentReadyState = {
  aborted: boolean;
  done: boolean;
  error: ?Error;
  mounted: boolean;
  ready: boolean;
  stale: boolean;
};
export type ComponentReadyStateChangeCallback =
  (readyState: ComponentReadyState) => void;

export type ComponentFetchState = {
  done: boolean;
  stale: boolean;
};

export type ReadyState = {
  aborted: boolean;
  done: boolean;
  error: ?Error;
  ready: boolean;
  stale: boolean;
};
export type ReadyStateChangeCallback = (readyState: ReadyState) => void;

// Containers
export type RelayContainer = ReactClass<any, any, any>;

export type RelayProp = {
  forceFetch: (
    partialVariables?: ?Variables,
    callback?: ?ComponentReadyStateChangeCallback
  ) => void,
  getFragmentError: (
    fragmentReference: RelayFragmentReference,
    record: Object
  ) => ?Error,
  getPendingTransactions: (record: Object) => ?Array<RelayMutationTransaction>,
  hasFragmentData: (
    fragmentReference: RelayFragmentReference,
    record: Object
  ) => boolean,
  hasOptimisticUpdate: (
    record: Object
  ) => boolean,
  route: RelayMetaRoute,
  setVariables: (
    partialVariables?: ?Variables,
    callback?: ?ComponentReadyStateChangeCallback
  ) => void,
  variables: Variables,
};

// Mutations
export type RelayMutationTransactionCommitFailureCallback = (
  transaction: RelayMutationTransaction,
  preventAutoRollback: () => void,
) => void;
export type RelayMutationTransactionCommitSuccessCallback = (
  response: {[key: string]: Object}
) => void;
export type RelayMutationTransactionCommitCallbacks = {
  onFailure?: ?RelayMutationTransactionCommitFailureCallback;
  onSuccess?: ?RelayMutationTransactionCommitSuccessCallback;
};
export type RelayMutationConfig = {
  type: 'FIELDS_CHANGE',
  fieldIDs: {[fieldName: string]: DataID | Array<DataID>},
} | {
  type: 'RANGE_ADD',
  parentName: string,
  parentID: string,
  connectionName: string,
  edgeName: string,
  // from GraphQLMutatorConstants.RANGE_OPERATIONS
  rangeBehaviors: {[call: string]: 'append' | 'prepend' | 'remove'},
} | {
  type: 'NODE_DELETE',
  parentName: string;
  parentID: string;
  connectionName: string;
  deletedIDFieldName: string;
} | {
  type: 'RANGE_DELETE';
  parentName: string;
  parentID: string;
  connectionName: string;
  deletedIDFieldName: string;
  pathToConnection: Array<string>;
} | {
  type: 'REQUIRED_CHILDREN',
  children: Array<RelayConcreteNode>,
};

// Observable
export type Observable<T> = {
  subscribe: (callbacks: SubscriptionCallbacks<T>) => Subscription;
};

export type MultiObservable<T> = {
  subscribe: (callbacks: SubscriptionCallbacks<Array<T>>) => Subscription;
  setDataIDs: (dataIDs: Array<DataID>) => void;
};

export type Subscription = {
  dispose(): void;
};

export type SubscriptionCallbacks<T> = {
  onNext: ((value: T) => void);
  onError?: ((error: Error) => void);
  onCompleted?: (() => void);
};

// Store
export type StoreReaderData = Object;
export type StoreReaderOptions = {
  traverseFragmentReferences?: boolean;
  traverseGeneratedFields?: boolean;
};

// Disk Cache
export type CacheManager = {
  clear: () => void;
  getMutationWriter: () => CacheWriter;
  getQueryWriter: () => CacheWriter;
  readAllData: (
    cachedRecords: Records,
    rootCallData: RootCallMap,
    callback: Function
  ) => void;
  readNode: (
    id: DataID,
    callback: (error: any, value: any) => void
  ) => void;
   readRootCall: (
    callName: string,
    callValue: string,
    callback: (error: any, value: any) => void
  ) => void;
};

export type CacheReadCallbacks = {
  onSuccess?: () => void;
  onFailure?: () => void;
};

export type CacheWriter = {
  writeField: (
    dataID: DataID,
    field: string,
    value: ?FieldValue,
    typeName: ?string
  ) => void;
  writeNode: (dataID: DataID, record: ?Record) => void;
  writeRootCall: (
    storageKey: string,
    identifyingArgValue: string,
    dataID: DataID
  ) => void;
};

// Network requests
export type RequestOptions = {
  data?: ?{[key: string]: mixed};
  errorHandler?: ?(error: XHRErrorData) => void;
  headers?: ?{[key: string]: string};
  method: string;
  rawData?: mixed;
  responseHandler?: ?(
    responseText: string,
    responseHeaders: ?string,
    isComplete: boolean
  ) => void;
  timeout?: ?number;
  timeoutHandler?: ?() => void;
  transportBuilder?: any;
  uri: URI;
};
type XHRErrorData = {
  errorCode: ?string;
  errorMsg: ?string;
  errorType: ?string;
};
export type MutationResult = {
  response: Object;
};
export type QueryResult = {
  error?: ?Error;
  ref_params?: ?{[name: string]: mixed};
  response: Object;
};

// Utility
export type Abortable = {
  abort: () => void;
};
