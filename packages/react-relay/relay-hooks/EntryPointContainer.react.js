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
  EntryPointComponent,
  PreloadedEntryPoint,
} from './EntryPointTypes.flow';

const ProfilerContext = require('./ProfilerContext');
const useRelayEnvironment = require('./useRelayEnvironment');
const React = require('react');
const {useContext, useEffect} = require('react');
const warning = require('warning');

function EntryPointContainer<
  +TPreloadedQueries: {...},
  +TPreloadedNestedEntryPoints: {...},
  +TRuntimeProps: {...},
  +TExtraProps,
  +TEntryPointComponent: EntryPointComponent<
    TPreloadedQueries,
    TPreloadedNestedEntryPoints,
    TRuntimeProps,
    TExtraProps,
  >,
>({
  entryPointReference,
  props,
}: $ReadOnly<{|
  entryPointReference: PreloadedEntryPoint<TEntryPointComponent>,
  props: TRuntimeProps,
|}>): React.MixedElement {
  warning(
    entryPointReference.isDisposed === false,
    '<EntryPointContainer>: Expected entryPointReference to not be disposed ' +
      'yet. This is because disposing the entrypoint marks it for future garbage ' +
      'collection, and as such may no longer be present in the Relay store. ' +
      'In the future, this will become a hard error.',
  );
  const {getComponent, queries, entryPoints, extraProps, rootModuleID} =
    entryPointReference;
  const Component = getComponent();
  const profilerContext = useContext(ProfilerContext);
  const environment = useRelayEnvironment();
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

module.exports = EntryPointContainer;
