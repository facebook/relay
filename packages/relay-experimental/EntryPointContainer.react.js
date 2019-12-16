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

const React = require('react');

import type {
  EntryPointComponent,
  PreloadedEntryPoint,
} from './EntryPointTypes.flow';

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
  const {getComponent, queries, entryPoints, extraProps} = entryPointReference;
  const Component = getComponent();
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
