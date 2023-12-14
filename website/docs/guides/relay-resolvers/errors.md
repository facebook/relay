---
id: errors
title: "Error Handling"
slug: /guides/relay-resolvers/errors/
description: How Relay handles errors throw by resolvers
---

Just like GraphQL servers, Relay Resolvers support field-level error handling. If an individual resolver throws an error, when that field is read, Relay will log that error to the environment's user-provided `requiredFieldLogger` logger, and the field will become null.

This provides important symmetry with GraphQL servers. Resolvers are designed to enable a smooth migration path to allow teams to start with fields defined client-side using Resolvers and then eventually migrate them to a server.

If a resolver throws an error, Relay will log the error to the user-provided error logger, and will return null for the field which the resolver defines.

The object passed to the `requiredFieldLogger` will have the following shape:

```ts
type ResolverErrorEvent = {
  kind: 'relay_resolver.error',
  // The name of the fragment/query in which the field was read
  owner: string,
  // The path from the owner root to the field which threw the error
  fieldPath: string,
  // The error thrown by the resolver
  error: Error,
}
```

:::note
[Live Resolvers](./live-fields.md) can potentially throw errors when they are first evaluated or when their `.read()` method is called. Both types of errors will be handled identically by Relay.
:::