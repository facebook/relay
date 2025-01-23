/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

/* eslint-disable no-unused-vars */

import type {JSResourceReference} from 'JSResourceReference';
import type {ComponentType, ElementConfig} from 'react';
import type {
  CacheConfig,
  FetchPolicy,
  GraphQLResponse,
  IEnvironment,
  Observable,
  OperationType,
  RequestParameters,
  VariablesOf as _VariablesOf,
} from 'relay-runtime';

export type VariablesOf<T> = _VariablesOf<T>;

export type PreloadFetchPolicy =
  | 'store-or-network'
  | 'store-and-network'
  | 'network-only';

export type PreloadOptions = {
  +fetchKey?: string | number,
  +fetchPolicy?: ?PreloadFetchPolicy,
  +networkCacheConfig?: ?CacheConfig,
};

export type LoadQueryOptions = {
  +fetchPolicy?: ?FetchPolicy,
  +networkCacheConfig?: ?CacheConfig,
  +__nameForWarning?: ?string,
};

export type PreloadableConcreteRequest<+TQuery: OperationType> = {
  kind: 'PreloadableConcreteRequest',
  params: RequestParameters,
  // Note: the phantom type parameter here helps ensures that the
  // $Parameters.js value matches the type param provided to preloadQuery.
  // We also need to add usage of this generic here,
  // becuase not using the generic in the definition makes it
  // unconstrained in the call to a function that accepts PreloadableConcreteRequest<T>
  +__phantom__?: ?TQuery,
};

export type EnvironmentProviderOptions = {+[string]: mixed, ...};

export type PreloadedQuery<
  +TQuery: OperationType,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> =
  | PreloadedQueryInner_DEPRECATED<TQuery, TEnvironmentProviderOptions>
  | PreloadedQueryInner<TQuery, TEnvironmentProviderOptions>;

export type PreloadedQueryInner_DEPRECATED<
  +TQuery: OperationType,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> = {
  +kind: 'PreloadedQuery_DEPRECATED',
  +environment: IEnvironment,
  +environmentProviderOptions: ?TEnvironmentProviderOptions,
  +fetchKey: ?string | ?number,
  +fetchPolicy: FetchPolicy,
  +networkCacheConfig?: ?CacheConfig,
  +id: ?string,
  +name: string,
  +source: ?Observable<GraphQLResponse>,
  +variables: TQuery['variables'],
  +status: PreloadQueryStatus,
};

export type PreloadedQueryInner<
  +TQuery: OperationType,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> = {
  // Releases query data and cancels network request if still in flight
  +dispose: () => void,
  // Releases query data
  +releaseQuery: () => void,
  // Cancels network request if still in flight
  +cancelNetworkRequest: () => void,
  +environment: IEnvironment,
  +environmentProviderOptions: ?TEnvironmentProviderOptions,
  +fetchKey: string | number,
  +fetchPolicy: FetchPolicy,
  +id: ?string,
  +isDisposed: boolean,
  +networkError: ?Error,
  +name: string,
  +networkCacheConfig: ?CacheConfig,
  +source: ?Observable<GraphQLResponse>,
  +kind: 'PreloadedQuery',
  +variables: TQuery['variables'],
};

export type PreloadQueryStatus = {
  +cacheConfig: ?CacheConfig,
  +source: 'cache' | 'network',
  +fetchTime: ?number,
};

/**
The Interface of the EntryPoints .entrypoint files

Every .entrypoint file it's an object that must have two required fields:
- getPreloadProps(...)  function that will return the description of preloaded
  queries and preloaded (nested) entry points for the current entry point
- root - JSResourceReference of the module that will render those preloaded queries

TEntryPointParams - object that contains all necessary information to execute
the preloaders (routeParams, query variables)

TPreloadedQueries -  queries, defined in the root components

TPreloadedEntryPoints - nested entry points, defined in the root components

TRuntimeProps - the type of additional props that you may pass to the
component (like `onClick` handler, etc) during runtime. Values for them
defined during component runtime

TExtraProps - a bag of extra props that you may define in `entrypoint` file
and they will be passed to the EntryPointComponent as `extraProps`
*/
export type InternalEntryPointRepresentation<
  TEntryPointParams,
  TPreloadedQueries,
  TPreloadedEntryPoints = {...},
  TRuntimeProps = {...},
  TExtraProps = null,
> = $ReadOnly<{
  getPreloadProps: (
    entryPointParams: TEntryPointParams,
  ) => PreloadProps<
    TEntryPointParams,
    TPreloadedQueries,
    TPreloadedEntryPoints,
    TExtraProps,
  >,
  root: JSResourceReference<
    EntryPointComponent<
      TPreloadedQueries,
      TPreloadedEntryPoints,
      TRuntimeProps,
      TExtraProps,
    >,
  >,
}>;

// The shape of the props of the entry point `root` component
export type EntryPointProps<
  TPreloadedQueries,
  TPreloadedEntryPoints = {},
  TRuntimeProps = {},
  TExtraProps = null,
> = $ReadOnly<{
  entryPoints: TPreloadedEntryPoints,
  extraProps: TExtraProps | null,
  props: TRuntimeProps,
  queries: TPreloadedQueries,
}>;

// Type of the entry point `root` component
export type EntryPointComponent<
  TPreloadedQueries,
  TPreloadedEntryPoints = {},
  TRuntimeProps = {},
  TExtraProps = null,
> = ComponentType<
  EntryPointProps<
    TPreloadedQueries,
    TPreloadedEntryPoints,
    TRuntimeProps,
    TExtraProps,
  >,
>;

// Return type of the `getPreloadProps(...)` of the entry point
export type PreloadProps<
  +TPreloadParams,
  // $FlowExpectedError[unclear-type] Need any to make it supertype of all PreloadedQuery
  TPreloadedQueries: {+[string]: PreloadedQuery<any>},
  TPreloadedEntryPoints: {...},
  TExtraProps = null,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> = $ReadOnly<{
  entryPoints?: {
    +[K in keyof TPreloadedEntryPoints]?: ?ThinNestedEntryPointParams,
  },
  extraProps?: TExtraProps,
  queries?: ExtractQueryTypes<TEnvironmentProviderOptions, TPreloadedQueries>,
}>;

// Return type of `loadEntryPoint(...)`
export type PreloadedEntryPoint<TEntryPointComponent> = $ReadOnly<{
  dispose: () => void,
  entryPoints: ElementConfig<TEntryPointComponent>['entryPoints'],
  extraProps: ElementConfig<TEntryPointComponent>['extraProps'],
  getComponent: () => TEntryPointComponent,
  isDisposed: boolean,
  queries: ElementConfig<TEntryPointComponent>['queries'],
  rootModuleID: string,
}>;

export type EntryPointElementConfig<
  // $FlowExpectedError[unclear-type] Need any to make it supertype of all InternalEntryPointRepresentation
  +TEntryPoint: InternalEntryPointRepresentation<any, any, any, any, any>,
> =
  TEntryPoint extends InternalEntryPointRepresentation<
    // $FlowExpectedError[unclear-type] Need any to make it supertype of all InternalEntryPointRepresentation
    any,
    // $FlowExpectedError[unclear-type] Need any to make it supertype of all InternalEntryPointRepresentation
    any,
    // $FlowExpectedError[unclear-type] Need any to make it supertype of all InternalEntryPointRepresentation
    any,
    infer Props,
    // $FlowExpectedError[unclear-type] Need any to make it supertype of all InternalEntryPointRepresentation
    any,
  >
    ? Props
    : empty;

export type ThinQueryParams<
  +TQuery: OperationType,
  TEnvironmentProviderOptions,
> = $ReadOnly<{
  environmentProviderOptions?: ?TEnvironmentProviderOptions,
  options?: ?PreloadOptions,
  parameters: PreloadableConcreteRequest<TQuery>,
  // $FlowFixMe[incompatible-use]
  variables: TQuery['variables'],
}>;

/**
 * We make the type of `ThinNestedEntryPointParams` opaque, so that the only way
 * to construct a `ThinNestedEntryPointParams` is by calling `NestedRelayEntryPoint`
 * from `NestedRelayEntryPointBuilderUtils` module.
 */
declare export opaque type ThinNestedEntryPointParams;

export type ExtractQueryTypeHelper<TEnvironmentProviderOptions> = <TQuery>(
  PreloadedQuery<TQuery>,
) => ThinQueryParams<TQuery, TEnvironmentProviderOptions>;

// We need to match both cases without using distributive conditional types,
// because PreloadedQuery's TQuery parameter is almost phantom, and breaking
// up the union type would cause us to lose track of TQuery.
type ExtractThinQueryParams<T, TEnvironmentProviderOptions> = [+t: T] extends [
  // $FlowFixMe[incompatible-type-arg]
  +t: PreloadedQuery<infer TQuery>,
]
  ? ThinQueryParams<TQuery, TEnvironmentProviderOptions>
  : [+t: T] extends [
        +t: PreloadedQuery<infer TQuery extends OperationType> | void,
      ]
    ? ThinQueryParams<TQuery, TEnvironmentProviderOptions> | void
    : empty;

export type ExtractQueryTypes<
  TEnvironmentProviderOptions,
  // $FlowExpectedError[unclear-type] Need any to make it supertype of all PreloadedQuery
  PreloadedQueries: {+[string]: PreloadedQuery<any>} | void,
> = {
  [K in keyof PreloadedQueries]: ExtractThinQueryParams<
    PreloadedQueries[K],
    TEnvironmentProviderOptions,
  >,
};

export type EntryPoint<TEntryPointParams, +TEntryPointComponent> =
  InternalEntryPointRepresentation<
    TEntryPointParams,
    ElementConfig<TEntryPointComponent>['queries'],
    ElementConfig<TEntryPointComponent>['entryPoints'],
    ElementConfig<TEntryPointComponent>['props'],
    ElementConfig<TEntryPointComponent>['extraProps'],
  >;

export type PreloadParamsOf<T> = Parameters<T['getPreloadProps']>[0];

export type IEnvironmentProvider<TOptions> = {
  getEnvironment: (options: ?TOptions) => IEnvironment,
};
