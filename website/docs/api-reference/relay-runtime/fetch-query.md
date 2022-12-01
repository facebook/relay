---
id: fetch-query
title: fetchQuery
slug: /api-reference/fetch-query/
description: API reference for fetchQuery, which imperatively fetches data for a query and returns an observable
keywords:
  - observable
  - query
  - fetch
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

## `fetchQuery`

If you want to fetch a query outside of React, you can use the `fetchQuery` function from `react-relay`:

```js
// You should prefer passing an environment that was returned from useRelayEnvironment()
const MyEnvironment = require('MyEnvironment');
const {fetchQuery} = require('react-relay');

fetchQuery(
  environment,
  graphql`
    query AppQuery($id: ID!) {
      user(id: $id) {
        name
      }
    }
  `,
  {id: 4},
)
.subscribe({
  start: () => {...},
  complete: () => {...},
  error: (error) => {...},
  next: (data) => {...}
});
```

### Arguments

* `environment`: A Relay Environment instance to execute the request on. If you're starting this request somewhere within a React component, you probably want to use the environment you obtain from using [`useRelayEnvironment`](../use-relay-environment/).
* `query`: GraphQL query to fetch, specified using a `graphql` template literal.
* `variables`: Object containing the variable values to fetch the query. These variables need to match GraphQL variables declared inside the query.
* `options`: *_[Optional]_* options object
    * `networkCacheConfig`: *_[Optional]_ *Object containing cache config options
        * `force`: Boolean value. If true, will bypass the network response cache. Defaults to true.

### Flow Type Parameters

* `TQuery`: Type parameter that should correspond to the Flow type for the specified query. This type is available to import from the the auto-generated file: `<query_name>.graphql.js`. It will ensure that the type of the data provided by the observable matches the shape of the query, and enforces that the `variables` passed as input to `fetchQuery` match the type of the variables expected by the query.

### Return Value

* `observable`: Returns an observable instance. To start the request, `subscribe` or `toPromise` must be called on the observable. Exposes the following methods:
    * `subscribe`: Function that can be called to subscribe to the observable for the network request. Keep in mind that this subscribes you only to the fetching of the query, not to any subsequent changes to the data within the Relay Store.
        * Arguments:
            * `observer`: Object that specifies observer functions for different events occurring on the network request observable. May specify the following event handlers as keys in the observer object:
                * `start`: Function that will be called when the network requests starts. It will receive a single `subscription` argument, which represents the subscription on the network observable.
                * `complete`: Function that will be called if and when the network request completes successfully.
                * `next`: Function that will be called every time a payload is received from the network. It will receive a single `data` argument, which represents a snapshot of the query data read from the Relay store at the moment a payload was received from the server.
                * `error`:  Function that will be called if an error occurs during the network request. It will receive a single `error` argument, containing the error that occurred.
                * `unsubscribe`: Function that will be called whenever the subscription is unsubscribed. It will receive a single `subscription` argument, which represents the subscription on the network observable.
        * Return Value:
            * `subscription`: Object representing a subscription to the observable. Calling `subscription.unsubscribe()` will cancel the network request.
    * `toPromise`:
        * Return Value:
            * `promise`: Returns a promise that will resolve when the first network response is received from the server. If the request fails, the promise will reject. Cannot be cancelled.

<FbInternalOnly>

> The `next` function may be called multiple times when using Relay's [Incremental Data Delivery](../../guides/incremental-data-delivery/) capabilities to receive multiple payloads from the server.

</FbInternalOnly>

### Behavior

* `fetchQuery` will automatically save the fetched data to the in-memory Relay store, and notify any components subscribed to the relevant data.
* `fetchQuery` will **NOT** retain the data for the query, meaning that it is not guaranteed that the data will remain saved in the Relay store at any point after the request completes. If you wish to make sure that the data is retained outside of the scope of the request, you need to call `environment.retain()` directly on the query to ensure it doesn't get deleted. See our section on [Controlling Relay's GC Policy](../../guided-tour/reusing-cached-data/availability-of-data) for more details.
* `fetchQuery` will automatically de-dupe identical network requests (same query and variables) that are in flight at the same time, and that were initiated with `fetchQuery`.


### Behavior with `.toPromise()`

If desired, you can convert the request into a Promise using `**.toPromise()**`. Note that toPromise will start the query and return a Promise that will resolve when the *first* piece of data returns from the server and *cancel further processing*. That means any deferred or 3D data in the query may not be processed. **We generally recommend against using toPromise() for this reason.**

```js
const {fetchQuery} = require('react-relay');

fetchQuery(
  environment,
  graphql`
    query AppQuery($id: ID!) {
      user(id: $id) {
        name
      }
    }
  `,
  {id: 4},
)
.toPromise() // NOTE: don't use, this can cause data to be missing!
.then(data => {...})
.catch(error => {...};
```

* `toPromise` Returns a promise that will resolve when the first network response is received from the server. If the request fails, the promise will reject. Cannot be cancelled.

<DocsRating />
