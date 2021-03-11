---
id: use-pagination-fragment
title: usePaginationFragment
slug: /api-reference/use-pagination-fragment/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbUsePaginationFragmentReturnValue from './fb/FbUsePaginationFragmentReturnValue.md';

## `usePaginationFragment`

You can use `usePaginationFragment` to render a fragment that uses a `@connection` and paginate over it:

```js
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsList_user$key} from 'FriendsList_user.graphql';

const React = require('React');

const {graphql, usePaginationFragment} = require('react-relay');

type Props = {
  user: FriendsList_user$key,
};

function FriendsList(props: Props) {
  const {
    data,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious,
    refetch, // For refetching connection
  } = usePaginationFragment<FriendsListPaginationQuery, _>(
    graphql`
      fragment FriendsListComponent_user on User
      @refetchable(queryName: "FriendsListPaginationQuery") {
        name
        friends(first: $count, after: $cursor)
        @connection(key: "FriendsList_user_friends") {
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

      <List items={data.friends?.edges.map(edge => edge.node)}>
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
    * This fragment must have an `@connection` directive on a connection field, otherwise using it will throw an error.
    * This fragment must have a `@refetchable` directive, otherwise using it will throw an error. The `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are declared on `Viewer` or  `Query` types, or on a type that implements `Node` (i.e. a type that has an `id`).
        * Note that you *do not* need to manually specify a pagination query yourself. The `@refetchable` directive will autogenerate a query with the specified `queryName`. This will also generate Flow types for the query, available to import from the generated file: `<queryName>.graphql.js`.
* `fragmentReference`: The *fragment reference* is an opaque Relay object that Relay uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.
    * The type of the fragment reference can be imported from the generated Flow types, from the file `<fragment_name>.graphql.js`, and can be used to declare the type of your `Props`. The name of the fragment reference type will be: `<fragment_name>$key`. We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared.

### Flow Type Parameters

* `TQuery`: Type parameter that should corresponds the Flow type for the `@refetchable` pagination query. This type is available to import from the the auto-generated file: `<queryName>.graphql.js`.
* `TFragmentRef`: Type parameter corresponds to the type of the fragment reference argument (i.e. `<fragment_name>$key`). This type usually does not need to be explicitly specified, and can be passed as `_` to let Flow infer the concrete type.

### Return Value

<FbInternalOnly>
  <FbUsePaginationFragmentReturnValue />
</FbInternalOnly>

<OssOnly>

Object containing the following properties:

* `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified fragment.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema.
* `isLoadingNext`: Boolean value which indicates if a pagination request for the *next* items in the connection is currently in flight, including any incremental data payloads.
* `isLoadingPrevious`: Boolean value which indicates if a pagination request for the *previous* items in the connection is currently in flight, including any incremental data payloads.
* `hasNext`: Boolean value which indicates if the end of the connection has been reached in the "forward" direction. It will be true if there are more items to query for available in that direction, or false otherwise.
* `hasPrevious`: Boolean value which indicates if the end of the connection has been reached in the "backward" direction. It will be true if there are more items to query for available in that direction, or false otherwise.
* `loadNext`: Function used to fetch more items in the connection in the "forward" direction.
    * Arguments:
        * `count`*:* Number that indicates how many items to query for in the pagination request.
        * `options`: *_[Optional]_* options object
            * `onComplete`: Function that will be called whenever the refetch request has completed, including any incremental data payloads. If an error occurs during the request, `onComplete` will be called with an `Error` object as the first parameter.
    * Return Value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will cancel the pagination request.
    * Behavior:
        * Calling `loadNext`  *will not* cause the component to suspend. Instead, the `isLoadingNext` value will be set to true while the request is in flight, and the new items from the pagination request will be added to the connection, causing the component to re-render.
        * Pagination requests initiated from calling `loadNext` will *always* use the same variables that were originally used to fetch the connection, *except* pagination variables (which need to change in order to perform pagination); changing variables other than the pagination variables during pagination doesn't make sense, since that'd mean we'd be querying for a different connection.
* `loadPrevious`: Function used to fetch more items in the connection in the "backward" direction.
    * Arguments:
        * `count`*:* Number that indicates how many items to query for in the pagination request.
        * `options`: *_[Optional]_* options object
            * `onComplete`: Function that will be called whenever the refetch request has completed, including any incremental data payloads. If an error occurs during the request, `onComplete` will be called with an `Error` object as the first parameter.
    * Return Value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will cancel the pagination request.
    * Behavior:
        * Calling `loadPrevious`  *will not* cause the component to suspend. Instead, the `isLoadingPrevious` value will be set to true while the request is in flight, and the new items from the pagination request will be added to the connection, causing the component to re-render.
        * Pagination requests initiated from calling `loadPrevious` will *always* use the same variables that were originally used to fetch the connection, *except* pagination variables (which need to change in order to perform pagination); changing variables other than the pagination variables during pagination doesn't make sense, since that'd mean we'd be querying for a different connection.
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

</OssOnly>

### Behavior

* The component is automatically subscribed to updates to the fragment data: if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
* The component will suspend if any data for that specific fragment is missing, and the data is currently being fetched by a parent query.
    * For more details on Suspense, see our [Loading States with Suspense](../../guided-tour/rendering/loading-states/) guide.
* Note that pagination (`loadNext` or `loadPrevious`), *will not* cause the component to suspend.

### DIfferences with `PaginationContainer`

* A pagination query no longer needs to be specified in this api, since it will be automatically generated by Relay by using a `@refetchable` fragment.
* This api supports simultaneous bi-directional pagination out of the box.
* This api no longer requires passing a `getVariables` or `getFragmentVariables` configuration functions, like the `PaginationContainer` does.
    * This implies that pagination no longer has a between `variables` and `fragmentVariables`, which were previously vaguely defined concepts. Pagination requests will always use the same variables that were originally used to fetch the connection, *except* pagination variables (which need to change in order to perform pagination); changing variables other than the pagination variables during pagination doesn't make sense, since that'd mean we'd be querying for a different connection.
* This api no longer takes additional configuration like `direction` or `getConnectionFromProps` function (like Pagination Container does). These values will be automatically determined by Relay.
* Refetching no longer has a distinction between `variables` and `fragmentVariables`, which were previously vaguely defined concepts. Refetching will always correctly refetch and render the fragment with the variables you provide (any variables omitted in the input will fallback to using the original values in the parent query).
* Refetching will unequivocally update the component, which was not always true when calling `refetchConnection` from `PaginationContainer` (it would depend on what you were querying for in the refetch query and if your fragment was defined on the right object type).


<DocsRating />
