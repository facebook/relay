/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {RelayProp} from 'react-relay/modern/ReactRelayTypes';
import type {IEnvironment} from 'relay-runtime';

const relayPropCache =
  typeof WeakMap === 'function' ? new WeakMap() : new Map();

function getRelayProp_UNSTABLE(environment: IEnvironment): RelayProp {
  const cached = relayPropCache.get(environment);
  if (cached) {
    return cached;
  }
  const relayProp = {environment};
  relayPropCache.set(environment, relayProp);
  return relayProp;
}

module.exports = getRelayProp_UNSTABLE;
