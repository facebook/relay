/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const ReactRelayContext = require('../../modern/ReactRelayContext');
const RelayEnvironment = require('../store/RelayEnvironment');
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

// this should be deprecated
class RelayMockRenderer extends React.Component<$FlowFixMeProps> {
  // TODO t16225453
  mockContext: $FlowFixMe = {
    environment: new RelayEnvironment(),
    variables: {},
    route: {
      name: '$RelayMockRenderer',
      params: {},
      queries: {},
      useMockData: true,
    },
    useFakeData: true,
  };
  render() {
    return (
      <ReactRelayContext.Provider value={this.mockContext}>
        {this.props.render()}
      </ReactRelayContext.Provider>
    );
  }
}

module.exports = RelayMockRenderer;
