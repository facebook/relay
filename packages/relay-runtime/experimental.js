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

import type {DataID} from './util/RelayRuntimeTypes';

const resolverDataInjector = require('./store/experimental-live-resolvers/resolverDataInjector');

// eslint-disable-next-line no-unused-vars
export type IdOf<A> = DataID;

module.exports = {
  resolverDataInjector,
};
