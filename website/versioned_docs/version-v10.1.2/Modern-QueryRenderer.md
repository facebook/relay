---
id: query-renderer
title: QueryRenderer
original_id: query-renderer
---
A `QueryRenderer` is a React Component at the root of a Relay component tree. It takes a query, fetches the given query, and uses the `render` prop to render the resulting data.

As React components, `QueryRenderer`s can be rendered anywhere that a React component can be rendered, i.e. not just at the top level but _within_ other components or containers; for example, to lazily fetch additional data for a popover.

However, a `QueryRenderer` will not start loading its data until it is mounted, so nested `QueryRenderer` components can lead to request waterfalls if used unnecessarily.

## Props

-   `environment`: The [Relay Environment](Modern-RelayEnvironment.md)
-   `query`: The `graphql` tagged query. **Note:** `relay-compiler` enforces the query to be named as `<FileName>Query`. Optional, if not provided, an empty `props` object is passed to the `render` callback.
-   `cacheConfig?`: Optional object containing a set of cache configuration options, i.e. `force: true` requires the fetch to be issued regardless of the state of any configured response cache.
-   `fetchPolicy?`: Optional prop to indicate if data already present in the store should be used to render immediately and updated from the network afterwards using the `store-and-network` key. Using the `network-only` key, which is the default behavior, ignores data already present in the store and waits for the network results to come back.
-   `variables`: Object containing set of variables to pass to the GraphQL query, i.e. a mapping from variable name to value. **Note:** If a new set of variables is passed, the `QueryRenderer` will re-fetch the query.
-   `render`: Function of type `({error, props, retry}) => React.Node`. The output of this function will be rendered by the `QueryRenderer`.
    -   `props`: Object containing data obtained from the query; the shape of this object will match the shape of the query. If this object is not defined, it means that the data is still being fetched.
    -   `error`: Error will be defined if an error has occurred while fetching the query.
    -   `retry`: Reload the data. It is null if `query` was not provided.

## Example

```javascript
// Example.js
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';

const renderQuery = ({error, props}) => {
  if (error) {
    return <div>{error.message}</div>;
  } else if (props) {
    return <div>{props.page.name} is great!</div>;
  }
  return <div>Loading</div>;
}

const Example = (props) => {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ExampleQuery($pageID: ID!) {
          page(id: $pageID) {
            name
          }
        }
      `}
      variables={{
        pageID: '110798995619330',
      }}
      render={renderQuery}
    />
  );
}
```
