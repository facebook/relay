/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule center
 * @format
 */

'use strict';

const React = require('React');

const assign = require('object-assign');

class center extends React.Component {
  render() {
    let {style, ...props} = this.props;
    style = assign({}, style, {textAlign: 'center'});

    return (
      <div {...props} style={style}>
        {this.props.children}
      </div>
    );
  }
}

module.exports = center;
