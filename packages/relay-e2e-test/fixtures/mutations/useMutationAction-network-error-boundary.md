# useMutationAction_EXPERIMENTAL — Network Error (Error Boundary)

When the network layer fails and the rejection is not caught inside the
transition, React surfaces it to the nearest error boundary.

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

```tsx title="App.tsx"
import { Component, Suspense, useTransition } from "react";
import type { ReactNode } from "react";
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

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error != null) {
      return <div>Error boundary caught: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

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

  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div>{data.greeting}</div>
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await commitAction({ input: "test" });
          });
        }}
      >
        Submit
      </button>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Content />
        </Suspense>
      </ErrorBoundary>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Ready"
click button "Submit"
wait "Error boundary caught: Network request failed"
```
