---
id: network-layer
title: Network Layer
---

In order to know how to access your GraphQL server, Relay Modern requires developers to provide an object implementing the `NetworkLayer` interface when creating an instance of a [Relay Environment](relay-environment.html). The environment uses this network layer to execute queries, mutations, and (if your server supports them) subscriptions. This allows developers to use whatever transport (HTTP, WebSockets, etc) and authentication is most appropriate for their application, decoupling the environment from the particulars of each application's network configuration.

Currently the easiest way to create a network layer is via a helper from the `relay-runtime` package:

```javascript
import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
function fetchQuery(
  operation,
  variables,
  cacheConfig,
  uploadables,
) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      // Add authentication and other headers here
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: operation.text, // GraphQL text from input
      variables,
    }),
  }).then(response => {
    return response.json();
  });
}

// Create a network layer from the fetch function
const network = Network.create(fetchQuery);
const store = new Store(new RecordSource())

const environment = new Environment({
  network,
  store
  // ... other options
});

export default environment;
```

Note that this is a basic example to help you get started. This example could be extended with additional features such as request/response caching (enabled e.g. when `cacheConfig.force` is false) and uploading form data for mutations (the `uploadables` parameter).

## Custom open-source implementations
**[react-relay-network-modern](https://github.com/nodkz/react-relay-network-modern)** on [npm](https://www.npmjs.com/package/react-relay-network-modern) - is a Network Layer for Relay Modern which has built-in highly customizable middlewares for commonly used scenarios: batching query requests, caching, authentication, request retrying, logging. Moreover, you may write your own middlewares with custom logic.
