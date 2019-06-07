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

import type {RequestParameters} from '../util/RelayConcreteNode';
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
 * [spec](https://graphql.github.io/graphql-spec/June2018/#sec-Response-Format)
 */
export type GraphQLResponseWithData = {
  +data: PayloadData,
  +errors?: Array<PayloadError>,
  +extensions?: PayloadExtensions,
  +label?: string,
  +path?: Array<string | number>,
};
export type GraphQLResponseWithoutData = {
  +data?: ?PayloadData,
  +errors: Array<PayloadError>,
  +extensions?: PayloadExtensions,
  +label?: string,
  +path?: Array<string | number>,
};
export type GraphQLResponse =
  | GraphQLResponseWithData
  | GraphQLResponseWithoutData;

/**
 * A function that returns an Observable representing the response of executing
 * a GraphQL operation.
 */
export type ExecuteFunction = (
  request: RequestParameters,
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
  request: RequestParameters,
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
  request: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  observer?: LegacyObserver<GraphQLResponse>,
) => RelayObservable<GraphQLResponse> | Disposable;

// $FlowFixMe(site=react_native_fb) this is compatible with classic api see D4658012
export type Uploadable = File | Blob;
// $FlowFixMe(site=mobile,www)
export type UploadableMap = {[key: string]: Uploadable};

// Supports legacy SubscribeFunction definitions. Do not use in new code.
export type LegacyObserver<-T> = {|
  +onCompleted?: ?() => void,
  +onError?: ?(error: Error) => void,
  +onNext?: ?(data: T) => void,
|};
