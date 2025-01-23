---
id: errors
title: "Error Handling"
slug: /guides/relay-resolvers/errors/
description: How Relay handles errors throw by resolvers
---

Just like GraphQL servers, Relay Resolvers support field-level error handling. If an individual resolver throws an error, when that field is read, Relay will log that error to the environment's user-provided `relayFieldLogger` logger, and the field will become null.

This provides important symmetry with GraphQL servers. Resolvers are designed to enable a smooth migration path to allow teams to start with fields defined client-side using Resolvers and then eventually migrate them to a server.

If a resolver throws an error, Relay will log the error to the user-provided error logger, and will return null for the field which the resolver defines. To enable this behavior at runtime, the Relay compiler will not allow resolver fields to be typed as non-nullable.

The object passed to the `relayFieldLogger` will have the following shape:

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

An example logger might look like:

```ts
function fieldLogger(event) {
  if(event.kind === "relay_resolver.error") {
    // Log this somewhere!
    console.warn(`Resolver error encountered in ${event.owner}.${event.fieldPath}`)
    console.warn(event.error)
  }
}

const environment = new Environment({
  network: Network.create(/* your fetch function here */),
  store: new LiveResolverStore(new RecordSource()),
  relayFieldLogger: fieldLogger
});
```

:::note
[Live Resolvers](./live-fields.md) can potentially throw errors when they are first evaluated or when their `.read()` method is called. Both types of errors will be handled identically by Relay.
:::
