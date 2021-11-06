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
import type {
  EntryPoint,
  EntryPointProps,
  PreloadedEntryPoint,
} from '../../EntryPointTypes.flow';

declare function mockJSResource<TModule>(
  module: TModule,
): JSResourceReference<TModule>;

type NestedEntrypointComponentProps = EntryPointProps<{}>;

const NestedEntrypointComponent = (_props: NestedEntrypointComponentProps) =>
  null;

type NestedEntrypointPreloadParams = $ReadOnly<{|
  subEntrypointPreloadParam: string,
|}>;

type NestedEntryPointType = EntryPoint<
  NestedEntrypointPreloadParams,
  typeof NestedEntrypointComponent,
>;

const NestedEntryPoint = ({
  getPreloadProps({subEntrypointPreloadParam: _subEntrypointPreloadParam}) {
    return {};
  },
  root: mockJSResource(NestedEntrypointComponent),
}: NestedEntryPointType);

// Define the parent entrypoint's component

type PreloadedEntrypoints = $ReadOnly<{
  nestedComponent: PreloadedEntryPoint<typeof NestedEntrypointComponent>,
}>;

type ParentEntrypointComponentProps = EntryPointProps<{}, PreloadedEntrypoints>;

const ParentEntrypointComponent = (_props: ParentEntrypointComponentProps) =>
  null;

/**
 * Create a parent entrypoint with the component with
 * INCORRECT params passed into the nested entrypoints.
 */

type BadParentEntrypointParams = $ReadOnly<{}>;

({
  getPreloadProps(_params: BadParentEntrypointParams) {
    return {
      entryPoints: {
        nestedComponent: {
          entryPoint: NestedEntryPoint,
          /**
           $FlowExpectedError The entryPointParams here should be of type
            NestedEntrypointPreloadParams, but it does not contain subEntrypointPreloadParam
          */
          entryPointParams: Object.freeze({}),
        },
      },
    };
  },
  root: mockJSResource(ParentEntrypointComponent),
}: EntryPoint<BadParentEntrypointParams, typeof ParentEntrypointComponent>);

/**
 * Create a parent entrypoint with the component with
 * CORRECT params passed into the nested entrypoints.
 */

type GoodParentEntrypointParams = $ReadOnly<{}>;

({
  getPreloadProps(_params: GoodParentEntrypointParams) {
    return {
      entryPoints: {
        nestedComponent: {
          entryPoint: NestedEntryPoint,
          // No flow error since this matches NestedEntrypointPreloadParams
          entryPointParams: {
            subEntrypointPreloadParam: 'test',
          },
        },
      },
    };
  },
  root: mockJSResource(ParentEntrypointComponent),
}: EntryPoint<GoodParentEntrypointParams, typeof ParentEntrypointComponent>);
