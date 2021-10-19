---
id: pagination
title: Pagination
slug: /guided-tour/list-data/pagination/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

## Pagination

To actually perform pagination over the connection, we need use the `loadNext` function to fetch the next page of items, which is available from `usePaginationFragment`:

```js
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');

const {graphql, usePaginationFragment} = require('react-relay');
const useSuspenseTransition = require('useSuspenseTransition');

const {Suspense, SuspenseList} = require('React');

type Props = {
  user: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  const [startTransition] = useSuspenseTransition();
  const {data, loadNext} = `usePaginationFragment``<``FriendsListPaginationQuery``,`` _``>`(
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
      <SuspenseList revealOrder="forwards">
        {(data.friends?.edges ?? []).map(edge => {
          const node = edge.node;
          return (
            <Suspense fallback={<Glimmer />}>
              <FriendComponent user={node} />
            </Suspense>
          );
        })}
      </SuspenseList>

      <Button
        onClick={() => {
          startTransition(() => {
            loadNext(10)
          });
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
* `loadNext` may cause the component or new children components to suspend (as explained in [Transitions and Updates that Suspend](../../rendering/loading-states/)). This means that you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, and/or that you are using [`useSuspenseTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) with a Suspense config  in order to show the appropriate pending or loading state.
    * Note that since `loadNext` may cause the component to suspend, regardless of whether we're using a Suspense config to render a pending state, we should always use `startTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.


Often, you will also want to access information about whether there are more items available to load. To do this, you can use the `hasNext` value, also available from `usePaginationFragment`:

```js
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');
const {Suspense, SuspenseList} = require('React');

const {graphql, usePaginationFragment} = require('react-relay');
const useSuspenseTransition = require('useSuspenseTransition');

type Props = {
  user: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  const [startTransition] = useSuspenseTransition();
  const {
    data,
    loadNext,
    hasNext,
  } = `usePaginationFragment``<``FriendsListPaginationQuery``,`` _``>`(
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
      <SuspenseList revealOrder="forwards">
        {(data.friends?.edges ?? []).map(edge => {
          const node = edge.node;
          return (
            <Suspense fallback={<Glimmer />}>
              <FriendComponent user={node} />
            </Suspense>
          );
        })}
      </SuspenseList>

      {/* Only render button if there are more friends to load in the list */}
      {hasNext ? (
        <Button
          onClick={() => {
            startTransition(() => {
              loadNext(10)
            });
          }}>
          Load more friends
        </Button>
      ) : null}
    </>
  );
}

module.exports = FriendsListComponent;
```

* `hasNext` is a boolean which indicates if the connection has more items available. This information can be useful for determining if different UI controls should be rendered. In our specific case, we only render the `Button` if there are more friends available in the connection .



<DocsRating />
