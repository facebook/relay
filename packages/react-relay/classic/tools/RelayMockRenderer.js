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

const PropTypes = require('prop-types');
const React = require('React');
const RelayEnvironment = require('../store/RelayEnvironment');
const RelayPropTypes = require('../container/RelayPropTypes');

/**
 * A helper for rendering RelayContainers with mock data, outside of a
 * RelayRootContainer/RelayRenderer. This is intended for use in unit tests or
 * component browser-style interfaces.
 *
 * Note: For unit tests, you may need to mock `ReactDOM` as follows:
 *
 * ```
 * jest.mock('ReactDOM', () => ({}));
 * ```
 *
 * Currently ReactDOM and ReactTestRenderer cannot both be loaded in the same
 * test, and Relay transitively includes ReactDOM under its default settings.
 */
class RelayMockRenderer extends React.Component<$FlowFixMeProps> {
  mockContext: any;

  static childContextTypes = {
    relay: RelayPropTypes.ClassicRelay,
    route: RelayPropTypes.QueryConfig.isRequired,
    useFakeData: PropTypes.bool,
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
