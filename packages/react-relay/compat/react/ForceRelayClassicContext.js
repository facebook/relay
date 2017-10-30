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
const RelayPropTypes = require('../../classic/container/RelayPropTypes');
const RelayRoute = require('../../classic/route/RelayRoute');
const RelayStore = require('../../classic/store/RelayStore');

// Dummy Route
/* $FlowFixMe(>=0.54.0) This comment suppresses an error
 * found when Flow v0.54 was deployed. To see the error delete this comment and
 * run Flow. */
class QueryConfig extends RelayRoute {}
QueryConfig.routeName = 'ForceRelayClassicContextRoute';
QueryConfig.queries = {};

/**
 * This wrapper will provide dummy RelayContainer context to it's children. It
 * should only be used as a wrapper around RelayContainers that have not been
 * converted to one of the compatibility container and are not fetching data.
 */
class ForceRelayClassicContext extends React.Component<$FlowFixMeProps> {
  static childContextTypes = {
    relay: RelayPropTypes.ClassicRelay,
    route: RelayPropTypes.QueryConfig.isRequired,
  };

  getChildContext() {
    return {
      relay: {
        environment: RelayStore,
        variables: {},
      },
      route: new QueryConfig(),
    };
  }
  render(): React.Node {
    return this.props.children;
  }
}

module.exports = ForceRelayClassicContext;
