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

import type {ConcreteOperation, RequestNode} from '../util/RelayConcreteNode';
import type {
  CacheConfig,
  Disposable,
  Variables,
} from '../util/RelayRuntimeTypes';
import type RelayObservable, {ObservableFromValue} from './RelayObservable';

/**
 * An interface for fetching the data for one or more (possibly interdependent)
 * queries.
 */
export type Network = {|
  execute: ExecuteFunction,
|};

export type PayloadData = {[key: string]: mixed};

export type PayloadError = {
  message: string,
  locations?: Array<{
    line: number,
    column: number,
  }>,
};

/**
 * The shape of a GraphQL response as dictated by the
 * [spec](http://facebook.github.io/graphql/#sec-Response)
 */
export type GraphQLResponse =
  | {
      data: PayloadData,
      errors?: Array<PayloadError>,
    }
  | {
      data?: ?PayloadData,
      errors: Array<PayloadError>,
    };

/**
 * The data returned from Relay's execute function, which includes both the
 * raw GraphQL network response as well as any related client metadata.
 */
export type ExecutePayload = {|
  // The operation executed
  operation: ConcreteOperation,
  // The variables which were used during this execution.
  variables: Variables,
  // The response from GraphQL execution
  response: GraphQLResponse,
  // Default is false
  isOptimistic?: boolean,
|};

/**
 * A function that returns an Observable representing the response of executing
 * a GraphQL operation.
 */
export type ExecuteFunction = (
  request: RequestNode,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: ?UploadableMap,
) => RelayObservable<ExecutePayload>;

/**
 * A function that executes a GraphQL operation with request/response semantics.
 *
 * May return an Observable or Promise of a plain GraphQL server response, or
 * a composed ExecutePayload object supporting additional metadata.
 */
export type FetchFunction = (
  request: RequestNode,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables: ?UploadableMap,
) => ObservableFromValue<ExecutePayload> | ObservableFromValue<GraphQLResponse>;

/**
 * A function that executes a GraphQL subscription operation, returning one or
 * more raw server responses over time.
 *
 * May return an Observable, otherwise must call the callbacks found in the
 * fourth parameter.
 */
export type SubscribeFunction = (
  request: RequestNode,
  variables: Variables,
  cacheConfig: CacheConfig,
  observer?: LegacyObserver<GraphQLResponse>,
) =>
  | RelayObservable<ExecutePayload>
  | RelayObservable<GraphQLResponse>
  | Disposable;

// $FlowFixMe this is compatible with classic api see D4658012
export type Uploadable = File | Blob;
// $FlowFixMe this is compatible with classic api see D4658012
export type UploadableMap = {[key: string]: Uploadable};

// Supports legacy SubscribeFunction definitions. Do not use in new code.
export type LegacyObserver<-T> = {|
  +onCompleted?: ?() => void,
  +onError?: ?(error: Error) => void,
  +onNext?: ?(data: T) => void,
|};
