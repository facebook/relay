---
id: query-renderer
title: QueryRenderer
layout: docs
category: Relay Modern
permalink: docs/query-renderer.html
next: fragment-container
---

`QueryRenderer` is the root of a Relay tree. It takes a query, fetches the data and calls the `render` callback with the data.

A `QueryRenderer` is a React component, so it can be rendered anywhere that a React component can be rendered. It doesn't have to be on the top level. It can also be rendered *within* other Relay components (for example, to fetch the data lazily in a different roundtrip).

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

### Query naming convention

To enable [compatibility mode](./relay-compat.html), `relay-compiler` enforces a simple naming convention for your queries. Queries must be named as `<FileName><OperationType>`, where "<OperationType>" is one of "Query", "Mutation", or "Subscription". The query above is named `ExampleQuery` so should be placed in `Example.js`.
