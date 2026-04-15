# Greeting Query

A basic end-to-end test: a Grats `@gqlQueryField` resolver returns a string,
Relay fetches it via `useLazyLoadQuery`, and the component renders the result.

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
  return <div>{data.greeting}</div>;
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
