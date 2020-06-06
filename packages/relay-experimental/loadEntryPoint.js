/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const {loadQuery} = require('./loadQuery');

import type {
  EntryPoint,
  EntryPointComponent,
  EnvironmentProviderOptions,
  IEnvironmentProvider,
  PreloadedEntryPointInner,
} from 'relay-experimental/EntryPointTypes.flow';

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
): PreloadedEntryPointInner<TEntryPointComponent> {
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
      const {
        environmentProviderOptions,
        options,
        parameters,
        variables,
      } = queries[queryPropName];

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
      const {
        entryPoint: nestedEntryPoint,
        entryPointParams: nestedParams,
      } = entryPointDescription;
      preloadedEntryPoints[entryPointPropName] = loadEntryPoint(
        environmentProvider,
        nestedEntryPoint,
        nestedParams,
      );
    });
  }

  const dispose = () => {
    if (preloadedQueries != null) {
      Object.values(preloadedQueries).forEach(
        ({dispose: innerDispose}: $FlowFixMe) => {
          innerDispose && innerDispose();
        },
      );
    }
  };

  return {
    kind: 'PreloadedEntryPoint',
    dispose,
    entryPoints: (preloadedEntryPoints: TPreloadedEntryPoints),
    extraProps: extraProps ?? null,
    getComponent: () => {
      const component = entryPoint.root.getModuleIfRequired();
      if (component == null) {
        loadingPromise = loadingPromise ?? entryPoint.root.load();
        throw loadingPromise;
      }
      // $FlowFixMe - trust me Flow, its entryPoint component
      return (component: TEntryPointComponent);
    },
    queries: (preloadedQueries: TPreloadedQueries),
  };
}

module.exports = loadEntryPoint;
