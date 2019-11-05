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

'use strict';

import type {JSResourceReference} from 'JSResourceReference';
import type {AbstractComponent, ElementConfig} from 'React';
import type {
  ConcreteRequest,
  GraphQLResponse,
  IEnvironment,
  Observable,
  OperationType,
  RequestParameters,
} from 'relay-runtime';

export type PreloadFetchPolicy =
  | 'store-or-network'
  | 'store-and-network'
  | 'network-only';

export type PreloadOptions = {|
  +fetchKey?: string | number,
  +fetchPolicy?: ?PreloadFetchPolicy,
  +extraOptions?: ?{},
|};

// Note: the phantom type parameter here helps ensures that the
// $Parameters.js value matches the type param provided to preloadQuery.
// eslint-disable-next-line no-unused-vars
export type PreloadableConcreteRequest<TQuery: OperationType> = {|
  queryResource: JSResourceReference<ConcreteRequest>,
  params: RequestParameters,
|};

export type EnvironmentProviderOptions = {
  [string]: mixed,
};

export type PreloadedQuery<
  TQuery: OperationType,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> = {|
  +environment: IEnvironment,
  +environmentProviderOptions: ?TEnvironmentProviderOptions,
  +fetchKey: ?string | ?number,
  +fetchPolicy: PreloadFetchPolicy,
  +name: string,
  +source: ?Observable<GraphQLResponse>,
  +variables: $ElementType<TQuery, 'variables'>,
|};

/**
The Interface of the EntryPoints .entrypoint files

Every .entrypoint file it's an object that must have two required fields:
- getPreloadProps(...)  function that will return the description of preloaded
  queries and preloaded (nested) entry points for the current entry point
- root - JSResource of the module that will render those preloaded queries

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
  TPreloadedQueries: {},
  TPreloadedEntryPoints: {},
  TExtraProps = null,
  TEnvironmentProviderOptions = EnvironmentProviderOptions,
> = $ReadOnly<{|
  entryPoints?: $ObjMap<
    TPreloadedEntryPoints,
    ExtractEntryPointTypeHelper<TPreloadParams>,
  >,
  extraProps?: TExtraProps,
  queries?: $ObjMap<
    TPreloadedQueries,
    ExtractQueryTypeHelper<TEnvironmentProviderOptions>,
  >,
|}>;

// Return type of the `prepareEntryPoint(...)` function
export type PreloadedEntryPoint<TEntryPointComponent> = $ReadOnly<{|
  entryPoints: $PropertyType<
    ElementConfig<TEntryPointComponent>,
    'entryPoints',
  >,
  extraProps: $PropertyType<ElementConfig<TEntryPointComponent>, 'extraProps'>,
  getComponent: () => TEntryPointComponent,
  queries: $PropertyType<ElementConfig<TEntryPointComponent>, 'queries'>,
|}>;

type ThinQueryParams<
  TQuery: OperationType,
  TEnvironmentProviderOptions,
> = $ReadOnly<{|
  environmentProviderOptions?: ?TEnvironmentProviderOptions,
  options?: ?PreloadOptions,
  parameters: PreloadableConcreteRequest<TQuery>,
  variables: $ElementType<TQuery, 'variables'>,
|}>;

type ThinNestedEntryPointParams<TEntryPointParams, TEntryPoint> = $ReadOnly<{|
  entryPoint: TEntryPoint,
  entryPointParams: TEntryPointParams,
|}>;

type ExtractQueryTypeHelper<TEnvironmentProviderOptions> = <TQuery>(
  PreloadedQuery<TQuery>,
) => ThinQueryParams<TQuery, TEnvironmentProviderOptions>;

type ExtractEntryPointTypeHelper<TEntryPointParams> = <TEntryPointComponent>(
  ?PreloadedEntryPoint<TEntryPointComponent>,
) => ?ThinNestedEntryPointParams<
  TEntryPointParams,
  EntryPoint<TEntryPointParams, TEntryPointComponent>,
>;

export type EntryPoint<
  TEntryPointParams,
  +TEntryPointComponent,
> = InternalEntryPointRepresentation<
  TEntryPointParams,
  $PropertyType<ElementConfig<TEntryPointComponent>, 'queries'>,
  $PropertyType<ElementConfig<TEntryPointComponent>, 'entryPoints'>,
  $PropertyType<ElementConfig<TEntryPointComponent>, 'props'>,
  $PropertyType<ElementConfig<TEntryPointComponent>, 'extraProps'>,
>;

export type IEnvironmentProvider<TOptions> = {|
  getEnvironment(options: ?TOptions): IEnvironment,
|};
