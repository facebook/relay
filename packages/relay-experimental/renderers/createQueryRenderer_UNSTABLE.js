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
const ReactRelayContext = require('react-relay/modern/ReactRelayContext');

const areEqual = require('areEqual');
const invariant = require('invariant');
const retainQuery_UNSTABLE = require('../helpers/retainQuery_UNSTABLE');

const {
  getCacheForEnvironment,
  DataResourceCacheContext,
} = require('./DataResourceCache_UNSTABLE');

import type {FetchPolicy, ReadPolicy} from './DataResourceCache_UNSTABLE';
import type {
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  OperationType,
  RelayContext,
  Snapshot,
  Variables,
} from 'relay-runtime';

/**
Query Renderer
==============

Create a QueryRenderer that can be used to render data for a query.
By default, the QueryRenderer will attempt to _fetch_ the query, and
will suspend rendering while the data for the query becomes available.

```
import type {MyQuery} from 'MyQuery.graphql';

const query = graphql`
  query MyQuery($id: ID!) {
    node(id) {
      id
    }
  }
`;

const MyQueryRenderer = createQueryRenderer_UNSTABLE<MyQuery>(query);

render() {
  return (
    <ErrorBoundary fallback={'Error loading query.'}>
      <Placeholder delayMs={500} fallback={'Loading query...'}>
        <MyQueryRenderer environment={environment} variables={{id: '4'}}>
          {({data}) => <h1>{data.node?.id}</h1>}
        </MyQueryRenderer>
      </Placeholder>
    </ErrorBoundary>
  );
}
```

Fetching and Reading Behavior
=============================

By default, the QueryRenderer will always attempt to fetch the query from the
network, without using any locally available data.

This behavior can be configured by the `readPolicy` and `fetchPolicy` props.

`readPolicy` will be ***"lazy"*** by default, and can be one of the following values:
- **"eager"**: Will try to read as much data as possible, even if the full query is
  not available in the Relay store. If any data is available, it will be
  provided to render, and a network request might be initiated based on the
  specified `fetchPolicy`.
- **"lazy"**: Will not attempt to read a query unless the data for the full query is
  available in the Relay store. If the full query is available, it will be provided for
  render. A network request might be initiated based on the specified
  `fetchPolicy`.

`fetchPolicy`  will be ***"network-only"*** by default, and can be one of the following values:
- **"store-only"**: The QueryRenderer will only attempt to _read_ the query from
  the store based on the specified `readPolicy`, without making any network
  requests.
  In this mode, the responsibility of fetching the data is left to the caller.
  The QueryRenderer will only attempt to suspend rendering for missing data
  if a network request for the query has been initiated elsewhere _and_ is in
  flight, otherwise an error will be thrown.

- **"store-or-network"**: The QueryRenderer will attempt to _read_ the query
  from the store, based on the specified `readPolicy`.
  - If the `readPolicy` is "eager" and if any data is available from the store
    read, the data will be provided for render, and a network request will **not**
    be initiated. Otherwise, a network request to fetch the query will be
    initiated.
    If missing data is accessed, render will be suspended if a network request
    is in flight, otherwise an error will be thrown.
  - If the `readPolicy` is "lazy", if the full query is available in the relay
    store, it will be read and a network request will **not** be initiated.
    Otherwise a network request to fetch the query will be initiated, and render
    will be suspended until the request completes.

- **"store-and-network"**: The QueryRenderer will attempt to _read_ the query
  from the store based on the specified `readPolicy`.
  Additionally, a network request will always be initiated; if missing data is
  accessed, rendering will be suspended until the network request completes.

- **"network-only"**: The QueryRenderer will always attempt to fetch the
  query from the network without using any data that might
  be available locally in the store, and will suspend rendering until the
  network request completes.
*/
type RenderProps<TQueryResponse> = {|
  data: TQueryResponse,
|};

function createQueryRenderer_UNSTABLE<TQuery: OperationType>(
  query: GraphQLTaggedNode,
): React.ComponentType<{|
  children: (RenderProps<$ElementType<TQuery, 'response'>>) => React.Node,
  environment: IEnvironment,
  variables: $ElementType<TQuery, 'variables'>,
  fetchPolicy?: FetchPolicy,
  readPolicy?: ReadPolicy,
|}> {
  type Props = {|
    children: (RenderProps<$ElementType<TQuery, 'response'>>) => React.Node,
    environment: IEnvironment,
    variables: $ElementType<TQuery, 'variables'>,
    fetchPolicy?: FetchPolicy,
    readPolicy?: ReadPolicy,
  |};

  function getReactRelayContext(
    environment: IEnvironment,
    variables: Variables,
  ) {
    const {getRequest, createOperationSelector} = environment.unstable_internal;
    const queryNode = getRequest(query);
    const operation = createOperationSelector(queryNode, variables);
    return {
      environment,
      query,
      variables: operation.variables,
    };
  }

  function memoizedGetRelayContext(
    relayContextByEnvironment,
    environment: IEnvironment,
    variables: Variables,
  ): RelayContext {
    const cachedValue: ?{
      relayContext: RelayContext,
      variables: Variables,
    } = relayContextByEnvironment.get(environment);

    // We don't want to use the object identity of variables as a cache key
    // because variables are often times re-created on each render.
    // We also don't want to do a deep comparison of variables, e.g. by using
    // JSON.stringify as the cache key.
    // So, we do a shallow comparison each time.
    if (cachedValue && areEqual(cachedValue.variables, variables)) {
      return cachedValue.relayContext;
    }

    const newRelayContext = getReactRelayContext(environment, variables);
    relayContextByEnvironment.set(environment, {
      relayContext: newRelayContext,
      variables,
    });
    return newRelayContext;
  }

  return class QueryRenderer extends React.Component<Props> {
    _relayContextByEnvironment =
      typeof WeakMap === 'function' ? new WeakMap() : new Map();
    _dataSubscription: Disposable | null = null;
    _fetchDisposable: Disposable | null = null;
    _renderedSnapshot: Snapshot | null = null;
    _retainHandle: Disposable | null = null;

    componentDidMount() {
      // TODO Check if data has changed between render and mount. Schedule another
      // update if so
      const {environment, variables} = this.props;

      // We dispose of the fetch that was potentially started during the render
      // phase, to release any data it was retaining. We will retain the data here
      // now that the component has mounted
      if (this._fetchDisposable) {
        this._fetchDisposable.dispose();
        this._fetchDisposable = null;
      }
      this._retainHandle = retainQuery_UNSTABLE(environment, query, variables);

      this._unsubscribe();
      this._subscribe();
    }

    componentDidUpdate(prevProps: Props) {
      // TODO Check if data has changed between render and update. Schedule another
      // update if so
      const {environment, variables} = this.props;

      // We dispose of the fetch that was potentially started during the render
      // phase, to release any data it was retaining. We will retain the data here
      // now that the component has updated
      if (this._fetchDisposable) {
        this._fetchDisposable.dispose();
        this._fetchDisposable = null;
      }
      const prevRelayContext = memoizedGetRelayContext(
        this._relayContextByEnvironment,
        prevProps.environment,
        prevProps.variables,
      );
      const currentRelayContext = memoizedGetRelayContext(
        this._relayContextByEnvironment,
        environment,
        variables,
      );
      const mustResubscribe = prevRelayContext !== currentRelayContext;
      if (mustResubscribe) {
        if (this._retainHandle) {
          this._retainHandle.dispose();
        }
        this._retainHandle = retainQuery_UNSTABLE(
          environment,
          query,
          variables,
        );
        this._unsubscribe();
        this._subscribe();
      }
    }

    componentWillUnmount() {
      const {environment, variables} = this.props;
      this._unsubscribe();
      if (this._retainHandle) {
        this._retainHandle.dispose();
      }

      // We invalidate on unmount because we want to allow a component that is
      // remounting in the future to read fresh data from the Relay store and
      // potentiatlly initiate a new fetch.
      // If we didn't, new mounts of the component would always find the data
      // cached in DataResourceCache and not read from the store or fetch
      const DataResourceCache = getCacheForEnvironment(environment);
      DataResourceCache.invalidateQuery({query, variables});
    }

    _handleDataUpdate = latestSnapshot => {
      const {environment, variables} = this.props;
      const DataResourceCache = getCacheForEnvironment(environment);

      DataResourceCache.invalidateQuery({query, variables});
      DataResourceCache.setQuery({
        query,
        variables,
        snapshot: latestSnapshot,
      });
      this.forceUpdate();
    };

    _subscribe() {
      const {environment} = this.props;
      const snapshot = this._renderedSnapshot;
      invariant(
        snapshot !== null,
        'QueryRenderer: Expected to have rendered with a snapshot',
      );
      this._dataSubscription = environment.subscribe(
        snapshot,
        this._handleDataUpdate,
      );
    }

    _unsubscribe() {
      if (this._dataSubscription) {
        this._dataSubscription.dispose();
        this._dataSubscription = null;
      }
    }

    render() {
      const {
        children,
        fetchPolicy,
        environment,
        readPolicy,
        variables,
      } = this.props;
      const DataResourceCache = getCacheForEnvironment(environment);

      const {snapshot, data, fetchDisposable} = DataResourceCache.readQuery({
        environment,
        query,
        variables,
        fetchPolicy,
        readPolicy,
      });
      invariant(
        !Array.isArray(snapshot),
        'QueryRenderer: Expected snapshot not to be an array when reading a query',
      );

      // WARNING: Keeping instance variables in render can be unsafe; however,
      // in this case it is safe because we're ensuring they are only used in the
      // commit phase.
      this._fetchDisposable = fetchDisposable;
      this._renderedSnapshot = snapshot;

      // We memoize the ReactRelayContext so we don't pass a new object on
      // every render to ReactRelayContext.Provider, which would always trigger
      // an update to all consumers
      const reactRelayContext = memoizedGetRelayContext(
        this._relayContextByEnvironment,
        environment,
        variables,
      );
      return (
        <ReactRelayContext.Provider value={reactRelayContext}>
          <DataResourceCacheContext.Provider value={DataResourceCache}>
            {children({
              data: data,
            })}
          </DataResourceCacheContext.Provider>
        </ReactRelayContext.Provider>
      );
    }
  };
}

module.exports = createQueryRenderer_UNSTABLE;
