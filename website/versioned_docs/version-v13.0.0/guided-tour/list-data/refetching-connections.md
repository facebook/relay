---
id: refetching-connections
title: Refetching Connections (Using and Changing Filters)
slug: /guided-tour/list-data/refetching-connections/
description: Relay guide to refetching connections
keywords:
- pagination
- refetching
- connection
- useRefetchableFragment
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';
import FbRefetchingConnectionsUsingUseTransition from './fb/FbRefetchingConnectionsUsingUseTransition.md';

Often times when querying for a list of data, you can provide different values in the query which serve as filters that change the result set, or sort it differently.

Some examples of this are:

* Building a search typeahead, where the list of results is a list filtered by the search term entered by the user.
* Changing the ordering mode of the list comments currently displayed for a post, which could produce a completely different set of comments from the server.
* Changing the way News Feed is ranked and sorted.


Specifically, in GraphQL, connection fields can accept arguments to sort or filter the set of queried results:

```graphql
fragment UserFragment on User {
  name
  friends(order_by: DATE_ADDED, search_term: "Alice", first: 10) {
    edges {
      node {
        name
        age
      }
    }
  }
}
```


In Relay, we can pass those arguments as usual using GraphQL [variables](../../rendering/variables/)

```js
type Props = {
  userRef: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  const userRef = props.userRef;

  const {data, ...} = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User {
        name
        friends(
          order_by: $orderBy,
          search_term: $searchTerm,
          after: $cursor,
          first: $count,
        ) @connection(key: "FriendsListComponent_user_friends_connection") {
          edges {
            node {
              name
              age
            }
          }
        }
      }
    `,
    userRef,
  );

  return (...);
}
```


When paginating, the original values for those filters will be preserved:

```js
type Props = {
  userRef: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  const userRef = props.userRef;

  const {data, loadNext} = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User {
        name
        friends(order_by: $orderBy, search_term: $searchTerm)
          @connection(key: "FriendsListComponent_user_friends_connection") {
          edges {
            node {
              name
              age
            }
          }
        }
      }
    `,
    userRef,
  );

  return (
    <>
      <h1>Friends of {data.name}:</h1>
      <List items={data.friends?.nodes}>{...}</List>

      {/*
       Loading the next items will use the original order_by and search_term
       values used for the initial query
      */ }
      <Button onClick={() => loadNext(10)}>Load more friends</Button>
    </>
  );
}
```
* Note that calling `loadNext` will use the original `order_by` and `search_term` values used for the initial query. During pagination, these value won't (*and shouldn't*) change.

If we want to refetch the connection with *different* variables, we can use the `refetch` function provided by `usePaginationFragment`, similarly to how we do so when [Refetching Fragments with Different Data](../../refetching/refetching-fragments-with-different-data/):

<FbInternalOnly>
  <FbRefetchingConnectionsUsingUseTransition />
</FbInternalOnly>

<OssOnly>

```js
/**
 * FriendsListComponent.react.js
 */
import type {FriendsListComponent_user$key} from 'FriendsListComponent_user.graphql';

const React = require('React');
const {useState, useEffect} = require('React');

const {graphql, usePaginationFragment} = require('react-relay');


type Props = {
  searchTerm?: string,
  user: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  const searchTerm = props.searchTerm;
  const {data, loadNext, refetch} = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User {
        name
        friends(
          order_by: $orderBy,
          search_term: $searchTerm,
          after: $cursor,
          first: $count,
        ) @connection(key: "FriendsListComponent_user_friends_connection") {
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

  useEffect(() => {
    // When the searchTerm provided via props changes, refetch the connection
    // with the new searchTerm
    refetch({first: 10, search_term: searchTerm}, {fetchPolicy: 'store-or-network'});
  }, [searchTerm])

  return (
    <>
      <h1>Friends of {data.name}:</h1>

      {/* When the button is clicked, refetch the connection but sorted differently */}
      <Button
        onClick={() =>
          refetch({first: 10, orderBy: 'DATE_ADDED'});
        }>
        Sort by date added
      </Button>

      <List items={data.friends?.nodes}>...</List>
      <Button onClick={() => loadNext(10)}>Load more friends</Button>
    </>
  );
}
```

Let's distill what's going on here:

* Calling `refetch` and passing a new set of variables will fetch the fragment again *with the newly provided variables*. The variables you need to provide are a subset of the variables that the generated query expects; the generated query will require an `id`, if the type of the fragment has an `id` field, and any other variables that are transitively referenced in your fragment.
    * In our case, we need to pass the count we want to fetch as the `first` variable, and we can pass different values for our filters, like `orderBy` or `searchTerm`.
* This will re-render your component and may cause it to suspend (as explained in [Loading States with Suspense](../../rendering/loading-states/)) if it needs to send and wait for a network request. If `refetch` causes the component to suspend, you'll need to make sure that there's a `Suspense` boundary wrapping this component from above.
* Conceptually, when we call refetch, we're fetching the connection *from scratch*. It other words, we're fetching it again from the *beginning* and *"resetting"* our pagination state. For example, if we fetch the connection with a different `search_term`, our pagination information for the previous `search_term` no longer makes sense, since we're essentially paginating over a new list of items.

</OssOnly>




<DocsRating />
