# Live Resolver

Demonstrates a Relay `@live` resolver backed by a simple external store. The
resolver subscribes to the store and re-reads whenever the value changes. A
`@gqlQueryField` provides the base schema; the `counter` field is defined
entirely client-side via a `@RelayResolver` docblock. Clicking the button
increments the store, which notifies Relay, triggering a re-render.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

```ts title="server.ts"
/** @gqlQueryField */
export function greeting(): string {
  return "Live Counter Demo";
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

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { CounterStore } from "./CounterStore";
import { AppLiveCounterQuery } from "./__generated__/AppLiveCounterQuery.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function Counter() {
  const data = useLazyLoadQuery<AppLiveCounterQuery>(
    graphql`
      query AppLiveCounterQuery {
        greeting
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
