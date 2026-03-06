# Relay E2E Tests

Markdown-driven end-to-end tests for Relay. Each test is a self-contained `.md` file that defines a GraphQL server (via [Grats](https://grats.capt.dev/)), a Relay-powered React component, and optional interaction steps. The test harness extracts the code blocks, compiles them with Grats + relay-compiler, renders with React Testing Library, runs interactions, and snapshot-tests the output.

Tests run against **Relay runtime packages from source** (`packages/relay-runtime/` and `packages/react-relay/`), so changes are reflected immediately without a build step.

## Running tests

From the repo root:

```
yarn test:e2e
```

Run a single fixture by name:

```
yarn test:e2e -- --testNamePattern defer
```

### First-time setup

The e2e package has its own `node_modules` (isolated `react@19`, `graphql@16`):

```
cd packages/relay-e2e-test && yarn install
```

The babel-plugin-relay must be built before running tests:

```
gulp dist
```

### Compiler resolution

The test harness resolves the relay-compiler binary in this order:

1. `RELAY_COMPILER_BINARY` env var
2. Local cargo build: `compiler/target/debug/relay`
3. npm fallback: `node_modules/.bin/relay-compiler`

To test compiler changes, build with `cargo build --manifest-path=compiler/Cargo.toml --bin relay` and re-run tests.

## Writing fixtures

Each test is a `fixtures/<name>.md` file. Fixtures can be organized into subdirectories (e.g. `fixtures/errors/catch.md`). The test name uses the relative path without extension (e.g. `errors/catch`). Snapshots are placed alongside the fixture as `<name>.snap.md`.

Every fixture needs three code blocks:

1. **`relay.config.json`** - Relay compiler configuration
2. **`server.ts`** - Grats schema and resolvers
3. **`App.tsx`** - React component that default-exports the test app

Each code block should be preceded by a `##` heading describing its contents. Additional files get their own heading. A short note can be added between the heading and the code block when something is non-obvious.

### Example fixture

````markdown
# Greeting Query

A basic test: Grats resolver returns a string, Relay fetches it, component renders it.

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
  return "Hello!";
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function Greeting() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
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
      <Suspense fallback={<div>Loading...</div>}>
        <Greeting />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Hello!"
```
````

### Server code

Use `@gqlQueryField` / `@gqlMutationField` / `@gqlSubscriptionField` for resolvers. Prefer `@gqlType` on TypeScript type literals over classes:

```ts
/** @gqlType */
type User = {
  /** @gqlField */
  name: string;
};
```

Use classes only when needed (e.g. async method resolvers).

Import the shared network via `import { gratsNetwork } from "../GratsNetwork"`. Import generated types from `./__generated__/`.

### Interactions

Add a `steps` block to run user interactions before the snapshot is taken:

````markdown
```steps
wait button "Save"
click button "Save"
type textbox "Search" "hello"
```
````

Syntax: `action [role] "name" ["value"]`

| Action  | Description |
|---------|-------------|
| `click` | Click an element by text or role+name |
| `type`  | Type into an element by text or role+name |
| `wait`  | Wait for an element to appear (async/Suspense) |

Roles are ARIA roles (`button`, `link`, `textbox`, `checkbox`, etc.). Names must be quoted.

`wait` polls until a matching element appears (uses `findByText`/`findByRole`). Use it to wait for Suspense to resolve before snapshotting or interacting.

### Snapshots

Run tests to generate snapshots. Delete a `.snap.md` file and re-run to regenerate. Console output (log/warn/error) is captured and included in the snapshot when present.
