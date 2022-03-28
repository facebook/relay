/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

import type {
  EntryPoint,
  EntryPointComponent,
  EnvironmentProviderOptions,
  IEnvironmentProvider,
  PreloadedEntryPoint,
} from './EntryPointTypes.flow';

const {loadQuery} = require('./loadQuery');

function loadEntryPoint<
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

      preloadedQueries[queryPropName] = loadQuery(
        environment,
        parameters,
        variables,
        {
          fetchPolicy: options?.fetchPolicy,
          networkCacheConfig: options?.networkCacheConfig,
          __nameForWarning: 'loadEntryPoint',
        },
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
      preloadedEntryPoints[entryPointPropName] = loadEntryPoint(
        environmentProvider,
        nestedEntryPoint,
        nestedParams,
      );
    });
  }

  let isDisposed = false;
  return {
    dispose() {
      if (isDisposed) {
        return;
      }
      if (preloadedQueries != null) {
        Object.values(preloadedQueries).forEach(
          ({dispose: innerDispose}: $FlowFixMe) => {
            innerDispose();
          },
        );
      }
      if (preloadedEntryPoints != null) {
        Object.values(preloadedEntryPoints).forEach(
          ({dispose: innerDispose}: $FlowFixMe) => {
            innerDispose();
          },
        );
      }
      isDisposed = true;
    },
    entryPoints: (preloadedEntryPoints: TPreloadedEntryPoints),
    extraProps: extraProps ?? null,
    getComponent: () => {
      const componentModule = entryPoint.root.getModuleIfRequired();
      if (componentModule == null) {
        loadingPromise = loadingPromise ?? entryPoint.root.load();
        throw loadingPromise;
      }

      // On certain platforms, getting an es6 module with a default export from a JSResource will return an object like
      // {default: module}, so let's assume that if the "component" has a static property named "default"
      // that it's actually an es6 module wrapper, so unwrap it. This won't work for React classes with a static property named "default", but
      // that's probably a worthwhile trade-off.
      const component =
        // $FlowIgnore[prop-missing]
        componentModule.default != null
          ? componentModule.default
          : componentModule;
      // $FlowFixMe[incompatible-cast] - trust me Flow, its entryPoint component
      return (component: TEntryPointComponent);
    },
    // $FlowFixMe[unsafe-getters-setters] - this has no side effects
    get isDisposed() {
      return isDisposed;
    },
    queries: (preloadedQueries: TPreloadedQueries),
    rootModuleID: entryPoint.root.getModuleId(),
  };
}

module.exports = loadEntryPoint;
