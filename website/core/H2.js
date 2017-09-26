/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule H2
 * @format
 */

'use strict';

const Header = require('Header');
const React = require('React');

class H2 extends React.Component {
  render() {
    return (
      <Header {...this.props} level={2}>
        {this.props.children}
      </Header>
    );
  }
}

module.exports = H2;
