# Mutation Error — @catch(to: RESULT)

`@catch(to: RESULT)` can be applied to mutation fields just like query
fields. Instead of checking the second argument of `onCompleted`, the
failed field is wrapped in a result type: `{ok: true, value: T}` on
success, or `{ok: false, errors: [...]}` on failure. This moves error
handling into normal data flow — no second argument to forget.

One caveat: Relay intentionally strips the `message` property from
`@catch` errors (to discourage showing raw server messages to users).
The error objects contain `path` and `locations` but not `message`.
To surface a human-readable message, use `extensions` on the server
or keep a client-side fallback.

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
import { AppMutationErrorCatchQuery } from "./__generated__/AppMutationErrorCatchQuery.graphql";
import { AppMutationErrorCatchMutation } from "./__generated__/AppMutationErrorCatchMutation.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function Greeting() {
  const data = useLazyLoadQuery<AppMutationErrorCatchQuery>(
    graphql`
      query AppMutationErrorCatchQuery {
        greeting
      }
    `,
    {},
  );

  const [status, setStatus] = useState<string | null>(null);

  const [commit] = useMutation<AppMutationErrorCatchMutation>(
    graphql`
      mutation AppMutationErrorCatchMutation {
        saveGreeting @catch(to: RESULT)
      }
    `,
  );

  const handleSave = useCallback(() => {
    commit({
      variables: {},
      onCompleted(response) {
        if (response.saveGreeting.ok) {
          setStatus("Saved!");
        } else {
          setStatus("Error: save failed");
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
wait "Error: save failed"
```
