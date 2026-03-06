# Required

Demonstrates `@required(action: THROW)` on a nullable field. When the field
returns `null`, Relay throws during render. An `ErrorBoundary` catches the
error and displays a message. The query defines two fields: one that returns a
value and one that returns `null`, shown side by side.

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
export function presentName(): string | null {
  return "Alice";
}

/** @gqlQueryField */
export function missingName(): string | null {
  return null;
}
```

## App

```tsx title="App.tsx"
import { Component, Suspense } from "react";
import type { ReactNode } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppRequiredQuery } from "./__generated__/AppRequiredQuery.graphql";

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
      return <div>Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function Names() {
  const data = useLazyLoadQuery<AppRequiredQuery>(
    graphql`
      query AppRequiredQuery {
        presentName @required(action: THROW)
        missingName @required(action: THROW)
      }
    `,
    {},
  );

  return (
    <div>
      <p>Present: {data.presentName}</p>
      <p>Missing: {data.missingName}</p>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Names />
        </Suspense>
      </ErrorBoundary>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Error:"
```
