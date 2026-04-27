# useMutationAction_EXPERIMENTAL

Basic test for `useMutationAction_EXPERIMENTAL`: a button triggers a mutation
via the returned action callback, and the response is rendered.

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
export function message(): string {
  return "Click the button";
}

/** @gqlMutationField */
export async function setMessage(args: { text: string }): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return args.text;
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
import { AppSetMessageMutation } from "./__generated__/AppSetMessageMutation.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function Message() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        message
      }
    `,
    {},
  );

  const commitAction = useMutationAction_EXPERIMENTAL<AppSetMessageMutation>(
    graphql`
      mutation AppSetMessageMutation($text: String!) {
        setMessage(text: $text)
      }
    `,
  );

  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div>{data.message}</div>
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const response = await commitAction({ text: "Hello from mutation!" });
            setResult(response.setMessage);
          });
        }}
      >
        Send
      </button>
      {isPending && <div>Sending...</div>}
      {result != null && <div>Result: {result}</div>}
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <Message />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Click the button"
click button "Send"
wait "Sending..."
wait "Result: Hello from mutation!"
```
