/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMockRenderer
 * @flow
 */

'use strict';

const React = require('React');
const RelayEnvironment = require('RelayEnvironment');
const RelayPropTypes = require('RelayPropTypes');

/**
 * A helper for rendering RelayContainers with mock data, outside of a
 * RelayRootContainer/RelayRenderer. This is intended for use in unit tests or
 * component browser-style interfaces.
 *
 * Note: For unit tests, you may need to mock `ReactDOM` as follows:
 *
 * ```
 * jest
 *   .disableAutomock()
 *   .mock('ReactDOM', () => ({}));
 * ```
 *
 * Currently ReactDOM and ReactTestRenderer cannot both be loaded in the same
 * test, and Relay transitively includes ReactDOM under its default settings.
 */
class RelayMockRenderer extends React.Component {
  mockContext: any;

  static childContextTypes = {
    relay: RelayPropTypes.LegacyRelay,
    route: RelayPropTypes.QueryConfig.isRequired,
    useFakeData: React.PropTypes.bool,
  };

  constructor() {
    super();
    this.mockContext = {
      relay: {
        environment: new RelayEnvironment(),
        variables: {},
      },
      route: {
        name: '$RelayMockRenderer',
        params: {},
        queries: {},
        useMockData: true,
      },
      useFakeData: true,
    };
  }

  getChildContext() {
    return this.mockContext;
  }

  render() {
    return this.props.render();
  }
}

module.exports = RelayMockRenderer;
