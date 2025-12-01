---
id: streaming-pagination
title: Streaming Pagination
slug: /guided-tour/list-data/streaming-pagination/
description: Relay guide to streaming pagination
keywords:
- pagination
- usePaginationFragment
- connection
- streaming
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

<FbInternalOnly>

Additionally, we can combine `usePaginationFragment` with Relay's [Incremental Data Delivery](../../../guides/incremental-data-delivery/) capabilities in order to fetch a connection and incrementally receive each item in the connection as it becomes ready, instead of waiting for the whole list of items to be returned in a single payload. This can be useful when for example computing each item in the connection is an expensive operation in the server, and we want to be able to show the first item(s) in the list as soon as possible without blocking on *all* the items that we need to become available; for example, on News Feed a user could ideally see and start interacting with the first story while additional stories loaded in below.

</FbInternalOnly>

<OssOnly>

Additionally, we can combine `usePaginationFragment` with Relay's Incremental Data Delivery capabilities in order to fetch a connection and incrementally receive each item in the connection as it becomes ready, instead of waiting for the whole list of items to be returned in a single payload. This can be useful when for example computing each item in the connection is an expensive operation in the server, and we want to be able to show the first item(s) in the list as soon as possible without blocking on *all* the items that we need to become available; for example, on News Feed a user could ideally see and start interacting with the first story while additional stories loaded in below.

</OssOnly>

In order to do so, we can use the `@stream_connection` directive instead of the `@connection` directive:

```js
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');

const {graphql, usePaginationFragment} = require('react-relay');

type Props = {
  user: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  // ...

  const {
    data,
    loadNext,
    hasNext,
  } = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User
      @refetchable(queryName: "FriendsListPaginationQuery") {
        name
        friends(first: $count, after: $cursor)
        @stream_connection(key: "FriendsList_user_friends", initial_count: 2,) {
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

  return (...);
}

module.exports = FriendsListComponent;
```

Let's distill what's happening here:

* The `@stream_connection` directive can be used directly in place of the `@connection` directive; it accepts the same arguments as @connection plus additional, *optional* parameters to control streaming:
    * `initial_count: Int`: A number (defaulting to zero) that controls how many items will be included in the initial payload. Any subsequent items are streamed, so when set to zero the list will initially be empty and all items will be streamed. Note that this number does not affect how many items are returned *total*, only how many items are included in the initial payload. For example, consider a product that today makes an initial fetch for 2 items and then *immediately* issues a pagination query to fetch 3 more. With streaming, this product could instead choose to fetch 5 items in the initial query with initial_count=2, in order to fetch the 2 items quickly while avoiding a round trip for the subsequent 3 items.
* As with regular usage of `usePaginationFragment`, the connection will be automatically updated as new items are streamed in from the server, and the component will re-render each time with the latest items in the connection.


<FbInternalOnly>

For more information, see our docs on [Incremental Data Delivery](../../../guides/incremental-data-delivery/#stream_connection).

</FbInternalOnly>


<DocsRating />
