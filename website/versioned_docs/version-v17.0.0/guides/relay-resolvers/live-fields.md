---
id: live-fields
title: "Live Fields"
slug: /guides/relay-resolvers/live-fields/
description: Modeling data that changes over time in Relay Resolvers
---

One critical difference between client state and server state is that as client state changes over time, those changes will need to be reflected in your UI. To address this, Relay Resolvers support the ability to be marked as `@live`. Live resolvers are expected to return a `LiveState` shaped object which includes methods which allow Relay to both `read()` the current value and also to `subscribe()` to changes to the value.

As this value changes over time, Relay will automatically recompute any [derived fields](./derived-fields.md) that depend on this field (including transitive dependencies if the changes cascade), and also efficiently trigger the update of any components/subscribers which have read fields that updated as a result of this change.

## @live

To mark a resolver as live, add the `@live` docblock tag to the resolver definition. For example:

```tsx
import type { LiveState } from 'relay-runtime';

/**
 * @RelayResolver Query.counter: Int
 * @live
 */
export function counter(): LiveState<number> {
  return {
    read: () => store.getState().counter,
    subscribe: (callback) => {
      return store.subscribe(callback);
    },
  };

}
```

:::note
Both field resolvers and strong model resolvers, which map an ID to a model, may be annotated as `@live`.
:::

## The LiveState Type

The return type of a Live Resolver is known as a `LiveState`. It is conceptually similar to an observable or a signal, if you are familiar with those concepts. Unlike an observable, when a `LiveState` notifies its subscriber of an update, it does not include the new value. Instead, the subscriber (Relay) is expected to call `read()` to get the new value.

While over-notification (subscription notifications when the read value has not actually changed) is supported, for performance reasons, it is recommended that the provider of the LiveState value confirms that the value has indeed change before notifying Relay of the change.

The type of a LiveState is defined as follows:

```ts
export type LiveState<T> = {
  /**
   * Returns the current value of the live state.
   */
  read(): T,
  /**
   * Subscribes to changes in the live state. The state provider should
   * call the callback when the value of the live state changes.
   */
  subscribe(cb: () => void): () => void,
};
```

## Creating a LiveState Object

In most cases, you will want to define a helper function that reads your reactive data store and returns a `LiveState` object. For example, you for a Redux store you might write a wrapper that exposes a `LiveState` for a given selector:

```ts
type Selector<T> = (state: State) => T;

function selectorAsLiveState<T>(selector: Selector<T>): LiveState<T> {
  let currentValue = selector(store.getState());
  return {
    read: () => currentValue,
    subscribe: (cb) => {
      return store.subscribe(() => {
        const newValue = selector(store.getState());
        if (newValue === currentValue) {
          return;
        }
        currentValue = newValue;
        cb();
      });
      return unsubscribe;
    },
  };
}
```

A Live Resolver that uses this helper might look like this:

```tsx
/**
 * @RelayResolver Query.counter: Int
 * @live
 */
export function counter(): LiveState<number> {
  return selectorAsLiveState(getCounter);
}

function getCounter(state) {
  return state.counter;
}
```

## Batching

When state changes in your data layer, it's possible that one change could result in notifying many `@live` resolver subscriptions about updates. By default each of these updates will require Relay to do work to determine which components need to be updated. This can lead to significant duplicate work being performed.

When possible, it is recommended that you batch updates to `@live` resolvers. This can be done by wrapping your state updates in a `batchLiveStateUpdates()` call on your `RelayStore` instance.

A typical use with a Redux store might look like this:

```ts
const store = createStore(reducer);
const originalDispatch = store.dispatch;

function wrapped(action) {
  relayStore.batchLiveStateUpdates(() => {
    originalDispatch(action);
  })
}

store.dispatch = wrapped;
```
