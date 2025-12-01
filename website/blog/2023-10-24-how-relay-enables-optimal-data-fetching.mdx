---
title: How Relay Enables Optimal Data Fetching
author: Jordan Eldredge
tags: []
description:
  Exploring the tradoeffs that most data fetching strategies are forced to make,
  and how Relay allows you to have your cake and eat it too.
hide_table_of_contents: false
---

Relay’s approach to application authorship enables a unique combination of
optimal runtime performance and application maintainability. In this post I’ll
describe the tradeoffs most apps are forced to make with their data fetching and
then describe how Relay’s approach allows you to sidestep these tradeoffs and
achieve an optimal outcome across multiple tradeoff dimensions.

---

In component-based UI systems such as React, one important decision to make is
where in your UI tree you fetch data. While data fetching can be done at any
point in the UI tree, in order to understand the tradeoffs at play, let’s
consider the two extremes:

- Leaf node: Fetch data directly within each component that uses data
- Root node: Fetch all data at the root of your UI and thread it down to leaf
  nodes using prop drilling

Where in the UI tree you fetch data impacts multiple dimensions of the
performance and maintainability of your application. Unfortunately, with naive
data fetching, neither extreme is optimal for all dimensions. Let’s look at
these dimensions and consider which improve as you move data fetching closer to
the leaves, vs. which improve as you move data fetching closer to the root.

### Loading experience

- 🚫 Leaf node: If individual nodes fetch data, you will end up with request
  cascades where your UI needs to make multiple request roundtrips in series
  (waterfalls) since each layer of the UI is blocked on its parent layer
  rendering. Additionally, if multiple components happen to use the same data,
  you will end up fetching the same data multiple times
- ✅ Root node: If all your data is fetched at the root, you will make single
  request and render the whole UI without any duplicate data or cascading
  requests

### Suspense cascades

- 🚫 Leaf node: If each individual component needs to fetch data separately,
  each component will suspend on initial render. With the current implementation
  of React, unsuspending results in rerendering from the nearest parent suspense
  boundary. This means you will have to reevaluate product component code O(n)
  times during initial load, where n is the depth of the tree.
- ✅ Root node: If all your data is fetched at the root, you will suspend a
  single time and evaluate product component code only once.

### Composability

- ✅ Leaf node: Using an existing component in a new place is as easy as
  rendering it. Removing a component is as simple as not-rendering it. Similarly
  adding/removing data dependencies can be done fully locally.
- 🚫 Root node: Adding an existing component as a child of another component
  requires updating every query that includes that component to fetch the new
  data and then threading the new data through all intermediate layers.
  Similarly, removing a component requires tracing those data dependencies back
  to each root component and determining if the component you removed was that
  data’s last remaining consumer. The same dynamics apply to adding/removing new
  data to an existing component.

### Granular updates

- ✅ Leaf node: When data changes, each component reading that data can
  individually rerender, avoiding the need to rerender unaffected components.
- 🚫 Root node: Since all data originates at the root, when any data updates it
  always forces the root component to update forcing an expensive rerender of
  the entire component tree.

## Relay

Relay leverages GraphQL fragments and a compiler build step to offer a more
optimal alternative. In an app that uses Relay, each component defines a GraphQL
fragment which declares the data that it needs. This includes both the concrete
values the component will render as well as the fragments (referenced by name)
of each direct child component it will render.

At build time, the Relay compiler collects these fragments and builds a single
query for each root node in your application. Let’s look at how this approach
plays out for each of the dimensions described above:

- ✅ Loading experience - The compiler generated query fetches all data needed
  for the surface in a single roundtrip
- ✅ Suspense cascades - Since all data is fetched in a single request, we only
  suspend once, and it’s right at the root of the tree
- ✅ Composability - Adding/removing data from a component, including the
  fragment data needed to render a child component, can be done locally within a
  single component. The compiler takes care of updating all impacted root
  queries
- ✅ Granular updates - Because each component defines a fragment, Relay knows
  exactly which data is consumed by each component. This lets relay perform
  optimal updates where the minimal set of components are rerendered when data
  changes

## Summary

As you can see, Relay’s use of a declarative composable data fetching language
(GraphQL), combined a compiler step, allows us to achieve optimal outcomes
across all of the tradeoff dimensions outlined above:

|                    | Leaf node | Root node | GraphQL/Relay |
| ------------------ | --------- | --------- | ------------- |
| Loading experience | 🚫        | ✅        | ✅            |
| Suspense cascades  | 🚫        | ✅        | ✅            |
| Composability      | ✅        | 🚫        | ✅            |
| Granular updates   | ✅        | 🚫        | ✅            |
