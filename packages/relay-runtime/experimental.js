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

const LiveResolverStore = require('./store/experimental-live-resolvers/LiveResolverStore');
const {
  isSuspenseSentinel,
  suspenseSentinel,
} = require('./store/experimental-live-resolvers/LiveResolverSuspenseSentinel');
const fragmentDataInjector = require('./store/experimental-live-resolvers/fragmentDataInjector');
const resolverWeakObjectWrapper = require('./store/experimental-live-resolvers/resolverWeakObjectWrapper');

module.exports = {
  fragmentDataInjector,
  isSuspenseSentinel,
  LiveResolverStore,
  resolverWeakObjectWrapper,
  suspenseSentinel,
};
