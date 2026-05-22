# Query Selection Hoist (__query)

Tests the `__query` feature: a selection set can include `__query { ... }` to
select fields from the query root type. The compiler hoists these selections to
the query root in the operation text sent to the server, and the reader uses a
`QueryRootSelection` node to read the data from the root record in the store.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript",
  "featureFlags": {
    "enable_query_root_selection": true
  }
}
```

## Server

```ts title="server.ts"
import type { ID } from "grats";

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
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useFragment,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppQuerySelectionHoistQuery } from "./__generated__/AppQuerySelectionHoistQuery.graphql";
import { UserProfile_user$key } from "./__generated__/UserProfile_user.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function UserProfile({ userRef }: { userRef: UserProfile_user$key }) {
  const data = useFragment(
    graphql`
      fragment UserProfile_user on User {
        name
        __query {
          greeting
        }
      }
    `,
    userRef,
  );
  return (
    <div>
      <p>Name: {data.name}</p>
      <p>Greeting: {data.greeting}</p>
    </div>
  );
}

function App() {
  const data = useLazyLoadQuery<AppQuerySelectionHoistQuery>(
    graphql`
      query AppQuerySelectionHoistQuery {
        me {
          ...UserProfile_user
        }
      }
    `,
    {},
  );

  return <UserProfile userRef={data.me} />;
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
wait "Name:"
```
