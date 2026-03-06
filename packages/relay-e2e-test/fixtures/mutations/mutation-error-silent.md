# Mutation Error — Silent Failure

When a mutation resolver throws, the error does NOT surface through
`onError`, does NOT trigger an error boundary, and does NOT cause
`commit()` to throw. Instead, `onCompleted` fires normally. If the
callback ignores its second argument (`errors`), the UI shows "Saved!"
even though the mutation failed — a silent data-loss bug.

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
import { AppMutationErrorSilentQuery } from "./__generated__/AppMutationErrorSilentQuery.graphql";
import { AppMutationErrorSilentMutation } from "./__generated__/AppMutationErrorSilentMutation.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function Greeting() {
  const data = useLazyLoadQuery<AppMutationErrorSilentQuery>(
    graphql`
      query AppMutationErrorSilentQuery {
        greeting
      }
    `,
    {},
  );

  const [status, setStatus] = useState<string | null>(null);

  const [commit] = useMutation<AppMutationErrorSilentMutation>(
    graphql`
      mutation AppMutationErrorSilentMutation {
        saveGreeting
      }
    `,
  );

  const handleSave = useCallback(() => {
    commit({
      variables: {},
      onCompleted() {
        setStatus("Saved!");
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
wait "Saved!"
```
