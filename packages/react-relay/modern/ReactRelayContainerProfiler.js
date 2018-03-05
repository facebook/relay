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

  // Copy static getDerivedStateFromProps() to the instrumented constructor.
  // This is necessary to support the react-lifecycle-compat poyfill.
  // This can be removed once react-relay requires React 16.3+.
  if (
    Container.prototype !== null &&
    typeof Container.prototype === 'object' &&
    typeof Container.getDerivedStateFromProps === 'function'
  ) {
    Container.prototype.constructor.getDerivedStateFromProps =
      Container.getDerivedStateFromProps;
  }
}

module.exports = {profileContainer};
