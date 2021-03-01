---
id: use-preloaded-query
title: usePreloadedQuery
slug: /api-reference/use-preloaded-query/
---

import DocsRating from '../../../src/core/DocsRating';

## `usePreloadedQuery`

Hook used to access data fetched by an earlier call to [`loadQuery`](../load-query) or with the help of `[`useQueryLoader`](../use-query-loader). This implements the "render-as-you-fetch" pattern:

* Call the `loadQuery` callback returned from `useQueryLoader`. This will store a query reference in React state.
    * You can also call the imported `loadQuery` directly, which returns a query reference. In that case, store the item in state or in a React ref, and call `dispose()` on the value when you are no longer using it.
* Then, in your render method, consume the query reference with `usePreloadedQuery()`. This call will suspend if the query is still pending, throw an error if it failed, and otherwise return the query results.
* This pattern is encouraged over `useLazyLoadQuery()` as it can allow fetching data earlier while not blocking rendering.

For more information, see the [Rendering Queries](../../guided-tour/rendering/queries) guide.

```js
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');

const {graphql, useQueryLoader, usePreloadedQuery} = require('react-relay');

const query = graphql`
  query AppQuery($id: ID!) {
    user(id: $id) {
      name
    }
  }
`;

function NameLoader() {
  const [queryReference, loadQuery] = useQueryLoader(query);
  return (<>
    <Button
      onClick={() => loadQuery({id: '4'})}
      disabled={queryReference != null}
    >
      Reveal your name!
    </Button>
    <Suspense fallback="Loading...">
      <NameDisplay queryReference={queryReference} />
    </Suspense>
  </>);
}

function NameDisplay({ queryReference }) {
  const data = usePreloadedQuery<AppQuery>(query, queryReference);

  return <h1>{data.user?.name}</h1>;
}
```

### Arguments

* `query`: GraphQL query specified using a `graphql` template literal.
* `preloadedQueryReference`: The query reference, which can be acquired from `useQueryLoader` or by calling [`loadQuery()`](../load-query) .

### Flow Type Parameters

* `TQuery`: Type parameter that should correspond to the Flow type for the specified query. This type is available to import from the the auto-generated file: `<query_name>.graphql.js`.

### Return Value

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified query.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema. For example, the type of `data` above is: `{| user: ?{| name: ?string |} |}`.




<DocsRating />
