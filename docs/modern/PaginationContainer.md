---
id: pagination-container
title: PaginationContainer
layout: docs
category: Relay Modern
permalink: docs/pagination-container.html
next: routing
---

`PaginationContainer` is designed to simplify the workflow of loading more items in a list -- in many cases, we don't want to fetch all the data at once but lazily load more data. It relies on a GraphQL server exposing connections in a standardized way. For a detailed spec, please check out [this page](https://facebook.github.io/relay/graphql/connections.htm).

`this.props.relay` exposes the following APIs:

```javascript
type Variables = {[name: string]: any};
type RefetchOptions = {
  force?: boolean, // Refetch from the server ignoring anything in the cache.
};
type Disposable = {
  dispose(): void,
};

/**
 * Check if there is at least one more page.
 */
hasMore: () => boolean,

/**
 * Check if there are pending requests.
 */
isLoading: () => boolean,

/**
 * Execute the pagination query. Relay will infer the pagination direction (either 'forward'
 * or 'backward') from the query parameters. `pageSize` is the additional number of items
 * to load.
 */
loadMore: (
  pageSize: number,
  callback: ?(error: ?Error) => void,
  options: ?RefetchOptions
) => ?Disposable,

/**
 * Refetch the items in the connection (with potentially new variables).
 */
refetchConnection:(
  totalCount: number,
  callback: (error: ?Error) => void,
  refetchVariables: ?Variables,
) => ?Disposable,
```

## `@connection` directive

The pagination container expects the connection field to be annotated with a `@connection(key: ...)` directive, where the `key` is expected to be a unique identifier under the parent field type `User`. A good practice could be `<ComponentName>_<fieldName | fieldAlias>`. By default, Relay generates storage key based on the user-supplied `key` and all non-filter variables of the field. Relay also provides an advanced feature `@connection(key: 'FriendsList_friends', filters:['orderBy', ...])` that allows you to explicitly specify which variables should be used to generate the storage key. Particularly, if you write `@connection(key: ..., filters:[])`, Relay will ignore all the variables.

```javascript
graphql`
  fragment Feed_user on User {
    feed(first: $count, after: $cursor) @connection(key: "Feed_feed") {
      edges {
        node {
          id,
          ...Story_story
        }
    }
  }
`,
```

## Example

```javascript
const {
  createPaginationContainer,
  graphql,
} = require('react-relay');

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
      10, // Fetch the next 10 feed items
      e => {
        console.log(e);
      },
    );
  }
}

module.exports = createPaginationContainer(
  Feed,
  {
    user: graphql`
      fragment Feed_user on User {
        feed(
          first: $count
          after: $cursor
          orderby: $orderBy # other variables
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
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
        orderBy: fragmentVariables.orderBy,
      };
    },
    query: graphql`
      query FeedPaginationQuery(
        $count: Int!
        $cursor: String
        $orderby: String!
      ) {
        user {
          # You could reference the fragment defined previously.
          ...Feed_user
        }
      }
    `
  }
);
```
