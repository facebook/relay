/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

/**
 * This feature is deprecated and unavailable in open source.
 */
const RelayContainerProxy = {
  proxyMethods(
    Container: React$ComponentType<any>,
    Component: React$ComponentType<any>,
  ): void {},
  injectProxyMethods(
    proxyMethods: (
      Container: React$ComponentType<any>,
      Component: React$ComponentType<any>,
    ) => void,
  ) {
    this.proxyMethods = proxyMethods;
  },
};

module.exports = RelayContainerProxy;
