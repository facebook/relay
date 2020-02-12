/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

export interface JSResourceReference<+T> {
  +getModuleId: () => string;
  +getModuleIfRequired: () => ?T;
  +load: () => Promise<T>;
}
