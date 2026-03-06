# Relay E2E Tests

## Running tests

From the repo root:

```
yarn test:e2e
```

Run a single fixture by name:

```
yarn test:e2e -- --testNamePattern defer
```

## Writing fixtures

Each test is a `fixtures/<name>.md` file. Fixtures can be organized into subdirectories (e.g. `fixtures/errors/catch.md`). The test name uses the relative path without extension (e.g. `errors/catch`). Snapshots are placed alongside the fixture as `<name>.snap.md`.

Every fixture needs a `relay.config.json`, a `server.ts` for Grats schema/resolvers, and an `App.tsx` that default-exports a React component. Each code block should be preceded by a `##` heading describing its contents (`## Relay Config`, `## Server`, `## App`, `## Steps`). Additional files get their own descriptive heading (e.g. `## Counter Store`). A short note can be added between the heading and the code block when something is non-obvious.

````markdown
## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript",
  "eagerEsModules": true
}
```

## Server

```ts title="server.ts"
// Grats types and resolvers go here
/** @gqlQueryField */
export function greeting(): string { return "Hello!"; }
```

## App

```tsx title="App.tsx"
// React components and Relay environment go here
export default function TestApp() { /* ... */ }
```

## Steps

```steps
wait "Hello!"
```
````

Keep server code (Grats types, resolvers, directives, server-side state) in `server.ts` and client code (React components, Relay environment/network setup) in `App.tsx`.

Use `@gqlQueryField` / `@gqlMutationField` for resolvers. Prefer `@gqlType` on TypeScript type literals over classes where possible:

```ts
/** @gqlType */
type MyType = {
  /** @gqlField */
  id: ID;
  /** @gqlField */
  name: string;
};
```

Use classes only when needed (e.g. async method resolvers like `async bio(): Promise<string>`).

Import shared network via `import { gratsNetwork } from "../GratsNetwork"`. Import generated types from `./__generated__/`.

## Interactions

Add a `steps` block to run user interactions before the snapshot is taken:

````markdown
```steps
wait button "Save"
click button "Save"
type textbox "Search" "hello"
```
````

Syntax: `action [role] "name" ["value"]`. Actions: `click`, `type`, `wait`. Roles are ARIA roles. Names must be quoted.

`wait` polls until an element matching the text or role+name appears (uses `findByText`/`findByRole`). Use it to wait for Suspense to resolve or for async data to arrive before snapshotting or interacting.

## Snapshots

Run `yarn test:e2e` to generate. Delete a `.snap.md` file and re-run to regenerate. Console output (log/warn/error) is captured and included in the snapshot when present.
