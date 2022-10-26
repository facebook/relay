---
id: new-in-relay-modern
title: New in Relay Modern
original_id: new-in-relay-modern
---
<blockquote>
A summary of the improvements and new features in Relay Modern.
</blockquote>

## Modern API

Compared to Relay Classic, the Relay Modern API has the following differentiating features:

-   A simpler, more predictable mutation API. The restrictions on mutation queries from Relay Classic are also removed: mutation queries are static, fields can be arbitrarily nested, and may use arbitrary arguments.
-   When using [`QueryRenderer`](Modern-QueryRenderer.md), the restrictions on queries from Relay Classic are removed: queries may contain multiple root fields that use arbitrary arguments and return singular or plural values. The `viewer` root field is now optional.
-   Routes are now optional: `QueryRenderer` can be used without defining a route. More in the [routing guide](./Modern-Routing.md).
-   `QueryRenderer` supports rendering small amounts of data directly, instead of requiring a container to access data. [Containers](Modern-FragmentContainer.md) are optional and can be used as your application grows in size and complexity.
-   The API is overall simpler and more predictable.

You can use [Compat mode](Modern-RelayCompat.md) to incrementally adopt Relay Modern APIs in an existing Relay app.

## Modern Runtime

For new Relay apps or existing apps that have been fully converted to the Modern/Compat API, the Relay Modern runtime can be enabled to activate even more features. In addition to those described above, this includes:

### Performance

The new Relay Modern core is more light-weight and significantly faster than the previous version. It is redesigned to work with static queries, which allow us to push more work to build/compilation time. The Modern core is much smaller as a result of removing a lot of the complex features required for dynamic queries. The new core is also an order of magnitude faster in processing the response with an optimized parsing instruction set that is generated at build time. We no longer keep around tracking information needed for dynamic query generation, which drastically reduces the memory overhead of using Relay. This means more memory is left for making the UI feel responsive. Relay Modern also supports persisted queries, reducing the upload size of the request from the full query text to a simple id.

### Smaller Bundle Size

The Relay runtime bundle is roughly 20% of the size of Relay Classic.

### Garbage Collection

The runtime automatically removes cached data that is no longer referenced, helping to reduce memory usage.

### GraphQL Subscriptions & Live Queries

Relay Modern supports GraphQL Subscriptions, using the imperative update API to allow modifications to the store whenever a payload is received. It also features experimental support for GraphQL Live Queries via polling.

### Injectable Custom Field Handlers

Some fields - especially those for paginated data - can require post-processing on the client in order to merge previously fetched data with new information. Relay Modern supports custom field handlers that can be used to process these fields to work with various pagination patterns and other use cases.

### Simpler Mutation API

An area we've gotten a lot of questions on was mutations and their configs. Relay Modern introduces a new mutation API that allows records and fields to be updated in a more direct manner.

### Client Schema Extensions (Experimental)

The Relay Modern Core adds support for client schema extensions. These allow Relay to conveniently store some extra information with data fetched from the server and be rendered like any other field fetched from the server. This should be able to replace some use cases that previously required a Flux/Redux store on the side.

### Flow Type Generation

Relay Modern comes with automatic Flow type generation for the fragments used in Relay containers based on the GraphQL schema. Using these Flow types can help make an application less error-prone, by ensuring all possible `null` or `undefined` cases are considered even if they don't happen frequently.

## Fewer Requirements around Routing

Routes no longer need to know anything about the query root in Relay Modern. Relay components can be rendered anywhere wrapped in a `QueryRenderer`. This should bring more flexibility around picking routing frameworks.

## Extensible Core

Relay Modern's core is essentially an un-opinionated store for GraphQL data. It can be used independent of rendering views using React and can be extended to be used with other frameworks.
