---
id: advanced-pagination
title: Advanced Pagination
slug: /guided-tour/list-data/advanced-pagination/
description: Relay guide for advanced pagination
keywords:
- pagination
- usePaginationFragment
- prefetching
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

In this section we're going to cover how to implement more advanced pagination use cases than the default cases covered by `usePaginationFragment`.


## Pagination Over Multiple Connections

If you need to paginate over multiple connections within the same component, you can use `usePaginationFragment` multiple times:

```js
import type {CombinedFriendsListComponent_user$key} from 'CombinedFriendsListComponent_user.graphql';
import type {CombinedFriendsListComponent_viewer$key} from 'CombinedFriendsListComponent_viewer.graphql';

const React = require('React');

const {graphql, usePaginationFragment} = require('react-relay');

type Props = {
  user: CombinedFriendsListComponent_user$key,
  viewer: CombinedFriendsListComponent_viewer$key,
};

function CombinedFriendsListComponent(props: Props) {

  const {data: userData, ...userPagination} = usePaginationFragment(
    graphql`
      fragment CombinedFriendsListComponent_user on User {
        name
        friends
          @connection(
            key: "CombinedFriendsListComponent_user_friends_connection"
          ) {
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

  const {data: viewerData, ...viewerPagination} = usePaginationFragment(
    graphql`
      fragment CombinedFriendsListComponent_user on Viewer {
        actor {
          ... on User {
            name
            friends
              @connection(
                key: "CombinedFriendsListComponent_viewer_friends_connection"
              ) {
              edges {
                node {
                  name
                  age
                }
              }
            }
          }
        }
      }
    `,
    props.viewer,
  );

  return (...);
}
```

However, we recommend trying to keep a single connection per component, to keep the components easier to follow.



## Bi-directional Pagination

In the [Pagination](../pagination/) section we covered how to use `usePaginationFragment` to paginate in a single *"forward"* direction. However, connections also allow paginating in the opposite *"backward"* direction. The meaning of *"forward"* and *"backward"* directions will depend on how the items in the connection are sorted, for example  *"forward"* could mean more recent*, and "backward"* could mean less recent.

Regardless of the semantic meaning of the direction, Relay also provides the same APIs to paginate in the opposite direction, using `usePaginationFragment`, as long  as the `before` and `last` connection arguments are also used along with `after` and `first`:

```js
import type {FriendsListComponent_user$key} from 'FriendsListComponent_user.graphql';

const React = require('React');
const {Suspense} = require('React');

const {graphql, usePaginationFragment} = require('react-relay');

type Props = {
  userRef: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  const {
    data,
    loadPrevious,
    hasPrevious,
    // ... forward pagination values
  } = usePaginationFragment(
    graphql`
      fragment FriendsListComponent_user on User {
        name
        friends(after: $after, before: $before, first: $first, last: $last)
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
      <List items={data.friends?.edges.map(edge => edge.node)}>
        {node => {
          return (
            <div>
              {node.name} - {node.age}
            </div>
          );
        }}
      </List>

      {hasPrevious ? (
        <Button onClick={() => loadPrevious(10)}>
          Load more friends
        </Button>
      ) : null}

      {/* Forward pagination controls can go simultaneously here */}
    </>
  );
}
```

* The APIs for both *"forward"* and *"backward"* are exactly the same, they're only named differently. When paginating forward, then the  `after` and `first` connection arguments will be used, when paginating backward, the `before` and `last` connection arguments will be used.
* Note that the primitives for both *"forward"* and *"backward"* pagination are exposed from a single call to `usePaginationFragment`, so both *"forward"* and *"backward"* pagination can be performed simultaneously in the same component.



## Custom Connection State

By default, when using `usePaginationFragment` and `@connection`, Relay will *append* new pages of items to the connection when paginating *"forward",* and *prepend* new pages of items when paginating *"backward"*. This means that your component will always render the *full* connection, with *all* of the items that have been accumulated so far via pagination, and/or items that have been added or removed via mutations or subscriptions.

However, it is possible that you'd need different behavior for how to merge and accumulate pagination results (or other updates to the connection), and/or derive local component state from changes to the connection. Some examples of this might be:

* Keeping track of different *visible* slices or windows of the connection.
* Visually separating each *page* of items. This requires knowledge of the exact set of items inside each page that has been fetched.
* Displaying different ends of the same connection simultaneously, while keeping track of the "gaps" between them, and being able to merge results when preforming pagination between the gaps. For example, imagine rendering a list of comments where the oldest comments are displayed at the top, then a "gap" that can be interacted with to paginate, and then a section at the bottom which shows the most recent comments that have been added by the user or by real-time subscriptions.


To address these more complex use cases, Relay is still working on a solution:


> TBD




## Refreshing connections

> TBD




## Prefetching Pages of a Connection

> TBD




## Rendering One Page of Items at a Time

> TBD



<DocsRating />
