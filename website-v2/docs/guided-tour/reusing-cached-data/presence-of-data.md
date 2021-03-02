---
id: presence-of-data
title: Presence of Data
slug: /guided-tour/reusing-cached-data/presence-of-data/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbGarbageCollection from './fb/FbGarbageCollection.md';


## Presence of Data

An important thing to keep in mind when attempting to reuse data that is cached in the Relay store is to understand the lifetime of that data; that is, if it is present in the store, and for how long it will be.

Data in the Relay store for a given query will generally be present after the query has been fetched for the first time, as long as that query is being rendered on the screen. If we've never fetched data for a specific query, then it will be missing from the store.

However, even after we've fetched data for different queries, we can't keep all of the data that we've fetched indefinitely in memory, since over time it would grow to be too large and too stale. In order to mitigate this, Relay runs a process called *Garbage Collection*, in order to delete data that we're no longer using:

### Garbage Collection in Relay

Specifically, Relay runs garbage collection on the local in-memory store by deleting any data that is no longer being referenced by any component in the app.

However, this can be at odds with reusing cached data; if the data is deleted too soon, before we try to reuse it again later, that will prevent us from reusing that data to render a screen without having to wait on a network request. To address this, this section will cover what you need to do in order to ensure that the data you want to reuse is kept cached for as long as you need it.


> NOTE: Usually, you shouldn't need to worry about configuring garbage collection and data retention, as this should be configured by the app infrastructure at the RelayEnvironment level; however, we will cover it here for reference.

<FbGarbageCollection />



#### Query Retention

Retaining a query indicates to Relay that the data for that query and variables shouldn't be deleted (i.e. garbage collected). Multiple callers might retain a single query, and as long as there is at least one caller retaining a query, it won't be deleted from the store.

By default, any query components using `useQueryLoader` / `usePreloadedQuery` or our other APIs will retain the query for as long as they are mounted. After they unmount, they will release the query, which means that the query might be deleted at any point in the future after that occurs.

If you need to retain a specific query outside of the components lifecycle, you can use the [`retain`](../../accessing-data-without-react/retaining-queries/) operation:

```js
// Retain query; this will prevent the data for this query and
// variables from being garbage collected by Relay
const disposable = environment.retain(queryDescriptor);

// Disposing of the disposable will release the data for this query
// and variables, meaning that it can be deleted at any moment
// by Relay's garbage collection if it hasn't been retained elsewhere
disposable.dispose();
```

* As mentioned, this will allow you to retain the query even after a query component has unmounted, allowing other components, or future instances of the same component, to reuse the retained data.


Controlling Relay's Garbage Collection Policy
There are currently 2 options you can provide to your Relay Store in to control the behavior of garbage collection:

#### GC Scheduler

The `gcScheduler` is a function you can provide to the Relay Store which will determine when a GC execution should be scheduled to run:

```js
// Sample scheduler function
// Accepts a callback and schedules it to run at some future time.
function gcScheduler(run: () => void) {
  resolveImmediate(run);
}

const store = new Store(source, {gcScheduler});
```

* By default, if a `gcScheduler` option is not provided, Relay will schedule garbage collection using the `resolveImmediate` function.
* You can provide a scheduler function to make GC scheduling less aggressive than the default, for example based on time or [scheduler](https://github.com/facebook/react/tree/master/packages/scheduler) priorities, or any other heuristic. By convention, implementations should not execute the callback immediately.


#### GC Release Buffer Size

The Relay Store internally holds a release buffer to keep a specific (configurable) number of queries temporarily retained even *after* they have been released by their original owner  (which will happen by default when a component rendering that query unmounts). This makes it possible (and more likely) to be able to reuse data when navigating back to a page, tab or piece of content that has been visited before.

In order to configure the size of the release buffer, we can specify the `gcReleaseBufferSize` option to the Relay Store:

```js
const store = new Store(source, {gcReleaseBufferSize: 10});
```

* Note that having a buffer size of 0 is equivalent to not having the release buffer, which means that queries will be immediately released and collected.
* By default, environments have a release buffer size of 10.

<DocsRating />
