---
name: relay-best-practices
description: >-
  Best practices for writing idiomatic Relay code. ALWAYS use this skill when
  writing or modifying React components that use Relay for data fetching. Covers
  fragments, queries, mutations, pagination, and common anti-patterns. Use when
  you see `useFragment`, `useLazyLoadQuery`, `usePreloadedQuery`, `useMutation`,
  `usePaginationFragment`, `graphql` template literals, `react-relay` imports,
  or `__generated__/*.graphql` files. Also use when asked to explain Relay
  concepts, debug Relay issues, or review Relay code.
---

# Relay Best Practices

Relay is a GraphQL client for React that enforces colocated, composable, and
type-safe data fetching. Its core insight is that each component should declare
exactly what data it needs via GraphQL fragments, and Relay handles the rest —
fetching, caching, consistency, and updates.

This skill provides opinionated guidance on which patterns to prefer. For
detailed API documentation, read the relevant page from the doc map below.

## Documentation

Relay ships LLM-friendly docs in `node_modules/relay-runtime/llm-docs/`
(available after v20.1.1). For older versions, fetch the same files from
`https://raw.githubusercontent.com/facebook/relay/main/website/docs/`.

Paths below are relative to this directory (`<llm-docs>/`). Read the relevant
page before writing Relay code. Key docs:

| Topic | Path |
|-------|------|
| Core concepts & philosophy | `principles-and-architecture/thinking-in-relay.mdx` |
| Fragments | `guided-tour/rendering/fragments.mdx` |
| Queries | `guided-tour/rendering/queries.mdx` |
| Mutations | `guided-tour/updating-data/graphql-mutations.mdx` |
| Pagination | `guided-tour/list-data/pagination.mdx` |
| Refetching | `guided-tour/refetching/refetching-queries-with-different-data.mdx` |
| `useFragment` | `api-reference/hooks/use-fragment.mdx` |
| `usePreloadedQuery` | `api-reference/hooks/use-preloaded-query.mdx` |
| `useQueryLoader` / `loadQuery` | `api-reference/hooks/load-query.mdx` |
| `useMutation` | `api-reference/hooks/use-mutation.mdx` |
| `usePaginationFragment` | `api-reference/hooks/use-pagination-fragment.mdx` |
| `@throwOnFieldError` | `guides/throw-on-field-error-directive.mdx` |
| `@catch` directive | `guides/catch-directive.mdx` |
| Semantic nullability | `guides/semantic-nullability.mdx` |
| Relay Resolvers | `guides/relay-resolvers/introduction.mdx` |
| Testing | `guides/testing-relay-components.mdx` |
| Compiler setup | `getting-started/compiler.mdx` |
| Compiler configuration | `getting-started/compiler-config.mdx` |
| Lint rules (ESLint plugin) | `getting-started/lint-rules.mdx` |

**For performance-specific guidance** (query placement, `@defer`, pagination,
fetch policies, caching, fragment granularity), see the companion
`relay-performance` skill.

## Core Philosophy

These principles are the foundation of every decision below. When in doubt,
refer back to them.

- **Co-location**: Each component declares its own data requirements via a
  GraphQL fragment, right next to the rendering code. Data needs travel with the
  component, not separately.
- **Data masking**: A component can only access the fields it explicitly
  selected in its own fragment. Parents cannot see child fragment data, and vice
  versa. This prevents implicit coupling between components.
- **Composition**: Fragments compose into parent fragments and ultimately into
  queries, forming a tree that mirrors the component tree. The compiler flattens
  this into a single network request per query.
- **Render-as-you-fetch**: Start fetching data before the component that needs
  it renders. This avoids sequential request waterfalls.
- **Normalized store**: Relay maintains a flat, ID-keyed cache. When a mutation
  returns updated data, every component reading that data re-renders
  automatically. You do not need to manually propagate changes.

## Compiler Workflow

Relay uses an ahead-of-time compiler that reads `graphql` tagged template
literals in your code and generates runtime artifacts and TypeScript/Flow types.

### Finding the config

The compiler looks for its config in these locations (checked in order):
- `relay.config.{json,js,mjs,ts}` in the project root
- A `"relay"` key in `package.json`

See `<llm-docs>/getting-started/compiler-config.mdx` for the full config schema.
You can also emit a JSON Schema for the config by running
`npx relay-compiler config-json-schema`.

### Running the compiler

Run `npx relay-compiler` after any change to the contents of a `graphql` tagged
template literal or the docblock of a Relay Resolver. Some projects add this as
a script in `package.json` (e.g., `yarn relay`). The compiler also supports watch mode (`--watch`), but avoid using it in
non-interactive contexts since the process never exits.

Generated files go into `__generated__/` directories next to the source files.
Never edit these files — they are overwritten on every compiler run. If you see
type errors about missing generated types, run the compiler first — the
types are likely just out of date.

## Lint Rules

Relay's ESLint plugin (`eslint-plugin-relay`) is a key part of the developer
experience. Two rules are especially important:

- `relay/unused-fields` — detects GraphQL fields that are selected in a
  fragment but never read in the component. This prevents the "append-only
  query" problem where fragments accumulate unused fields over time, fetching
  data no component actually needs.
- `relay/no-future-added-value` — prevents explicitly handling the
  `"%future added value"` enum placeholder that Relay inserts to ensure you
  handle the possibility of new enum variants being added by the server.

See `<llm-docs>/getting-started/lint-rules.mdx` for installation and configuration.

## Decision Rules

### Queries belong at roots — never in hooks

Queries belong at **route entrypoints** (the top-level component for a URL).
Hooks are leaves — reused across many components. A query inside a hook fires
late (after the hook's host renders) AND duplicates across every caller. The fix
is always: accept a fragment key as a parameter, use `useFragment`.

Use `usePreloadedQuery` + `useQueryLoader` (or `loadQuery`). Start the fetch in
an event handler, route transition, or during app initialization — before the
component renders. `useLazyLoadQuery` does not start fetching until render,
creating waterfalls. See `<llm-docs>/guided-tour/rendering/queries.mdx` for the full pattern.

### Before fixing where a query lives, ask if it should exist

| Question | If YES |
|----------|--------|
| Parent already fetches this GraphQL type? | Delete query, use `useFragment` |
| Component only fetches and passes data down? | Delete the wrapper component entirely (loader anti-pattern) |
| Query is inside a custom hook? | Delete query, accept a fragment key param |
| Two components fetch the same data? | Delete one query, fetch in a common ancestor |
| Data is only used for logging/analytics? | Move to `@defer` or server-side logging |
| Data is static config (same for every user)? | Inject server-side, no round-trip needed |

### `loadQuery` in `useEffect` is worse than `useLazyLoadQuery`

`useEffect` runs **after paint**, so the fetch starts even later than
`useLazyLoadQuery` (which at least starts during render). Call `loadQuery` in
event handlers, route transitions, or app initialization — never in effects.

### Walking the ancestor tree for `useFragment`

When deciding whether `useFragment` can replace a query, walk **up** the
component tree from your component. Stop at: route boundaries, feature gates,
conditional renders, or user-triggered interactions. Keep walking through:
unconditional renders, layout/wrapper components, context providers.

If any ancestor already queries the GraphQL type you need, `useFragment` is
the answer. Threading fragment keys through several layers of props is fine —
it IS the correct pattern.

### Don't default query variables to empty values

Never default a query variable to `''`, `0`, or `null` when the real value is
unavailable. This fires the query with bad data, returning wrong results or
errors. Instead, use conditional rendering (`if (!id) return null`) or
`@include`/`@skip` directives to omit the field entirely.

### Data flow: Always use fragments

Every component that displays server data should declare a fragment and receive
a fragment reference (the `$key` type) as a prop. The parent spreads the
child's fragment in its own query or fragment and passes the result down. See
the "Maintain fragment co-location" anti-pattern below for an example.

### Mutations: Spread fragments into responses

Spread the consuming component's fragment into the mutation response rather than
selecting fields individually. This keeps them in sync automatically. See the
anti-pattern example below.

### Error handling: Use `@throwOnFieldError` and `@catch`

The recommended approach for handling field errors and nullability is to add
`@throwOnFieldError` to your fragment or query. This causes Relay to throw a
JavaScript exception if a field error is encountered, which can be caught by a
React error boundary. It also enables non-null types for `@semanticNonNull`
fields, eliminating unnecessary null checks. Note that this pattern depends on
React error boundaries being configured in your application — proceed with
caution if error boundaries are not set up robustly.

For fields where you want to handle errors locally instead of throwing, use
`@catch` to receive errors inline as `{ ok: true, value: T } | { ok: false,
errors: [...] }`.

`@required` is also available for declaring that specific fields must be
non-null, but `@throwOnFieldError` + `@catch` is the preferred pattern for new
code.

See `<llm-docs>/guides/throw-on-field-error-directive.mdx`, `<llm-docs>/guides/catch-directive.mdx`,
and `<llm-docs>/guides/semantic-nullability.mdx`.

### Pagination: Use the three-directive pattern

Always use `@argumentDefinitions` (for cursor/count variables),
`@refetchable` (to auto-generate the pagination query), and `@connection` (to
identify the connection for store management) together. Never write manual
pagination queries. See `<llm-docs>/guided-tour/list-data/pagination.mdx`.

### Client state: Prefer Relay Resolvers

When multiple components need to read client-side data, use Relay Resolvers to
define client-only fields on the GraphQL schema rather than prop-drilling or
React context. This gives client state the same composability and caching
guarantees as server data. Use `useClientQuery` for queries that read only
resolver-defined fields.

See `<llm-docs>/guides/relay-resolvers/introduction.mdx` for how to define resolvers.

## Critical Anti-Patterns

### Never copy Relay data into React state

This is the single most important rule. Do not read data from `useFragment` and
copy it into `useState`, and do not update that state manually in mutation
`onCompleted` callbacks.

```tsx
// WRONG: Copying Relay data into React state
function UserProfile({userKey}) {
  const data = useFragment(UserProfileFragment, userKey);
  const [name, setName] = useState(data.name); // broken

  const [commit] = useMutation(UpdateNameMutation);
  const handleSave = (newName) => {
    commit({
      variables: {name: newName},
      onCompleted: (response) => {
        setName(response.updateName.user.name); // broken
      },
    });
  };
  return <span>{name}</span>;
}
```

Why this is wrong: Relay's normalized store is the single source of truth. When
a mutation returns updated data with a matching `id`, Relay automatically
updates every component reading that data via `useFragment`. By copying into
`useState`, you create a second source of truth that Relay cannot update. The
component will show stale data whenever the record is updated by another
mutation, subscription, or refetch elsewhere in the app.

```tsx
// CORRECT: Read directly from the fragment
function UserProfile({userKey}) {
  const data = useFragment(UserProfileFragment, userKey);
  const [commit, isInFlight] = useMutation(UpdateNameMutation);

  const handleSave = (newName) => {
    commit({variables: {name: newName}});
    // No onCompleted needed — Relay updates the store automatically,
    // and useFragment re-renders this component with the new data.
  };
  return <span>{data.name}</span>;
}
```

Similarly, do not store a fragment key (the `$key` prop) in React state. Relay
garbage collects data that is no longer retained by a mounted query component —
if the component that originally fetched the data unmounts, a stashed key may
point to data that is no longer in the store.

### Maintain fragment co-location

Do not fetch all data in a parent's query and pass raw data objects as props to
children. This defeats data masking and creates tight coupling — adding a field
to a child component requires editing the parent's query. Note that the
`relay/unused-fields` lint rule will flag fields selected in the parent that
are only used by children — this is a good signal that you need to extract a
fragment.

```tsx
// WRONG: Parent fetches everything, passes raw data
function Parent({queryRef}) {
  const data = usePreloadedQuery(graphql`
    query ParentQuery {
      user {
        name
        email
        avatarUrl
      }
    }
  `, queryRef);
  return <UserCard name={data.user.name} avatarUrl={data.user.avatarUrl} />;
}

// CORRECT: Child declares its own fragment
function Parent({queryRef}) {
  const data = usePreloadedQuery(graphql`
    query ParentQuery {
      user {
        ...UserCard_user
      }
    }
  `, queryRef);
  return <UserCard user={data.user} />;
}
```

### Spread fragments into mutation responses

Do not select fields individually in both a fragment and a mutation response —
they will drift out of sync. Spread the fragment instead:

```graphql
# WRONG
mutation UpdateUserMutation($input: UpdateUserInput!) {
  updateUser(input: $input) {
    user { id, name, email, avatarUrl }
  }
}

# CORRECT
mutation UpdateUserMutation($input: UpdateUserInput!) {
  updateUser(input: $input) {
    user { ...UserCard_user }
  }
}
```

## Correctness

### Use `optimisticUpdater` for store-dependent values

If an optimistic value depends on current store state (e.g., incrementing a
like count), use `optimisticUpdater` instead of `optimisticResponse`. Multiple
overlapping optimistic responses can compound incorrectly — two simultaneous
"like" mutations both read count=5 and set count=6, instead of 5→6→7. When one
rolls back, the store is left in an inconsistent state.

### Invalidate data after wide-effect mutations

When a mutation has side effects too broad to capture in a single response
payload, use `invalidateRecord()` for targeted invalidation or
`invalidateStore()` for global invalidation. Pair with
`useSubscribeToInvalidationState` on mounted components to trigger refetches
for stale data automatically.

### Handle staleness explicitly

Relay treats cached data as fresh **indefinitely** by default. Two approaches:

- **Time-based**: Set `queryCacheExpirationTime` on the Relay Store to
  automatically mark data stale after a duration.
- **Event-based**: Call `invalidateRecord()` after mutations whose side effects
  extend beyond the mutation response payload.

Without explicit staleness handling, components can display arbitrarily old data
after the user returns to a previously visited screen.

### Single artifact directory for type safety

Without setting `artifactDirectory` in the compiler config, fragment references
may default to `any`, losing type safety. Set it and align your bundler's
module resolution accordingly. See `<llm-docs>/getting-started/compiler-config.mdx`.

### Use `@updatable` for store manipulation

Prefer typesafe updatable queries/fragments over raw store manipulation with
string-based field access (e.g., `store.get(id).setValue(newName, 'name')`).
Updatable fragments provide getters and setters, reducing the risk of typos
and type mismatches.

### Avoid unnecessary refetches after mutations

Do not call `refetch()` or `fetchQuery()` after mutations when spreading
component fragments in the mutation response would auto-update the store. Each
unnecessary refetch is a wasted network request and delays the UI update.

Reserve manual refetches for cases where the mutation's side effects are too
broad to capture in the response payload — and in those cases, prefer
`invalidateRecord()` (see above).

### Use subscriptions for real-time data

Prefer GraphQL Subscriptions over polling (`setInterval` + `fetchQuery`) or
manual refresh buttons for data that must stay current. Subscriptions push
updates only when data changes and integrate with Relay's normalized store
automatically.

## Naming Conventions

Relay **enforces** that operation names match the module (file) they are defined
in. Mismatched names cause compiler errors, not just style warnings.

| Element | Convention | Example |
|---------|-----------|---------|
| Fragment | `ComponentName_propName` | `UserCard_user` |
| Query | `ComponentNameQuery` | `HomePageQuery` |
| Mutation | `ComponentNameMutation` | `LikeButtonMutation` |
| Generated files | `__generated__/*.graphql` | Never edit these |

The module name is the filename stripped of all extensions (`.react.js`, `.tsx`,
etc.). `UserCard.react.js` → module name `UserCard`.

### Renaming operations when extracting to a new file

When moving a component to a new file, rename only the operations **defined in
that file** to match the new filename. Do NOT rename fragment spreads that
reference fragments owned by other modules — those names belong to their
defining component.

Renaming an operation also changes its generated type name (e.g.,
`UserCard_user$key` → `ProfileCard_user$key`), so update all downstream imports
of those generated types.

### Never hand-edit `__generated__/` files

The next compiler run overwrites any manual edits. If you see type errors about
missing generated types, run the compiler first — the types are just out of
date, not missing.

### Verify mutation variable keys after auto-formatting

Auto-formatters and linters can rename variables in ways that silently break
mutation calls. After running lint auto-fix, verify that variable keys in
`commit({ variables: { ... } })` still match the generated `Mutation$variables`
type (check for `data` vs `input` mismatches in particular).
