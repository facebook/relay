---
id: introduction
title: "Introduction to Relay Resolvers"
slug: /api-reference/relay-resolvers/introduction
description: An introduction to Relay Resolvers
keywords:
- resolvers
- derived
- selectors
- reactive
---

Relay Resolvers are a feature that allow you to augment Relay’s GraphQL graph with two types of additional data:

- Derived data: fields which are a pure function of a node in the graph
- Client state: dynamic client state like pre-existing state management solution (Redux) or client-side data stores such as IndexDB.

By modeling derived and client state in the graph, Relay can present a data access API for product developers. All globally relevant data that a product engineer wants to access can discovered and efficiently obtained via GraphQL. Additionally we provide a number of runtime benefits:

- Global memoization with garbage collection
- Efficient reactive recomputation of resolvers
- Efficient UI updates when data changes
- Structured global observability of execution

You can think of resolvers as additional schema types and fields which are defined in your client code and are stitched into your server’s schema. Just like you define resolver methods/functions which model your fields on the server, Relay Resolves are defined using resolver functions.

## Defining a Resolver

Resolvers are defined using exported functions that are annotated with a special `@RelayResolver` docblock. These docblocks are visible to the Relay compiler, and allow the compiler to automatically import your function in Relay’s generated artifacts. Resolver functions may be defined in any file in your Relay project, though you may wish to define some convention for where they live within your codebase.

The simplest resolver augments an existing type and does not have any inputs:

```tsx
/**
 * @RelayResolver Query.greeting: String
 */
export function greeting(): string {
  return "Hello World";
}
```

Consuming resolvers is identical to consuming a server field. Product code deosn’t need to know which kind of field it is reading.

```tsx
import {useLazyLoadQuery, graphql} from 'react-relay';

function Greeting() {
  const data = useLazyLoadQuery(graphql`
    query GreetingQuery {
      greeting
    }`, {});
  return <p>{data.greeting}</p>;
}
```