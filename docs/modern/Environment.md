---
id: relay-environment
title: The Relay "Environment"
layout: docs
category: Relay Modern
permalink: docs/relay-environment.html
next: QueryRenderer
---

The Relay "Environment" bundles together the configuration, cache storage, and network-handling that Relay needs in order to operate.

For most applications, you will create a single instance of the environment, and then you will use that throughout. In specific situations, however, you may wish to create a special-purpose environment and use that. For example, in a server-rendering context you may want to create a brand new environment for every request so that user-specific data gets its own request-specific cache. Alternatively, you might have multiple products or features within a larger application, and you want each one to have product-specific network-handling or caching.

## A simple example

To create an environment instance in Relay modern, use the `RelayStaticEnvironment` class:

```javascript
const {
  Environment,
  Network,
  RecordSource,
  Store,
} = require('relay-runtime');

const source = new RecordSource();
const store = new Store(source);
const network = Network.create(fetch); // TODO: still need to provide a non-FB fetch
const handlerProvider = null;

const environment = new Environment({
  handlerProvider, // Can omit.
  network,
  store,
});
```

Once you have an environment, you can pass it in to your [`QueryRenderer`](./QueryRenderer.html) instance, or into mutations via the `commitUpdate` function (see "[Mutations](./mutations.html)").

## Adding a `handlerProvider`

The example above did not configure a `handlerProvider`, which means that a default one will be provided. Relay Modern comes with a couple of built-in handlers that augment the core with special functionality for handling connections (which is not a standard GraphQL feature, but a set of pagination conventions used at Facebook, specified in detail in the [Relay Cursor Connections Specification](./graphql-connections.html), and well-supported by Relay itself) and the `viewer` field (again, not a standard GraphQL schema feature, but one which has been conventionally used extensively within Facebook).

If you wish to provide your own `handlerProvider`, you can do so:

```javascript
const {
  ConnectionHandler,
  ViewerHandler,
} = require('relay-runtime');

function handlerProvider(handle) {
  switch (handle) {
    // Augment (or remove from) this list:
    case 'connection': return ConnectionHandler;
    case 'viewer': return ViewerHandler;
  }
  throw new Error(
    `handlerProvider: No handler provided for ${handle}`
  );
}
```
