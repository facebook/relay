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
 * @RelayResolver Query.live_resolver_return_undefined: RelayResolverValue
 * @live
 *
 * A @live resolver that returns undefined
 */
// $FlowFixMe[incompatible-type] - this resolver returns undefined, but should return LiveState
function live_resolver_return_undefined(): LiveState<$FlowFixMe> {}

module.exports = {
  live_resolver_return_undefined,
};
