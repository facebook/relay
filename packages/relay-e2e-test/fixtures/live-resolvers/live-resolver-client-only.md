# Live Resolver (client-only)

A pure client-side test with no server fields. A dummy `@gqlQueryField`
provides the base schema; the only meaningful query field (`counter`) is
defined by a `@RelayResolver` with `@live`, backed by a simple external
store. No network request is made.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

Dummy field to provide a base schema for Grats. Not queried at runtime.

```ts title="server.ts"
/** @gqlQueryField */
export function _unused(): string | null {
  return null;
}
```

## Counter Store

```tsx title="CounterStore.ts"
let count = 0;
const listeners = new Set<() => void>();

export const CounterStore = {
  getCount: () => count,
  increment: () => {
    count++;
    listeners.forEach((cb) => cb());
  },
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};
```

## Counter Resolver

```tsx title="CounterResolver.ts"
import type { LiveState } from "relay-runtime";
import { CounterStore } from "./CounterStore";

/**
 * @RelayResolver Query.counter: Int
 * @live
 */
export function counter(): LiveState<number> {
  return {
    read() {
      return CounterStore.getCount();
    },
    subscribe(cb: () => void) {
      return CounterStore.subscribe(cb);
    },
  };
}
```

## App

Network throws because all queried fields are client-side Relay Resolvers.

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import {
  graphql,
  Environment,
  Network,
} from "relay-runtime";
import { CounterStore } from "./CounterStore";
import { AppClientLiveQuery } from "./__generated__/AppClientLiveQuery.graphql";

const testEnvironment = new Environment({
  network: Network.create(() => {
    throw new Error("No server fields");
  }),
});

function Counter() {
  const data = useLazyLoadQuery<AppClientLiveQuery>(
    graphql`
      query AppClientLiveQuery {
        counter
      }
    `,
    {},
  );

  return (
    <div>
      <span>Count: {data.counter}</span>
      <button onClick={() => CounterStore.increment()}>Click</button>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <Counter />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait button "Click"
click button "Click"
```
