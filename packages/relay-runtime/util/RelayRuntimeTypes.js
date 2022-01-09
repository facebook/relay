/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

/**
 * Basic types used throughout Relay.
 */

import type {ReaderFragment, ReaderInlineDataFragment} from './ReaderNode';
import type {ConcreteRequest} from './RelayConcreteNode';

/**
 * Represents any resource that must be explicitly disposed of. The most common
 * use-case is as a return value for subscriptions, where calling `dispose()`
 * would cancel the subscription.
 */
export type Disposable = interface {dispose(): void};

export type DataID = string;

// Variables
export type Variables = {+[string]: $FlowFixMe};

/**
 * Generated operation flow types are subtypes of this.
 */
export type OperationType = {|
  // TODO(T33395812) Make this an open object type
  +variables: Variables,
  +response: mixed,
  +rawResponse?: {...},
|};

export type VariablesOf<T: OperationType> = T['variables'];

/**
 * Settings for how a query response may be cached.
 *
 * - `force`: causes a query to be issued unconditionally, irrespective of the
 *   state of any configured response cache.
 * - `poll`: causes a query to live update by polling at the specified interval
 *   in milliseconds. (This value will be passed to setTimeout.)
 * - `liveConfigId`: causes a query to live update by calling GraphQLLiveQuery,
 *   it represents a configuration of gateway when doing live query
 * - `onSubscribe`: Not in use.
 * - `metadata`: user-supplied metadata.
 * - `transactionId`: a user-supplied value, intended for use as a unique id for
 *   a given instance of executing an operation.
 */
export type CacheConfig = {|
  force?: ?boolean,
  poll?: ?number,
  liveConfigId?: ?string,
  onSubscribe?: () => void,
  metadata?: {[key: string]: mixed, ...},
  transactionId?: ?string,
|};

export type FetchQueryFetchPolicy = 'store-or-network' | 'network-only';
export type FetchPolicy =
  | FetchQueryFetchPolicy
  | 'store-and-network'
  | 'store-only';
export type RenderPolicy = 'full' | 'partial';

/* eslint-disable no-undef */

/**
 * Return type of graphql tag literals for all operations.
 */
declare export opaque type Operation<
  -TVariables: Variables,
  +TData,
  TRawResponse,
>: ConcreteRequest;

/**
 * Return type of graphql tag literals for queries.
 */
declare export opaque type Query<
  -TVariables: Variables,
  +TData,
  TRawResponse = void,
>: Operation<TVariables, TData, TRawResponse>;

/**
 * Return type of graphql tag literals for mutations.
 */
declare export opaque type Mutation<
  -TVariables: Variables,
  +TData,
  TRawResponse = void,
>: Operation<TVariables, TData, TRawResponse>;

/**
 * Return type of graphql tag literals for subscriptions.
 *
 * NOTE: Using the GraphQL prefix here because of a naming conflict with
 *       `RelayObservable`'s `Subscription` type.
 */
declare export opaque type GraphQLSubscription<
  -TVariables: Variables,
  +TData,
  TRawResponse = void,
>: Operation<TVariables, TData, TRawResponse>;

/**
 * Return type of graphql tag literals for `@inline` fragments.
 */
declare export opaque type InlineFragment<
  TFragmentType,
  +TData,
>: ReaderInlineDataFragment;

/**
 * Return type of graphql tag literals for fragments, except `@inline`
 * fragments.
 */
declare export opaque type Fragment<TFragmentType, +TData>: ReaderFragment;

/**
 * Return type of graphql tag literals for `@refetchable` fragments.
 */
declare export opaque type RefetchableFragment<
  TFragmentType,
  +TData,
  -TVariables: Variables,
>: Fragment<TFragmentType, TData>;
