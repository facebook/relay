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

const areEqual = require('areEqual');
const buildReactRelayContainer = require('./buildReactRelayContainer');
const invariant = require('invariant');
const isRelayContext = require('../classic/environment/isRelayContext');
const isScalarAndEqual = require('isScalarAndEqual');
const polyfill = require('react-lifecycles-compat');

const {
  getComponentName,
  getReactComponent,
} = require('../classic/container/RelayContainerUtils');
const {profileContainer} = require('./ReactRelayContainerProfiler');
const {injectContext} = require('./ReactRelayContextConsumer');
const {RelayProfiler} = require('RelayRuntime');

import type {FragmentSpecResolver} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {$RelayProps, GeneratedNodeMap, RelayProp} from './ReactRelayTypes';
import type {FragmentMap, GraphQLTaggedNode, RelayContext} from 'RelayRuntime';

type ContainerProps = $FlowFixMeProps;
type ContainerState = {
  data: {[key: string]: mixed},
  fragmentSpecResolverCallback: () => void,
  prevProps: ContainerProps,
  relayProp: RelayProp,
  resolver: FragmentSpecResolver,
};

/**
 * Composes a React component class, returning a new class that intercepts
 * props, resolving them with the provided fragments and subscribing for
 * updates.
 */
function createContainerWithFragments<
  TConfig,
  TClass: React.ComponentType<TConfig>,
>(
  Component: TClass,
  fragments: FragmentMap,
): React.ComponentType<TConfig & {componentRef?: any}> {
  const ComponentClass = getReactComponent(Component);
  const componentName = getComponentName(Component);
  const containerName = `Relay(${componentName})`;

  class Container extends React.Component<ContainerProps, ContainerState> {
    constructor(props) {
      super(props);
      const relay = assertRelayContext(props.relay);
      const {createFragmentSpecResolver} = relay.environment.unstable_internal;
      const resolver = createFragmentSpecResolver(
        relay,
        containerName,
        fragments,
        props,
        this._handleFragmentDataUpdate,
      );
      this.state = {
        data: resolver.resolve(),
        fragmentSpecResolverCallback: this._handleFragmentDataUpdate,
        prevProps: this.props,
        relayProp: {
          isLoading: resolver.isLoading(),
          environment: relay.environment,
        },
        resolver,
      };
    }

    /**
     * When new props are received, read data for the new props and subscribe
     * for updates. Props may be the same in which case previous data and
     * subscriptions can be reused.
     */
    static getDerivedStateFromProps(
      nextProps: ContainerProps,
      prevState: ContainerState,
    ): $Shape<ContainerState> | null {
      // Any props change could impact the query, so we mirror props in state.
      // This is an unusual pattern, but necessary for this container usecase.
      const {prevProps} = prevState;

      const relay = assertRelayContext(nextProps.relay);
      const {
        createFragmentSpecResolver,
        getDataIDsFromObject,
      } = relay.environment.unstable_internal;
      const prevIDs = getDataIDsFromObject(fragments, prevProps);
      const nextIDs = getDataIDsFromObject(fragments, nextProps);

      let resolver: FragmentSpecResolver = prevState.resolver;

      // If the environment has changed or props point to new records then
      // previously fetched data and any pending fetches no longer apply:
      // - Existing references are on the old environment.
      // - Existing references are based on old variables.
      // - Pending fetches are for the previous records.
      if (
        prevProps.relay.environment !== relay.environment ||
        prevProps.relay.variables !== relay.variables ||
        !areEqual(prevIDs, nextIDs)
      ) {
        resolver.dispose();
        resolver = createFragmentSpecResolver(
          relay,
          containerName,
          fragments,
          nextProps,
          prevState.fragmentSpecResolverCallback,
        );

        return {
          data: resolver.resolve(),
          prevProps: nextProps,
          relayProp: {
            isLoading: resolver.isLoading(),
            environment: relay.environment,
          },
          resolver,
        };
      } else {
        resolver.setProps(nextProps);

        const data = resolver.resolve();
        if (data !== prevState.data) {
          return {
            data,
            prevProps: nextProps,
            relayProp: {
              isLoading: resolver.isLoading(),
              environment: relay.environment,
            },
          };
        }
      }

      return null;
    }

    componentWillUnmount() {
      this.state.resolver.dispose();
    }

    shouldComponentUpdate(nextProps, nextState): boolean {
      // Short-circuit if any Relay-related data has changed
      if (nextState.data !== this.state.data) {
        return true;
      }
      // Otherwise, for convenience short-circuit if all non-Relay props
      // are scalar and equal
      const keys = Object.keys(nextProps);
      for (let ii = 0; ii < keys.length; ii++) {
        const key = keys[ii];
        if (key === 'relay') {
          if (
            nextProps.relay.environment !== this.props.relay.environment ||
            nextProps.relay.variables !== this.props.relay.variables
          ) {
            return true;
          }
        } else {
          if (
            !fragments.hasOwnProperty(key) &&
            !isScalarAndEqual(nextProps[key], this.props[key])
          ) {
            return true;
          }
        }
      }
      return false;
    }

    /**
     * Render new data for the existing props/context.
     */
    _handleFragmentDataUpdate = () => {
      const profiler = RelayProfiler.profile(
        'ReactRelayFragmentContainer.handleFragmentDataUpdate',
      );
      this.setState(
        state => ({
          data: state.resolver.resolve(),
          relayProp: {
            isLoading: state.resolver.isLoading(),
            environment: state.relayProp.environment,
          },
        }),
        profiler.stop,
      );
    };

    render() {
      if (ComponentClass) {
        return (
          <ComponentClass
            {...this.props}
            {...this.state.data}
            // TODO: Remove the string ref fallback.
            ref={this.props.componentRef || 'component'}
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
  Container.displayName = containerName;

  // Make static getDerivedStateFromProps work with older React versions:
  polyfill(Container);

  // Inject context.relay as a prop so it's pasesd to getDerivedStateFromProps()
  return injectContext(Container);
}

function assertRelayContext(relay: mixed): RelayContext {
  invariant(
    isRelayContext(relay),
    'ReactRelayFragmentContainer: Expected `context.relay` to be an object ' +
      'conforming to the `RelayContext` interface, got `%s`.',
    relay,
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
function createContainer<Props: {}, TComponent: React.ComponentType<Props>>(
  Component: TComponent,
  fragmentSpec: GraphQLTaggedNode | GeneratedNodeMap,
): React.ComponentType<
  $RelayProps<React.ElementConfig<TComponent>, RelayProp>,
> {
  return buildReactRelayContainer(
    Component,
    fragmentSpec,
    createContainerWithFragments,
  );
}

module.exports = {createContainer, createContainerWithFragments};
