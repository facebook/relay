---
id: pagination
title: Pagination
slug: /guided-tour/list-data/pagination/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbPaginationUsingUseTransition from './fb/FbPaginationUsingUseTransition.md';

To actually perform pagination over the connection, we need use the `loadNext` function to fetch the next page of items, which is available from `usePaginationFragment`:

<FbInternalOnly>
  <FbPaginationUsingUseTransition />
</FbInternalOnly>

<OssOnly>

```js
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');

const {graphql, usePaginationFragment} = require('react-relay');

const {Suspense} = require('React');

type Props = {
  user: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  const {data, loadNext} = usePaginationFragment<FriendsListPaginationQuery, _>(
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
      <div>
        {(data.friends?.edges ?? []).map(edge => {
          const node = edge.node;
          return (
            <Suspense fallback={<Glimmer />}>
              <FriendComponent user={node} />
            </Suspense>
          );
        })}
      </div>

      <Button
        onClick={() => {
          loadNext(10)
        }}>
        Load more friends
      </Button>
    </>
  );
}

module.exports = FriendsListComponent;
```

Let's distill what's happening here:

* `loadNext` takes a count to specify how many more items in the connection to fetch from the server. In this case, when `loadNext` is called we'll fetch the next 10 friends in the friends list of our currently rendered `User`.
* When the request to fetch the next items completes, the connection will be automatically updated and the component will re-render with the latest items in the connection. In our case, this means that the `friends` field will always contain *all* of the friends that we've fetched so far. By default, *Relay will automatically append new items to the connection upon completing a pagination request,* and will make them available to your fragment component*.* If you need a different behavior, check out our [Advanced Pagination Use Cases](../advanced-pagination/) section.
* `loadNext` may cause the component or new children components to suspend (as explained in [Loading States with Suspense](../../rendering/loading-states/)). This means that you'll need to make sure that there's a `Suspense` boundary wrapping this component from above.

</OssOnly>


Often, you will also want to access information about whether there are more items available to load. To do this, you can use the `hasNext` value, also available from `usePaginationFragment`:

```js
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');
const {Suspense} = require('React');

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
  } = usePaginationFragment<FriendsListPaginationQuery, _>(
    graphql`...`,
    props.user,
  );

  return (
    <>
      <h1>Friends of {data.name}:</h1>
      {/* ... */}

      {/* Only render button if there are more friends to load in the list */}
      {hasNext ? (
        <Button
          onClick={/* ... */}>
          Load more friends
        </Button>
      ) : null}
    </>
  );
}

module.exports = FriendsListComponent;
```

* `hasNext` is a boolean which indicates if the connection has more items available. This information can be useful for determining if different UI controls should be rendered. In our specific case, we only render the `Button` if there are more friends available in the connection.



<DocsRating />
