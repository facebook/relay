---
id: classic-interfaces-relay-network-layer
title: RelayNetworkLayer
original_id: classic-interfaces-relay-network-layer
---
Custom network layers that must conform to the `RelayNetworkLayer` interface.

## Overview

_Methods_

<ul className="apiIndex">
  <li>
    <a href="#sendmutation">
      <pre>sendMutation(mutationRequest)</pre>
    </a>
  </li>
  <li>
    <a href="#sendqueries">
      <pre>sendQueries(queryRequests)</pre>
    </a>
  </li>
  <li>
    <a href="#supports">
      <pre>supports(...options)</pre>
    </a>
  </li>
</ul>

## Methods

### sendMutation

```

sendMutation(mutationRequest: RelayMutationRequest): ?Promise

```

Implement this method to send mutations to the server. When the server response is obtained, this method must either call `mutationRequest.resolve` with the response data, or `mutationRequest.reject` with an `Error` object.

This method can optionally return a promise in order to facilitate proper error propagation.

#### Example

```

sendMutation(mutationRequest) {
  return fetch(...).then(result => {
    if (result.errors) {
      mutationRequest.reject(new Error(...))
    } else {
      mutationRequest.resolve({response: result.data});
    }
  });
}
```

See [RelayMutationRequest](./classic-interfaces-relay-mutation-request) for methods available on the argument object.

### sendQueries

```

sendQueries(queryRequests: Array<RelayQueryRequest>): ?Promise

```

Implement this method to send queries to the server. For each query request, when the server response is received, this method must either call `resolve` with the response data, or `reject` with an `Error` object.

This method receives an array of queries (instead of a single query) in order to facilitate batching queries to improve network efficiency.

This method can optionally return a promise in order to facilitate proper error propagation.

#### Example

```

sendQueries(queryRequests) {
  return Promise.all(queryRequests.map(
    queryRequest => fetch(...).then(result => {
      if (result.errors) {
        queryRequest.reject(new Error(...));
      } else {
        queryRequest.resolve({response: result.data});
      }
    })
  ));
}
```

See [RelayQueryRequest](./classic-interfaces-relay-query-request) for methods available on the argument objects.

### supports

```

supports(...options: Array<string>): boolean

```

Implement this method to return true when the supplied options are supported by this network layer. This is used to declare which features the network layer supports.

In the future, advanced capabilities in Relay may be dependent on the network layer being able to support certain features.

#### Example

```

supports(...options) {
  return options.every(option => {
    if (option === 'future-feature') {
      return true;
    }
    return false;
  });
}
```
