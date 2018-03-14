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

import type {StoreUpdater, Environment} from '../store/RelayStoreTypes';

function commitLocalUpdate(
  environment: Environment,
  updater: StoreUpdater,
): void {
  environment.commitUpdate(updater);
}

module.exports = commitLocalUpdate;
