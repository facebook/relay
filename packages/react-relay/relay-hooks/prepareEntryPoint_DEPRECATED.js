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
import type {OperationType} from '../../relay-runtime/util/RelayRuntimeTypes';
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
    // $FlowFixMe[unused-promise]
    entryPoint.root.load();
  }
  const preloadProps = entryPoint.getPreloadProps(entryPointParams);
  const {queries, entryPoints} = preloadProps;
  // $FlowFixMe[incompatible-type]
  const preloadedQueries: Partial<TPreloadedQueries> = {};
  // $FlowFixMe[incompatible-type]
  const preloadedEntryPoints: Partial<TPreloadedEntryPoints> = {};
  if (queries != null) {
    const queriesPropNames = Object.keys(queries);
    queriesPropNames.forEach(queryPropName => {
      const {environmentProviderOptions, options, parameters, variables} =
        queries[queryPropName];

      const environment = environmentProvider.getEnvironment(
        environmentProviderOptions,
      );

      preloadedQueries[queryPropName] = preloadQuery<OperationType, mixed>(
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
      preloadedEntryPoints[entryPointPropName] = prepareEntryPoint<
        TEntryPointParams,
        TPreloadedQueries,
        TPreloadedEntryPoints,
        TRuntimeProps,
        TExtraProps,
        TEntryPointComponent,
        TEntryPoint,
      >(environmentProvider, nestedEntryPoint, nestedParams);
    });
  }
}

module.exports = prepareEntryPoint;
