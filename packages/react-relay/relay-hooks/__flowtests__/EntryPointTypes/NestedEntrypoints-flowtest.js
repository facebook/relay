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

import type {
  EntryPoint,
  EntryPointProps,
  PreloadedEntryPoint,
} from '../../EntryPointTypes.flow';
import type {JSResourceReference} from 'JSResourceReference';

import {NestedRelayEntryPoint} from '../../NestedRelayEntryPointBuilderUtils';

declare function mockJSResource<TModule>(
  module: TModule,
): JSResourceReference<TModule>;

type NestedEntrypointComponentProps = EntryPointProps<{}>;

const NestedEntrypointComponent = (_props: NestedEntrypointComponentProps) =>
  null;

type NestedEntrypointPreloadParams = Readonly<{
  subEntrypointPreloadParam: string,
}>;

type NestedEntryPointType = EntryPoint<
  NestedEntrypointPreloadParams,
  typeof NestedEntrypointComponent,
>;

const NestedEntryPoint = {
  getPreloadProps({subEntrypointPreloadParam: _subEntrypointPreloadParam}) {
    return {};
  },
  root: mockJSResource(NestedEntrypointComponent),
} as NestedEntryPointType;

// Define the parent entrypoint's component

type PreloadedEntrypoints = Readonly<{
  nestedComponent: PreloadedEntryPoint<typeof NestedEntrypointComponent>,
}>;

type ParentEntrypointComponentProps = EntryPointProps<{}, PreloadedEntrypoints>;

const ParentEntrypointComponent = (_props: ParentEntrypointComponentProps) =>
  null;

/**
 * Create a parent entrypoint with the component with
 * INCORRECT params passed into the nested entrypoints.
 */

type BadParentEntrypointParams = Readonly<{}>;

({
  getPreloadProps(_params: BadParentEntrypointParams) {
    return {
      entryPoints: {
        nestedComponent: NestedRelayEntryPoint({
          /**
           $FlowExpectedError[incompatible-type] The entryPointParams here should be of type
            NestedEntrypointPreloadParams, but it does not contain subEntrypointPreloadParam
          */
          entryPoint: NestedEntryPoint,
          entryPointParams: Object.freeze({}),
        }),
      },
    };
  },
  root: mockJSResource(ParentEntrypointComponent),
}) as EntryPoint<BadParentEntrypointParams, typeof ParentEntrypointComponent>;

/**
 * Create a parent entrypoint with the component with
 * CORRECT params passed into the nested entrypoints.
 */

type GoodParentEntrypointParams = Readonly<{}>;

({
  getPreloadProps(_params: GoodParentEntrypointParams) {
    return {
      entryPoints: {
        nestedComponent: NestedRelayEntryPoint({
          entryPoint: NestedEntryPoint,
          // No flow error since this matches NestedEntrypointPreloadParams
          entryPointParams: {
            subEntrypointPreloadParam: 'test',
          },
        }),
      },
    };
  },
  root: mockJSResource(ParentEntrypointComponent),
}) as EntryPoint<GoodParentEntrypointParams, typeof ParentEntrypointComponent>;
