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
const ReactRelayContext = require('./ReactRelayContext');

function ReactRelayFragmentMockRenderer(props: Object) {
  return (
    <ReactRelayContext.Provider
      value={{
        environment: props.environment,
        variables: {},
      }}>
      {props.render()}
    </ReactRelayContext.Provider>
  );
}

module.exports = ReactRelayFragmentMockRenderer;
