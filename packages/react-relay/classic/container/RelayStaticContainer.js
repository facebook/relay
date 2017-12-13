/**
 * Copyright 2013-2015, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 * @flow
 * @format
 */

'use strict';

const React = require('React');

type Props = {|
  shouldUpdate?: boolean,
  children?: React$Node,
|};

class RelayStaticContainer extends React.Component<Props, void> {
  shouldComponentUpdate(nextProps: Props) {
    return !!nextProps.shouldUpdate;
  }

  render() {
    const child = this.props.children;
    return child ? React.Children.only(child) : null;
  }
}

module.exports = RelayStaticContainer;
