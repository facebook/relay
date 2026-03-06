# Catch

Demonstrates `@catch(to: RESULT)` on a field that may fail. Instead of
throwing or returning `null`, `@catch` wraps the field value in a result type:
`{ok: true, value: T}` on success, or `{ok: false, errors: [...]}` on failure.
The component handles errors inline without needing an error boundary.

The fixture defines two query fields — one that succeeds and one that throws —
and renders both using the same pattern to show both outcomes.

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
export function workingGreeting(): string {
  return "Hello from a working resolver!";
}

/** @gqlQueryField */
export function brokenGreeting(): string {
  throw new Error("Something went wrong!");
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppCatchQuery } from "./__generated__/AppCatchQuery.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function Greeting() {
  const data = useLazyLoadQuery<AppCatchQuery>(
    graphql`
      query AppCatchQuery {
        workingGreeting @catch(to: RESULT)
        brokenGreeting @catch(to: RESULT)
      }
    `,
    {},
  );

  return (
    <div>
      <p>
        Working:{" "}
        {data.workingGreeting.ok
          ? data.workingGreeting.value
          : "Failed unexpectedly"}
      </p>
      <p>
        Broken:{" "}
        {data.brokenGreeting.ok
          ? data.brokenGreeting.value
          : "This greeting is unavailable"}
      </p>
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
wait "Working:"
```
