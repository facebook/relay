---
id: introduction
title: "Introduction to Relay Resolvers"
slug: /api-reference/relay-resolvers/introduction
description: An introduction to Relay Resolvers
---

Relay Resolvers are a feature that allow you to augment Relay’s GraphQL graph with values that are known only on the client. This allows you to model client state in the same way that you model server state, and to use Relay’s data fetching APIs to access that state. Client state can include both data from client-side data stores as well as derived data that is computed from other values in the graph.

By modeling derived and client state in the graph, Relay can present a unified data access API for product developers. All globally relevant data that a product engineer wants to access can discovered and efficiently obtained via the same structured GraphQL schema. Additionally we provide a number of runtime benefits:

- Global memoization with garbage collection
- Efficient reactive recomputation of resolvers
- Efficient UI updates when data changes

You can think of resolvers as additional schema types and fields which are defined in your client code and are stitched into your server’s schema. Just like you define resolver methods/functions which model your fields on the server, Relay Resolves are defined using resolver functions.

## Use Cases for Relay Resolvers

Relay Resolvers are useful for modeling a number of different kinds of data. Here are some examples of types of data that can be schematized using Relay Resolvers and made available to product code:

* **Legacy Data Stores** - During the adoption of Relay, pre-existing data layers, like Redux, can be exposed in the graph to ensure migrated and un-migrated portions of your app always remain in sync
* **User-created Data** - You can model complex form state, or other data that should outlive a specific component tree
* **Client-Side Database** - Persistent data stores like IndexDB, localStorage, or SQLite
* **Third-party APIs** - Data that is fetched from a third party API directly by the client, for example search results from an third-party search provider
* **Encrypted Data** - End-to-end encrypted data that is opaque on the server and thus cannot be modeled in the server schema

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