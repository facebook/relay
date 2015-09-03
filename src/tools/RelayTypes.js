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
import type {DataID} from 'RelayInternalTypes';
import type RelayMutationTransaction from 'RelayMutationTransaction';

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

// Mutations
export type RelayMutationTransactionCommitFailureCallback = (
  transaction: RelayMutationTransaction,
  preventAutoRollback: () => void,
) => void;
export type RelayMutationTransactionCommitSuccessCallback = (
  response: {[key: string]: {[key: string]: mixed}}
) => void;
export type RelayMutationTransactionCommitCallbacks = {
  onFailure?: ?RelayMutationTransactionCommitFailureCallback;
  onSuccess?: ?RelayMutationTransactionCommitSuccessCallback;
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
  onError: ((error: Error) => void);
  onCompleted: (() => void);
};

// Store
export type StoreReaderData = Object;
export type StoreReaderOptions = {
  traverseFragmentReferences?: boolean;
  traverseGeneratedFields?: boolean;
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
