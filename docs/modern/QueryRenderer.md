---
id: query-renderer
title: QueryRenderer
layout: docs
category: Relay Modern
permalink: docs/query-renderer.html
next: fragment-container
---

`QueryRenderer` is the root of a Relay tree. It takes a query, fetches the data and calls the `render` callback with the data.

A `QueryRenderer` is a React component, so it can be rendered anywhere that a React component can be rendered, not just at the top level. A `QueryRenderer` can be rendered *within* other Relay components, for example to lazily fetch additional data for a popover. However, a `QueryRenderer` will not start loading its data until it is mounted, so nested `QueryRenderer` components can lead to avoidable request waterfalls if used unnecessarily.

```
const {
  QueryRenderer,
  graphql,
} = require('react-relay'); // or require('react-relay/compat') for compatibility

// Render this somewhere with React:
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
  render={({error, props}) => {
    if (error) {
      return <div>{error.message}</div>;
    } else if (props) {
      return <div>{props.page.name} is great!</div>;
    }
    return <div>Loading</div>;
  }}
/>
```

### Query Naming Convention

To enable [compatibility mode](./relay-compat.html), `relay-compiler` enforces a simple naming convention for your queries. Queries must be named as `<FileName><OperationType>`, where "<OperationType>" is one of "Query", "Mutation", or "Subscription". The query above is named `ExampleQuery` so should be placed in `Example.js`.
