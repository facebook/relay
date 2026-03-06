# Mutation Required

Demonstrates `@required(action: THROW)` on a nullable field in the mutation
response. The `allow_required_in_mutation_response` feature flag is enabled
since the Relay compiler disallows this by default. When the mutation returns
`null` for the `name` field, `@required` nulls out the parent `clearName`
object — but does not throw. `onCompleted` receives `clearName: null`. The
store is still updated with the null value, so the query also re-renders.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript",
  "featureFlags": {
    "allow_required_in_mutation_response": { "kind": "enabled" }
  }
}
```

## Server

```ts title="server.ts"
import type { ID } from "grats";

/** @gqlType */
type User = {
  /** @gqlField */
  id: ID;
  /** @gqlField */
  name: string | null;
};

/** @gqlQueryField */
export function user(): User {
  return { id: "user-1" as ID, name: "Alice" };
}

/** @gqlMutationField */
export function clearName(): User {
  return { id: "user-1" as ID, name: null };
}
```

## App

```tsx title="App.tsx"
import { Component, Suspense, useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppMutationRequiredQuery } from "./__generated__/AppMutationRequiredQuery.graphql";
import { AppMutationRequiredClearMutation } from "./__generated__/AppMutationRequiredClearMutation.graphql";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div>Boundary: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function UserDisplay() {
  const data = useLazyLoadQuery<AppMutationRequiredQuery>(
    graphql`
      query AppMutationRequiredQuery {
        user {
          name
        }
      }
    `,
    {},
  );

  const [commit] = useMutation<AppMutationRequiredClearMutation>(
    graphql`
      mutation AppMutationRequiredClearMutation {
        clearName {
          name @required(action: THROW)
        }
      }
    `,
  );

  const [callbackResult, setCallbackResult] = useState("pending");

  const handleClear = useCallback(() => {
    commit({
      variables: {},
      onCompleted(response) {
        setCallbackResult(
          response.clearName == null
            ? "onCompleted: parent nulled"
            : `onCompleted: ${response.clearName.name}`,
        );
      },
      onError(error) {
        setCallbackResult(`onError: ${error.message}`);
      },
    });
  }, [commit]);

  const name = data.user?.name;

  return (
    <div>
      <p>Name: {name ?? "null"}</p>
      <p>Callback: {callbackResult}</p>
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <UserDisplay />
        </Suspense>
      </ErrorBoundary>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Name: Alice"
click button "Clear"
wait "Name: null"
```
