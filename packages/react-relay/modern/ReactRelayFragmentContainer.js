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

const areEqual = require('areEqual');
const buildReactRelayContainer = require('./buildReactRelayContainer');

const {assertRelayContext} = require('../classic/environment/RelayContext');
const {profileContainer} = require('./ReactRelayContainerProfiler');
const {getContainerName} = require('./ReactRelayContainerUtils');
const {RelayProfiler, isScalarAndEqual} = require('RelayRuntime');

import type {FragmentSpecResolver} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {RelayEnvironmentInterface as ClassicEnvironment} from '../classic/store/RelayEnvironment';
import type {$RelayProps, GeneratedNodeMap, RelayProp} from './ReactRelayTypes';
import type {
  FragmentMap,
  GraphQLTaggedNode,
  IEnvironment,
  RelayContext,
  Variables,
} from 'RelayRuntime';

type ContainerProps = $FlowFixMeProps;
type ContainerState = {
  data: {[key: string]: mixed},
  prevProps: ContainerProps,
  relay: RelayContext,
  relayEnvironment: IEnvironment | ClassicEnvironment,
  relayProp: RelayProp,
  relayVariables: Variables,
  resolver: FragmentSpecResolver,
};

/**
 * Composes a React component class, returning a new class that intercepts
 * props, resolving them with the provided fragments and subscribing for
 * updates.
 */
function createContainerWithFragments<
  Props: {},
  TComponent: React.ComponentType<Props>,
>(
  Component: TComponent,
  fragments: FragmentMap,
): React.ComponentType<
  $RelayProps<React.ElementConfig<TComponent>, RelayProp>,
> {
  const containerName = getContainerName(Component);

  class Container extends React.Component<ContainerProps, ContainerState> {
    static displayName = containerName;
    static contextTypes = {
      relay: RelayPropTypes.Relay,
    };

    constructor(props, context) {
      super(props, context);
      const relay = assertRelayContext(context.relay);
      const {createFragmentSpecResolver} = relay.environment.unstable_internal;
      // Do not provide a subscription/callback here.
      // It is possible for this render to be interrupted or aborted,
      // In which case the subscription would cause a leak.
      // We will add the subscription in componentDidMount().
      const resolver = createFragmentSpecResolver(
        relay,
        containerName,
        fragments,
        props,
      );
      this.state = {
        data: resolver.resolve(),
        relay,
        relayEnvironment: context.relay.environment,
        prevProps: this.props,
        relayVariables: context.relay.variables,
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
      const {prevProps, relay} = prevState;

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
        prevState.relayEnvironment !== relay.environment ||
        prevState.relayVariables !== relay.variables ||
        !areEqual(prevIDs, nextIDs)
      ) {
        // Do not provide a subscription/callback here.
        // It is possible for this render to be interrupted or aborted,
        // In which case the subscription would cause a leak.
        // We will add the subscription in componentDidUpdate().
        resolver = createFragmentSpecResolver(
          relay,
          containerName,
          fragments,
          nextProps,
        );

        return {
          data: resolver.resolve(),
          relayEnvironment: relay.environment,
          prevProps: nextProps,
          relayVariables: relay.variables,
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
            relayEnvironment: relay.environment,
            prevProps: nextProps,
            relayVariables: relay.variables,
            relayProp: {
              isLoading: resolver.isLoading(),
              environment: relay.environment,
            },
          };
        }
      }

      return null;
    }

    componentDidMount() {
      this._subscribeToNewResolver();
      this._rerenderIfStoreHasChanged();
    }

    componentDidUpdate(prevProps: ContainerProps, prevState: ContainerState) {
      if (this.state.resolver !== prevState.resolver) {
        prevState.resolver.dispose();

        this._subscribeToNewResolver();
      }
      this._rerenderIfStoreHasChanged();
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
            nextState.relayEnvironment !== this.state.relayEnvironment ||
            nextState.relayVariables !== this.state.relayVariables
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
      const resolverFromThisUpdate = this.state.resolver;
      this.setState(updatedState => {
        // If this event belongs to the current data source, update.
        // Otherwise we should ignore it.
        if (resolverFromThisUpdate === updatedState.resolver) {
          return {
            data: updatedState.resolver.resolve(),
            relayProp: {
              isLoading: updatedState.resolver.isLoading(),
              environment: updatedState.relayProp.environment,
            },
          };
        }

        return null;
      }, profiler.stop);
    };

    _rerenderIfStoreHasChanged() {
      const {data, resolver} = this.state;
      // External values could change between render and commit.
      // Check for this case, even though it requires an extra store read.
      const maybeNewData = resolver.resolve();
      if (data !== maybeNewData) {
        this.setState({data: maybeNewData});
      }
    }

    _subscribeToNewResolver() {
      const {resolver} = this.state;

      // Event listeners are only safe to add during the commit phase,
      // So they won't leak if render is interrupted or errors.
      resolver.setCallback(this._handleFragmentDataUpdate);
    }

    render() {
      const {componentRef, ...props} = this.props;
      return React.createElement(Component, {
        ...props,
        ...this.state.data,
        ref: componentRef,
        relay: this.state.relayProp,
      });
    }
  }
  profileContainer(Container, 'ReactRelayFragmentContainer');

  return Container;
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
    /* provides child context */ false,
  );
}

module.exports = {createContainer, createContainerWithFragments};
