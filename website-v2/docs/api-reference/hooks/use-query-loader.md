---
id: use-query-loader
title: useQueryLoader
slug: /api-reference/use-query-loader/
---

import DocsRating from '../../../src/core/DocsRating';

## `useQueryLoader`

Hook used to make it easy to safely load queries, while avoiding data leaking into the Relay store. It will keep a query reference stored in state, and dispose of it when it is no longer accessible via state.

This hook is designed to be used with [`usePreloadedQuery`](../use-preloaded-query) to implement the "render-as-you-fetch" pattern. For more information, see the [Fetching Queries for Render](../../guided-tour/rendering/queries/) guide.

```js
const {useQueryLoader, usePreloadedQuery} = require('react-relay');

const query = graphql`
  query AppQuery($id: ID!) {
    user(id: $id) {
      name
    }
  }
`;

function QueryFetcherExample(): React.MixedElement {
  const [
    queryReference,
    loadQuery,
    disposeQuery,
  ] = useQueryLoader(query);

  return (<>
    {
      queryReference == null && (<Button
        onClick={() => loadQuery({})}
      >
        Click to reveal the name
      </Button>)
    }
    {
      queryReference != null && (<>
        <Button onClick={disposeQuery}>
          Click to hide the name and dispose the query.
        </Button>
        <React.Suspense fallback="Loading">
          <NameDisplay queryReference={queryReference} />
        </React.Suspense>
      </>)
    }
  </>);
}

function NameDisplay({ queryReference }) {
  const data = usePreloadedQuery<AppQuery>(query, queryReference);

  return <h1>{data.user?.name}</h1>;
}
```

### Arguments

* `query`: the graphql tagged node containing a query.

### Flow Type Parameters

* `TQuery`: the type of the query

### Return value

A tuple containing the following values:

* `queryReference`: the query reference, or `null`.
* `loadQuery`: a callback that, when executed, will load a query, which will be accessible as `queryReference`. If a previous query was loaded, it will dispose of it. It will throw an error if called during React's render phase.
    * Parameters
        * `variables`: the variables with which the query is loaded.
        * `options`: `LoadQueryOptions`. An optional options object, containing the following keys:
            * `fetchPolicy`: Optional. Determines if cached data should be used, and when to send a network request based on the cached data that is currently available in the Relay store (for more details, see our [Fetch Policies](https://www.internalfb.com/intern/wiki/Relay/guided-tour-of-relay/reusing-cached-data-for-rendering/#fetch-policies) and [Garbage Collection](https://www.internalfb.com/intern/wiki/Relay/guided-tour-of-relay/reusing-cached-data-for-rendering/#garbage-collection-in-re) guides):
                * "store-or-network": _*(default)*_ *will* reuse locally cached data and will *only* send a network request if any data for the query is missing. If the query is fully cached, a network request will *not* be made.
                * "store-and-network": *will* reuse locally cached data and will *always* send a network request, regardless of whether any data was missing from the local cache or not.
                * "network-only": *will* *not* reuse locally cached data, and will *always* send a network request to fetch the query, ignoring any data that might be locally cached in Relay.
            * `networkCacheConfig`: Optional. Object containing cache config options for the *network layer. *Note the the network layer contains a *additional *query response cache which will reuse network responses for identical queries. If you want to bypass this cache completely, pass `{force: true}` as the value for this option.
            * `onQueryAstLoadTimeout`: Optional. Callback that is executed if the request to fetch the query AST does not complete in time.
* `disposeQuery`: a callback that, when executed, will set `queryReference` to `null` and call `.dispose()` on it. It has type `() => void`. It should not be called during React's render phase.

### Behavior

* The `loadQuery` callback will fetch data if passed a query, or data and the query if passed a preloadable concrete request. Once both the query and data are available, the data from the query will be written to the store. This differs from the behavior of `preloadQuery_DEPRECATED`, which would only write data to the store if the query was passed to `usePreloadedQuery`.
* This query reference will be retained by the Relay store, preventing the data from being garbage collected. Once `.dispose()` is called on the query reference, the data is liable to be garbage collected.
* The `loadQuery` callback will throw an error if it is called during React's render phase.

<DocsRating />
