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
const isScalarAndEqual = require('isScalarAndEqual');
const nullthrows = require('nullthrows');
const warning = require('warning');

const {
  getComponentName,
  getReactComponent,
} = require('../classic/container/RelayContainerUtils');
const {profileContainer} = require('./ReactRelayContainerProfiler');
const {
  ConnectionInterface,
  RelayConcreteNode,
  RelayProfiler,
  Observable,
} = require('RelayRuntime');

import type {FragmentSpecResolver} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {
  $RelayProps,
  ObserverOrCallback,
  GeneratedNodeMap,
  RefetchOptions,
  RelayPaginationProp,
} from './ReactRelayTypes';
import type {
  CacheConfig,
  ConnectionMetadata,
  Disposable,
  FragmentMap,
  GraphQLTaggedNode,
  Observer,
  PageInfo,
  RelayContext,
  Subscription,
  Variables,
} from 'RelayRuntime';

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
 * Extends the functionality of RelayFragmentContainer by providing a mechanism
 * to load more data from a connection.
 *
 * # Configuring a PaginationContainer
 *
 * PaginationContainer accepts the standard FragmentContainer arguments and an
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
 * loadMore(pageSize: number, callback: ?(error: ?Error) => void): ?Disposable
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
 *         pageInfo {
 *           startCursor
 *           endCursor
 *           hasNextPage
 *           hasPreviousPage
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
 *         ...RelayFBCompatQueryConstants.get(),
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
  return (prevVars: Variables, totalCount: number) => ({
    ...prevVars,
    [countVariable]: totalCount,
  });
}

type ReactConnectionMetadata = ConnectionMetadata & {
  fragmentName: string,
};

function findConnectionMetadata(fragments): ReactConnectionMetadata {
  let foundConnectionMetadata = null;
  let isRelayModern = false;
  for (const fragmentName in fragments) {
    const fragment = fragments[fragmentName];
    const connectionMetadata: ?Array<ConnectionMetadata> = (fragment.metadata &&
      fragment.metadata.connection: any);
    // HACK: metadata is always set to `undefined` in classic. In modern, even
    // if empty, it is set to null (never undefined). We use that knowlege to
    // check if we're dealing with classic or modern
    if (fragment.metadata !== undefined) {
      isRelayModern = true;
    }
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
  invariant(
    !isRelayModern || foundConnectionMetadata !== null,
    'ReactRelayPaginationContainer: A @connection directive must be present.',
  );
  return foundConnectionMetadata || ({}: any);
}

function toObserver(observerOrCallback: ?ObserverOrCallback): Observer<void> {
  return typeof observerOrCallback === 'function'
    ? {
        error: observerOrCallback,
        complete: observerOrCallback,
        unsubscribe: subscription => {
          typeof observerOrCallback === 'function' && observerOrCallback();
        },
      }
    : observerOrCallback || ({}: any);
}

function createContainerWithFragments<
  TConfig,
  TClass: React.ComponentType<TConfig>,
>(
  Component: TClass,
  fragments: FragmentMap,
  connectionConfig: ConnectionConfig,
): React.ComponentType<TConfig & {componentRef?: any}> {
  const ComponentClass = getReactComponent(Component);
  const componentName = getComponentName(Component);
  const containerName = `Relay(${componentName})`;

  const metadata = findConnectionMetadata(fragments);

  const getConnectionFromProps =
    connectionConfig.getConnectionFromProps ||
    createGetConnectionFromProps(metadata);

  const direction = connectionConfig.direction || metadata.direction;
  invariant(
    direction,
    'ReactRelayPaginationContainer: Unable to infer direction of the ' +
      'connection, possibly because both first and last are provided.',
  );

  const getFragmentVariables =
    connectionConfig.getFragmentVariables ||
    createGetFragmentVariables(metadata);

  class Container extends React.Component<$FlowFixMeProps, ContainerState> {
    _isARequestInFlight: boolean;
    _localVariables: ?Variables;
    _refetchSubscription: ?Subscription;
    _references: Array<Disposable>;
    _relayContext: RelayContext;
    _resolver: FragmentSpecResolver;

    constructor(props, context) {
      super(props, context);
      const relay = assertRelayContext(context.relay);
      const {createFragmentSpecResolver} = relay.environment.unstable_internal;
      this._isARequestInFlight = false;
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
        'ReactRelayPaginationContainer.handleFragmentDataUpdate',
      );
      this.setState({data: this._resolver.resolve()}, profiler.stop);
    };

    _getConnectionData(): ?{
      cursor: ?string,
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
      const {
        EDGES,
        PAGE_INFO,
        HAS_NEXT_PAGE,
        HAS_PREV_PAGE,
        END_CURSOR,
        START_CURSOR,
      } = ConnectionInterface.get();

      invariant(
        typeof connectionData === 'object',
        'ReactRelayPaginationContainer: Expected `getConnectionFromProps()` in `%s`' +
          'to return `null` or a plain object with %s and %s properties, got `%s`.' +
          componentName,
        EDGES,
        PAGE_INFO,
        connectionData,
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
        edges,
      );
      invariant(
        typeof pageInfo === 'object',
        'ReactRelayPaginationContainer: Expected `getConnectionFromProps()` in `%s`' +
          'to return an object with %s: Object, got `%s`.',
        componentName,
        PAGE_INFO,
        pageInfo,
      );
      const hasMore =
        direction === FORWARD
          ? pageInfo[HAS_NEXT_PAGE]
          : pageInfo[HAS_PREV_PAGE];
      const cursor =
        direction === FORWARD ? pageInfo[END_CURSOR] : pageInfo[START_CURSOR];
      if (
        typeof hasMore !== 'boolean' ||
        (edges.length !== 0 && typeof cursor === 'undefined')
      ) {
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
      return !!(
        connectionData &&
        connectionData.hasMore &&
        connectionData.cursor
      );
    };

    _isLoading = (): boolean => {
      return !!this._refetchSubscription;
    };

    _refetchConnection = (
      totalCount: number,
      observerOrCallback: ?ObserverOrCallback,
      refetchVariables: ?Variables,
    ): Disposable => {
      const paginatingVariables = {
        count: totalCount,
        cursor: null,
        totalCount,
      };
      const fetch = this._fetchPage(
        paginatingVariables,
        toObserver(observerOrCallback),
        {force: true},
        refetchVariables,
      );

      return {dispose: fetch.unsubscribe};
    };

    _loadMore = (
      pageSize: number,
      observerOrCallback: ?ObserverOrCallback,
      options: ?RefetchOptions,
    ): ?Disposable => {
      const observer = toObserver(observerOrCallback);
      const connectionData = this._getConnectionData();
      if (!connectionData) {
        Observable.create(sink => sink.complete()).subscribe(observer);
        return null;
      }
      const totalCount = connectionData.edgeCount + pageSize;
      if (options && options.force) {
        return this._refetchConnection(totalCount, observerOrCallback);
      }
      const {END_CURSOR, START_CURSOR} = ConnectionInterface.get();
      const cursor = connectionData.cursor;
      warning(
        cursor,
        'ReactRelayPaginationContainer: Cannot `loadMore` without valid `%s` (got `%s`)',
        direction === FORWARD ? END_CURSOR : START_CURSOR,
        cursor,
      );
      const paginatingVariables = {
        count: pageSize,
        cursor: cursor,
        totalCount,
      };
      const fetch = this._fetchPage(paginatingVariables, observer, options);
      return {dispose: fetch.unsubscribe};
    };

    _fetchPage(
      paginatingVariables: {
        count: number,
        cursor: ?string,
        totalCount: number,
      },
      observer: Observer<void>,
      options: ?RefetchOptions,
      refetchVariables: ?Variables,
    ): Subscription {
      const {environment} = assertRelayContext(this.context.relay);
      const {
        createOperationSelector,
        getRequest,
        getVariablesFromObject,
      } = environment.unstable_internal;
      const props = {
        ...this.props,
        ...this.state.data,
      };
      let fragmentVariables = getVariablesFromObject(
        this._relayContext.variables,
        fragments,
        this.props,
      );
      fragmentVariables = {...fragmentVariables, ...refetchVariables};
      let fetchVariables = connectionConfig.getVariables(
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
        componentName,
      );
      fetchVariables = {
        ...fetchVariables,
        ...refetchVariables,
      };
      this._localVariables = fetchVariables;

      const cacheConfig: ?CacheConfig = options
        ? {force: !!options.force}
        : undefined;
      if (cacheConfig && options && options.rerunParamExperimental) {
        cacheConfig.rerunParamExperimental = options.rerunParamExperimental;
      }
      const request = getRequest(connectionConfig.query);
      if (request.kind === RelayConcreteNode.BATCH_REQUEST) {
        throw new Error(
          'ReactRelayPaginationContainer: Batch request not yet ' +
            'implemented (T22954884)',
        );
      }
      const operation = createOperationSelector(request, fetchVariables);

      let refetchSubscription = null;

      // Immediately retain the results of the query to prevent cached
      // data from being evicted
      const reference = environment.retain(operation.root);
      this._references.push(reference);

      if (this._refetchSubscription) {
        this._refetchSubscription.unsubscribe();
      }

      const onNext = (payload, complete) => {
        this._relayContext = {
          environment: this.context.relay.environment,
          variables: {
            ...this.context.relay.variables,
            ...fragmentVariables,
          },
        };
        const prevData = this._resolver.resolve();
        this._resolver.setVariables(
          getFragmentVariables(
            fragmentVariables,
            paginatingVariables.totalCount,
          ),
        );
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
          this.setState({data: nextData}, complete);
        } else {
          complete();
        }
      };

      const cleanup = () => {
        if (this._refetchSubscription === refetchSubscription) {
          this._refetchSubscription = null;
          this._isARequestInFlight = false;
        }
      };

      this._isARequestInFlight = true;
      refetchSubscription = environment
        .execute({operation, cacheConfig})
        .mergeMap(payload =>
          Observable.create(sink => {
            onNext(payload, () => {
              sink.next(); // pass void to public observer's `next`
              sink.complete();
            });
          }),
        )
        // use do instead of finally so that observer's `complete` fires after cleanup
        .do({
          error: cleanup,
          complete: cleanup,
          unsubscribe: cleanup,
        })
        .subscribe(observer || {});

      this._refetchSubscription = this._isARequestInFlight
        ? refetchSubscription
        : null;

      return refetchSubscription;
    }

    _release() {
      this._resolver.dispose();
      this._references.forEach(disposable => disposable.dispose());
      this._references.length = 0;
      if (this._refetchSubscription) {
        this._refetchSubscription.unsubscribe();
        this._refetchSubscription = null;
        this._isARequestInFlight = false;
      }
    }

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
  connectionConfig: ConnectionConfig,
): React.ComponentType<
  $RelayProps<React.ElementConfig<TComponent>, RelayPaginationProp>,
> {
  const Container = buildReactRelayContainer(
    Component,
    fragmentSpec,
    (ComponentClass, fragments) =>
      createContainerWithFragments(ComponentClass, fragments, connectionConfig),
  );
  /* $FlowFixMe(>=0.53.0) This comment suppresses an error
   * when upgrading Flow's support for React. Common errors found when
   * upgrading Flow's React support are documented at
   * https://fburl.com/eq7bs81w */
  Container.childContextTypes = containerContextTypes;
  return Container;
}

module.exports = {createContainer, createContainerWithFragments};
