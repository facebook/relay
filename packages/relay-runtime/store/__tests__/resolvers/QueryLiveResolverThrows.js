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

import type {LiveState} from 'relay-runtime';

/**
 * @RelayResolver Query.live_resolver_throws: RelayResolverValue
 * @live
 *
 * A @live resolver that throws
 */
function live_resolver_throws(): LiveState<null> {
  throw new Error('What?');
}

module.exports = {
  live_resolver_throws,
};
