/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {JSResourceReference} from 'JSResourceReference';
import type {AbstractComponent, ElementConfig} from 'React';
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

export type PreloadOptions = {|
  +fetchKey?: string | number,
  +fetchPolicy?: ?PreloadFetchPolicy,
  +networkCacheConfig?: ?CacheConfig,
|};

export type LoadQueryOptions = {|
  +fetchPolicy?: ?FetchPolicy,
  +networkCacheConfig?: ?CacheConfig,
  +__nameForWarning?: ?string,
|};

// Note: the phantom type parameter here helps ensures that the
// $Parameters.js value matches the type param provided to preloadQuery.
// eslint-disable-next-line no-unused-vars
export type PreloadableConcreteRequest<TQuery: OperationType> = {|
  kind: 'PreloadableConcreteRequest',
  params: RequestParameters,
|};

export type EnvironmentProviderOptions = {[string]: mixed, ...};

export type PreloadedQuery<
  TQuery: OperationType,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> =
  | PreloadedQueryInner_DEPRECATED<TQuery, TEnvironmentProviderOptions>
  | PreloadedQueryInner<TQuery, TEnvironmentProviderOptions>;

export type PreloadedQueryInner_DEPRECATED<
  TQuery: OperationType,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> = {|
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
|};

export type PreloadedQueryInner<
  TQuery: OperationType,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> = {|
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
|};

export type PreloadQueryStatus = {|
  +cacheConfig: ?CacheConfig,
  +source: 'cache' | 'network',
  +fetchTime: ?number,
|};

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
type InternalEntryPointRepresentation<
  TEntryPointParams,
  TPreloadedQueries,
  TPreloadedEntryPoints,
  TRuntimeProps,
  TExtraProps,
> = $ReadOnly<{|
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
|}>;

// The shape of the props of the entry point `root` component
export type EntryPointProps<
  TPreloadedQueries,
  TPreloadedEntryPoints = {||},
  TRuntimeProps = {||},
  TExtraProps = null,
> = $ReadOnly<{|
  entryPoints: TPreloadedEntryPoints,
  extraProps: TExtraProps | null,
  props: TRuntimeProps,
  queries: TPreloadedQueries,
|}>;

// Type of the entry point `root` component
export type EntryPointComponent<
  TPreloadedQueries,
  TPreloadedEntryPoints = {||},
  TRuntimeProps = {||},
  TExtraProps = null,
> = AbstractComponent<
  EntryPointProps<
    TPreloadedQueries,
    TPreloadedEntryPoints,
    TRuntimeProps,
    TExtraProps,
  >,
>;

// Return type of the `getPreloadProps(...)` of the entry point
export type PreloadProps<
  TPreloadParams,
  TPreloadedQueries: {...},
  TPreloadedEntryPoints: {...},
  TExtraProps = null,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> = $ReadOnly<{|
  entryPoints?: $ObjMap<TPreloadedEntryPoints, ExtractEntryPointTypeHelper>,
  extraProps?: TExtraProps,
  queries?: $ObjMap<
    TPreloadedQueries,
    ExtractQueryTypeHelper<TEnvironmentProviderOptions>,
  >,
|}>;

// Return type of `loadEntryPoint(...)`
export type PreloadedEntryPoint<TEntryPointComponent> = $ReadOnly<{|
  dispose: () => void,
  entryPoints: ElementConfig<TEntryPointComponent>['entryPoints'],
  extraProps: ElementConfig<TEntryPointComponent>['extraProps'],
  getComponent: () => TEntryPointComponent,
  isDisposed: boolean,
  queries: ElementConfig<TEntryPointComponent>['queries'],
  rootModuleID: string,
|}>;

type _ComponentFromEntryPoint = <
  +TPreloadParams,
  +TComponent,
  +TEntryPoint: EntryPoint<TPreloadParams, TComponent>,
>(
  TEntryPoint,
) => TComponent;

type ComponentFromEntryPoint<+TEntryPoint> = $Call<
  _ComponentFromEntryPoint,
  TEntryPoint,
>;

export type EntryPointElementConfig<+TEntryPoint> = ElementConfig<
  ComponentFromEntryPoint<TEntryPoint>,
>['props'];

export type ThinQueryParams<
  TQuery: OperationType,
  TEnvironmentProviderOptions,
> = $ReadOnly<{|
  environmentProviderOptions?: ?TEnvironmentProviderOptions,
  options?: ?PreloadOptions,
  parameters: PreloadableConcreteRequest<TQuery>,
  variables: TQuery['variables'],
|}>;

type ThinNestedEntryPointParams<TEntryPointParams, TEntryPoint> = $ReadOnly<{|
  entryPoint: TEntryPoint,
  entryPointParams: TEntryPointParams,
|}>;

export type ExtractQueryTypeHelper<TEnvironmentProviderOptions> = <TQuery>(
  PreloadedQuery<TQuery>,
) => ThinQueryParams<TQuery, TEnvironmentProviderOptions>;

export type ExtractEntryPointTypeHelper = <
  TEntryPointParams,
  TEntryPointComponent,
>(
  ?PreloadedEntryPoint<TEntryPointComponent>,
) => ?ThinNestedEntryPointParams<
  TEntryPointParams,
  EntryPoint<TEntryPointParams, TEntryPointComponent>,
>;

export type EntryPoint<TEntryPointParams, +TEntryPointComponent> =
  InternalEntryPointRepresentation<
    TEntryPointParams,
    ElementConfig<TEntryPointComponent>['queries'],
    ElementConfig<TEntryPointComponent>['entryPoints'],
    ElementConfig<TEntryPointComponent>['props'],
    ElementConfig<TEntryPointComponent>['extraProps'],
  >;

type ExtractFirstParam = <P, R>((P) => R) => P;
type GetPreloadPropsType<T> = T['getPreloadProps'];
export type PreloadParamsOf<T> = $Call<
  ExtractFirstParam,
  GetPreloadPropsType<T>,
>;

export type IEnvironmentProvider<TOptions> = {|
  getEnvironment: (options: ?TOptions) => IEnvironment,
|};
