/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayFragmentMockRenderer
 * @flow
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('RelayPropTypes');

class ReactRelayFragmentMockRenderer extends React.Component {
  mockContext: any;

  static childContextTypes = {
    relay: RelayPropTypes.Relay,
  }

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
