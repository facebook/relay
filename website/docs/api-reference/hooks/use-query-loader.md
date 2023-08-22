---
id: use-query-loader
title: useQueryLoader
slug: /api-reference/use-query-loader/
description: API reference for useQueryLoader, a React hook used to imperatively fetch data for a query in response to a user event
keywords:
  - query
  - fetch
  - preload
  - render-as-you-fetch
---

import DocsRating from '@site/src/core/DocsRating';

## `useQueryLoader`

Hook used to make it easy to safely load and retain queries. It will keep a query reference stored in state, and dispose of it when the component is disposed or it is no longer accessible via state.

This hook is designed to be used with [`usePreloadedQuery`](../use-preloaded-query) to implement the "render-as-you-fetch" pattern. For more information, see the [Fetching Queries for Render](../../guided-tour/rendering/queries/) guide.

```js
import type {PreloadedQuery} from 'react-relay';

const {useQueryLoader, usePreloadedQuery} = require('react-relay');

const AppQuery = graphql`
  query AppQuery($id: ID!) {
    user(id: $id) {
      name
    }
  }
`;

function QueryFetcherExample() {
  const [
    queryReference,
    loadQuery,
    disposeQuery,
  ] = useQueryLoader(
    AppQuery,
  );

  if (queryReference == null) {
    return (
      <Button onClick={() => loadQuery({})}> Click to reveal the name </Button>
    );
  }

  return (
    <>
      <Button onClick={disposeQuery}>
        Click to hide the name and dispose the query.
      </Button>
      <React.Suspense fallback="Loading">
        <NameDisplay queryReference={queryReference} />
      </React.Suspense>
    </>
  );
}

function NameDisplay({ queryReference }) {
  const data = usePreloadedQuery(AppQuery, queryReference);

  return <h1>{data.user?.name}</h1>;
}
```

### Arguments

* `query`: GraphQL query specified using a `graphql` template literal.
* `initialQueryRef`: _*[Optional]*_ An initial `PreloadedQuery` to be used as the initial value of the `queryReference` stored in state and returned by `useQueryLoader`.

### Return value

A tuple containing the following values:

* `queryReference`: the query reference, or `null`.
* `loadQuery`: a callback that, when executed, will load a query, which will be accessible as `queryReference`. If a previous query was loaded, it will dispose of it. It will throw an error if called during React's render phase.
    * Parameters
        * `variables`: the variables with which the query is loaded.
        * `options`: `LoadQueryOptions`. An optional options object, containing the following keys:
            * `fetchPolicy`: _*[Optional]*_ Determines if cached data should be used, and when to send a network request based on the cached data that is currently available in the Relay store (for more details, see our [Fetch Policies](../../guided-tour/reusing-cached-data/fetch-policies) and [Garbage Collection](../../guided-tour/reusing-cached-data/presence-of-data) guides):
                * "store-or-network": _*(default)*_ *will* reuse locally cached data and will *only* send a network request if any data for the query is missing. If the query is fully cached, a network request will *not* be made.
                * "store-and-network": *will* reuse locally cached data and will *always* send a network request, regardless of whether any data was missing from the local cache or not.
                * "network-only": *will* *not* reuse locally cached data, and will *always* send a network request to fetch the query, ignoring any data that might be locally cached in Relay.
            * `networkCacheConfig`: *_[Optional]_* Default value: `{force: true}`. Object containing cache config options for the *network layer*. Note that the network layer may contain an *additional* query response cache which will reuse network responses for identical queries. If you want to bypass this cache completely (which is the default behavior), pass `{force: true}` as the value for this option.
* `disposeQuery`: a callback that, when executed, will set `queryReference` to `null` and call `.dispose()` on it. It has type `() => void`. It should not be called during React's render phase.

### Behavior

* The `loadQuery` callback will fetch data if passed a query, or data and the query if passed a preloadable concrete request. Once both the query and data are available, the data from the query will be written to the store. This differs from the behavior of `preloadQuery_DEPRECATED`, which would only write data to the store if the query was passed to `usePreloadedQuery`.
* This query reference will be retained by the Relay store, preventing the data from being garbage collected. Once `.dispose()` is called on the query reference, the data is liable to be garbage collected.
* The `loadQuery` callback will throw an error if it is called during React's render phase.

<DocsRating />
