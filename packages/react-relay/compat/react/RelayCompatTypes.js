/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {RelayEnvironmentInterface as RelayClassicEnvironment} from '../../classic/store/RelayEnvironment';
import type {IEnvironment} from 'RelayRuntime';

export type CompatEnvironment = IEnvironment | RelayClassicEnvironment;

declare class RelayCompatContainerClass<Props> extends React$Component<Props> {
  static getFragment: Function;
}

export type RelayCompatContainer<Props> = Class<
  RelayCompatContainerClass<Props>,
>;
