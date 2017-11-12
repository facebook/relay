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
const invariant = require('invariant');
const isRelayContext = require('../classic/environment/isRelayContext');
const isScalarAndEqual = require('../classic/util/isScalarAndEqual');
const nullthrows = require('nullthrows');

const {
  getComponentName,
  getReactComponent,
} = require('../classic/container/RelayContainerUtils');
const {profileContainer} = require('./ReactRelayContainerProfiler');
const {Observable, RelayProfiler, RelayConcreteNode} = require('RelayRuntime');

import type {
  Disposable,
  FragmentSpecResolver,
} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {Variables} from '../classic/tools/RelayTypes';
import type {
  ObserverOrCallback,
  GeneratedNodeMap,
  RefetchOptions,
  RelayRefetchProp,
} from './ReactRelayTypes';
import type {
  FragmentMap,
  GraphQLTaggedNode,
  RelayContext,
  Subscription,
} from 'RelayRuntime';

type ContainerState = {
  data: {[key: string]: mixed},
  relayProp: RelayRefetchProp,
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
  TConfig,
  TClass: React.ComponentType<TConfig>,
>(
  Component: TClass,
  fragments: FragmentMap,
  taggedNode: GraphQLTaggedNode,
): React.ComponentType<TConfig & {componentRef?: any}> {
  const ComponentClass = getReactComponent(Component);
  const componentName = getComponentName(Component);
  const containerName = `Relay(${componentName})`;

  class Container extends React.Component<$FlowFixMeProps, ContainerState> {
    _localVariables: ?Variables;
    _refetchSubscription: ?Subscription;
    _references: Array<Disposable>;
    _relayContext: RelayContext;
    _resolver: FragmentSpecResolver;

    constructor(props, context) {
      super(props, context);
      const relay = assertRelayContext(context.relay);
      const {createFragmentSpecResolver} = relay.environment.unstable_internal;
      this._localVariables = null;
      this._refetchSubscription = null;
      this._references = [];
      this._resolver = createFragmentSpecResolver(
        relay,
        containerName,
        fragments,
        props,
        this._handleFragmentDataUpdate,
      );
      this._relayContext = {
        environment: this.context.relay.environment,
        variables: this.context.relay.variables,
      };
      this.state = {
        data: this._resolver.resolve(),
        relayProp: this._buildRelayProp(relay),
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
      const {
        createFragmentSpecResolver,
        getDataIDsFromObject,
      } = relay.environment.unstable_internal;
      const prevIDs = getDataIDsFromObject(fragments, this.props);
      const nextIDs = getDataIDsFromObject(fragments, nextProps);

      // If the environment has changed or props point to new records then
      // previously fetched data and any pending fetches no longer apply:
      // - Existing references are on the old environment.
      // - Existing references are based on old variables.
      // - Pending fetches are for the previous records.
      if (
        this.context.relay.environment !== relay.environment ||
        this.context.relay.variables !== relay.variables ||
        !areEqual(prevIDs, nextIDs)
      ) {
        this._release();
        this._localVariables = null;
        this._relayContext = {
          environment: relay.environment,
          variables: relay.variables,
        };
        this._resolver = createFragmentSpecResolver(
          relay,
          containerName,
          fragments,
          nextProps,
          this._handleFragmentDataUpdate,
        );
        this.setState({relayProp: this._buildRelayProp(relay)});
      } else if (!this._localVariables) {
        this._resolver.setProps(nextProps);
      }
      const data = this._resolver.resolve();
      if (data !== this.state.data) {
        this.setState({data});
      }
    }

    componentWillUnmount() {
      this._release();
    }

    shouldComponentUpdate(nextProps, nextState, nextContext): boolean {
      // Short-circuit if any Relay-related data has changed
      if (
        nextContext.relay !== this.context.relay ||
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
        if (
          !fragments.hasOwnProperty(key) &&
          !isScalarAndEqual(nextProps[key], this.props[key])
        ) {
          return true;
        }
      }
      return false;
    }

    _release(): void {
      this._resolver.dispose();
      this._references.forEach(disposable => disposable.dispose());
      this._references.length = 0;
      this._refetchSubscription && this._refetchSubscription.unsubscribe();
    }

    _buildRelayProp(relay: RelayContext): RelayRefetchProp {
      return {
        environment: relay.environment,
        refetch: this._refetch,
      };
    }

    /**
     * Render new data for the existing props/context.
     */
    _handleFragmentDataUpdate = () => {
      const profiler = RelayProfiler.profile(
        'ReactRelayRefetchContainer.handleFragmentDataUpdate',
      );
      this.setState({data: this._resolver.resolve()}, profiler.stop);
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
      if (query.kind === RelayConcreteNode.BATCH_REQUEST) {
        throw new Error(
          'ReactRelayRefetchContainer: Batch request not yet ' +
            'implemented (T22955000)',
        );
      }
      const operation = createOperationSelector(query, fetchVariables);

      // Immediately retain the results of the query to prevent cached
      // data from being evicted
      const reference = environment.retain(operation.root);
      this._references.push(reference);

      this._localVariables = fetchVariables;

      // Cancel any previously running refetch.
      this._refetchSubscription && this._refetchSubscription.unsubscribe();

      // Declare refetchSubscription before assigning it in .start(), since
      // synchronous completion may call callbacks .subscribe() returns.
      let refetchSubscription;
      environment
        .execute({operation, cacheConfig})
        .mergeMap(response => {
          this._relayContext = {
            environment: this.context.relay.environment,
            variables: fragmentVariables,
          };
          this._resolver.setVariables(fragmentVariables);
          return Observable.create(sink =>
            this.setState({data: this._resolver.resolve()}, () => {
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
      return {relay: this._relayContext};
    }

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
  profileContainer(Container, 'ReactRelayRefetchContainer');
  Container.contextTypes = containerContextTypes;
  Container.displayName = containerName;

  return (Container: any);
}

function assertRelayContext(relay: mixed): RelayContext {
  invariant(
    isRelayContext(relay),
    'ReactRelayRefetchContainer: Expected `context.relay` to be an object ' +
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
function createContainer<TBase: React.ComponentType<*>>(
  Component: TBase,
  fragmentSpec: GraphQLTaggedNode | GeneratedNodeMap,
  taggedNode: GraphQLTaggedNode,
): TBase {
  const Container = buildReactRelayContainer(
    Component,
    fragmentSpec,
    (ComponentClass, fragments) =>
      createContainerWithFragments(ComponentClass, fragments, taggedNode),
  );
  /* $FlowFixMe(>=0.53.0) This comment suppresses an error
   * when upgrading Flow's support for React. Common errors found when
   * upgrading Flow's React support are documented at
   * https://fburl.com/eq7bs81w */
  Container.childContextTypes = containerContextTypes;
  return Container;
}

module.exports = {createContainer, createContainerWithFragments};
