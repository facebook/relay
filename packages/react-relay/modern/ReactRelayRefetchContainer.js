/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayRefetchContainer
 * @flow
 */

'use strict';

const React = require('React');
const RelayProfiler = require('RelayProfiler');
const RelayPropTypes = require('RelayPropTypes');

const areEqual = require('areEqual');
const buildReactRelayContainer = require('buildReactRelayContainer');
const invariant = require('invariant');
const isRelayContext = require('isRelayContext');
const isScalarAndEqual = require('isScalarAndEqual');
const nullthrows = require('nullthrows');

const {profileContainer} = require('ReactRelayContainerProfiler');
const {getComponentName, getReactComponent} = require('RelayContainerUtils');

import type {
  GeneratedNodeMap,
  RefetchOptions,
  RelayRefetchProp,
} from 'ReactRelayTypes';
import type {
  Disposable,
  FragmentSpecResolver,
} from 'RelayCombinedEnvironmentTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {FragmentMap, RelayContext} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

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
function createContainerWithFragments<TBase: ReactClass<*>>(
  Component: TBase,
  fragments: FragmentMap,
  taggedNode: GraphQLTaggedNode,
): TBase {
  const ComponentClass = getReactComponent(Component);
  const componentName = getComponentName(Component);
  const containerName = `Relay(${componentName})`;

  class Container extends React.Component {
    state: ContainerState;
    _localVariables: ?Variables;
    _pendingRefetch: ?Disposable;
    _references: Array<Disposable>;
    _resolver: FragmentSpecResolver;

    constructor(props, context) {
      super(props, context);
      const relay = assertRelayContext(context.relay);
      const {createFragmentSpecResolver} = relay.environment.unstable_internal;
      this._localVariables = null;
      this._pendingRefetch = null;
      this._references = [];
      this._resolver = createFragmentSpecResolver(
        relay,
        fragments,
        props,
        this._handleFragmentDataUpdate,
      );
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
      // - Pending fetches are for the previous records.
      if (
        this.context.relay.environment !== relay.environment ||
        !areEqual(prevIDs, nextIDs)
      ) {
        this._release();
        this._localVariables = null;
        this._resolver = createFragmentSpecResolver(
          relay,
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
      if (this._pendingRefetch) {
        this._pendingRefetch.dispose();
        this._pendingRefetch = null;
      }
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
        'ReactRelayRefetchContainer.handleFragmentDataUpdate'
      );
      this.setState({data: this._resolver.resolve()}, profiler.stop);
    };

    _getFragmentVariables(): Variables {
      const {getVariablesFromObject} = this.context.relay.environment.unstable_internal;
      return getVariablesFromObject(
        this.context.relay.variables,
        fragments,
        this.props,
      );
    }

    _refetch = (
      refetchVariables: Variables | (fragmentVariables: Variables) => Variables,
      renderVariables: ?Variables,
      callback: ?(error: ?Error) => void,
      options: ?RefetchOptions
    ): Disposable => {
      const {environment, variables: rootVariables} = assertRelayContext(this.context.relay);
      let fetchVariables = typeof refetchVariables === 'function' ?
        refetchVariables(this._getFragmentVariables()) :
        refetchVariables;
      fetchVariables = {...rootVariables, ...fetchVariables};
      const fragmentVariables = renderVariables ?
        {...rootVariables, ...renderVariables} :
        fetchVariables;

      const onNext = response => {
        if (!this._pendingRefetch) {
          // only call callback once per refetch
          return;
        }
        // TODO t15106389: add helper utility for fetching more data
        this._pendingRefetch = null;
        callback && callback();
        this._resolver.setVariables(fragmentVariables);
        this.setState({data: this._resolver.resolve()});
      };
      const onError = error => {
        this._pendingRefetch = null;
        callback && callback(error);
      };

      const cacheConfig = options ? {force: !!options.force} : undefined;
      const {
        createOperationSelector,
        getOperation,
      } = this.context.relay.environment.unstable_internal;
      const query = getOperation(taggedNode);
      const operation = createOperationSelector(query, fetchVariables);

      // Immediately retain the results of the query to prevent cached
      // data from being evicted
      const reference = environment.retain(operation.root);
      this._references.push(reference);

      this._localVariables = fetchVariables;
      if (this._pendingRefetch) {
        this._pendingRefetch.dispose();
      }
      const pendingRefetch = environment.streamQuery({
        cacheConfig,
        onError,
        onNext,
        operation,
      });
      this._pendingRefetch = pendingRefetch;
      return {
        dispose: () => {
          // Disposing a refetch() call should always dispose the fetch itself,
          // but should not clear this._pendingFetch unless the refetch() being
          // cancelled is the most recent call.
          pendingRefetch.dispose();
          if (this._pendingRefetch === pendingRefetch) {
            this._pendingRefetch = null;
          }
        },
      };
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
  taggedNode: GraphQLTaggedNode,
): TBase {
  return buildReactRelayContainer(
    Component,
    fragmentSpec,
    (ComponentClass, fragments) => createContainerWithFragments(
      ComponentClass,
      fragments,
      taggedNode,
    ),
  );
}

module.exports = {createContainer, createContainerWithFragments};
