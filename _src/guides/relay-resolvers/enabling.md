---
id: enabling
title: "Enabling Relay Resolvers"
slug: /guides/relay-resolvers/enabling-resolvers
description: Enabling experimental Relay Resolvers
---

Relay Resolvers are still an experimental feature in Relay. As such they require additional configuration to enable. You may also find that the APIs in the documentation are not yet reflected in our community maintained TypeScript types.

## Runtime

Relay Resolvers must be enabled in your runtime code by using our experimental `LiveResolverStore` as your Relay store and enabling the `ENABLE_RELAY_RESOLVERS` runtime feature flag:

```ts
import { Environment, RecordSource, RelayFeatureFlags } from "relay-runtime";
// highlight-next-line
import LiveResolverStore from "relay-runtime/lib/store/experimental-live-resolvers/LiveResolverStore";

RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;

// It is recommended to log errors thrown by Resolvers
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

// ... create your Relay context with your environment
```

## Compiler

You must enable the `"enable_relay_resolver_transform"` feature flag in your Relay compiler config:


```json title="relay.config.json"
{
  "src": "./src",
  "schema": "./schema.graphql",
  "language": "typescript",
  "featureFlags": {
    // highlight-next-line
    "enable_relay_resolver_transform": true
  }
}
```
