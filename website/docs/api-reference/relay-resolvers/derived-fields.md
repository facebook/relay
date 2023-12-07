---
id: derived-fields
title: "Derived Fields"
slug: /api-reference/relay-resolvers/derived-fields/
description: Defining field which are a pure function of other fields
keywords:
- resolvers
- derived
- selectors
- reactive
---

In addition to modeling client state, Relay Resolvers also allow you to define fields which are a pure function of other fields. These fields are called derived fields.

For globally useful data, resolvers have a few advantages of alternative solutions like [React Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks):

* Global memoization - Relay Resolvers automatically memoize derived fields. Unlike hooks, this cache is shared by all components in your application, so if two sibling components both read the same field, the computation will only be performed once.
* Efficient updates - If your derived resolver recomputes but derives the same value, Relay can avoid rerendering components that read the field.
* Composable - Derived fields can be composed with other derived fields, allowing you to build up complex, but explicit computation graphs.
* Discoverable - Values in the graph are discoverable via the GraphQL schema and thus are more likely to be discovered and reused instead of reinvented.
* Documented - GraphQL's field documentation and structured deprecation model make it easy to understand the purpose of a field and its intended use.

## RootFragment

## Reactivity

## Composition

## Passing Arguments to your @rootFragment

TODO