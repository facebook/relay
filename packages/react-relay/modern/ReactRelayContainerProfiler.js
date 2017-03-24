/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayContainerProfiler
 * @flow
 */

'use strict';

const RelayProfiler = require('RelayProfiler');

function profileContainer(
  Container: ReactClass<any>,
  containerName: string,
): void {
  RelayProfiler.instrumentMethods(Container.prototype, {
    constructor:
      `${containerName}.prototype.constructor`,
    componentWillReceiveProps:
      `${containerName}.prototype.componentWillReceiveProps`,
    componentWillUnmount:
      `${containerName}.prototype.componentWillUnmount`,
    shouldComponentUpdate:
      `${containerName}.prototype.shouldComponentUpdate`,
  });
}

module.exports = {profileContainer};
