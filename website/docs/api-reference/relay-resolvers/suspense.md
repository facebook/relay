---
id: suspense
title: "Suspense"
slug: /api-reference/relay-resolvers/suspense/
description: Handling loading states for live data
---

With [Live Resolvers](./live-data.md), it's possible that the data you are exposing in the graph may not be synchronously available. For example, if you are fetching data from a remote API, it may take some time for the data to be fetched. Relay Resolvers provide a mechanism for handling this loading state.

If a Live Resolver returns the "suspense sentinel" value, all consumers of that field will suspend until that field updates with a non-suspense value.

## Suspense Sentinel

If a Live Resolver is in a loading state, it may return a special sentinel value to indicate that the data is not yet available.

```ts
import {suspenseSentinel} from 'relay-runtime';

/**
 * @RelayResolver Query.myIp: String
 * @live
 */
export function myIp(): LiveState<string> {
  return {
    read: () => {
      const state = store.getState();
      const ipLoadObject = state.ip;
      if (ipLoadObject.status === "LOADING") {
        return suspenseSentinel();
      }
      return state.ip;
    },
    subscribe: (cb) => {
      return store.subscribe(cb);
    },
  };
}

