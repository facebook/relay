---
name: relay-performance
description: >-
  Performance best practices for Relay applications. Use when optimizing data
  fetching, reducing re-renders, configuring caching, or improving time to first
  meaningful paint. Covers query placement, @defer, pagination, fetch policies,
  garbage collection, fragment granularity, and server-side filtering. Companion
  to the relay-best-practices skill which covers correctness and architecture.
---

# Relay Performance Best Practices

Performance-focused guidance for Relay applications. For correctness, naming,
and architectural patterns, see the `relay-best-practices` skill.

For detailed API documentation, read the relevant page from `<llm-docs>/`
(available in `node_modules/relay-runtime/llm-docs/` after v20.1.1).

## One Query Per Screen

Each screen or route should have **one** (or very few) root queries. Relay
coalesces all fragment data needs into a single network request per query.
Multiple root queries on the same screen defeat this optimization — the browser
makes multiple parallel requests that each carry redundant overhead (HTTP
headers, connection setup, response parsing).

```
GOOD:                              BAD:
Route → 1 query                    Route → 3 queries
  ├─ Header (fragment)               ├─ Header (query #1)
  ├─ Content (fragment)               ├─ Content (query #2)
  └─ Sidebar (fragment)               └─ Sidebar (query #3)
```

## Preload Before Rendering the Root

Fetch the initial query **before** calling `createRoot().render()`. This
overlaps the network request with React's initialization, minimizing time to
first meaningful paint.

```tsx
// Start fetch immediately — before React even initializes
const queryRef = loadQuery(environment, AppQuery, initialVariables);

// Then render — data may already be available
const root = createRoot(document.getElementById('root'));
root.render(
  <RelayEnvironmentProvider environment={environment}>
    <Suspense fallback={<AppSkeleton />}>
      <App queryRef={queryRef} />
    </Suspense>
  </RelayEnvironmentProvider>
);
```

## Use `@defer` for Non-Critical Content

Defer secondary or below-the-fold content so primary UI renders faster.
Relay streams deferred data progressively via Suspense — the initial response
arrives smaller and the critical path renders sooner.

```graphql
query ProfileScreenQuery($id: ID!) {
  user(id: $id) {
    ...ProfileHeader_user
    ...ProfileDetails_user @defer
    ...ProfileComments_user @defer
  }
}
```

```tsx
function ProfileScreen({ queryRef }) {
  const data = usePreloadedQuery(ProfileScreenQuery, queryRef);

  return (
    <ScrollView>
      <ProfileHeader user={data.user} />
      <Suspense fallback={<DetailsSkeleton />}>
        <ProfileDetails user={data.user} />
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <ProfileComments user={data.user} />
      </Suspense>
    </ScrollView>
  );
}
```

Good candidates for `@defer`:
- Sidebar content
- Below-the-fold sections
- Tabs and accordions not visible on initial load
- Heavy item details in paginated lists

## Fetch Policies

`store-or-network` (the default) is correct for most cases — it reuses cached
data and only hits the network for missing or stale data.

| Policy | When to use |
|--------|-------------|
| `store-or-network` | Default. Best balance of speed and freshness. |
| `store-and-network` | Show cached data immediately, update in background. |
| `network-only` | Freshness is critical (e.g., after a mutation with wide side effects). |
| `store-only` | Offline-first or reading data already guaranteed to be in the store. |

Reserve `network-only` for rare cases. Overusing it turns Relay into a
no-cache client and eliminates the benefit of the normalized store.

## Configure Garbage Collection

Set `gcReleaseBufferSize` on the Relay Store to retain recently-used queries
after their components unmount. The default is 10. This makes navigating back
to a previously visited screen instant (data is still in the store) instead of
triggering a new network request.

```tsx
const store = new Store(new RecordSource(), {
  gcReleaseBufferSize: 20,
});
```

For apps with many screens or heavy navigation, increase the buffer. For
memory-constrained environments (mobile), keep it conservative.

## Filter and Sort on the Server

Use GraphQL field arguments to filter and sort data on the server rather than
fetching everything and processing in JavaScript.

```tsx
// BAD: fetch all tasks, filter on client
const data = useFragment(graphql`
  fragment TaskList_user on User {
    tasks { id, title, status }
  }
`, user);
const active = data.tasks.filter(t => t.status === 'ACTIVE');

// GOOD: filter on server via field argument
const data = useFragment(graphql`
  fragment TaskList_user on User {
    tasks(status: ACTIVE) { id, title }
  }
`, user);
```

Server-side filtering reduces payload size, avoids unnecessary network
transfer, and reduces memory usage on the client.

## Never Fetch Unbounded Collections

Always paginate list fields using `@connection` + `usePaginationFragment`.
Fetching an entire collection at once risks transferring megabytes of data,
stalling the UI during normalization, and exhausting device memory.

Start with a page size appropriate for the viewport (e.g., 10–20 items) and
load more on scroll.

```graphql
# BAD: fetches every item — unbounded
fragment NotificationList_user on User {
  notifications {
    id
    message
  }
}

# GOOD: paginated with a bounded first page
fragment NotificationList_user on User
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 10 }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "NotificationListPaginationQuery") {
  notifications(first: $count, after: $cursor)
    @connection(key: "NotificationList_notifications") {
    edges {
      node {
        id
        message
      }
    }
  }
}
```

## Keep Fragments Granular

Split large fragments into smaller, component-scoped fragments so Relay can
re-render **only** the components whose data actually changed. A single
monolithic fragment shared by many components causes all of them to re-render
when any field in the fragment changes.

```tsx
// BAD: one large fragment, all children re-render on any field change
function PostCard({ post }) {
  const data = useFragment(graphql`
    fragment PostCard_post on Post {
      title
      body
      author { name, profilePicture { uri } }
      likeCount
      commentCount
    }
  `, post);
  return (
    <>
      <PostHeader title={data.title} author={data.author} />
      <PostBody body={data.body} />
      <PostFooter likes={data.likeCount} comments={data.commentCount} />
    </>
  );
}

// GOOD: each child owns its fragment, re-renders independently
function PostHeader({ post }: { post: PostHeader_post$key }) {
  const data = useFragment(graphql`
    fragment PostHeader_post on Post {
      title
      author { name }
    }
  `, post);
  // Only re-renders when title or author.name changes
}

function PostFooter({ post }: { post: PostFooter_post$key }) {
  const data = useFragment(graphql`
    fragment PostFooter_post on Post {
      likeCount
      commentCount
    }
  `, post);
  // Only re-renders when like/comment counts change
}
```

## One Connection Per Component

Use a single `usePaginationFragment` per component. Multiple connections in
one component make pagination state harder to reason about — cursor tracking,
loading states, and `hasNext` flags become tangled. Split each connection into
its own component instead.

## Avoid Unnecessary Refetches

After a mutation, let Relay's normalized store auto-update components by
spreading relevant fragments in the mutation response. Do not call `refetch()`
or `fetchQuery()` when the store update is sufficient.

```graphql
# GOOD: updated data comes back with the mutation response
mutation UpdateUserMutation($input: UpdateUserInput!) {
  updateUser(input: $input) {
    user {
      ...UserProfile_user
      ...UserAvatar_user
    }
  }
}

# BAD: requires a separate round-trip after mutation
mutation UpdateUserMutation($input: UpdateUserInput!) {
  updateUser(input: $input) {
    user { id }
  }
}
```

Use `fetchKey` sparingly — changing it forces a full network round trip.
Reserve `refetchQueries` / manual refetch for cases where the mutation's side
effects are too broad to capture in the response payload.

## Fetch Only What You Need

Each fragment should request only the fields the component actually renders.
Do not add fields "just in case" — unused fields increase payload size and slow
down parsing and normalization. Relay's `unused-fields` lint rule catches this.

If a child component needs more data, add a fragment **to the child** and
spread it in the parent — do not widen the parent's fragment.
