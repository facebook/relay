/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayContainerProxy
 * @flow
 * @format
 */

'use strict';

import type {RelayContainer} from 'RelayTypes';

/**
 * This feature is deprecated and unavailable in open source.
 */
const RelayContainerProxy = {
  proxyMethods(
    Container: RelayContainer,
    Component: React$ComponentType<any>,
  ): void {},
  injectProxyMethods(
    proxyMethods: (
      Container: RelayContainer,
      Component: React$ComponentType<any>,
    ) => void,
  ) {
    this.proxyMethods = proxyMethods;
  },
};

module.exports = RelayContainerProxy;
