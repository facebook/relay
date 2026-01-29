---
id: use-client-query
title: useClientQuery
slug: /api-reference/use-client-query/
description: API reference for useClientQuery, a React hook used to render client only queries
keywords:
  - query
  - read
  - client-query
---

import DocsRating from '@site/src/core/DocsRating';

`useClientQuery` hook is used to render queries that read _only_ client fields.

The Relay Compiler fully supports [client-side extensions](../../guides/client-schema-extensions/) of the schema, which allows you to define local fields and types.

```graphql
# example client extension of the `Query` type
extend type Query {
  client_field: String
}
```

These client-only fields are not sent to the server, and should be updated
using APIs for local updates, for example `commitPayload`.

```js
const React = require('React');

const {graphql, useClientQuery} = require('react-relay');

function ClientQueryComponent() {
  const data = useClientQuery(
    graphql`
      query ClientQueryComponentQuery {
        client_field
      }
    `,
    {}, // variables
  );

  return (
    <div>{data.client_field}</div>
  );
}
```


### Arguments

* `query`: GraphQL query specified using a `graphql` template literal.
* `variables`: Object containing the variable values to fetch the query. These variables need to match GraphQL variables declared inside the query.

### Return Value

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified query.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema. For example, the type of `data` above is: `{| user: ?{| name: ?string |} |}`.

### Behavior

* This hooks works as [`useLazyLoadQuery`](../use-lazy-load-query) with `fetchPolicy: store-only`, it does not send the network request.


<DocsRating />
