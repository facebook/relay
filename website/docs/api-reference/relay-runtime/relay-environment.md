---
id: relay-environment
title: Relay Environment
slug: /api-reference/relay-runtime/relay-environment
description: Setting up a Relay Environment
---

The core of Relay's runtime is the `Environment`. The environment knows how to make requests to your GraphQL server and contains the `Store`, Relay's normalized data cache. Generally your application will construct a single environment which is configured to fetch data from your server, and then expose that environment to all of your components via `RelayEnvironmentProvider`.

## Creating an Environment

To create your environment you must provide two key pieces, a [`Network`](../../guides/network-layer.md) and a [`Store`](store.md).

The `Network` is responsible for making requests to your GraphQL server. The `Store` holds the normalized data cache.

A minimal implementation of an environment might look like this:

```ts title="RelayEnvironment.js"
import { Environment, Store, RecordSource, Network, FetchFunction } from "relay-runtime";

const HTTP_ENDPOINT = "https://graphql.org/graphql/";

const fetchGraphQL: FetchFunction = async (request, variables) => {
  const resp = await fetch(HTTP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: request.text, variables }),
  });
  if (!resp.ok) {
    throw new Error("Response failed.");
  }
  return await resp.json();
};

export const environment = new Environment({
  store: new Store(new RecordSource({})),
  network: Network.create(fetchGraphQL),
});
```

## Advanced Configuration

The Relay environment accepts a number of additional configuration options when it is created. These options are all optional, but can be used to customize the behavior of the environment.

Notable options include:

* `log` - A function that will be called with telemetry events. See the types for [`LogEvent`](https://github.com/facebook/relay/blob/0414c9ad0744483e349e07defcb6d70a52cf8b3c/packages/relay-runtime/store/RelayStoreTypes.js#L799) for a full list of events and their fields.
* [`missingFieldHandlers`](../../guided-tour/reusing-cached-data/filling-in-missing-data.md) - A list of handlers that will be called when a field is missing from the store. This can be used to enable fulfilling queries to fields like `Query.node` from cache.
* `getDataID` - A function that will be called to generate a unique ID for a given object. This can be used to customize the way that Relay generates IDs for objects if your server does not implement the [Global Object Identification spec](https://graphql.org/learn/global-object-identification/).
* [`relayFieldLogger`](./field-logger.md) - A function that will be called when Relay encounters a field-level error.
* [`_deferDeduplicatedFields`] - Set to true if you are using the latest `@defer` spec proposal, which does not send duplicate fields in deferred responses.

For a full list of options, inspect the [provided TypeScript types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/relay-runtime/lib/store/RelayModernEnvironment.d.ts#L26-L43).
