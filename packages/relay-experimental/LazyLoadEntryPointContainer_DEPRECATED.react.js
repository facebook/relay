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

const React = require('react');

const prepareEntryPoint = require('./prepareEntryPoint');
const useRelayEnvironment = require('./useRelayEnvironment');

const {useMemo} = require('react');
const {stableCopy} = require('relay-runtime');

import type {
  EntryPoint,
  EntryPointComponent,
  EnvironmentProviderOptions,
  IEnvironmentProvider,
} from './EntryPointTypes.flow';

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

function LazyLoadEntryPointContainer_DEPRECATED<
  TEntryPointParams: {},
  TPreloadedQueries: {},
  TPreloadedEntryPoints: {},
  TRuntimeProps: {},
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
  const {getComponent, queries, entryPoints, extraProps} = useMemo(() => {
    return prepareEntryPoint(
      environmentProvider ?? {
        getEnvironment: () => environment,
      },
      entryPoint,
      entryPointParams,
    );
    // NOTE: stableParams encodes the information from params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, environmentProvider, getPreloadProps, entryPointParamsHash]);
  const Component = useMemo(() => {
    return getComponent();
  }, [getComponent]);
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
