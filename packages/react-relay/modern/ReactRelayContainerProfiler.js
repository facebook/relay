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

const {RelayProfiler} = require('RelayRuntime');

function profileContainer(
  Container: React$ComponentType<any>,
  containerName: string,
): void {
  /* $FlowFixMe(>=0.53.0) This comment suppresses an error
   * when upgrading Flow's support for React. Common errors found when
   * upgrading Flow's React support are documented at
   * https://fburl.com/eq7bs81w */
  RelayProfiler.instrumentMethods(Container.prototype, {
    constructor: `${containerName}.prototype.constructor`,
    componentWillReceiveProps: `${containerName}.prototype.componentWillReceiveProps`,
    componentWillUnmount: `${containerName}.prototype.componentWillUnmount`,
    shouldComponentUpdate: `${containerName}.prototype.shouldComponentUpdate`,
  });
}

module.exports = {profileContainer};
