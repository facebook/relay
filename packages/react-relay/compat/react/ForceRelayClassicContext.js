/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ForceRelayClassicContext
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('RelayPropTypes');
const RelayRoute = require('RelayRoute');
const RelayStore = require('RelayStore');

// Dummy Route
class QueryConfig extends RelayRoute {}
QueryConfig.routeName = 'ForceRelayClassicContextRoute';
QueryConfig.queries = {};

/**
 * This wrapper will provide dummy RelayContainer context to it's children. It
 * should only be used as a wrapper around RelayContainers that have not been
 * converted to one of the compatibility container and are not fetching data.
 */
class ForceRelayClassicContext extends React.Component {
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
  render(): ?React.Element<*> {
    return this.props.children;
  }
}

module.exports = ForceRelayClassicContext;
