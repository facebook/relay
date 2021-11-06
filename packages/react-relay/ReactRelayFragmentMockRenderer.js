/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const ReactRelayContext = require('./ReactRelayContext');
const React = require('react');

function ReactRelayFragmentMockRenderer(props: Object): React.Node {
  return (
    <ReactRelayContext.Provider value={{environment: props.environment}}>
      {props.render()}
    </ReactRelayContext.Provider>
  );
}

module.exports = ReactRelayFragmentMockRenderer;
