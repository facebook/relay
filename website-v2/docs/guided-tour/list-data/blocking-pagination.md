---
id: blocking-pagination
title: Blocking Pagination
slug: /guided-tour/list-data/blocking-pagination/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

## Blocking ("all-at-once") Pagination [Concurrent Mode Only]

So far when we've talked about pagination, we haven't specified how we want pagination to behave when we're rendering the new item's we've fetched. Since the new items that we're fetching and rendering might individually suspend due to their own asynchronous dependencies ([Loading States With Suspense](../../rendering/loading-states/)), we need to be able to specify what kind of behavior we want to have as we render them.

Usually, we've identified that this will fall under one of these 2 categories:

* *"One by one"* (or "stream-y") pagination: Regardless of whether we're actually streaming at the data layer, conceptually this type of pagination is where we want to render items one by one, in order, as they become available. In this use case, we usually want to show some sort of loading placeholder for the new items (either in aggregate or for each individual item) as they are loaded in. This should not exclude the possibility of *also* having a *separate* pending or busy state (like a spinner next to the button that started the action). This is generally the default pagination behavior that we'll want, which applies to most lists and feeds.

<FbInternalOnly>

> See [this guide](https://fb.workplace.com/notes/sebastian-markbage/3-paints/462082611213402/) about pending and busy states.

</FbInternalOnly>

* *"All at once"* pagination: This type of pagination is where we want to load and render the entire next page of items *all at once,* in a *single paint*; that is, we want to render the next page of items only when *all* of the items are ready (including when individual items suspend). Unlike the previous case, in this case, we do not want to show individual placeholders for the new items in the list, but instead we want to immediately show a pending or busy state, such as a spinner next (or close) to the element that started the action (like a button); this pending spinner should continue "spinning" until the entire next page of items are *fully* loaded and rendered.


<FbInternalOnly>

> The best example of a use case for blocking pagination is the comments list in UFI.

</FbInternalOnly>

So far in the previous pagination sections, we've implicitly been referring to the *"one by one"* pagination case when describe using `usePaginationFragment` + `SuspenseList` to render lists and show loading placeholders.

However, if we want to implement *"all at once"* pagination, we need to use a different api, `useBlockingPaginationFragment`:

```js
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');
const {Suspense} = require('React');

const {graphql, useBlockingPaginationFragment} = require('react-relay');
const SuspenseList = require('SuspenseList');
const useSuspenseTransition = require('useSuspenseTransition');

type Props = {
  user: FriendsListComponent_user$key,
};

const SUSPENSE_CONFIG = {
  // timeoutMs allows us to delay showing the "loading" state for a while
  // in favor of showing a "pending" state that we control locally
  timeoutMs: 30 * 1000,
};

function FriendsListComponent(props: Props) {
  // isPending captures the "pending" state. It will become true
  // **immediately** when the pagination transition starts, and will be set back
  // to false when the transition reaches the fully "completed" stage
  // (i.e. when all the new items in the list have fully loaded and rendered)
  const [startTransition, isPending] = useSuspenseTransition(SUSPENSE_CONFIG);
  const {
    data,
    loadNext,
    hasNext,
  } = `useBlockingPaginationFragment``<``FriendsListPaginationQuery``,`` _``>`(
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

      {/* Render a Spinner next to the button immediately, while transition is pending */}
      {isPending ? <Spinner /> : null}

      {hasNext ? (
        <Button
          {/* Disbale the button immediately, while transition is pending */}
          disabled={isPending}
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

Let's distill what's going on here:

* `loadNext` will cause the component to suspend, so we need to wrap it in `startTransition`, as explained in [Transitions and Updates that Suspend](../../rendering/loading-states/).
* Also similarly to the case described in [Transitions and Updates that Suspend](../../rendering/loading-states/), we're passing the `SUSPENSE_CONFIG` config object to `useSuspenseTransition` in order to configure how we want this transition to behave. Specifically, we can pass a `timeoutMs` property in the config, which will dictate how long React should wait before transitioning to the *"loading"* state (i.e. transition to showing the loading placeholders for the new items), in favor of showing a *"pending"* state controlled locally by the component during that time.
* `useSuspenseTransition` will also return a `isPending` boolean value, which captures the pending state. That is, this value will become `true` *immediately* when the pagination transition starts, and will become `false` when the transition reaches the fully *"completed"* stage, that is, when all the new items have been *fully* loaded, including their own asynchronous dependencies that would cause them to suspend. We can use the `isPending` value to show immediate feedback to the user action, in this case by rendering a spinner next to the button and disabling the button. In this case, the spinner will be rendered and the button will be disable until *all* the new items in the list have been fully loaded and rendered.



> NOTE: If you're using pagination outside of React Concurrent mode, `useBlockingPagination` functionality will not be available; you will need to use [`usePaginationFragment`](../pagination/) instead.




<DocsRating />
