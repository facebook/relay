---
id: relay-environment
title: Relay Environment
---

The Relay "Environment" bundles together the configuration, cache storage, and network-handling that Relay needs in order to operate.

Most applications will create a single Environment instance and use it throughout. In specific situations, however, you may want to create multiple environments for different purposes. For example, you may create a new environment instance whenever the user logs in or out in order to prevent data for different users being cached together. Similarly, a server rendered application may create a new environment instance per request, so that each request gets its own cache and user data does not overlap. Alternatively, you might have multiple products or features within a larger application, and you want each one to have product-specific network-handling or caching.

## A simple example

To create an environment instance in Relay Modern, use the `RelayModernEnvironment` class:

```javascript
const {
  Environment,
  Network,
  RecordSource,
  Store,
} = require('relay-runtime');

const source = new RecordSource();
const store = new Store(source);
const network = Network.create(/*...*/); // see note below
const handlerProvider = null;

const environment = new Environment({
  handlerProvider, // Can omit.
  network,
  store,
});
```

For more details on creating a Network, see the [NetworkLayer guide](./network-layer.html).

Once you have an environment, you can pass it in to your [`QueryRenderer`](./query-renderer.html) instance, or into mutations via the `commitUpdate` function (see "[Mutations](./mutations.html)").

## Adding a `handlerProvider`

The example above did not configure a `handlerProvider`, which means that a default one will be provided. Relay Modern comes with a built-in handler that augment the core with special functionality for handling connections (which is not a standard GraphQL feature, but a set of pagination conventions used at Facebook, specified in detail in the [Relay Cursor Connections Specification](https://relay.dev/graphql/connections.htm), and well-supported by Relay itself).

If you wish to provide your own `handlerProvider`, you can do so:

```javascript
const {
  ConnectionHandler,
} = require('relay-runtime');

function handlerProvider(handle) {
  switch (handle) {
    // Augment (or remove from) this list:
    case 'connection': return ConnectionHandler;
  }
  throw new Error(
    `handlerProvider: No handler provided for ${handle}`
  );
}
```

## Adding a `log` function

You can get access to the inner life cycle stages of Relay, and log those. Super helpful for tracing, and debugging. For an in-depth look at what log events you can access, I urge you to try it out. Log a few things, and have a play. Alternively you can find a [list of possible events](https://github.com/facebook/relay/blob/37cee8039b888755e4ad4219e703be13a9a49ebb/packages/relay-runtime/store/RelayStoreTypes.js#L410) in the source code.

Most notably there are `execute.X` events, that run through `start` -> `next` -> to either `complete` or `error`. Which as you'd assume, are for those various states.


```javascript
const {
  Environment,
  Network,
  RecordSource,
  Store,
} = require('relay-runtime');

const source = new RecordSource();
const store = new Store(source);
const network = Network.create(/*...*/); // see note below
const handlerProvider = null;

const environment = new Environment({
  handlerProvider, // Can omit.
  network,
  store,
  log: function(logEvent) {
    if (logEvent.name === "execute.error") {
      console.error("There was a relay error", logEvent.error);
    }
  }
});
```

If you're using Sentry to track those errors, there is a community projet geared toward making that integration easier. See [relay-sentry](https://github.com/maraisr/relay-sentry)
