---
id: fetch-policies
title: Fetch Policies
slug: /guided-tour/reusing-cached-data/fetch-policies/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

The first step to reusing locally cached data is to pass a `fetchPolicy` to the `loadQuery` function, which can be provided by `useQueryLoader` (see the [Fetching Queries section](../../rendering/queries/)):

```js
const React = require('React');
const {graphql} = require('react-relay');

function AppTabs() {
  const [
    queryRef,
    loadQuery,
  ] = useQueryLoader<HomeTabQueryType>(HomeTabQuery);

  const onSelectHomeTab = () => {
    loadQuery({id: '4'}, {fetchPolicy: 'store-or-network'});
  }

  // ...
}
```

The provided `fetchPolicy` will determine:

* *whether* the query should be fulfilled from the local cache, and
* *whether* a network request should be made to fetch the query from the server, depending on the [availability of the data for that query in the store](../availability-of-data/).


By default, Relay will try to read the query from the local cache; if any piece of data for that query is [missing](../presence-of-data/) or [stale](../staleness-of-data/), it will fetch the entire query from the network. This default `fetchPolicy` is called "*store-or-network".*

Specifically, `fetchPolicy` can be any of the following options: **

* "store-or-network": *(default)* *will* reuse locally cached data, and will *only* send a network request if any data for the query is [missing](../presence-of-data/) or [stale](../staleness-of-data/). If the query is fully cached, a network request will *not* be made.
* "store-and-network": *will* reuse locally cached data and will *always* send a network request, regardless of whether any data was [missing](../presence-of-data/) or [stale](../staleness-of-data/) in the store.
* "network-only": *will* *not* reuse locally cached data, and will *always* send a network request to fetch the query, ignoring any data that might be locally cached and whether it's [missing](../presence-of-data/) or [stale](../staleness-of-data/).
* "store-only": *will* *only* reuse locally cached data, and will *never* send a network request to fetch the query. In this case, the responsibility of fetching the query falls to the caller, but this policy could also be used to read and operate and data that is entirely [local](../../updating-data/local-data-updates/).


Note that the `refetch` function discussed in the [Fetching and Rendering Different Data](../../refetching/) section also takes a `fetchPolicy`.


<DocsRating />
