# useMutationAction_EXPERIMENTAL — Network Error (try/catch)

When the network layer itself fails, `commitAction` rejects. The component
can catch the rejection with try/catch inside the transition and display an
error message without an error boundary.

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
  return "Ready";
}

/** @gqlMutationField */
export function doSomething(args: { input: string }): string {
  return "ok";
}
```

## App

The environment uses `gratsNetwork` for the initial query but a failing
network for mutations.

```tsx title="App.tsx"
import { Suspense, useState, useTransition } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutationAction_EXPERIMENTAL,
} from "react-relay";
import { graphql, Environment, Network, Observable } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";
import { AppDoSomethingMutation } from "./__generated__/AppDoSomethingMutation.graphql";

const failingMutationNetwork = Network.create((operation, variables) => {
  if (operation.operationKind === "mutation") {
    return Observable.create((sink) => {
      sink.error(new Error("Network request failed"));
    });
  }
  return gratsNetwork.execute(operation, variables, {}, null);
});

const testEnvironment = new Environment({ network: failingMutationNetwork });

function Content() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        greeting
      }
    `,
    {},
  );

  const commitAction = useMutationAction_EXPERIMENTAL<AppDoSomethingMutation>(
    graphql`
      mutation AppDoSomethingMutation($input: String!) {
        doSomething(input: $input)
      }
    `,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div>{data.greeting}</div>
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              await commitAction({ input: "test" });
            } catch (err) {
              setErrorMessage((err as Error).message);
            }
          });
        }}
      >
        Submit
      </button>
      {errorMessage != null && <div>Caught error: {errorMessage}</div>}
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <Content />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Ready"
click button "Submit"
wait "Caught error: Network request failed"
```
