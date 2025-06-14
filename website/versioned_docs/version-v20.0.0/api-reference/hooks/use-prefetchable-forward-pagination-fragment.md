---
id: use-prefetchable-forward-pagination-fragment
title: usePrefetchableForwardPaginationFragment
slug: /api-reference/use-prefetchable-forward-pagination-fragment/
description: API reference for usePrefetchableForwardPaginationFragment, an experimental React hook used to paginate a connection and automatically prefetches
keywords:
  - pagination
  - connection
  - prefetching
---

import DocsRating from '@site/src/core/DocsRating';

NOTE: This is an experimental API and may be subject to change.
`usePrefetchableForwardPaginationFragment` is similar to [`usePaginationFragment`](../use-pagination-fragment). It adds the capability to automatically prefetch a `bufferSize` number of items to fill the buffer without displaying the items. And when `loadNext` is called, it vends from the buffer first to achieve faster pagination. It only supports forward pagination (provides APIs for `loadNext`, `hasNext` and `isLoadingNext`) for now.

```js
import type {FriendsList_user$key} from 'FriendsList_user.graphql';

const React = require('React');

const {graphql, usePrefetchableForwardPaginationFragment} = require('react-relay');

type Props = {
  user: FriendsList_user$key,
};

function FriendsList(props: Props) {
  const {
    data,
    edges, // NOTE: It is required to use `edges` to access the items
    loadNext,
    hasNext,
    isLoadingNext,
    refetch, // For refetching connection
  } = usePrefetchableForwardPaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User
      @refetchable(queryName: "FriendsListPaginationQuery") {
        name
        friends(first: $count, after: $cursor)
        @connection(key: "FriendsList_user_friends", prefetchable_pagination: true) {
          edges {
            node {
              name
              age
            }
          }
        }
      }
    `,
    props.user,
  );

  return (
    <>
      <h1>Friends of {data.name}:</h1>

      <List items={edges.map(edge => edge.node)}>
        {node => {
          return (
            <div>
              {node.name} - {node.age}
            </div>
          );
        }}
      </List>
      <Button onClick={() => loadNext(10)}>Load more friends</Button>
    </>
  );
}

module.exports = FriendsList;
```

### Arguments

* `fragment`: GraphQL fragment specified using a `graphql` template literal.
    * This fragment must have an `@connection` directive on a connection field, and set `prefetchable_pagination` to `true`, otherwise using it will throw an error.
    * This fragment must have a `@refetchable` directive, otherwise using it will throw an error. The `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are declared on `Viewer` or  `Query` types, or on a type that implements `Node` (i.e. a type that has an `id`).
        * Note that you *do not* need to manually specify a pagination query yourself. The `@refetchable` directive will autogenerate a query with the specified `queryName`. This will also generate Flow types for the query, available to import from the generated file: `<queryName>.graphql.js`.
* `fragmentReference`: The *fragment reference* is an opaque Relay object that Relay uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.
    * The type of the fragment reference can be imported from the generated Flow types, from the file `<fragment_name>.graphql.js`, and can be used to declare the type of your `Props`. The name of the fragment reference type will be: `<fragment_name>$key`. We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared.
* `bufferSize`: The size of the buffer. The component will always try to prefetch to fill the buffer.
* `initialSize`: *_[Optional]_* argument to define the initial number of items to display. If it is unset, the component shows all available items on the initial render or on refetch.
* `prefetchingLoadMoreOptions`: *_[Optional]_* fetching arguments to provide to the automatic prefetch.
  * `options`: *_[Optional]_* options object
      * `onComplete`: Function that will be called whenever the request has completed, including any incremental data payloads. If an error occurs during the request, `onComplete` will be called with an `Error` object as the first parameter.
* `minimumFetchSize`: Optional argument to define the minimum number of items to fetch in any requests.

### Return Value

Object containing the following properties:

* `edges`: The edges to use. This provides a filtered list of edges in the connection that excludes the buffer. Do not use the connection edges from `data` to render otherwise the hook will not work correctly.
* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified fragment.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema.
* `isLoadingNext`: Boolean value which indicates if a pagination request for the *next* items in the connection is currently in flight, including any incremental data payloads. The value stays `false` if the hook is automatically prefetching to fill the buffer, and the code hasn't asked for more items.
* `hasNext`: Boolean value which indicates if the end of the connection has been reached in the "forward" direction. It will be true if there are more items to query for available in that direction, or there are more items in the buffer, or false otherwise.
* `loadNext`: Function used to fetch more items in the connection in the "forward" direction.
    * Arguments:
        * `count`*:* Number that indicates how many items to show more from buffer or fetch.
        * `options`: *_[Optional]_* options object
            * `onComplete`: Function that will be called whenever the request has completed, including any incremental data payloads. If an error occurs during the request, `onComplete` will be called with an `Error` object as the first parameter.
    * Return Value: void
    * Behavior:
        * Calling `loadNext`  *will not* cause the component to suspend. The component first try to fill the request using items prefetched in the buffer, if there isn't enough item, it sends a request. The `isLoadingNext` value will be set to true while the request is in flight.
        * Pagination requests initiated from calling `loadNext` will *always* use the same variables that were originally used to fetch the connection, *except* pagination variables (which need to change in order to perform pagination); changing variables other than the pagination variables during pagination doesn't make sense, since that'd mean we'd be querying for a different connection.

* `refetch`: Function used to refetch the connection fragment with a potentially new set of variables.
    * Arguments:
        * `variables`: Object containing the new set of variable values to be used to fetch the `@refetchable` query.
            * These variables need to match GraphQL variables referenced inside the fragment.
            * However, only the variables that are intended to change for the refetch request need to be specified; any variables referenced by the fragment that are omitted from this input will fall back to using the value specified in the original parent query. So for example, to refetch the fragment with the exact same variables as it was originally fetched, you can call `refetch({})`.
            * Similarly, passing an `id` value for the `$id` variable is _*optional*_, unless the fragment wants to be refetched with a different `id`. When refetching a `@refetchable` fragment, Relay will already know the id of the rendered object.
        * `options`: *_[Optional]_* options object
            * `fetchPolicy`: Determines if cached data should be used, and when to send a network request based on cached data that is available. See the [Fetch Policies](../../guided-tour/reusing-cached-data/fetch-policies/) section for full specification.
            * `onComplete`: Function that will be called whenever the refetch request has completed, including any incremental data payloads.
    * Return value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will cancel the refetch request.
    * Behavior:
        * Calling `refetch` with a new set of variables will fetch the fragment again *with the newly provided variables*. Note that the variables you need to provide are only the ones referenced inside the fragment. In this example, it means fetching the translated body of the currently rendered Comment, by passing a new value to the `lang` variable.
        * Calling `refetch` will re-render your component and may cause it to *[suspend](../../guided-tour/rendering/loading-states)*, depending on the specified `fetchPolicy` and whether cached data is available or if it needs to send and wait for a network request. If refetch causes the component to suspend, you'll need to make sure that there's a `Suspense` boundary wrapping this component.
        * For more details on Suspense, see our [Loading States with Suspense](../../guided-tour/rendering/loading-states/) guide.

### Behavior

* The component automatically fetches for more items to fill the buffer in `useEffect`.
* The component is automatically subscribed to updates to the fragment data: if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
* The component will suspend if any data for that specific fragment is missing, and the data is currently being fetched by a parent query.
    * For more details on Suspense, see our [Loading States with Suspense](../../guided-tour/rendering/loading-states/) guide.
* Note that pagination (`loadNext`), *will not* cause the component to suspend.

<DocsRating />
