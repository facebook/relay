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

import type {
  EntryPoint,
  EntryPointComponent,
  EnvironmentProviderOptions,
  IEnvironmentProvider,
} from './EntryPointTypes.flow';

const preloadQuery_DEPRECATED = require('./preloadQuery_DEPRECATED');
const ProfilerContext = require('./ProfilerContext');
const useRelayEnvironment = require('./useRelayEnvironment');
const React = require('react');
const {useContext, useEffect, useMemo} = require('react');
const {stableCopy} = require('relay-runtime');

type PreloadedEntryPoint<TEntryPointComponent> = $ReadOnly<{|
  entryPoints: React.ElementConfig<TEntryPointComponent>['entryPoints'],
  extraProps: React.ElementConfig<TEntryPointComponent>['extraProps'],
  getComponent: () => TEntryPointComponent,
  queries: React.ElementConfig<TEntryPointComponent>['queries'],
  rootModuleID: string,
|}>;

type EntryPointContainerProps<
  TEntryPointParams,
  TPreloadedQueries,
  TPreloadedEntryPoints,
  TRuntimeProps,
  TExtraProps,
> = $ReadOnly<
  $ReadOnly<{|
    entryPoint: EntryPoint<
      TEntryPointParams,
      EntryPointComponent<
        TPreloadedQueries,
        TPreloadedEntryPoints,
        TRuntimeProps,
        TExtraProps,
      >,
    >,
    entryPointParams: TEntryPointParams,
    environmentProvider?: IEnvironmentProvider<EnvironmentProviderOptions>,
    props: TRuntimeProps,
  |}>,
>;

function stableStringify(value: mixed): string {
  return JSON.stringify(stableCopy(value)) ?? 'null';
}

function prepareEntryPoint<
  TEntryPointParams: {...},
  TPreloadedQueries: {...},
  TPreloadedEntryPoints: {...},
  TRuntimeProps: {...},
  TExtraProps,
  TEntryPointComponent: EntryPointComponent<
    TPreloadedQueries,
    TPreloadedEntryPoints,
    TRuntimeProps,
    TExtraProps,
  >,
  TEntryPoint: EntryPoint<TEntryPointParams, TEntryPointComponent>,
>(
  environmentProvider: IEnvironmentProvider<EnvironmentProviderOptions>,
  entryPoint: TEntryPoint,
  entryPointParams: TEntryPointParams,
): PreloadedEntryPoint<TEntryPointComponent> {
  // Start loading the code for the entrypoint
  let loadingPromise = null;
  if (entryPoint.root.getModuleIfRequired() == null) {
    loadingPromise = entryPoint.root.load();
  }
  const preloadProps = entryPoint.getPreloadProps(entryPointParams);
  const {queries, entryPoints, extraProps} = preloadProps;
  const preloadedQueries: $Shape<TPreloadedQueries> = {};
  const preloadedEntryPoints: $Shape<TPreloadedEntryPoints> = {};
  if (queries != null) {
    const queriesPropNames = Object.keys(queries);
    queriesPropNames.forEach(queryPropName => {
      const {environmentProviderOptions, options, parameters, variables} =
        queries[queryPropName];

      const environment = environmentProvider.getEnvironment(
        environmentProviderOptions,
      );

      preloadedQueries[queryPropName] = preloadQuery_DEPRECATED(
        environment,
        parameters,
        variables,
        options,
        environmentProviderOptions,
      );
    });
  }

  if (entryPoints != null) {
    const entryPointPropNames = Object.keys(entryPoints);
    entryPointPropNames.forEach(entryPointPropName => {
      const entryPointDescription = entryPoints[entryPointPropName];
      if (entryPointDescription == null) {
        return;
      }
      const {entryPoint: nestedEntryPoint, entryPointParams: nestedParams} =
        entryPointDescription;
      preloadedEntryPoints[entryPointPropName] = prepareEntryPoint(
        environmentProvider,
        nestedEntryPoint,
        nestedParams,
      );
    });
  }
  return {
    entryPoints: (preloadedEntryPoints: TPreloadedEntryPoints),
    extraProps: extraProps ?? null,
    getComponent: () => {
      const component = entryPoint.root.getModuleIfRequired();
      if (component == null) {
        loadingPromise = loadingPromise ?? entryPoint.root.load();
        throw loadingPromise;
      }
      // $FlowFixMe[incompatible-cast] - trust me Flow, its entryPoint component
      return (component: TEntryPointComponent);
    },
    queries: (preloadedQueries: TPreloadedQueries),
    rootModuleID: entryPoint.root.getModuleId(),
  };
}

function LazyLoadEntryPointContainer_DEPRECATED<
  TEntryPointParams: {...},
  TPreloadedQueries: {...},
  TPreloadedEntryPoints: {...},
  TRuntimeProps: {...},
  TExtraProps,
>({
  entryPoint,
  entryPointParams,
  props,
  environmentProvider,
}: EntryPointContainerProps<
  TEntryPointParams,
  TPreloadedQueries,
  TPreloadedEntryPoints,
  TRuntimeProps,
  TExtraProps,
>): React.MixedElement {
  const environment = useRelayEnvironment();
  const {getPreloadProps} = entryPoint;
  // IMPORTANT: Loading the component may suspend (throw), so the props
  // *must* be computed first to fetch the component's data-dependencies in
  // parallel with the component itself (the code).
  const entryPointParamsHash = stableStringify(entryPointParams);
  const {getComponent, queries, entryPoints, extraProps, rootModuleID} =
    useMemo(() => {
      return prepareEntryPoint(
        environmentProvider ?? {
          getEnvironment: () => environment,
        },
        entryPoint,
        entryPointParams,
      );
      // NOTE: stableParams encodes the information from params
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      environment,
      environmentProvider,
      getPreloadProps,
      entryPointParamsHash,
    ]);
  const Component = useMemo(() => {
    return getComponent();
  }, [getComponent]);

  const profilerContext = useContext(ProfilerContext);
  useEffect(() => {
    environment.__log({
      name: 'entrypoint.root.consume',
      profilerContext,
      rootModuleID,
    });
  }, [environment, profilerContext, rootModuleID]);
  return (
    <Component
      entryPoints={entryPoints}
      extraProps={extraProps}
      props={props}
      queries={queries}
    />
  );
}

module.exports = LazyLoadEntryPointContainer_DEPRECATED;
