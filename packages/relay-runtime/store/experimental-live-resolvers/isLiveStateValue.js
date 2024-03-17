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

import type {LiveState} from '../RelayStoreTypes';

declare function isLiveStateValue<T, U = LiveState<T>>(v: mixed): v is U;

function isLiveStateValue(v: mixed) {
  return (
    v != null &&
    typeof v === 'object' &&
    typeof v.read === 'function' &&
    typeof v.subscribe === 'function'
  );
}

module.exports = isLiveStateValue;
