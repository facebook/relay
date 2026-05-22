# Query Selection Hoist (__query)

Tests the `__query` feature: a fragment can include `__query { ... }` to select
fields from the query root type. The compiler hoists these selections to the
query root in the operation text sent to the server.

This test verifies that fields NOT inside `__query` still render correctly when
`__query` is used alongside them.

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
import type { ID, Int } from "grats";

/** @gqlType */
type User = {
  /** @gqlField */
  id: ID;
  /** @gqlField */
  name: string;
};

/** @gqlQueryField */
export function me(): User {
  return { id: "user-1" as ID, name: "Alice" };
}

/** @gqlQueryField */
export function greeting(): string {
  return "Hello from query root!";
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppQuerySelectionHoistQuery } from "./__generated__/AppQuerySelectionHoistQuery.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function UserProfile() {
  const data = useLazyLoadQuery<AppQuerySelectionHoistQuery>(
    graphql`
      query AppQuerySelectionHoistQuery {
        me {
          name
          __query {
            greeting
          }
        }
      }
    `,
    {},
  );
  return (
    <div>
      <p>Name: {data.me.name}</p>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <UserProfile />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Name:"
```
