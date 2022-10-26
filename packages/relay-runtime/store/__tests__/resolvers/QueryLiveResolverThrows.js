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

/**
 * @RelayResolver
 * @fieldName live_resolver_throws
 * @onType Query
 * @live
 *
 * A @live resolver that throws
 */
import type {LiveState} from '../../experimental-live-resolvers/LiveResolverStore';

function live_resolver_throws(): LiveState<null> {
  throw new Error('What?');
}

module.exports = {
  live_resolver_throws,
};
