/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');

const areEqual = require('areEqual');
const buildReactRelayContainer = require('./buildReactRelayContainer');

const {profileContainer} = require('./ReactRelayContainerProfiler');
const {getContainerName} = require('./ReactRelayContainerUtils');
const {assertRelayContext} = require('./RelayContext');
const {RelayProfiler, isScalarAndEqual} = require('relay-runtime');

import type {FragmentSpecResolver} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {$RelayProps, GeneratedNodeMap, RelayProp} from './ReactRelayTypes';
import type {FragmentMap, GraphQLTaggedNode, RelayContext} from 'relay-runtime';

type ContainerProps = $FlowFixMeProps;
type ContainerState = {
  data: {[key: string]: mixed},
  prevProps: ContainerProps,
  prevPropsContext: RelayContext,
  relayProp: RelayProp,
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
  $RelayProps<React$ElementConfig<TComponent>, RelayProp>,
> {
  const containerName = getContainerName(Component);

  class Container extends React.Component<ContainerProps, ContainerState> {
    static displayName = containerName;
    constructor(props) {
      super(props);
      const relayContext = assertRelayContext(props.__relayContext);
      const {
        createFragmentSpecResolver,
      } = relayContext.environment.unstable_internal;
      // Do not provide a subscription/callback here.
      // It is possible for this render to be interrupted or aborted,
      // In which case the subscription would cause a leak.
      // We will add the subscription in componentDidMount().
      const resolver = createFragmentSpecResolver(
        relayContext,
        containerName,
        fragments,
        props,
      );
      this.state = {
        data: resolver.resolve(),
        prevProps: props,
        prevPropsContext: relayContext,
        relayProp: getRelayProp(relayContext.environment),
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
      const relayContext = assertRelayContext(nextProps.__relayContext);
      const {
        createFragmentSpecResolver,
        getDataIDsFromObject,
      } = relayContext.environment.unstable_internal;
      const prevIDs = getDataIDsFromObject(fragments, prevProps);
      const nextIDs = getDataIDsFromObject(fragments, nextProps);

      let resolver: FragmentSpecResolver = prevState.resolver;

      // If the environment has changed or props point to new records then
      // previously fetched data and any pending fetches no longer apply:
      // - Existing references are on the old environment.
      // - Existing references are based on old variables.
      // - Pending fetches are for the previous records.
      if (
        prevState.prevPropsContext.environment !== relayContext.environment ||
        prevState.prevPropsContext.variables !== relayContext.variables ||
        !areEqual(prevIDs, nextIDs)
      ) {
        // Do not provide a subscription/callback here.
        // It is possible for this render to be interrupted or aborted,
        // In which case the subscription would cause a leak.
        // We will add the subscription in componentDidUpdate().
        resolver = createFragmentSpecResolver(
          relayContext,
          containerName,
          fragments,
          nextProps,
        );

        return {
          data: resolver.resolve(),
          prevPropsContext: relayContext,
          prevProps: nextProps,
          relayProp: getRelayProp(relayContext.environment),
          resolver,
        };
      } else {
        resolver.setProps(nextProps);

        const data = resolver.resolve();
        if (data !== prevState.data) {
          return {
            data,
            prevProps: nextProps,
            prevPropsContext: relayContext,
            relayProp: getRelayProp(relayContext.environment),
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
        if (key === '__relayContext') {
          if (
            nextState.prevPropsContext.environment !==
              this.state.prevPropsContext.environment ||
            nextState.prevPropsContext.variables !==
              this.state.prevPropsContext.variables
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
            relayProp: getRelayProp(updatedState.relayProp.environment),
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
      const {componentRef, __relayContext: _, ...props} = this.props;
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

function getRelayProp(environment) {
  return {
    environment,
  };
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
  $RelayProps<React$ElementConfig<TComponent>, RelayProp>,
> {
  return buildReactRelayContainer(
    Component,
    fragmentSpec,
    createContainerWithFragments,
  );
}

module.exports = {createContainer, createContainerWithFragments};
