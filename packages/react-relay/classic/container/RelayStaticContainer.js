/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStaticContainer
 * @typechecks
 * @flow
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
