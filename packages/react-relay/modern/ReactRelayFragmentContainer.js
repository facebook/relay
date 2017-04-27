/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayFragmentContainer
 * @flow
 */

'use strict';

const React = require('React');
const RelayProfiler = require('RelayProfiler');
const RelayPropTypes = require('RelayPropTypes');

const buildReactRelayContainer = require('buildReactRelayContainer');
const invariant = require('invariant');
const isRelayContext = require('isRelayContext');
const isScalarAndEqual = require('isScalarAndEqual');
const nullthrows = require('nullthrows');

const {profileContainer} = require('ReactRelayContainerProfiler');
const {getComponentName, getReactComponent} = require('RelayContainerUtils');

import type {GeneratedNodeMap, RelayProp} from 'ReactRelayTypes';
import type {FragmentSpecResolver} from 'RelayCombinedEnvironmentTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {FragmentMap, RelayContext} from 'RelayStoreTypes';

type ContainerState = {
  data: {[key: string]: mixed},
  relayProp: RelayProp,
};

const containerContextTypes = {
  relay: RelayPropTypes.Relay,
};

/**
 * Composes a React component class, returning a new class that intercepts
 * props, resolving them with the provided fragments and subscribing for
 * updates.
 */
function createContainerWithFragments<TBase: ReactClass<*>>(
  Component: TBase,
  fragments: FragmentMap,
): TBase {
  const ComponentClass = getReactComponent(Component);
  const componentName = getComponentName(Component);
  const containerName = `Relay(${componentName})`;

  class Container extends React.Component {
    state: ContainerState;
    _resolver: FragmentSpecResolver;

    constructor(props, context) {
      super(props, context);
      const relay = assertRelayContext(context.relay);
      const {createFragmentSpecResolver} = relay.environment.unstable_internal;
      this._resolver = createFragmentSpecResolver(
        relay,
        fragments,
        props,
        this._handleFragmentDataUpdate,
      );
      this.state = {
        data: this._resolver.resolve(),
        relayProp: {
          environment: relay.environment,
        },
      };
    }

    /**
     * When new props are received, read data for the new props and subscribe
     * for updates. Props may be the same in which case previous data and
     * subscriptions can be reused.
     */
    componentWillReceiveProps(nextProps, nextContext) {
      const context = nullthrows(nextContext);
      const relay = assertRelayContext(context.relay);
      if (relay !== this.context.relay) {
        const {createFragmentSpecResolver} = relay.environment.unstable_internal;
        this._resolver.dispose();
        this._resolver = createFragmentSpecResolver(
          relay,
          fragments,
          nextProps,
          this._handleFragmentDataUpdate,
        );
        const relayProp = {
          environment: relay.environment,
        };
        this.setState({relayProp});
      } else {
        this._resolver.setProps(nextProps);
      }
      const data = this._resolver.resolve();
      if (data !== this.state.data) {
        this.setState({data});
      }
    }

    componentWillUnmount() {
      this._resolver.dispose();
    }

    shouldComponentUpdate(nextProps, nextState, nextContext): boolean {
      // Short-circuit if any Relay-related data has changed
      if (
        nextContext.relay !== this.context.relay ||
        nextState.data !== this.state.data
      ) {
        return true;
      }
      // Otherwise, for convenience short-circuit if all non-Relay props
      // are scalar and equal
      const keys = Object.keys(nextProps);
      for (let ii = 0; ii < keys.length; ii++) {
        const key = keys[ii];
        if (
          !fragments.hasOwnProperty(key) &&
          !isScalarAndEqual(nextProps[key], this.props[key])
        ) {
          return true;
        }
      }
      return false;
    }

    /**
     * Render new data for the existing props/context.
     */
    _handleFragmentDataUpdate = () => {
      const data = this._resolver.resolve();
      const profiler = RelayProfiler.profile(
        'ReactRelayFragmentContainer.handleFragmentDataUpdate'
      );
      this.setState({data}, profiler.stop);
    };

    render() {
      if (ComponentClass) {
        return (
          <ComponentClass
            {...this.props}
            {...this.state.data}
            ref={'component'} // eslint-disable-line react/no-string-refs
            relay={this.state.relayProp}
          />
        );
      } else {
        // Stateless functional, doesn't support `ref`
        return React.createElement(Component, {
          ...this.props,
          ...this.state.data,
          relay: this.state.relayProp,
        });
      }
    }
  }
  profileContainer(Container, 'ReactRelayFragmentContainer');
  Container.contextTypes = containerContextTypes;
  Container.displayName = containerName;

  return (Container: any);
}

function assertRelayContext(relay: mixed): RelayContext {
  invariant(
    isRelayContext(relay),
    'ReactRelayFragmentContainer: Expected `context.relay` to be an object ' +
    'conforming to the `RelayContext` interface, got `%s`.',
    relay
  );
  return (relay: any);
}

/**
 * Wrap the basic `createContainer()` function with logic to adapt to the
 * `context.relay.environment` in which it is rendered. Specifically, the
 * extraction of the environment-specific version of fragments in the
 * `fragmentSpec` is memoized once per environment, rather than once per
 * instance of the container constructed/rendered.
 */
function createContainer<TBase: ReactClass<*>>(
  Component: TBase,
  fragmentSpec: GraphQLTaggedNode | GeneratedNodeMap,
): TBase {
  return buildReactRelayContainer(
    Component,
    fragmentSpec,
    createContainerWithFragments,
  );
}

module.exports = {createContainer, createContainerWithFragments};
