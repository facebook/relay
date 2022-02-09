---
id: refetch-container
title: Refetch Container
original_id: refetch-container
---
A Refetch Container is also a [higher-order component](https://reactjs.org/docs/higher-order-components.html) that works like a regular [Fragment Container](Modern-FragmentContainer.md), but provides the additional ability to fetch a new GraphQL query with different variables and re-render the component with the new result.

Table of Contents:

-   [`createRefetchContainer`](#createrefetchcontainer)
-   [`refetch`](#refetch)
-   [Examples](#examples)

## `createRefetchContainer`

`createRefetchContainer` has the following signature:

```javascript
createRefetchContainer(
  component: ReactComponentClass,
  fragmentSpec: {[string]: GraphQLTaggedNode},
  refetchQuery: GraphQLTaggedNode,
): ReactComponentClass;
```

### Arguments

-   `component`: The React Component _class_ of the component requiring the fragment data.
-   `fragmentSpec`: Specifies the data requirements for the Component via a GraphQL fragment. The required data will be available on the component as props that match the shape of the provided fragment. `fragmentSpec` should be an object whose keys are prop names and values are `graphql` tagged fragments. Each key specified in this object will correspond to a prop available to the resulting Component.
    -   **Note:** `relay-compiler` enforces fragments to be named as `<FileName>_<propName>`.
-   `refetchQuery`: A `graphql` tagged query to be fetched upon calling [`props.relay.refetch`](#refetch). As with any query, upon fetching this query, its result will be normalized into the store, any relevant subscriptions associated with the changed records will be fired, and subscribed components will re-render.

### Available Props

The Component resulting from `createRefetchContainer` will receive the following `props`:

```javascript
type Props = {
  relay: {
    environment: Environment,
    refetch(), // See #refetch section
  },
  // Additional props as specified by the fragmentSpec
}
```

-   `relay`:
    -   `environment`: The current [Relay Environment](Modern-RelayEnvironment.md)
    -   `refetch`: See `refetch` [docs](#refetch)

## `refetch`

`refetch` is a function available on the `relay` [prop](#available-props) which can be used to execute the `refetchQuery` and potentially re-render the component with the newly fetched data. Specifically, upon fetching the `refetchQuery`, its result will be normalized into the store, and any relevant subscriptions associated with the changed records will be fired, causing relevant components to re-render.

**Note:** `refetch` is meant to be used for changing variables in the component's fragment. Specifically, in order for _this_ component to re-render, it must be subscribed to changes in the records affected by this query. If the fragment for the component doesn't use variables, the component won't be subscribed to changes to new records that might be fetched by this query. A common example of this is using `refetch` to fetch a new node and re-render the component with the data for the new node; in this case the fragment needs to use a variable for the node's id, otherwise the component won't pick up the changes for the new node.

`refetch` has the following signature:

```javascript
type RefetchOptions = {
  force?: boolean,
};

type Disposable = {
  dispose(): void,
};

refetch(
  refetchVariables: Object | (fragmentVariables: Object) => Object,
  renderVariables: ?Object,
  callback: ?(error: ?Error) => void,
  options?: RefetchOptions,
): Disposable,

```

### Arguments

-   `refetchVariables`:
    -   A bag of variables to pass to the `refetchQuery` when fetching it from the server.
    -   Or, a function that receives the previous set of variables used to query the data, and returns a new set of variables to pass to the `refetchQuery` when fetching it from the server.
-   `renderVariables`: Optional bag of variables that indicate which variables to use for reading out the data from the store when re-rendering the component. Specifically, this indicates which variables to use when querying the data from the
    local data store _after_ the new query has been fetched. If not specified, the `refetchVariables` will be used. This is useful when the data you need to render in your component doesn't necessarily match the data you queried the server for. For example, to implement pagination, you would fetch a page with variables like `{first: 5, after: '<cursor>'}`, but you might want to render the full collection with `{first: 10}`.
-   `callback`: Function to be called after the refetch has completed. If an error occurred during refetch, this function will receive that error as an argument.
-   `options`: Optional object containing set of options.
    -   `force`: If the [Network Layer](Modern-NetworkLayer.md) has been configured with a cache, this option forces a refetch even if the data for this query and variables is already available in the cache.

### Return Value

Returns a `Disposable` on which you could call `dispose()` to cancel the refetch.

## Examples

### Refetching latest data

In this simple example, let's assume we want to fetch the latest data for a `TodoItem` from the server:

```javascript
// TodoItem.js
import {createRefetchContainer, graphql} from 'react-relay';

class TodoItem extends React.Component {
  render() {
    const item = this.props.item;
    return (
      <View>
        <Checkbox checked={item.isComplete} />
        <Text>{item.text}</Text>
        <button onPress={this._refetch} title="Refresh" />
      </View>
    );
  }

  _refetch = () => {
    this.props.relay.refetch(
      {itemID: this.props.item.id},  // Our refetchQuery needs to know the `itemID`
      null,  // We can use the refetchVariables as renderVariables
      () => { console.log('Refetch done') },
      {force: true},  // Assuming we've configured a network layer cache, we want to ensure we fetch the latest data.
    );
  }
}

export default createRefetchContainer(
  TodoItem,
  graphql`
    fragment TodoItem_item on Todo {
      text
      isComplete
    }
  `,
  graphql`
    # Refetch query to be fetched upon calling `refetch`.
    # Notice that we re-use our fragment and the shape of this query matches our fragment spec.
    query TodoItemRefetchQuery($itemID: ID!) {
      item: node(id: $itemID) {
        ...TodoItem_item
      }
    }
  `
);
```

### Loading more data

In this example we are using a Refetch Container to fetch more stories in a story feed component.

```javascript
import {createRefetchContainer, graphql} from 'react-relay';

class FeedStories extends React.Component {
  render() {
    return (
      <div>
        {this.props.feed.stories.edges.map(
          edge => <Story story={edge.node} key={edge.node.id} />
        )}
        <button
          onPress={this._loadMore}
          title="Load More"
        />
      </div>
    );
  }

  _loadMore() {
    // Increments the number of stories being rendered by 10.
    const refetchVariables = fragmentVariables => ({
      count: fragmentVariables.count + 10,
    });
    this.props.relay.refetch(refetchVariables);
  }
}

export default createRefetchContainer(
  FeedStories,
  {
    feed: graphql`
      fragment FeedStories_feed on Feed
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 10}
      ) {
        stories(first: $count) {
          edges {
            node {
              id
              ...Story_story
            }
          }
        }
      }
    `
  },
  graphql`
    # Refetch query to be fetched upon calling `refetch`.
    # Notice that we re-use our fragment and the shape of this query matches our fragment spec.
    query FeedStoriesRefetchQuery($count: Int) {
      feed {
        ...FeedStories_feed @arguments(count: $count)
      }
    }
  `,
);
```
