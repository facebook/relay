# useMutationAction_EXPERIMENTAL — Top-Level Field Error (data: null)

When the server returns `{data: null, errors: [...]}` — for example because a
non-nullable top-level mutation field failed — Relay treats this as a fatal
error and routes it to `onError`. The `commitAction` promise rejects, so the
caller can catch it with try/catch or let it propagate to an error boundary.

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

The environment uses a custom network that returns `{data: null, errors: [...]}`
for mutations, simulating a non-nullable top-level field error.

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

const dataNullNetwork = Network.create((operation, variables) => {
  if (operation.operationKind === "mutation") {
    return Observable.create((sink) => {
      sink.next({
        data: null,
        errors: [{ message: "Non-nullable field failed" }],
      });
      sink.complete();
    });
  }
  return gratsNetwork.execute(operation, variables, {}, null);
});

const testEnvironment = new Environment({ network: dataNullNetwork });

function Content() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        greeting
      }
    `,
    {},
  );

  const commitAction =
    useMutationAction_EXPERIMENTAL<AppDoSomethingMutation>(
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
wait "Caught error:"
```
