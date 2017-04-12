# The Relay "Environment"

The Relay "Environment" bundles together the configuration, cache storage, and network-handling that Relay needs in order to operate.

For most applications, you will create a single instance of the environment, and then you will use that throughout. In specific situations, however, you may wish to create a special-purpose environment and use that. For example, in a server-rendering context you may want to create a brand new environment for every request so that user-specific data gets its own request-specific cache. Alternatively, you might have multiple products or features within a larger application, and you want each one to have product-specific network-handling or caching.

To create an environment instance in Relay modern, use the `RelayStaticEnvironment` class:

```javascript
// Note: these are not currently exposed yet in open source,
// but we will do so, and likely also provide convenience
// methods for creating a new static environment, or accessing
// a default, shared environment instance.
const source = new RelayInMemoryRecordSource();
const store = new RelayMarkSweepStore(source);

// TODO: We also need to provide a reasonable default network
// implementation for open source.
const network = RelayNetwork.create(fetch, subscribe);

// TODO: provide a default handler that (probably) knows
// about the viewer and connection handlers.
const handlerProvider = RelayHandlerProvider;

const environment = new RelayStaticEnvironment({
  handlerProvider,
  network,
  store,
});
```

Once you have an environment, you can pass it in to your `QueryRenderer` instance.
