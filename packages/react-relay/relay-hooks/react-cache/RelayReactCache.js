/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const invariant = require('invariant');
// $FlowFixMe[prop-missing] These exist in experimental builds but aren't in React's types yet.
const {unstable_getCacheForType, unstable_getCacheSignal} = require('react');
const {RelayFeatureFlags} = require('relay-runtime');

function getCacheForType<T>(factory: () => T): T {
  invariant(
    typeof unstable_getCacheForType === 'function' &&
      RelayFeatureFlags.USE_REACT_CACHE,
    'RelayReactCache.getCacheForType should only be called when the USE_REACT_CACHE feature flag is enabled and when on an experimental React build that supports it.',
  );
  return unstable_getCacheForType(factory);
}

function getCacheSignal(): AbortSignal {
  invariant(
    typeof unstable_getCacheSignal === 'function' &&
      RelayFeatureFlags.USE_REACT_CACHE,
    'RelayReactCache.getCacheSignal should only be called when the USE_REACT_CACHE feature flag is enabled and when on an experimental React build that supports it.',
  );
  return unstable_getCacheSignal();
}

module.exports = {
  getCacheForType,
  getCacheSignal,
};
