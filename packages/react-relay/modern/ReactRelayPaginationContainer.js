/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayPaginationContainer
 * @flow
 */

'use strict';

const React = require('React');
const RelayProfiler = require('RelayProfiler');
const RelayPropTypes = require('RelayPropTypes');

const areEqual = require('areEqual');
const invariant = require('invariant');
const isRelayContext = require('isRelayContext');
const isScalarAndEqual = require('isScalarAndEqual');
const nullthrows = require('nullthrows');
const warning = require('warning');

const {buildCompatContainer} = require('ReactRelayCompatContainerBuilder');
const {profileContainer} = require('ReactRelayContainerProfiler');
const {
  EDGES,
  PAGE_INFO,
  HAS_NEXT_PAGE,
  HAS_PREV_PAGE,
  END_CURSOR,
  START_CURSOR,
} = require('RelayConnectionInterface');
const {getComponentName, getReactComponent} = require('RelayContainerUtils');

import type {
  GeneratedNodeMap,
  RefetchOptions,
  RelayPaginationProp,
} from 'ReactRelayTypes';
import type {
  Disposable,
  FragmentSpecResolver,
} from 'RelayCombinedEnvironmentTypes';
import type {ConnectionMetadata} from 'RelayConnectionHandler';
import type {PageInfo} from 'RelayConnectionInterface';
import type {GraphQLTaggedNode} from 'RelayStaticGraphQLTag';
import type {
  FragmentMap,
  RelayContext,
} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

type ContainerState = {
  data: {[key: string]: mixed},
  relayProp: RelayPaginationProp,
};

const containerContextTypes = {
  relay: RelayPropTypes.Relay,
};

const FORWARD = 'forward';

type FragmentVariablesGetter = (
  prevVars: Variables,
  totalCount: number,
) => Variables;

export type ConnectionConfig = {
  direction?: 'backward' | 'forward',
  getConnectionFromProps?: (props: Object) => ?ConnectionData,
  getFragmentVariables?: FragmentVariablesGetter,
  getVariables: (
    props: Object,
    paginationInfo: {count: number, cursor: ?string},
    fragmentVariables: Variables,
  ) => Variables,
  query: GraphQLTaggedNode,
};
export type ConnectionData = {
  edges?: ?Array<any>,
  pageInfo?: ?PageInfo,
};

/**
 * Extends the functionality of RelayCompatContainer by providing a mechanism
 * to load more data from a connection.
 *
 * # Configuring a PaginationContainer
 *
 * PaginationContainer accepts the standard CompatContainer arguments and an
 * additional `connectionConfig` argument:
 *
 * - `Component`: the component to be wrapped/rendered.
 * - `fragments`: an object whose values are `graphql` fragments. The object
 *   keys determine the prop names by which fragment data is available.
 * - `connectionConfig`: an object that determines how to load more connection
 *   data. Details below.
 *
 * # Loading More Data
 *
 * Use `props.relay.hasMore()` to determine if there are more items to load.
 *
 * ```
 * hasMore(): boolean
 * ```
 *
 * Use `props.relay.isLoading()` to determine if a previous call to `loadMore()`
 * is still pending. This is convenient for avoiding duplicate load calls.
 *
 * ```
 * isLoading(): boolean
 * ```
 *
 * Use `props.relay.loadMore()` to load more items. This will return null if
 * there are no more items to fetch, otherwise it will fetch more items and
 * return a Disposable that can be used to cancel the fetch.
 *
 * `pageSize` should be the number of *additional* items to fetch (not the
 * total).
 *
 * ```
 * loadMore(pageSize: number, callback: (error: ?Error) => void): ?Disposable
 * ```
 *
 * A complete example:
 *
 * ```
 * class Foo extends React.Component {
 *   ...
 *   _onEndReached() {
 *     if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
 *       return;
 *     }
 *     this.props.relay.loadMore(10);
 *   }
 *   ...
 * }
 * ```
 *
 * # Connection Config
 *
 * Here's an example, followed by details of each config property:
 *
 * ```
 * ReactRelayPaginationContainer.createContainer(
 *   Component,
 *   {
 *     user: graphql`fragment FriendsFragment on User {
 *       friends(after: $afterCursor first: $count) @connection {
 *         edges { ... }
 *         page_info {
 *           end_cursor
 *           has_next_page
 *         }
 *       }
 *     }`,
 *   },
 *   {
 *     direction: 'forward',
 *     getConnectionFromProps(props) {
 *       return props.user && props.user.friends;
 *     },
 *     getFragmentVariables(vars, totalCount) {
 *       // The component presumably wants *all* edges, not just those after
 *       // the cursor, so notice that we don't set $afterCursor here.
 *       return {
 *         ...vars,
 *         count: totalCount,
 *       };
 *     },
 *     getVariables(props, {count, cursor}, fragmentVariables) {
 *       return {
 *         ...RelayFBQueryConstants.get(),
 *         id: props.user.id,
 *         afterCursor: cursor,
 *         count,
 *       },
 *     },
 *     query: graphql`
 *       query FriendsQuery($id: ID!, $afterCursor: ID, $count: Int!) {
 *         node(id: $id) {
 *           ...FriendsFragment
 *         }
 *       }
 *     `,
 *   }
 * );
 * ```
 *
 * ## Config Properties
 *
 * - `direction`: Either "forward" to indicate forward pagination using
 *   after/first, or "backward" to indicate backward pagination using
 *   before/last.
 * - `getConnectionFromProps(props)`: PaginationContainer doesn't magically know
 *   which connection data you mean to fetch more of (a container might fetch
 *   multiple connections, but can only paginate one of them). This function is
 *   given the fragment props only (not full props), and should return the
 *   connection data. See the above example that returns the friends data via
 *   `props.user.friends`.
 * - `getFragmentVariables(previousVars, totalCount)`: Given the previous variables
 *   and the new total number of items, get the variables to use when reading
 *   your fragments. Typically this means setting whatever your local "count"
 *   variable is to the value of `totalCount`. See the example.
 * - `getVariables(props, {count, cursor})`: Get the variables to use when
 *   fetching the pagination `query`. You may determine the root object id from
 *   props (see the example that uses `props.user.id`) and may also set whatever
 *   variables you use for the after/first/before/last calls based on the count
 *   and cursor.
 * - `query`: A query to use when fetching more connection data. This should
 *   typically reference one of the container's fragment (as in the example)
 *   to ensure that all the necessary fields for sub-components are fetched.
 */

function createGetConnectionFromProps(metadata: ReactConnectionMetadata) {
  const path = metadata.path;
  invariant(
    path,
    'ReactRelayPaginationContainer: Unable to synthesize a ' +
      'getConnectionFromProps function.',
  );
  return props => {
    let data = props[metadata.fragmentName];
    for (let i = 0; i < path.length; i++) {
      if (!data || typeof data !== 'object') {
        return null;
      }
      data = data[path[i]];
    }
    return data;
  };
}

function createGetFragmentVariables(
  metadata: ReactConnectionMetadata,
): FragmentVariablesGetter {
  const countVariable = metadata.count;
  invariant(
    countVariable,
    'ReactRelayPaginationContainer: Unable to synthesize a ' +
      'getFragmentVariables function.',
  );
  return (
    prevVars: Variables,
    totalCount: number,
  ) => ({
    ...prevVars,
    [countVariable]: totalCount,
  });
}

type ReactConnectionMetadata = ConnectionMetadata & {
  fragmentName: string,
};

function findConnectionMetadata(fragments): ReactConnectionMetadata {
  let foundConnectionMetadata = null;
  for (const fragmentName in fragments) {
    const fragment = fragments[fragmentName];
    const connectionMetadata: ?Array<ConnectionMetadata> =
      (fragment.metadata && fragment.metadata.connection: any);
    if (connectionMetadata) {
      invariant(
        connectionMetadata.length === 1,
        'ReactRelayPaginationContainer: Only a single @connection is ' +
        'supported, `%s` has %s.',
        fragmentName,
        connectionMetadata.length,
      );
      invariant(
        !foundConnectionMetadata,
        'ReactRelayPaginationContainer: Only a single fragment with ' +
        '@connection is supported.',
      );
      foundConnectionMetadata = {
        ...connectionMetadata[0],
        fragmentName,
      };
    }
  }
  // TODO(t17350438) for modern, this should be an invariant.
  return foundConnectionMetadata || ({}: any);
}

function createContainerWithFragments<TDefaultProps, TProps>(
  Component: Class<React.Component<TDefaultProps, TProps, *>> | ReactClass<TProps>,
  fragments: FragmentMap,
  connectionConfig: ConnectionConfig,
): Class<React.Component<TDefaultProps, TProps, *>> {
  const ComponentClass = getReactComponent(Component);
  const componentName = getComponentName(Component);
  const containerName = `Relay(${componentName})`;

  const metadata = findConnectionMetadata(fragments);

  const getConnectionFromProps = connectionConfig.getConnectionFromProps ||
    createGetConnectionFromProps(metadata);

  const direction = connectionConfig.direction || metadata.direction;
  invariant(
    direction,
    'ReactRelayPaginationContainer: Unable to infer direction of the ' +
      'connection, possibly because both first and last are provided.',
  );

  const getFragmentVariables = connectionConfig.getFragmentVariables ||
    createGetFragmentVariables(metadata);

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

    _buildRelayProp(relay: RelayContext): RelayPaginationProp {
      return {
        hasMore: this._hasMore,
        isLoading: this._isLoading,
        loadMore: this._loadMore,
        refetchConnection: this._refetchConnection,
        environment: relay.environment,
      };
    }

    /**
     * Render new data for the existing props/context.
     */
    _handleFragmentDataUpdate = () => {
      const profiler = RelayProfiler.profile(
        'ReactRelayPaginationContainer.handleFragmentDataUpdate'
      );
      this.setState({data: this._resolver.resolve()}, profiler.stop);
    };

    _getConnectionData(): ?{
      cursor: string,
      edgeCount: number,
      hasMore: boolean,
    } {
      // Extract connection data and verify there are more edges to fetch
      const props = {
        ...this.props,
        ...this.state.data,
      };
      const connectionData = getConnectionFromProps(props);
      if (connectionData == null) {
        return null;
      }
      invariant(
        typeof connectionData === 'object',
        'ReactRelayPaginationContainer: Expected `getConnectionFromProps()` in `%s`' +
        'to return `null` or a plain object with %s and %s properties, got `%s`.' +
        componentName,
        EDGES,
        PAGE_INFO,
        connectionData
      );
      const edges = connectionData[EDGES];
      const pageInfo = connectionData[PAGE_INFO];
      if (edges == null || pageInfo == null) {
        return null;
      }
      invariant(
        Array.isArray(edges),
        'ReactRelayPaginationContainer: Expected `getConnectionFromProps()` in `%s`' +
        'to return an object with %s: Array, got `%s`.',
        componentName,
        EDGES,
        edges
      );
      invariant(
        typeof pageInfo === 'object',
        'ReactRelayPaginationContainer: Expected `getConnectionFromProps()` in `%s`' +
        'to return an object with %s: Object, got `%s`.',
        componentName,
        PAGE_INFO,
        pageInfo
      );
      const hasMore = direction === FORWARD ?
        pageInfo[HAS_NEXT_PAGE] :
        pageInfo[HAS_PREV_PAGE];
      const cursor = direction === FORWARD ?
        pageInfo[END_CURSOR] :
        pageInfo[START_CURSOR];
      if (typeof hasMore !== 'boolean' || typeof cursor !== 'string') {
        warning(
          false,
          'ReactRelayPaginationContainer: Cannot paginate without %s fields in `%s`. ' +
          'Be sure to fetch %s (got `%s`) and %s (got `%s`).',
          PAGE_INFO,
          componentName,
          direction === FORWARD ? HAS_NEXT_PAGE : HAS_PREV_PAGE,
          hasMore,
          direction === FORWARD ? END_CURSOR : START_CURSOR,
          cursor,
        );
        return null;
      }
      return {
        cursor,
        edgeCount: edges.length,
        hasMore,
      };
    }

    _hasMore = (): boolean => {
      const connectionData = this._getConnectionData();
      return !!connectionData && connectionData.hasMore;
    };

    _isLoading = (): boolean => {
      return !!this._pendingRefetch;
    };

    _refetchConnection = (
      totalCount: number,
      callback: (error: ?Error) => void,
    ): ?Disposable => {
      const paginatingVariables = {
        count: totalCount,
        cursor: null,
        totalCount,
      };
      return this._fetchPage(paginatingVariables, callback, {force: true});
    };

    _loadMore = (
      pageSize: number,
      callback: (error: ?Error) => void,
      options: ?RefetchOptions
    ): ?Disposable => {
      const connectionData = this._getConnectionData();
      if (!connectionData) {
        return null;
      }
      const totalCount = connectionData.edgeCount + pageSize;
      if (options && options.force) {
        return this._refetchConnection(totalCount, callback);
      }
      const paginatingVariables = {
        count: pageSize,
        cursor: connectionData.cursor,
        totalCount,
      };
      return this._fetchPage(paginatingVariables, callback, options);
    };

    _fetchPage(
      paginatingVariables: {
        count: number,
        cursor: ?string,
        totalCount: number,
      },
      callback: (error: ?Error) => void,
      options: ?RefetchOptions
    ): ?Disposable {
      const {environment} = assertRelayContext(this.context.relay);
      const {
        createOperationSelector,
        getOperation,
        getVariablesFromObject,
      } = environment.unstable_internal;
      const props = {
        ...this.props,
        ...this.state.data,
      };
      const fragmentVariables = getVariablesFromObject(
        this.context.relay.variables,
        fragments,
        this.props,
      );
      const fetchVariables = connectionConfig.getVariables(
        props,
        {
          count: paginatingVariables.count,
          cursor: paginatingVariables.cursor,
        },
        // Pass the variables used to fetch the fragments initially
        fragmentVariables,
      );
      invariant(
        typeof fetchVariables === 'object' && fetchVariables !== null,
        'ReactRelayPaginationContainer: Expected `getVariables()` to ' +
        'return an object, got `%s` in `%s`.',
        fetchVariables,
        componentName
      );
      this._localVariables = fetchVariables;

      const cacheConfig = options ? {force: !!options.force} : undefined;
      const query = getOperation(connectionConfig.query);
      const operation = createOperationSelector(query, fetchVariables);

      const onCompleted = () => {
        this._pendingRefetch = null;
        callback();
        this._updateSnapshots(paginatingVariables.totalCount);
      };
      const onError = error => {
        this._pendingRefetch = null;
        callback(error);
      };

      // Immediately retain the results of the query to prevent cached
      // data from being evicted
      const reference = environment.retain(operation.root);
      this._references.push(reference);

      if (this._pendingRefetch) {
        this._pendingRefetch.dispose();
      }
      const pendingRefetch = environment.streamQuery({
        cacheConfig,
        onCompleted,
        onError,
        operation,
      });
      this._pendingRefetch = pendingRefetch;
      return {
        dispose: () => {
          // Disposing a loadMore() call should always dispose the fetch itself,
          // but should not clear this._pendingFetch unless the loadMore() being
          // cancelled is the most recent call.
          pendingRefetch.dispose();
          if (this._pendingRefetch === pendingRefetch) {
            this._pendingRefetch = null;
          }
        },
      };
    }

    _updateSnapshots(totalCount: number): void {
      const {getVariablesFromObject} = this.context.relay.environment.unstable_internal;
      const prevVariables = getVariablesFromObject(
        this.context.relay.variables,
        fragments,
        this.props,
      );
      const nextVariables = getFragmentVariables(prevVariables, totalCount);

      const prevData = this._resolver.resolve();
      this._resolver.setVariables(nextVariables);
      const nextData = this._resolver.resolve();
      // Workaround slightly different handling for connection in different
      // core implementations:
      // - Classic core requires the count to be explicitly incremented
      // - Modern core automatically appends new items, updating the count
      //   isn't required to see new data.
      //
      // `setState` is only required if changing the variables would change the
      // resolved data.
      // TODO #14894725: remove PaginationContainer equal check
      if (!areEqual(prevData, nextData)) {
        this.setState({data: nextData});
      }
    }

    _release() {
      this._resolver.dispose();
      this._references.forEach(disposable => disposable.dispose());
      this._references.length = 0;
      if (this._pendingRefetch) {
        this._pendingRefetch.dispose();
        this._pendingRefetch = null;
      }
    }

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
  profileContainer(Container, 'ReactRelayPaginationContainer');
  Container.contextTypes = containerContextTypes;
  Container.displayName = containerName;

  return (Container: any);
}

function assertRelayContext(relay: mixed): RelayContext {
  invariant(
    isRelayContext(relay),
    'ReactRelayPaginationContainer: Expected `context.relay` to be an object ' +
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
  connectionConfig: ConnectionConfig,
): TBase {
  return buildCompatContainer(
    Component,
    (fragmentSpec: any),
    (ComponentClass, fragments) => {
      return createContainerWithFragments(ComponentClass, fragments, connectionConfig);
    },
  );
}

module.exports = {
  createContainer,
  createContainerWithFragments,
};
