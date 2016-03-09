/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayOSSContainerProxy
 * @typechecks
 * @flow
 */

'use strict';

import type {RelayContainer} from 'RelayTypes';

/**
 * This feature is deprecated and unavailable in open source.
 */
const RelayOSSContainerProxy = {
  proxyMethods(
    Container: RelayContainer,
    Component: ReactClass
  ): void {},
};

module.exports = RelayOSSContainerProxy;
