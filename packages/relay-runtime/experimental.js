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
const resolverDataInjector = require('./store/experimental-live-resolvers/resolverDataInjector');
const {
  weakObjectWrapper,
  weakObjectWrapperLive,
} = require('./store/experimental-live-resolvers/weakObjectWrapper');

module.exports = {
  resolverDataInjector,
  weakObjectWrapper,
  weakObjectWrapperLive,
  LiveResolverStore,
};
