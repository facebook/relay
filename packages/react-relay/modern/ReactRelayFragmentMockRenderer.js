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
const ReactRelayContext = require('../classic/tools/ReactRelayContext');

function ReactRelayFragmentMockRenderer(props: Object) {
  return (
    <ReactRelayContext.Provider value={{
      relay: {
        environment: props.environment,
        variables: {},
      },
    }}>
      {this.props.render()}
    </ReactRelayContext.Provider>
  );
}

module.exports = ReactRelayFragmentMockRenderer;
