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
const ReactRelayQueryFetcher = require('./ReactRelayQueryFetcher');
const RelayPropTypes = require('../classic/container/RelayPropTypes');

const areEqual = require('areEqual');
const buildReactRelayContainer = require('./buildReactRelayContainer');

const {assertRelayContext} = require('../classic/environment/RelayContext');
const {profileContainer} = require('./ReactRelayContainerProfiler');
const {getContainerName} = require('./ReactRelayContainerUtils');
const {Observable, RelayProfiler, isScalarAndEqual} = require('RelayRuntime');

import type {FragmentSpecResolver} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {RelayEnvironmentInterface as ClassicEnvironment} from '../classic/store/RelayEnvironment';
import type {
  $RelayProps,
  ObserverOrCallback,
  GeneratedNodeMap,
  RefetchOptions,
  RelayRefetchProp,
} from './ReactRelayTypes';
import type {
  Disposable,
  FragmentMap,
  GraphQLTaggedNode,
  IEnvironment,
  RelayContext,
  Subscription,
  Variables,
} from 'RelayRuntime';

type ContainerProps = $FlowFixMeProps;

type ContainerState = {
  data: {[key: string]: mixed},
  prevProps: ContainerProps,
  localVariables: ?Variables,
  relay: RelayContext,
  relayContext: RelayContext,
  relayEnvironment: IEnvironment | ClassicEnvironment,
  relayProp: RelayRefetchProp,
  relayVariables: Variables,
  resolver: FragmentSpecResolver,
};
const containerContextTypes = {
  relay: RelayPropTypes.Relay,
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
  taggedNode: GraphQLTaggedNode,
): React.ComponentType<
  $RelayProps<React.ElementConfig<TComponent>, RelayRefetchProp>,
> {
  const containerName = getContainerName(Component);

  class Container extends React.Component<ContainerProps, ContainerState> {
    static displayName = containerName;
    static contextTypes = containerContextTypes;

    _refetchSubscription: ?Subscription;
    _queryFetcher: ?ReactRelayQueryFetcher;

    constructor(props, context) {
      super(props, context);
      const relay = assertRelayContext(context.relay);
      const {createFragmentSpecResolver} = relay.environment.unstable_internal;
      this._refetchSubscription = null;
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
        localVariables: null,
        relay,
        relayContext: {
          environment: relay.environment,
          variables: relay.variables,
        },
        relayEnvironment: relay.environment,
        relayProp: {
          environment: relay.environment,
          refetch: this._refetch,
        },
        prevProps: this.props,
        relayVariables: relay.variables,
        resolver,
      };
    }

    componentDidMount() {
      this._subscribeToNewResolver();
    }

    componentDidUpdate(prevProps: ContainerProps, prevState: ContainerState) {
      // If the environment has changed or props point to new records then
      // previously fetched data and any pending fetches no longer apply:
      // - Existing references are on the old environment.
      // - Existing references are based on old variables.
      // - Pending fetches are for the previous records.
      if (this.state.resolver !== prevState.resolver) {
        prevState.resolver.dispose();
        this._queryFetcher && this._queryFetcher.dispose();
        this._refetchSubscription && this._refetchSubscription.unsubscribe();

        this._subscribeToNewResolver();
      }
    }

    /**
     * When new props are received, read data for the new props and add it to
     * state. Props may be the same in which case previous data can be reused.
     */
    static getDerivedStateFromProps(
      nextProps: ContainerProps,
      prevState: ContainerState,
    ): $Shape<ContainerState> | null {
      // Any props change could impact the query, so we mirror props in state.
      // This is an unusual pattern, but necessary for this container usecase.
      const {prevProps} = prevState;
      const relay = assertRelayContext(prevState.relay);

      const {
        createFragmentSpecResolver,
        getDataIDsFromObject,
      } = relay.environment.unstable_internal;
      const prevIDs = getDataIDsFromObject(fragments, prevProps);
      const nextIDs = getDataIDsFromObject(fragments, nextProps);

      let resolver = prevState.resolver;

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
        // Child containers rely on context.relay being mutated (for gDSFP).
        const mutatedRelayContext = prevState.relayContext;
        mutatedRelayContext.environment = relay.environment;
        mutatedRelayContext.variables = relay.variables;

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
          localVariables: null,
          prevProps: nextProps,
          relayContext: mutatedRelayContext,
          relayEnvironment: relay.environment,
          relayProp: {
            environment: relay.environment,
            // refetch should never really change
            refetch: prevState.relayProp.refetch,
          },
          relayVariables: relay.variables,
          resolver,
        };
      } else if (!prevState.localVariables) {
        resolver.setProps(nextProps);
      }
      const data = resolver.resolve();
      if (data !== prevState.data) {
        return {
          data,
          prevProps: nextProps,
        };
      }
      return null;
    }

    componentWillUnmount() {
      this.state.resolver.dispose();
      this._queryFetcher && this._queryFetcher.dispose();
      this._refetchSubscription && this._refetchSubscription.unsubscribe();
    }

    shouldComponentUpdate(nextProps, nextState, nextContext): boolean {
      // Short-circuit if any Relay-related data has changed
      if (
        nextState.data !== this.state.data ||
        nextState.relayProp !== this.state.relayProp
      ) {
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

    _subscribeToNewResolver() {
      const {data, resolver} = this.state;

      // Event listeners are only safe to add during the commit phase,
      // So they won't leak if render is interrupted or errors.
      resolver.setCallback(this._handleFragmentDataUpdate);

      // External values could change between render and commit.
      // Check for this case, even though it requires an extra store read.
      const maybeNewData = resolver.resolve();
      if (data !== maybeNewData) {
        this.setState({data: maybeNewData});
      }
    }

    /**
     * Render new data for the existing props/context.
     */
    _handleFragmentDataUpdate = () => {
      const profiler = RelayProfiler.profile(
        'ReactRelayRefetchContainer.handleFragmentDataUpdate',
      );
      const resolverFromThisUpdate = this.state.resolver;
      this.setState(updatedState => {
        // If this event belongs to the current data source, update.
        // Otherwise we should ignore it.
        if (resolverFromThisUpdate === updatedState.resolver) {
          return {
            data: updatedState.resolver.resolve(),
          };
        }

        return null;
      }, profiler.stop);
    };

    _getFragmentVariables(): Variables {
      const {
        getVariablesFromObject,
      } = this.context.relay.environment.unstable_internal;
      return getVariablesFromObject(
        this.context.relay.variables,
        fragments,
        this.props,
      );
    }

    _getQueryFetcher(): ReactRelayQueryFetcher {
      if (!this._queryFetcher) {
        this._queryFetcher = new ReactRelayQueryFetcher();
      }
      return this._queryFetcher;
    }

    _refetch = (
      refetchVariables:
        | Variables
        | ((fragmentVariables: Variables) => Variables),
      renderVariables: ?Variables,
      observerOrCallback: ?ObserverOrCallback,
      options: ?RefetchOptions,
    ): Disposable => {
      const {environment, variables: rootVariables} = assertRelayContext(
        this.context.relay,
      );
      let fetchVariables =
        typeof refetchVariables === 'function'
          ? refetchVariables(this._getFragmentVariables())
          : refetchVariables;
      fetchVariables = {...rootVariables, ...fetchVariables};
      const fragmentVariables = renderVariables
        ? {...rootVariables, ...renderVariables}
        : fetchVariables;
      const cacheConfig = options ? {force: !!options.force} : undefined;

      const observer =
        typeof observerOrCallback === 'function'
          ? {
              // callback is not exectued on complete or unsubscribe
              // for backward compatibility
              next: observerOrCallback,
              error: observerOrCallback,
            }
          : observerOrCallback || ({}: any);

      const {
        createOperationSelector,
        getRequest,
      } = this.context.relay.environment.unstable_internal;
      const query = getRequest(taggedNode);
      const operation = createOperationSelector(query, fetchVariables);

      // TODO: T26288752 find a better way
      /* eslint-disable lint/react-state-props-mutation */
      this.state.localVariables = fetchVariables;
      /* eslint-enable lint/react-state-props-mutation */

      // Cancel any previously running refetch.
      this._refetchSubscription && this._refetchSubscription.unsubscribe();

      // Declare refetchSubscription before assigning it in .start(), since
      // synchronous completion may call callbacks .subscribe() returns.
      let refetchSubscription;
      this._getQueryFetcher()
        .execute({
          environment,
          operation,
          cacheConfig,
          // TODO (T26430099): Cleanup old references
          preservePreviousReferences: true,
        })
        .mergeMap(response => {
          // Child containers rely on context.relay being mutated (for gDSFP).
          // TODO: T26288752 find a better way
          /* eslint-disable lint/react-state-props-mutation */
          this.state.relayContext.environment = this.context.relay.environment;
          this.state.relayContext.variables = fragmentVariables;
          /* eslint-enable lint/react-state-props-mutation */
          this.state.resolver.setVariables(fragmentVariables);
          return Observable.create(sink =>
            this.setState({data: this.state.resolver.resolve()}, () => {
              sink.next();
              sink.complete();
            }),
          );
        })
        .finally(() => {
          // Finalizing a refetch should only clear this._refetchSubscription
          // if the finizing subscription is the most recent call.
          if (this._refetchSubscription === refetchSubscription) {
            this._refetchSubscription = null;
          }
        })
        .subscribe({
          ...observer,
          start: subscription => {
            this._refetchSubscription = refetchSubscription = subscription;
            observer.start && observer.start(subscription);
          },
        });

      return {
        dispose() {
          refetchSubscription && refetchSubscription.unsubscribe();
        },
      };
    };

    getChildContext(): Object {
      return {relay: this.state.relayContext};
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
  profileContainer(Container, 'ReactRelayRefetchContainer');

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
  taggedNode: GraphQLTaggedNode,
): React.ComponentType<
  $RelayProps<React.ElementConfig<TComponent>, RelayRefetchProp>,
> {
  return buildReactRelayContainer(
    Component,
    fragmentSpec,
    (ComponentClass, fragments) =>
      createContainerWithFragments(ComponentClass, fragments, taggedNode),
    /* provides child context */ true,
  );
}

module.exports = {createContainer, createContainerWithFragments};
