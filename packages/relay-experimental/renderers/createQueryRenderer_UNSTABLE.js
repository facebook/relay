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

import type {DataAccessPolicy} from './DataResourceCache_UNSTABLE';
import type {ReactRelayModernContext} from 'react-relay/modern/ReactRelayContext';
import type {
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  OperationType,
  Snapshot,
} from 'relay-runtime';

type RenderProps<TQueryResponse> = {|
  data: TQueryResponse,
|};

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
network without using any data that might be available locally in the in-memory
Relay store.

This behavior can be configured by passing a `dataAccess` prop, which can be
one of the following values:

- "STORE_ONLY": The QueryRenderer will only attempt to _read_ the data for the
  query from the local store, without making any network requests. In this mode
  the responsibility of _fetching_ the data is left to the caller.
  Additionally, the QueryRenderer will provide the data ***even if*** it's only
  partially available in the store (e.g. some of the queried fields or records
  might be empty).
  In this mode, the QueryRenderer will only attempt to suspend rendering for
  missing data if a network request for the query is initiated elsewhere _and_
  is in flight, otherwise it will provide the data as is: fully or partially
  available.
- "STORE_OR_NETWORK": The QueryRenderer will attempt to _read_ the data for the
  query from the local store. If the data for the entire query is fully available
  in the store, the query renderer will ***not** make a network request.
  Otherwise, a network request will be initiated and the partially available
  will be provided.
  If data that isn't available is accessed, rendering will be suspended until
  the network request completes.
- "STORE_THEN_NETWORK": The QueryRenderer will attempt to _read_ the data for the
  query from the local store, and provide it regardless of if it is fully or
  partially available.
  Additionally, a network request will be initiated; if data that isn't
  available is accessed, rendering will be suspended until the network request
  completes.
- "NETWORK_ONLY": This is the default behavior: the QueryRenderer will always
  attempt to fetch the query from the network without using any data that might
   be available locally in the store, and will suspend rendering until the
   network request completes.
*/
function createQueryRenderer_UNSTABLE<TQuery: OperationType>(
  query: GraphQLTaggedNode,
): React.ComponentType<{|
  children: (RenderProps<$ElementType<TQuery, 'response'>>) => React.Node,
  dataAccess?: DataAccessPolicy,
  environment: IEnvironment,
  variables: $ElementType<TQuery, 'variables'>,
|}> {
  type Props = {|
    children: (RenderProps<$ElementType<TQuery, 'response'>>) => React.Node,
    dataAccess?: DataAccessPolicy,
    environment: IEnvironment,
    variables: $ElementType<TQuery, 'variables'>,
  |};

  type State = {|
    reactRelayContext: ReactRelayModernContext,
  |};

  return class QueryRenderer extends React.Component<Props, State> {
    _dataSubscription: Disposable | null = null;
    _fetchDisposable: Disposable | null = null;
    _renderedSnapshot: Snapshot | null = null;
    _retainHandle: Disposable | null = null;

    constructor(props: Props) {
      super(props);
      const {environment, variables} = props;

      this.state = {
        reactRelayContext: {
          environment: environment,
          query,
          variables: variables,
        },
      };
    }

    static getDerivedStateFromProps(
      nextProps: Props,
      prevState: State,
    ): $Shape<State> | null {
      const {environment, variables} = nextProps;
      const mirroredEnvironment = prevState.reactRelayContext.environment;
      const mirroredVariables = prevState.reactRelayContext.variables;
      if (
        environment !== mirroredEnvironment ||
        !areEqual(variables, mirroredVariables)
      ) {
        return {
          reactRelayContext: {
            environment,
            query,
            variables,
          },
        };
      }
      return null;
    }

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

    componentDidUpdate(prevProps: Props, prevState: State) {
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
      const mustResubscribe =
        prevState.reactRelayContext !== this.state.reactRelayContext;
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
      const {children, dataAccess, environment, variables} = this.props;
      const DataResourceCache = getCacheForEnvironment(environment);

      const {snapshot, data, fetchDisposable} = DataResourceCache.readQuery({
        environment,
        query,
        variables,
        dataAccess,
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

      // We keep environment and variables mirrored in state so we don't pass
      // a new object on every render to ReactRelayContext.Provider, which would
      // always trigger an update to all consumers
      const {reactRelayContext} = this.state;
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
