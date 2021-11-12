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

import type {
  EntryPoint,
  EntryPointElementConfig,
  EntryPointProps,
} from '../../EntryPointTypes.flow';

type MyComponentOtherProps = $ReadOnly<{|
  foo: string,
|}>;

type MyComponentProps = EntryPointProps<{}, {}, MyComponentOtherProps, {}>;

const MyComponent = (_props: MyComponentProps) => null;

type PreloadParams = $ReadOnly<{||}>;

type MyComponentEntryPointType = EntryPoint<PreloadParams, typeof MyComponent>;

// This gets the "other props" of the component through the entrypoint's typing
type MyComponentEntryPointProps =
  EntryPointElementConfig<MyComponentEntryPointType>;

// This gets the "other props" directly from the component's prop typings
type OtherProps = MyComponentProps['props'];

// We want to make sure that `OtherProps` and `MyComponentEntryPointProps` are exactly the same.
opaque type __SUBTYPE_CHECK_1__: OtherProps = MyComponentEntryPointProps;
opaque type __SUBTYPE_CHECK_2__: MyComponentEntryPointProps = OtherProps;

({foo: ''}: OtherProps);

({foo: ''}: MyComponentEntryPointProps);

// $FlowExpectedError[incompatible-cast]
({foo: null}: MyComponentEntryPointProps);
