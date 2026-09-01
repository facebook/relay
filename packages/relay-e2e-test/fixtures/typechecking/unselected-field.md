# Unselected Field Access

Reading a field the query did not select. `farewell` exists on `Query`, so the
GraphQL document is valid and the Relay compiler is happy — but it is absent
from the generated `AppTestQuery$data`, which contains only the selected
fields. At runtime it is simply `undefined` and renders as nothing, so the
component still works and the assertion below still passes.

The typecheck is the only thing that catches it, which is what this fixture
exists to prove.

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
  return "Hello, Jordan!";
}

/** @gqlQueryField */
export function farewell(): string {
  return "Goodbye, Jordan!";
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function Greeting() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        greeting
      }
    `,
    {},
  );
  // `farewell` is never selected above, so this is a type error.
  return (
    <div>
      {data.greeting}
      {data.farewell}
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <Greeting />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Hello, Jordan!"
```
