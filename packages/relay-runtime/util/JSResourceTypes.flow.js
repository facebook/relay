/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall relay
 */

'use strict';

export interface JSResourceReference<out T> {
  readonly getModuleId: () => string;
  readonly getModuleIfRequired: () => ?T;
  readonly load: () => Promise<T>;
}
