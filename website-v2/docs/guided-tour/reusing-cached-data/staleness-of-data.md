---
id: staleness-of-data
title: Staleness of Data
slug: /guided-tour/reusing-cached-data/staleness-of-data/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbPushViews from './fb/FbPushViews.md';

## Staleness of Data

Assuming our data is [present in the store](../presence-of-data/), we still need to consider the staleness of such data.

By default, Relay will not consider data in the store to be stale (regardless of how long it has been cached for), unless it's explicitly marked as stale using our data invalidation apis or if it is older than the query cache expiration time.

Marking data as stale is useful for cases when we explicitly know that some data is no longer fresh (for example after executing a [Mutation](../../updating-data/graphql-mutations/).

Relay exposes the following APIs to mark data as stale within an update to the store:

### Globally Invalidating the Relay Store

The coarsest type of data invalidation we can perform is invalidating the *whole* store, meaning that all currently cached data will be considered stale after invalidation.

To invalidate the store, we can call `invalidateStore()` within an [updater](../../updating-data/graphql-mutations/) function:

```js
function updater(store) {
  store.invalidateStore();
}
```

* Calling `invalidateStore()` will cause *all* data that was written to the store before invalidation occurred to be considered stale, and will require any query to be refetched again the next time it's evaluated.
* Note that an updater function can be specified as part of a [mutation](../../updating-data/graphql-mutations/), [subscription](../../updating-data/graphql-subscriptions/) or just a [local store update](../../updating-data/local-data-updates/).

### Invalidating Specific Data In The Store

We can also be more granular about which data we invalidate and only invalidate *specific records* in the store; compared to global invalidation, only queries that reference the invalidated records will be considered stale after invalidation.

To invalidate a record, we can call `invalidateRecord()` within an [updater](../../updating-data/graphql-mutations/) function:

```js
function updater(store) {
  const user = store.get('<id>');
  if (user != null) {
    user.invalidateRecord();
  }
}
```

* Calling `invalidateRecord()` on the `user` record will mark *that* specific user in the store as stale. That means that any query that is cached and references that invalidated user will now be considered stale, and will require to be refetched again the next time it's evaluated.
* Note that an updater function can be specified as part of a [mutation](../../updating-data/graphql-mutations/), [subscription](../../updating-data/graphql-subscriptions/) or just a [local store update](../../updating-data/local-data-updates/).

### Subscribing to Data Invalidation

Just marking the store or records as stale will cause queries to be refetched they next time they are evaluated; so for example, the next time you navigate back to a page that renders a stale query, the query will be refetched even if the data is cached, since the query references stale data.

This is useful for a lot of use cases, but there are some times when we'd like to immediately refetch some data upon invalidation, for example:

* When invalidating data that is already visible in the current page. Since no navigation is occurring, we won't re-evaluate the queries for the current page, so even if some data is stale, it won't be immediately refetched and we will be showing stale data.
* When invalidating data that is rendered on a previous view that was never unmounted; since the view wasn't unmounted, if we navigate back, the queries for that view won't be re-evaluated, meaning that even if some is stale, it won't be refetched and we will be showing stale data.

<FbPushViews />

To support these use cases, Relay exposes the `useSubscribeToInvalidationState` hook:

```js
function ProfilePage(props) {
  // Example of querying data for the current page for a given user
  const data = usePreloadedQuery(
    graphql`...`,
    props.preloadedQuery,
  )

  // Here we subscribe to changes in invalidation state for the given user ID.
  // Whenever the user with that ID is marked as stale, the provided callback will
  // be executed
  useSubscribeToInvalidationState([props.userID], () => {
    // Here we can do things like:
    // - re-evaluate the query by passing a new preloadedQuery to usePreloadedQuery.
    // - imperitavely refetch any data
    // - render a loading spinner or gray out the page to indicate that refetch
    //   is happening.
  })

  return (...);
}
```

* `useSubscribeToInvalidationState` takes an array of ids, and a callback. Whenever any of the records for those ids are marked as stale, the provided callback will fire.
* Inside the callback, we can react accordingly and refetch and/or update any current views that are rendering stale data. As an example, we could re-execute the top-level `usePreloadedQuery` by keeping the `preloadedQuery` in state and setting a new one here; since that query is stale at that point, the query will be refetched even if the data is cached in the store.



### Query Cache Expiration Time

In addition, the query cache expiration time affects whether certain operations (i.e. a query and variables) can be fulfilled with data that is already present in the store, i.e. whether the data for a query has become stale.

 A stale query is one which can be fulfilled with records from the store, and

* it was last fetched more than the query cache expiration time ago, or
* for which at least one referenced record was invalidated.

This staleness check occurs when a new request is made (e.g. in a call to `loadQuery`). Components which reference stale data will continue to be able to render that data; however, any additional requests which would be fulfilled using stale data will go to the network.

In order to configure the query cache expiration time, we can specify the `queryCacheExpirationTime` option to the Relay Store:

```js
const store = new Store(source, {queryCacheExpirationTime: 5 * 60 * 1000 });
```

If the query cache expiration time is not provided, staleness checks only look at whether the referenced records have been invalidated.



<DocsRating />
