# Mutation Error — onError Does Not Fire

Product engineers often add `onError` expecting it to catch server-side
resolver errors. It doesn't — `onError` only fires for network-level
failures (fetch threw, HTTP 500, timeout). A resolver error is part of a
valid GraphQL response, so `onCompleted` fires instead.

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
  return "Hello!";
}

/** @gqlMutationField */
export function saveGreeting(): string | null {
  throw new Error("Database connection failed!");
}
```

## App

```tsx title="App.tsx"
import { Suspense, useState, useCallback } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppMutationErrorOnErrorQuery } from "./__generated__/AppMutationErrorOnErrorQuery.graphql";
import { AppMutationErrorOnErrorMutation } from "./__generated__/AppMutationErrorOnErrorMutation.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function Greeting() {
  const data = useLazyLoadQuery<AppMutationErrorOnErrorQuery>(
    graphql`
      query AppMutationErrorOnErrorQuery {
        greeting
      }
    `,
    {},
  );

  const [status, setStatus] = useState<string | null>(null);

  const [commit] = useMutation<AppMutationErrorOnErrorMutation>(
    graphql`
      mutation AppMutationErrorOnErrorMutation {
        saveGreeting
      }
    `,
  );

  const handleSave = useCallback(() => {
    commit({
      variables: {},
      onCompleted() {
        setStatus("onCompleted called");
      },
      onError() {
        setStatus("onError called");
      },
    });
  }, [commit]);

  return (
    <div>
      <p>{data.greeting}</p>
      <button onClick={handleSave}>Save</button>
      {status && <p>{status}</p>}
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
wait button "Save"
click button "Save"
wait "onCompleted called"
```
