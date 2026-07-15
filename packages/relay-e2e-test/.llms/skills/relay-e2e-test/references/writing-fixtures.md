# Writing Fixtures

Each test is a `fixtures/<name>.md` file. Fixtures can be organized into subdirectories (e.g. `fixtures/errors/catch.md`). The test name uses the relative path without extension (e.g. `errors/catch`). Snapshots are placed alongside the fixture as `<name>.snap.md`.

Every fixture needs three code blocks:

1. **`relay.config.json`** - Relay compiler configuration
2. **`server.ts`** - Grats schema and resolvers
3. **`App.tsx`** - React component that default-exports the test app

Each code block **must** include a `title="<filename>"` attribute on the code fence (e.g. `` ```json title="relay.config.json" ``). The title determines the output filename — the language tag is only for syntax highlighting.

Each code block should be preceded by a `##` heading describing its contents (`## Relay Config`, `## Server`, `## App`, `## Steps`). Additional files get their own descriptive heading (e.g. `## Counter Store`). A short note can be added between the heading and the code block when something is non-obvious.

Keep server code (Grats types, resolvers, directives, server-side state) in `server.ts` and client code (React components, Relay environment/network setup) in `App.tsx`.

## Example fixture

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

## Server code

Use Grats to define the server schema. `@gqlQueryField` / `@gqlMutationField` / `@gqlSubscriptionField` for resolvers. Prefer `@gqlType` on TypeScript type literals over classes:

```ts
/** @gqlType */
type User = {
  /** @gqlField */
  name: string;
};
```

Use classes only when needed (e.g. async method resolvers like `async bio(): Promise<string>`).

Import the shared network via `import { gratsNetwork } from "../GratsNetwork"`. Import generated types from `./__generated__/`.

Grats documentation is in the Grats package in node_modules:

| | Path |
|---|---|
| GitHub | `packages/relay-e2e-test/node_modules/grats/llm-docs/` |
| Internal | same path under `__github__/` |

Key files: `getting-started.md`, `resolvers.md`, `docblock-tags.md`

## Interactions

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

Roles are [ARIA roles](https://testing-library.com/docs/queries/byrole/#api) (`button`, `link`, `textbox`, `checkbox`, etc.) as defined by [Testing Library](https://testing-library.com/docs/react-testing-library/intro). Names must be quoted.

`wait` polls until a matching element appears (uses `findByText`/`findByRole`). Use it to wait for Suspense to resolve or for async data to arrive before snapshotting or interacting.

## Snapshots

Run tests to generate snapshots. Delete a `.snap.md` file and re-run to regenerate. Console output (log/warn/error) is captured and included in the snapshot when present.

## Relay docs

To understand how Relay APIs work, consult the Relay docs source files:

| | Path |
|---|---|
| GitHub | `website/docs/` |
| Internal | `xplat/js/RKJSModules/Libraries/Relay/oss/__github__/website/docs/` |

Key directories: `api-reference/`, `guided-tour/`, `guides/`, `getting-started/`
