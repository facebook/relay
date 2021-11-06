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

const preloadQuery = require('./preloadQuery_DEPRECATED');

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
): void {
  // Start loading the code for the entrypoint
  if (entryPoint.root.getModuleIfRequired() == null) {
    entryPoint.root.load();
  }
  const preloadProps = entryPoint.getPreloadProps(entryPointParams);
  const {queries, entryPoints} = preloadProps;
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

      preloadedQueries[queryPropName] = preloadQuery(
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
}

module.exports = prepareEntryPoint;
