---
id: pagination
title: Pagination with Connections
slug: /guided-tour/list-data/pagination/
description: Relay guide to connections and pagination
keywords:
- pagination
- connections
- usePaginationFragment
---

import DocsRating from '@site/src/core/DocsRating';

# Pagination with Connections

In order to paginate through lists of data (load only discrete slices of list data), Relay introduces an abstraction known as a "connection". Connections allow you to request discrete slices of data from the server as well as information about the list itself (e.g. how to get the next page of data). For more information about the design of connections, see [Why Connections?](./connections.md).

A query with a connection includes:
- the *connection* itself, a field that returns the `edges` and `pageInfo`. It includes a `first` argument to indicate the page size and an `after` argument to indicate where the beginning of the list is.
- the *edge*, which contains the `cursor` (a bookmark of where you are in the list) and the `node` (the actual record the connection is paginating over).
- the *pageInfo*, which contains information about getting more edges (`hasPreviousPage`, `hasNextPage`, `startCursor`, and `endCursor`).

A typical query fragment (for fetching a list of comments) may look like:
```
const StoryCommentsSectionFragment = graphql`
  fragment StoryCommentsSectionFragment on Story {
    # the connection with arguments to specify which items to fetch
    comments(after: $cursor, first: $count) {
      edges {                # the list of edges
        node {               # the Comment record itself
          ...CommentFragment # the fields on Comment to fetch
        }
        cursor               # an identifier of this Comment's place in the list
      }
      pageInfo {             # the page info
        hasNextPage          # if another page of comments is available
      }
    }
  }
`;
```

:::info
Relay uses "cursors" to specify the beginning of a list. Each node is associated with a unique cursor, which can be passed to the connection to fetch the next page _after_ that cursor. This makes it easy to fetch consecutive pages of data.
:::

## Connection Directives

Relay handles a lot of the pagination logic for you but to do so, connections must be augmented with directives containing some additional information.

```
const StoryCommentsSectionFragment = graphql`
  fragment StoryCommentsSectionFragment on Story
  @argumentDefinitions(
    cursor: { type: "String" }
    count: { type: "Int", defaultValue: 3 }
  )
  @refetchable(queryName: "StoryCommentsSectionPaginationQuery") {
    comments(after: $cursor, first: $count)
      @connection(key: "StoryCommentsSectionFragment_comments") {
      edges {
        node {
          ...CommentFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
```
Breaking this down:
- `@argumentDefinitions` is just defining the `$cursor` and `$count` variables as [fragment arguments](../../api-reference/graphql/graphql-directives.md#argumentdefinitions)
- `@refetchable` makes the fragment [refetchable](../../tutorial/refetchable-fragments.md) so that Relay can fetch it again with new arguments — usually, a new cursor for the `$cursor` argument.
- `@connection` is what Relay uses to tell _which field_ within the fragment represents the connection to paginate over. The `@connection` directive requires a `key` argument which must be a unique string — here formed from the fragment name and field name. This key is used when editing the connection’s contents via [mutations](../updating-data/updating-connections.md).

:::tip
Relay’s pagination features only work with fragments, not entire queries. This is usually fine as queries are generally issued at some high-level routing component, which would rarely be the same component that’s showing a paginated list. If you need to paginate something at the query level, refactor the connection field out into a fragment that is defined on the `Query` type.
:::

For a full specification of connections, see the [GraphQL Cursor Connections Spec](https://relay.dev/graphql/connections.htm).

## The usePaginationFragment hook

Relay provides an easy way to use connections in React via the [`usePaginationFragment`](../../api-reference/hooks/use-pagination-fragment.md) hook. This hook acts similarly to the [`useFragment`](../../api-reference/hooks/use-fragment.md) hook but also provides additional callbacks for loading the next/previous page of data along with checking if those pages exist and loading indicators if a request is in flight. Using the `usePaginationFragment` hook also means you can omit the `pageInfo` and `cursor` fields from your fragment as Relay will automatically insert them and use the information to paginate via the hook. Taking the previous example with the `StoryCommentsSectionFragment`, the fragment can be reduced to:

```
const StoryCommentsSectionFragment = graphql`
  fragment StoryCommentsSectionFragment on Story
  @argumentDefinitions(
    cursor: { type: "String" }
    count: { type: "Int", defaultValue: 3 }
  )
  @refetchable(queryName: "StoryCommentsSectionPaginationQuery") {
    comments(after: $cursor, first: $count)
      @connection(key: "StoryCommentsSectionFragment_comments") {
      edges {
        node {
          ...CommentFragment
        }
      }
    }
  }
`;
```

Here's an example of how the `usePaginationFragment` hook can be used to implement pagination in a React component:

```
function StoryCommentsSection({story}) {
  const {
    data,
    hasNext,
    loadNext,
    isLoadingNext,
  } = usePaginationFragment(StoryCommentsSectionFragment, story);
  return (
    <>
      {data.comments.edges.map(commentEdge =>
        <Comment comment={commentEdge.node} />
      )}
      {hasNext && (
        <LoadMoreCommentsButton
          onClick={() => loadNext(3)}
          disabled={isLoadingNext}
        />
      )}
      {isLoadingNext && <SmallSpinner />}
    </>
  );
}
```
In this example, the `story` prop passed to the `usePaginationFragment` is the same as the query reference passed to `useFragment`. Along with the fragment `data`, the hook in this example also returns `loadNext`, `hasNext`, and `isLoadingNext`.
- `hasNext` indicates whether another page of data exists.
- `loadNext` is a function that can be called to load the next page of data — for example when a user clicks on the `LoadMoreCommentsButton`. It takes an argument to indicate how many new items to fetch.
- In order to provide a better user experience, `isLoadingNext` can be used to show a loading indicator while the next page of comments is loading.

:::info
When the request to fetch the next items completes, the connection will be automatically updated and the component will re-render with the latest items in the connection. In our case, this means that the `comments` field will always contain *all* of the comments that we've fetched so far. By default, *Relay will automatically append new items to the connection upon completing a pagination request,* and will make them available to your fragment component*.* If you need a different behavior, check out the [Advanced Pagination Use Cases](./advanced-pagination.md) section.
:::

For the full information on the `usePaginationFragment` hook, check out the [API reference](../../api-reference/hooks/use-pagination-fragment.md).

## React Loading States

React provides [suspense](https://react.dev/reference/react/Suspense) to allow a fallback while data is loading and [transitions](https://react.dev/reference/react/startTransition) to provide a better user experience when updating data. These can be used in conjunction with `usePaginationFragment`.

Taking the example above,
```
function StoryCommentsSection({story}) {
  const {
    data,
    hasNext,
    loadNext,
    isLoadingNext,
  } = usePaginationFragment(StoryCommentsSectionFragment, story);
  return (
    <>
      {data.comments.edges.map(commentEdge => {
        return (
          <Suspense fallback={<Glimmer />}>
            <Comment comment={commentEdge.node} />
          </Suspense>
        );
      })}
      {hasNext && (
        <LoadMoreCommentsButton
          onClick={() => {
            startTransition(() => {
              loadNext(3)
            });
          }}
          disabled={isLoadingNext}
        />
      )}
      {isLoadingNext && <SmallSpinner />}
    </>
  );
}
```

Calling `loadNext` may cause the component or new children components to suspend (as explained in [Loading States with Suspense](../rendering/loading-states.md)). This means that you'll need to make sure that there's a `Suspense` boundary wrapping this component from above and/or that you are using a transition in order to show the appropriate pending or loading state.

:::note
Since `loadNext` may cause the component to suspend, regardless of whether a transition is used to render a pending state (i.e. with a loading indicator from [useTransition](https://react.dev/reference/react/useTransition)), `startTransition` should always be used to schedule that update for the best user experience.
:::

<DocsRating />
