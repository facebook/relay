/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {ConcreteRequest} from '../util/RelayConcreteNode';
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
  severity?: 'CRITICAL' | 'ERROR' | 'WARNING', // Not officially part of the spec, but used at Facebook
};

export type PayloadExtensions = {[key: string]: mixed};

/**
 * The shape of a GraphQL response as dictated by the
 * [spec](http://facebook.github.io/graphql/#sec-Response)
 */
export type GraphQLResponse =
  | {
      data: PayloadData,
      errors?: Array<PayloadError>,
      extensions?: PayloadExtensions,
    }
  | {
      data?: ?PayloadData,
      errors: Array<PayloadError>,
      extensions?: PayloadExtensions,
    };

/**
 * A function that returns an Observable representing the response of executing
 * a GraphQL operation.
 */
export type ExecuteFunction = (
  request: ConcreteRequest,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: ?UploadableMap,
) => RelayObservable<GraphQLResponse>;

/**
 * A function that executes a GraphQL operation with request/response semantics.
 *
 * May return an Observable or Promise of a plain GraphQL server response, or
 * a composed ExecutePayload object supporting additional metadata.
 */
export type FetchFunction = (
  request: ConcreteRequest,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables: ?UploadableMap,
) => ObservableFromValue<GraphQLResponse>;

/**
 * A function that executes a GraphQL subscription operation, returning one or
 * more raw server responses over time.
 *
 * May return an Observable, otherwise must call the callbacks found in the
 * fourth parameter.
 */
export type SubscribeFunction = (
  request: ConcreteRequest,
  variables: Variables,
  cacheConfig: CacheConfig,
  observer?: LegacyObserver<GraphQLResponse>,
) => RelayObservable<GraphQLResponse> | Disposable;

// $FlowFixMe(site=react_native_fb) this is compatible with classic api see D4658012
export type Uploadable = File | Blob;
// $FlowFixMe this is compatible with classic api see D4658012
export type UploadableMap = {[key: string]: Uploadable};

// Supports legacy SubscribeFunction definitions. Do not use in new code.
export type LegacyObserver<-T> = {|
  +onCompleted?: ?() => void,
  +onError?: ?(error: Error) => void,
  +onNext?: ?(data: T) => void,
|};
