# useMutationAction_EXPERIMENTAL — Optimistic Update

Uses `useOptimistic` to show an optimistic value while the mutation is in
flight, then resolves to the real server response. After the `await`, a
`setState` records the confirmed count — this must stay entangled in the
transition so the optimistic value never visibly reverts before the
confirmed value appears. If it slipped out, the UI would briefly show
"Likes: 0" with no confirmed result, which is detected by the render-time
check that logs to `console.error`.

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
import type { Int } from "grats";

/** @gqlQueryField */
export function likeCount(): Int {
  return 0 as Int;
}

let serverLikeCount = 0;

/** @gqlMutationField */
export async function like(_args: {}): Promise<Int> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  serverLikeCount += 1;
  return serverLikeCount as Int;
}
```

## App

```tsx title="App.tsx"
import { Suspense, useState, useOptimistic, useTransition } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutationAction_EXPERIMENTAL,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";
import { AppLikeMutation } from "./__generated__/AppLikeMutation.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function LikeButton() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        likeCount
      }
    `,
    {},
  );

  const commitAction = useMutationAction_EXPERIMENTAL<AppLikeMutation>(
    graphql`
      mutation AppLikeMutation {
        like
      }
    `,
  );

  const [optimisticCount, addOptimistic] = useOptimistic(
    data.likeCount,
    (current, _increment: number) => current + _increment,
  );

  const [confirmed, setConfirmed] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [log, setLog] = useState<string[]>([]);

  const state = `likes=${optimisticCount} pending=${isPending} confirmed=${confirmed}`;
  if (log[log.length - 1] !== state) {
    setLog((prev) => [...prev, state]);
  }

  return (
    <div>
      <div>Likes: {optimisticCount}</div>
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            addOptimistic(1);
            const response = await commitAction({});
            setConfirmed(response.like);
          });
        }}
      >
        Like
      </button>
      {isPending && <div>Saving...</div>}
      {confirmed != null && <div>Confirmed: {confirmed}</div>}
      <ul data-testid="render-log">
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <LikeButton />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Likes: 0"
click button "Like"
wait "Likes: 1"
wait "Saving..."
wait "Confirmed: 1"
```
