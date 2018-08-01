/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('../classic/container/RelayPropTypes');
const ReactRelayContext = require('../classic/tools/ReactRelayContext');

const useContext = require('../classic/tools/useContext');

import type {RelayContext} from 'relay-runtime';

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
  function ReactRelayContextConsumer(props: TProps) {
    const {relay} = useContext(ReactRelayContext);
    return <Component {...this.props} relay={relay} />;
  }

  return ReactRelayContextConsumer;
}

module.exports = {injectContext};
