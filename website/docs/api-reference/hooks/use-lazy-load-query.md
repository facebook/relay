---
id: use-lazy-load-query
title: useLazyLoadQuery
slug: /api-reference/use-lazy-load-query/
---

import DocsRating from '@site/src/core/DocsRating';

## `useLazyLoadQuery`

Hook used to fetch a GraphQL query during render. This hook can trigger multiple nested or waterfalling round trips if used without caution, and waits until render to start a data fetch (when it can usually start a lot sooner than render), thereby degrading performance. Instead, prefer [`usePreloadedQuery`](../use-preloaded-query).

```js
import type {AppQuery} from 'AppQuery.graphql';

const React = require('React');

const {graphql, useLazyLoadQuery} = require('react-relay');

function App() {
  const data = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `,
    {id: 4},
    {fetchPolicy: 'store-or-network'},
  );

 return <h1>{data.user?.name}</h1>;
}
```

### Arguments

* `query`: GraphQL query specified using a `graphql` template literal.
* `variables`: Object containing the variable values to fetch the query. These variables need to match GraphQL variables declared inside the query.
* `options`: _*[Optional]*_ options object
    * `fetchPolicy`: Determines if cached data should be used, and when to send a network request based on the cached data that is currently available in the Relay store (for more details, see our [Fetch Policies](../../guided-tour/reusing-cached-data/fetch-policies) and [Garbage Collection](../../guided-tour/reusing-cached-data/presence-of-data) guides):
        * "store-or-network": _*(default)*_ *will* reuse locally cached data and will *only* send a network request if any data for the query is missing. If the query is fully cached, a network request will *not* be made.
        * "store-and-network": *will* reuse locally cached data and will *always* send a network request, regardless of whether any data was missing from the local cache or not.
        * "network-only": *will* *not* reuse locally cached data, and will *always* send a network request to fetch the query, ignoring any data that might be locally cached in Relay.
        * "store-only": *will* *only* reuse locally cached data, and will *never* send a network request to fetch the query. In this case, the responsibility of fetching the query falls to the caller, but this policy could also be used to read and operate and data that is entirely [local](../../guided-tour/updating-data/local-data-updates).
    * `fetchKey`: A `fetchKey` can be passed to force a re-evaluation of the current query and variables when the component re-renders, even if the variables didn't change, or even if the component isn't remounted (similarly to how passing a different `key` to a React component will cause it to remount). If the `fetchKey` is different from the one used in the previous render, the current query will be re-evaluated against the store, and it might be refetched depending on the current `fetchPolicy` and the state of the cache.
    * `networkCacheConfig`: *_[Optional] _* Default value: `{force: true}`. Object containing cache config options for the *network layer*. Note that the network layer may contain an *additional* query response cache which will reuse network responses for identical queries. If you want to bypass this cache completely (which is the default behavior), pass `{force: true}` as the value for this option.

### Flow Type Parameters

* `TQuery`: Type parameter that should correspond to the Flow type for the specified query. This type is available to import from the the auto-generated file: `<query_name>.graphql.js`.

### Return Value

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified query.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema. For example, the type of `data` above is: `{| user: ?{| name: ?string |} |}`.

### Behavior

* It is expected for `useLazyLoadQuery` to have been rendered under a [`RelayEnvironmentProvider`](../relay-environment-provider), in order to access the correct Relay environment, otherwise an error will be thrown.
* Calling `useLazyLoadQuery`  will fetch and render the data for this query, and it may [*_suspend_*](../../guided-tour/rendering/loading-states) while the network request is in flight, depending on the specified `fetchPolicy`, and whether cached data is available, or if it needs to send and wait for a network request. If `useLazyLoadQuery` causes the component to suspend, you'll need to make sure that there's a `Suspense` ancestor wrapping this component in order to show the appropriate loading state.
    * For more details on Suspense, see our [Loading States with Suspense](../../guided-tour/rendering/loading-states/) guide.
* The component is automatically subscribed to updates to the query data: if the data for this query is updated anywhere in the app, the component will automatically re-render with the latest updated data.
* After a component using `useLazyLoadQuery` has committed, re-rendering/updating the component will not cause the query to be fetched again.
    * If the component is re-rendered with *different query variables,* that will cause the query to be fetched again with the new variables, and potentially re-render with different data.
    * If the component *unmounts and remounts*, that will cause the current query and variables to be refetched (depending on the `fetchPolicy` and the state of the cache).

### Differences with `QueryRenderer`

* `useLazyLoadQuery` no longer takes a Relay environment as a parameter, and thus no longer sets the environment in React Context, like `QueryRenderer` did. Instead, `useLazyLoadQuery` should be used as a descendant of a [`RelayEnvironmentProvider`](../relay-environment-provider), which now sets the Relay environment in Context. Usually, you should render a single `RelayEnvironmentProvider` at the very root of the application, to set a single Relay environment for the whole application.
* `useLazyLoadQuery` will use [Suspense](../../guided-tour/rendering/loading-states) to allow developers to render loading states using Suspense boundaries, and will throw errors if network errors occur, which can be caught and rendered with Error Boundaries. This as opposed to providing error objects or null props to the `QueryRenderer` render function to indicate errors or loading states.
* `useLazyLoadQuery` fully supports fetch policies in order to reuse data that is cached in the Relay store instead of solely relying on the network response cache.
* `useLazyLoadQuery` has better type safety guarantees for the data it returns, which was not possible with QueryRenderer since we couldn't parametrize the type of the data with a renderer api.



<DocsRating />
