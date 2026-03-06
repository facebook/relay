# Resolver Error

When a resolver throws, the GraphQL response includes an error with a `path`
pointing to the failed field. With `@throwOnFieldError` on the query, Relay
re-throws during render instead of silently returning `null`. An
`ErrorBoundary` catches it and displays the message. A `relayFieldLogger` logs
the underlying resolver error.

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
  throw new Error("Something went wrong!");
}
```

## App

```tsx title="App.tsx"
import { Component, Suspense } from "react";
import type { ReactNode } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import type { RelayFieldLogger } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppErrorTestQuery } from "./__generated__/AppErrorTestQuery.graphql";

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

const relayFieldLogger: RelayFieldLogger = (event) => {
  if (event.kind === "relay_field_payload.error") {
    console.error(
      `Relay field error in ${event.owner}: ${event.error.message}`,
    );
  }
};

const testEnvironment = new Environment({
  network: gratsNetwork,
  relayFieldLogger,
});

function Greeting() {
  const data = useLazyLoadQuery<AppErrorTestQuery>(
    graphql`
      query AppErrorTestQuery @throwOnFieldError {
        greeting
      }
    `,
    {},
  );
  return <div>{data.greeting}</div>;
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Greeting />
        </Suspense>
      </ErrorBoundary>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Unexpected response payload"
```
