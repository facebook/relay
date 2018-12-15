/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const ReactRelayContext = require('./ReactRelayContext');
const ReactRelayQueryFetcher = require('./ReactRelayQueryFetcher');

const areEqual = require('areEqual');
const buildReactRelayContainer = require('./buildReactRelayContainer');
const warning = require('warning');

const {profileContainer} = require('./ReactRelayContainerProfiler');
const {getContainerName} = require('./ReactRelayContainerUtils');
const {assertRelayContext} = require('./RelayContext');
const {Observable, RelayProfiler, isScalarAndEqual} = require('relay-runtime');

import type {FragmentSpecResolver} from '../classic/environment/RelayCombinedEnvironmentTypes';
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
  RelayContext,
  Subscription,
  Variables,
} from 'relay-runtime';

type ContainerProps = $FlowFixMeProps;

type ContainerState = {
  data: {[key: string]: mixed},
  prevProps: ContainerProps,
  localVariables: ?Variables,
  prevPropsContext: RelayContext,
  relayProp: RelayRefetchProp,
  resolver: FragmentSpecResolver,
  contextForChildren: RelayContext,
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
  $RelayProps<React$ElementConfig<TComponent>, RelayRefetchProp>,
> {
  const containerName = getContainerName(Component);

  class Container extends React.Component<ContainerProps, ContainerState> {
    static displayName = containerName;

    _refetchSubscription: ?Subscription;
    _queryFetcher: ?ReactRelayQueryFetcher;
    _isUnmounted: boolean;

    constructor(props) {
      super(props);
      const relayContext = assertRelayContext(props.__relayContext);
      this._refetchSubscription = null;
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
        localVariables: null,
        prevProps: props,
        prevPropsContext: relayContext,
        contextForChildren: relayContext,
        relayProp: getRelayProp(relayContext.environment, this._refetch),
        resolver,
      };
      this._isUnmounted = false;
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
      const relayContext = assertRelayContext(nextProps.__relayContext);

      const {
        createFragmentSpecResolver,
        getDataIDsFromObject,
      } = relayContext.environment.unstable_internal;
      const prevIDs = getDataIDsFromObject(fragments, prevProps);
      const nextIDs = getDataIDsFromObject(fragments, nextProps);

      let resolver = prevState.resolver;

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
          localVariables: null,
          prevProps: nextProps,
          prevPropsContext: relayContext,
          contextForChildren: relayContext,
          relayProp: getRelayProp(
            relayContext.environment,
            prevState.relayProp.refetch,
          ),
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
      this._isUnmounted = true;
      this.state.resolver.dispose();
      this._queryFetcher && this._queryFetcher.dispose();
      this._refetchSubscription && this._refetchSubscription.unsubscribe();
    }

    shouldComponentUpdate(nextProps, nextState): boolean {
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
        if (key === '__relayContext') {
          if (
            this.state.prevPropsContext.environment !==
              nextState.prevPropsContext.environment ||
            this.state.prevPropsContext.variables !==
              nextState.prevPropsContext.variables
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
      } = this.props.__relayContext.environment.unstable_internal;
      return getVariablesFromObject(
        this.props.__relayContext.variables,
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
      if (this._isUnmounted) {
        warning(
          false,
          'ReactRelayRefetchContainer: Unexpected call of `refetch` ' +
            'on unmounted container `%s`. It looks like some instances ' +
            'of your container still trying to refetch the data but they already ' +
            'unmounted. Please make sure you clear all timers, intervals, async ' +
            'calls, etc that may trigger `refetch`.',
          containerName,
        );
        return {
          dispose() {},
        };
      }

      const {environment, variables: rootVariables} = assertRelayContext(
        this.props.__relayContext,
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
      } = this.props.__relayContext.environment.unstable_internal;
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

      if (options?.fetchPolicy === 'store-or-network') {
        const storeSnapshot = this._getQueryFetcher().lookupInStore(
          environment,
          operation,
        );
        if (storeSnapshot != null) {
          this.state.resolver.setVariables(fragmentVariables);
          this.setState(
            latestState => ({
              data: latestState.resolver.resolve(),
              contextForChildren: {
                environment: this.props.__relayContext.environment,
                variables: fragmentVariables,
              },
            }),
            () => {
              observer.next && observer.next();
              observer.complete && observer.complete();
            },
          );
          return {
            dispose() {},
          };
        }
      }

      this._getQueryFetcher()
        .execute({
          environment,
          operation,
          cacheConfig,
          // TODO (T26430099): Cleanup old references
          preservePreviousReferences: true,
        })
        .mergeMap(response => {
          this.state.resolver.setVariables(fragmentVariables);
          return Observable.create(sink =>
            this.setState(
              latestState => ({
                data: latestState.resolver.resolve(),
                contextForChildren: {
                  environment: this.props.__relayContext.environment,
                  variables: fragmentVariables,
                },
              }),
              () => {
                sink.next();
                sink.complete();
              },
            ),
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

    render() {
      const {componentRef, __relayContext, ...props} = this.props;
      const {relayProp, contextForChildren} = this.state;
      return (
        <ReactRelayContext.Provider value={contextForChildren}>
          <Component
            {...props}
            {...this.state.data}
            ref={componentRef}
            relay={relayProp}
          />
        </ReactRelayContext.Provider>
      );
    }
  }
  profileContainer(Container, 'ReactRelayRefetchContainer');

  return Container;
}

function getRelayProp(environment, refetch): RelayRefetchProp {
  return {
    environment,
    refetch,
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
  taggedNode: GraphQLTaggedNode,
): React.ComponentType<
  $RelayProps<React$ElementConfig<TComponent>, RelayRefetchProp>,
> {
  return buildReactRelayContainer(
    Component,
    fragmentSpec,
    (ComponentClass, fragments) =>
      createContainerWithFragments(ComponentClass, fragments, taggedNode),
  );
}

module.exports = {createContainer, createContainerWithFragments};
