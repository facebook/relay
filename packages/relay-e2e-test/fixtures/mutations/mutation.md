# Mutation

A `MessageHolder` object type has a stable `id` and a mutable `message` field
backed by a module-scoped variable. The mutation returns the same
`MessageHolder`, so Relay's normalized store automatically merges the updated
`message` — no manual `updater` needed.

After initial render the message reads "Hello". Clicking the "Toggle" button
fires the mutation, which flips the message to "Goodbye".

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
import type { ID } from "grats";

let currentMessage = "Hello";

/** @gqlType */
type MessageHolder = {
  /** @gqlField */
  id: ID;
  /** @gqlField */
  message: string;
};

/** @gqlQueryField */
export function messageHolder(): MessageHolder {
  return { id: "message-holder" as ID, message: currentMessage };
}

/** @gqlMutationField */
export function toggleMessage(): MessageHolder {
  currentMessage = currentMessage === "Hello" ? "Goodbye" : "Hello";
  return { id: "message-holder" as ID, message: currentMessage };
}
```

## App

```tsx title="App.tsx"
import { Suspense, useCallback } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppMutationQuery } from "./__generated__/AppMutationQuery.graphql";
import { AppMutationToggleMutation } from "./__generated__/AppMutationToggleMutation.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function MessageDisplay() {
  const data = useLazyLoadQuery<AppMutationQuery>(
    graphql`
      query AppMutationQuery {
        messageHolder {
          message
        }
      }
    `,
    {},
  );

  const [commit] = useMutation<AppMutationToggleMutation>(
    graphql`
      mutation AppMutationToggleMutation {
        toggleMessage {
          message
        }
      }
    `,
  );

  const handleToggle = useCallback(() => {
    commit({ variables: {} });
  }, [commit]);

  return (
    <div>
      <span>{data.messageHolder?.message}</span>
      <button onClick={handleToggle}>Toggle</button>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <MessageDisplay />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait button "Toggle"
click button "Toggle"
```
