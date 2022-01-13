/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {IEnvironment, StoreUpdater} from '../store/RelayStoreTypes';

function commitLocalUpdate(
  environment: IEnvironment,
  updater: StoreUpdater,
): void {
  environment.commitUpdate(updater);
}

module.exports = commitLocalUpdate;
