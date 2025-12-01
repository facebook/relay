---
id: enabling
title: "Enabling Relay Resolvers"
slug: /guides/relay-resolvers/enabling-resolvers
description: Enabling experimental Relay Resolvers
---

## Runtime

When using Relay Resolvers, we recommend configuring a `fieldLogger` in your Relay Enviornment in order to track errors which have been thrown within Relay resolver functions.

```ts
import { Environment, RecordSource, RelayFeatureFlags } from "relay-runtime";
import RelayModernStore from "relay-runtime/lib/store/RelayModernStore";

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
  store: new RelayModernStore(new RecordSource()),
  relayFieldLogger: fieldLogger
});

// ... create your Relay context with your environment
```

<FbInternalOnly>

## Enable new Flow based RelayResolver syntax
To opt-in the new syntax in a file, add `//relay:enable-new-relay-resolver` to the file

To convert files to the new syntax, run codemode: `flow-runner codemod relay/migrateResolver <path>`. The codemod doesn't support all cases, so you might need to modify some files manually after it runs.

</FbInternalOnly>
