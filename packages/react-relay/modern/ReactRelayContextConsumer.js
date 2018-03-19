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

import type {RelayContext} from 'RelayRuntime';

/**
 * Decorates a component and injects Relay context as a prop.
 * This allows it to be used in the static getDerivedStateFromProps lifecycle.
 */
function injectContext<TProps, TComponent: React.ComponentType<TProps>>(
  Component: TComponent,
): React.ComponentType<
  $Diff<
    React.ElementConfig<TComponent>,
    {
      relay: RelayContext,
    },
  >,
> {
  // TODO (T25783053) Update this container to use the new React context API,
  // Once we have confirmed that it's okay to raise min React version to 16.3.
  class ReactRelayContextConsumer extends React.Component<TProps> {
    static contextTypes = {
      relay: RelayPropTypes.Relay,
    };

    render() {
      return <Component {...this.props} relay={this.context.relay} />;
    }
  }

  return ReactRelayContextConsumer;
}

module.exports = {injectContext};
