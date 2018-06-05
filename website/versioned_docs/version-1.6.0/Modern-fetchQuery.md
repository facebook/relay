---
id: version-1.6.0-fetch-query
title: fetchQuery
original_id: fetch-query
---

You can use the `fetchQuery` function to imperatively make GraphQL Requests. This is useful for cases where you want to make requests outside of React but still utilize the Relay store and network layer.

```javascript
import {fetchQuery, graphql} from 'relay-runtime';

const query = graphql`
  query ExampleQuery($pageID: ID!) {
    page(id: $pageID) {
      name
    }
  }
`;

const variables = {
  pageID: '110798995619330',
};

fetchQuery(environment, query, variables)
  .then(data => {
    // access the graphql response
  });
```


## Arguments

* `environment`: The [Relay Environment](./relay-environment.html)
* `query`: The `graphql` tagged query. **Note:** To enable [compatibility mode](./relay-compat.html), `relay-compiler` enforces the query to be named as `<FileName>Query`.
* `variables`: Object containing set of variables to pass to the GraphQL query, i.e. a mapping from variable name to value.

## Return Value

The function returns a `Promise` that resolves with an object containing data obtained from the query.
