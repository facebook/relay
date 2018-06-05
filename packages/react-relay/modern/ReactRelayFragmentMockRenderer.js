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

const React = require('React');
const RelayPropTypes = require('../classic/container/RelayPropTypes');

class ReactRelayFragmentMockRenderer extends React.Component<Object> {
  mockContext: any;

  static childContextTypes = {
    relay: RelayPropTypes.Relay,
  };
  constructor(props: Object) {
    super();
    this.mockContext = {
      relay: {
        environment: props.environment,
        variables: {},
      },
    };
  }

  getChildContext() {
    return this.mockContext;
  }

  render() {
    return this.props.render();
  }
}

module.exports = ReactRelayFragmentMockRenderer;
