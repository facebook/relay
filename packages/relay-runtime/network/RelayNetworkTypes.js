/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNetworkTypes
 * @flow
 * @format
 */

'use strict';

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type RelayObservable, {ObservableFromValue} from 'RelayObservable';
import type {
  HandleFieldPayload,
  MutableRecordSource,
  Observer,
} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

/**
 * A cache for saving respones to queries (by id) and variables.
 */
export interface ResponseCache {
  get(id: string, variables: Variables): ?QueryPayload,
  set(id: string, variables: Variables, payload: QueryPayload): void,
}

/**
 * An interface for fetching the data for one or more (possibly interdependent)
 * queries.
 */
export type Network = {|
  observe: ObserveFunction,
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
export type QueryPayload = {|
  data?: ?PayloadData,
  errors?: Array<PayloadError>,
  rerunVariables?: Variables,
|};

/**
 * A function that returns an Observable representing the response of executing
 * a GraphQL operation.
 */
export type ObserveFunction = (
  operation: ConcreteBatch,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: ?UploadableMap,
) => RelayObservable<QueryPayload>;

/**
 * The shape of data that is returned by the Relay network layer for a given
 * query.
 */
export type RelayResponsePayload = {|
  fieldPayloads?: ?Array<HandleFieldPayload>,
  source: MutableRecordSource,
  errors: ?Array<PayloadError>,
|};

/**
 * A function that executes a GraphQL operation with request/response semantics.
 *
 * May return an Observable or Promise of a raw server response.
 */
export type FetchFunction = (
  operation: ConcreteBatch,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables: ?UploadableMap,
) => ObservableFromValue<QueryPayload>;

/**
 * A function that executes a GraphQL subscription operation, returning one or
 * more raw server responses over time.
 *
 * May return an Observable, otherwise must call the callbacks found in the
 * fourth parameter.
 */
export type SubscribeFunction = (
  operation: ConcreteBatch,
  variables: Variables,
  cacheConfig: CacheConfig,
  observer: Observer<QueryPayload>,
) => RelayObservable<QueryPayload> | Disposable;

export type Uploadable = File | Blob;
// $FlowFixMe this is compatible with classic api see D4658012
export type UploadableMap = {[key: string]: Uploadable};
