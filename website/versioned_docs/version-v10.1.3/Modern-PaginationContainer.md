---
id: pagination-container
title: Pagination Container
original_id: pagination-container
---
Pagination Container is also a [higher-order component](https://reactjs.org/docs/higher-order-components.html), similar to a [Fragment Container](Modern-FragmentContainer.md), that is designed to simplify the workflow of loading more items in a list — in many cases, we don't want to fetch all the data at once but lazily load more data. It relies on a GraphQL server exposing connections in a standardized way. For a detailed spec, please check out [this page](https://relay.dev/graphql/connections.htm).

Table of Contents:

-   [`@connection`](#connection)
-   [`createPaginationContainer`](#createpaginationcontainer)
-   [`hasMore`](#hasmore)
-   [`isLoading`](#isloading)
-   [`loadMore`](#loadmore)
-   [`refetchConnection`](#refetchconnection)
-   [Pagination Example](#pagination-example)

## `@connection`

Pagination Container works in a very similar way to the [Fragment Container](Modern-FragmentContainer.md) in that you also specify the data requirements for a component via GraphQL fragments in the `fragmentSpec`.

However, when [specifying connection fragments](#createpaginationcontainer) for a Pagination Container, it is expected that at least one of the fragments contains a [GraphQL connection](https://relay.dev/graphql/connections.htm) to paginate over, and that the connection field is annotated with a `@connection` directive.

The purpose of the `@connection` directive is to allow Relay to uniquely identify different connections under a parent type. The `@connection` directive takes 2 arguments that help identify the connection:

```graphql
@connection(key: String!, filters: [String])

```

-   `key`: **Required** String that serves as a unique identifier for the connection under the parent field type. A good practice could be `<ComponentName>_<fieldName | fieldAlias>`.
-   `filters`: **Optional** Array of strings that belong to the set of argument variables defined for the connection field (e.g. `orderBy`, `searchTerm`, etc). The values for the variables specified in this array will be used alongside the user-supplied `key` to uniquely identify a connection. If `filters` is not provided, by default Relay will use the set of all of the arguments the connection field takes, excluding pagination specific arguments (i.e. `first`/`last`, `after`/`before`).

### Examples

Specifying just the `key`:

```javascript
fragment Feed_user on User {
  # This connection, under a specific User, will be uniquely identified by
  # the key "Feed_feed" and the value of `$orderBy` (given that no `filters` were provided)
  feed(
    first: $count
    after: $cursor
    orderby: $orderBy
  ) @connection(key: "Feed_feed") {
    edges {
      node {
        id,
        ...Story_story
      }
  }
}
```

Specifying `key` and `filters`:

```javascript
fragment Feed_user on User {
  # This connection, under a specific User, will be uniquely identified by
  # the key "Feed_feed" and /only/ the value of `$searchTerm`, i.e.
  # different values of `orderBy` will not distinguish connections.
  feed(
    first: $count
    after: $cursor
    orderby: $orderBy
    search_term: $searchTerm
  ) @connection(key: "Feed_feed", filters: ["searchTerm"]) {
    edges {
      node {
        id,
        ...Story_story
      }
  }
}
```

## `createPaginationContainer`

`createPaginationContainer` has the following signature:

```javascript
createPaginationContainer(
  component: ReactComponentClass,
  fragmentSpec: {[string]: GraphQLTaggedNode},
  connectionConfig: ConnectionConfig,
): ReactComponentClass;

type ConnectionConfig = {
  direction?: 'backward' | 'forward',
  getConnectionFromProps?: (props: Object) => ?ConnectionData,
  getFragmentVariables?: (previousVariables: Object, totalCount: number) => Object,
  getVariables: (
    props: Object,
    paginationInfo: {count: number, cursor: ?string},
    fragmentVariables: Object,
  ) => Object,
  query: GraphQLTaggedNode,
};

type ConnectionData = {
  edges?: ?Array<any>,
  pageInfo?: ?{
    endCursor: ?string,
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    startCursor: ?string,
  },
};
```

### Arguments

-   `component`: The React Component _class_ of the component requiring the fragment data.
-   `fragmentSpec`: Specifies the data requirements for the Component via a GraphQL fragment. It is expected that one of the fragments specified here will contain a [`@connection`](#connection) for pagination. The required data will be available on the component as props that match the shape of the provided fragment. `fragmentSpec` should be an object whose keys are prop names and values are `graphql` tagged fragments. Each key specified in this object will correspond to a prop available to the resulting Component.
    -   **Note:** `relay-compiler` enforces fragments to be named as `<FileName>_<propName>`.
-   `connectionConfig`:
    -   `direction`: Either "forward" to indicate forward pagination using after/first, or "backward" to indicate backwards pagination using before/last. If not provided, Relay will infer the direction based on the provided `@connection` directive.
    -   `getConnectionFromProps`: Function that should indicate which connection to paginate over, given the fragment props (i.e. the props corresponding to the `fragmentSpec`). This is necessary in most cases because the Relay can't automatically tell which connection you mean to paginate over (a container might fetch multiple fragments and connections, but can only paginate one of them). If not provided, Relay will try infer the correct connection to paginate over based on the provided `@connection` directive. See our [example](#pagination-example) for more details.
    -   `getFragmentVariables`: Function that should return the bag of variables  to use for reading out the data from the store when re-rendering the component. This function takes the previous set of variables passed to the pagination `query`, and the number of elements that have been fetched in total so far. Specifically, this indicates which variables to use when reading out the data from the
        local data store _after_ the new pagination `query` has been fetched. If not specified, Relay will default to using all of the previous variables and using the total count for the `count` variable. This option is analogous to [`renderVariables`](Modern-RefetchContainer.md#refetch) in the Refetch Container. See our [example](#pagination-example) for more details.
    -   `getVariables`: Function that should return the variables to pass to the pagination `query` when fetching it from the server, given the current `props`, `count` and `cursor`. You may set whatever variables here, as well as modify the defaults to use for after/first/before/last arguments. See our [example](#pagination-example) for more details.
    -   `query`: A `graphql` tagged query to be used as the pagination query to fetch more data upon calling [`loadMore`](#loadmore).

### Available Props

The Component resulting from `createPaginationContainer` will receive the following `props`:

```javascript
type Props = {
  relay: {
    environment: Environment,
    hasMore(), // See #hasMore section
    isLoading(), // See #isLoading section
    loadMore(), // See #loadMore section
    refetchConnection(), // See #refetchConnection section
  },
  // Additional props as specified by the fragmentSpec
}
```

-   `relay`:
    -   `environment`: The current [Relay Environment](Modern-RelayEnvironment.md)
    -   `hasMore`: See `hasMore` [docs](#hasmore)
    -   `isLoading`: See `isLoading` [docs](#isloading)
    -   `loadMore`: See `loadMore` [docs](#loadmore)
    -   `refetchConnection `: See `refetchConnection` [docs](#refetchconnection)

## `hasMore`

`hasMore` is a function available on the `relay` [prop](#available-props). This function indicates whether there are more pages to fetch from the server or not.

```javascript
hasMore: () => boolean,

```

## `isLoading`

`isLoading` is a function available on the `relay` [prop](#available-props). This function indicates if a previous call to [`loadMore()`](#loadmore) is still pending. This is convenient for avoiding duplicate load calls.

```javascript
isLoading: () => boolean,

```

## `loadMore`

`loadMore` is a function available on the `relay` [prop](#available-props). You can call `loadMore()` to fetch more items from the server based on the `connectionConfig` provided to the container. This will return null if there are no more items to fetch, otherwise it will fetch more items and return a Disposable that can be used to cancel the fetch.

```javascript
loadMore(
  pageSize: number,
  callback: ?(error: ?Error) => void,
  options?: RefetchOptions
): ?Disposable

```

### Arguments:

-   `pageSize`: The number of **additional** items to fetch (not the total).
-   `callback`: Function called when the new page has been fetched. If an error occurred during refetch, this function will receive that error as an argument.
-   `options`: Optional object containing set of options.
    -   `force`: If the [Network Layer](Modern-NetworkLayer.md) has been configured with a cache, this option forces a refetch even if the data for this query and variables is already available in the cache.

## `refetchConnection`

`refetchConnection` is a function available on the `relay` [prop](#available-props). You can call `refetchConnection` to restart pagination on a connection from scratch, with optionally a completely new set of variables to pass to the pagination `query`. This is useful for example if you are paginating over a collection based on a userID and the userID changes, you'd want to start paginating over the new collection for the new user.

```javascript
refetchConnection:(
  totalCount: number,
  callback: (error: ?Error) => void,
  refetchVariables: ?Variables,
) => ?Disposable,

```

### Arguments:

-   `totalCount`: The total number of elements to fetch
-   `callback`: Function called when the new page has been fetched. If an error occurred during refetch, this function will receive that error as an argument.
-   `refetchVariables`: A potentially new bag of variables to pass to the pagination `query` when fetching it from the server.

## Pagination Example

```javascript
// Feed.js
import {createPaginationContainer, graphql} from 'react-relay';

class Feed extends React.Component {
  render() {
    return (
      <div>
        {this.props.user.feed.edges.map(
          edge => <Story story={edge.node} key={edge.node.id} />
        )}
        <button
          onPress={() => this._loadMore()}
          title="Load More"
        />
      </div>
    );
  }

  _loadMore() {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    }

    this.props.relay.loadMore(
      10,  // Fetch the next 10 feed items
      error => {
        console.log(error);
      },
    );
  }
}

module.exports = createPaginationContainer(
  Feed,
  {
    user: graphql`
      fragment Feed_user on User
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 10}
        cursor: {type: "ID"}
        orderby: {type: "[FriendsOrdering]", defaultValue: [DATE_ADDED]}
      ) {
        feed(
          first: $count
          after: $cursor
          orderby: $orderBy # Non-pagination variables
        ) @connection(key: "Feed_feed") {
          edges {
            node {
              id
              ...Story_story
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.user && props.user.feed;
    },
    // This is also the default implementation of `getFragmentVariables` if it isn't provided.
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return {
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        // userID isn't specified as an @argument for the fragment, but it should be a variable available for the fragment under the query root.
        userID: fragmentVariables.userID,
      };
    },
    query: graphql`
      # Pagination query to be fetched upon calling 'loadMore'.
      # Notice that we re-use our fragment, and the shape of this query matches our fragment spec.
      query FeedPaginationQuery(
        $count: Int!
        $cursor: ID
        $orderBy: [FriendsOrdering]!
        $userID: ID!
      ) {
        user: node(id: $userID) {
          ...Feed_user @arguments(count: $count, cursor: $cursor, orderBy: $orderBy)
        }
      }
    `
  }
);
```
