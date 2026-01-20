---
id: runtime-functions
title: "Runtime Functions"
slug: /api-reference/relay-resolvers/runtime-functions/
description: Runtime functions associated with Relay Resolvers
---

This page documents the runtime functions associated with Relay Resolvers. For an overview of Relay Resolvers and how to think about them, see the [Relay Resolvers](../../guides/relay-resolvers/introduction.md) guide.

## RelayModernStore


RelayModernStore exposes `batchLiveStateUpdates()`. See [Live Fields](../../guides/relay-resolvers/live-fields.md#batching) for more details of how to use this method.

## `readFragment()`

Derived resolver fields model data that is derived from other data in the graph. To read the data that a derived field depends on, they must use the `readFragment()` function which is exported from `relay-runtime`. This function accepts a GraphQL fragment and a fragment key, and returns the data for the fragment.

:::warning
`readFragment()` may only be used in Relay Resolvers. It will throw an error if used in any other context.
:::

```tsx
import {readFragment} from "relay-runtime";

/**
 * @RelayResolver User.fullName: String
 * @rootFragment UserFullNameFragment
 */
export function fullName(key: UserFullNameFragment$key): string {
  const user = readFragment(graphql`
    fragment UserFullNameFragment on User {
      firstName
      lastName
    }
  `, key);
  return `${user.firstName} ${user.lastName}`;
}
```

Note that Relay will ensure your field resolver is recomputed any time data in that fragment changes.

See the [Derived Fields](../../guides/relay-resolvers/derived-fields.md) guide for more information.

## `suspenseSentinel()`

Live resolvers model client state that can change over time. If at some point during that field's lifecycle, the data being read is in a pending state, for example if the data is being fetched from an API, the resolver may return the `suspenseSentinel()` to indicate that the data is not yet available.

Relay expects that when the data is available, the `LiveStateValue` will notify Relay by calling the subscribe callback.

```tsx
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
    subscribe: (callback) => {
      return store.subscribe(callback);
    },
  };
}
```

See the [Live Fields](../../guides/relay-resolvers/live-fields.md) guide for more information.

## `useClientQuery()`

If a query contains only client fields, it may not currently be used with hooks like `usePreloadedQuery` and `useLazyLoadQuery` since both of those hooks assume they will need to issue a network request. If you attempt to use these APIs in Flow you will get a type error.

Instead, for client-only queries, you can use the `useClientQuery` hook:

```tsx
import {useClientQuery} from 'react-relay';

export function MyComponent() {
  const data = useClientQuery(graphql`
    query MyQuery {
      myIp
    }
  `);
  return <div>{data.myIp}</div>;
}
```
