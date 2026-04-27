# useMutationAction_EXPERIMENTAL — Sequential Mutations

Awaits two mutations in sequence within a single `startTransition`. The
second mutation uses the result of the first, demonstrating how the
Promise-based API enables data-dependent chains that are awkward with
callback-based `useMutation`.

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
export function status(): string {
  return "Idle";
}

/** @gqlMutationField */
export function createItem(args: { name: string }): string {
  return `item-${args.name}`;
}

/** @gqlMutationField */
export function publishItem(args: { id: string }): string {
  return `Published ${args.id}`;
}
```

## App

```tsx title="App.tsx"
import { Suspense, useState, useTransition } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutationAction_EXPERIMENTAL,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";
import { AppCreateItemMutation } from "./__generated__/AppCreateItemMutation.graphql";
import { AppPublishItemMutation } from "./__generated__/AppPublishItemMutation.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function Publisher() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        status
      }
    `,
    {},
  );

  const createItem = useMutationAction_EXPERIMENTAL<AppCreateItemMutation>(
    graphql`
      mutation AppCreateItemMutation($name: String!) {
        createItem(name: $name)
      }
    `,
  );

  const publishItem = useMutationAction_EXPERIMENTAL<AppPublishItemMutation>(
    graphql`
      mutation AppPublishItemMutation($id: String!) {
        publishItem(id: $id)
      }
    `,
  );

  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div>{data.status}</div>
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const createResponse = await createItem({
              name: "draft",
            });
            const publishResponse = await publishItem({
              id: createResponse.createItem,
            });
            setResult(publishResponse.publishItem);
          });
        }}
      >
        Create and Publish
      </button>
      {isPending && <div>Working...</div>}
      {result != null && <div>{result}</div>}
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <Publisher />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Idle"
click button "Create and Publish"
wait "Published item-draft"
```
