/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict
 * @format
 */

'use strict';

export interface JSResourceReference<+T> {
  +getModuleId: () => string;
  +getModuleIfRequired: () => ?T;
  +load: () => Promise<T>;
}
