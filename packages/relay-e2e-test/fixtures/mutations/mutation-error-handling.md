# Mutation Error — Checking onCompleted Errors

The correct way to handle mutation resolver errors: inspect the second
argument of `onCompleted(response, errors)`. When `errors` is non-empty,
the mutation failed and `errors` contains the GraphQL error details
including the server-side message.

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
import { AppMutationErrorHandlingQuery } from "./__generated__/AppMutationErrorHandlingQuery.graphql";
import { AppMutationErrorHandlingMutation } from "./__generated__/AppMutationErrorHandlingMutation.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function Greeting() {
  const data = useLazyLoadQuery<AppMutationErrorHandlingQuery>(
    graphql`
      query AppMutationErrorHandlingQuery {
        greeting
      }
    `,
    {},
  );

  const [status, setStatus] = useState<string | null>(null);

  const [commit] = useMutation<AppMutationErrorHandlingMutation>(
    graphql`
      mutation AppMutationErrorHandlingMutation {
        saveGreeting
      }
    `,
  );

  const handleSave = useCallback(() => {
    commit({
      variables: {},
      onCompleted(_response, errors) {
        if (errors && errors.length > 0) {
          setStatus(`Error: ${errors[0].message}`);
        } else {
          setStatus("Saved!");
        }
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
wait "Error: Database connection failed!"
```
