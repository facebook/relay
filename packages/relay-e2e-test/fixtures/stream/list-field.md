# Streamed List Field

`@stream(initialCount: 1)` on a plural field: the initial payload carries the
first item and each later item arrives as its own patch addressed by list index
(`path: ["user", "friends", 1]`).

The generator blocks on a client-released permit between items, so each patch is
observed on its own rather than the list appearing complete in one go.

Also covers the one place `@stream` differs from `@defer`: it always ends with a
bookkeeping-only `{hasNext: false}` payload that `GratsNetwork` has to drop.
Forwarding it adds a `QueryResource` warning to the snapshot, so a regression
shows up as a snapshot diff.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

`friends` is an async generator, which is what lets graphql-js send items one at
a time. `releaseNextFriend` is a plain export, not a mutation.

Permits are counted rather than awaited directly, so a click that lands before
the generator asks for the next item is remembered instead of lost.

```ts title="server.ts"
let permits = 0;
let notify: (() => void) | null = null;

/** Lets the next streamed friend through. Not part of the schema. */
export function releaseNextFriend(): void {
  permits++;
  const waiter = notify;
  notify = null;
  waiter?.();
}

async function awaitPermit(): Promise<void> {
  while (permits === 0) {
    await new Promise<void>((resolve) => {
      notify = resolve;
    });
  }
  permits--;
}

/** @gqlType */
class Friend {
  /** @gqlField */
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

/** @gqlType */
class User {
  /** @gqlField */
  name: string = "Jordan";

  /** @gqlField */
  async *friends(): AsyncIterable<Friend> {
    yield new Friend("Bea");
    await awaitPermit();
    yield new Friend("Cid");
    await awaitPermit();
    yield new Friend("Dot");
  }
}

/** @gqlQueryField */
export function user(): User {
  return new User();
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { releaseNextFriend } from "./server";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function App() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        user {
          name
          friends @stream(initialCount: 1) {
            name
          }
        }
      }
    `,
    {},
  );
  const names = (data.user?.friends ?? []).map((f) => f?.name).join(", ");
  return (
    <div>
      <div>friends = {names}</div>
      <button onClick={() => releaseNextFriend()}>Next friend</button>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "friends = Bea"
click button "Next friend"
wait "friends = Bea, Cid"
click button "Next friend"
wait "friends = Bea, Cid, Dot"
```
